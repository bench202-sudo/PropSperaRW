import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Message, Property, Agent, User } from '@/types';
import { formatRelativeTime } from '@/data/mockData';
import { supabase } from '@/lib/supabase';
import { XIcon, SendIcon, ChevronLeftIcon, CheckCircleIcon } from '@/components/icons/Icons';
import { useLanguage } from '@/contexts/AuthContext';

interface MessagingPanelProps {
  conversations: Conversation[];
  currentUser: User;
  onClose: () => void;
  selectedConversation?: Conversation | null;
  newMessageContext?: { agent: Agent; property?: Property } | null;
}

const MessagingPanel: React.FC<MessagingPanelProps> = ({ 
  conversations, 
  currentUser,
  onClose,
  selectedConversation: initialConversation,
  newMessageContext
}) => {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(initialConversation || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { t } = useLanguage();
  const [showConversationList, setShowConversationList] = useState(!initialConversation && !newMessageContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Resolve the other person's app id regardless of who is logged in
  const getOtherPersonId = (): string | null => {
    if (newMessageContext) {
      // Buyer initiating — other person is the agent
      return newMessageContext.agent.user_id || null;
    }
    if (activeConversation) {
      // Determine other side based on current user's role
      if (currentUser.role === 'buyer') {
        return activeConversation.agent_id || null;
      } else {
        // Agent viewing conversation — other person is the buyer
        return activeConversation.buyer_id || null;
      }
    }
    return null;
  };

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const myAppId = currentUser.id;
    const otherPersonId = getOtherPersonId();

    if (!otherPersonId || !myAppId) return;

    const fetchMessages = async () => {
      // Mark unread messages sent to me as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('receiver_id', myAppId)
        .eq('sender_id', otherPersonId)
        .eq('read', false);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${myAppId},receiver_id.eq.${otherPersonId}),and(sender_id.eq.${otherPersonId},receiver_id.eq.${myAppId})`
        )
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      if (data) {
        setMessages(prev => {
          const confirmedPrevIds = prev.filter(m => !m.id.startsWith('temp-')).map(m => m.id).join(',');
          const newIds = (data as Message[]).map(m => m.id).join(',');
          if (confirmedPrevIds === newIds) return prev;
          const optimistic = prev.filter(m => m.id.startsWith('temp-'));
          return [...(data as Message[]), ...optimistic];
        });
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeConversation, newMessageContext, currentUser.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const myAppId = currentUser.id;
    const receiverAppId = getOtherPersonId();

    if (!receiverAppId) {
      console.error('No receiver found');
      return;
    }

    // Prevent sending a message to yourself
    if (receiverAppId === myAppId) {
      console.error('Cannot send message to yourself');
      return;
    }

    const propertyId = activeConversation?.property_id || newMessageContext?.property?.id || null;

    const messageData = {
      sender_id: myAppId,
      receiver_id: receiverAppId,
      property_id: propertyId,
      content: newMessage.trim(),
      read: false,
    };

    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      ...messageData,
      created_at: new Date().toISOString(),
      sender: currentUser,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setIsSending(true);

    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    setIsSending(false);

    if (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
      setNewMessage(messageData.content);
      alert(t('failedToSendMsg'));
    } else if (data) {
      setMessages(prev =>
        prev.map(m => m.id === optimisticId ? { ...data, sender: currentUser } : m)
      );
    }
  };

  const renderConversationList = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold">{t('messages')}</h2>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <XIcon size={20} />
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <SendIcon size={24} className="text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{t('noMessagesYet')}</h3>
            <p className="text-sm text-gray-500">
              {t('startConversationHint')}
            </p>
          </div>
        ) : (
          conversations.map((conv) => {
            const otherUser = currentUser.role === 'buyer' ? conv.agent : conv.buyer;

            return (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConversation(conv);
                  setShowConversationList(false);
                }}
                className="w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="relative">
                  <img 
                    src={otherUser?.avatar_url} 
                    alt={otherUser?.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {conv.unread_count !== undefined && conv.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 truncate">
                      {otherUser?.full_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(conv.last_message_at)}
                    </span>
                  </div>
                  {conv.property && (
                    <p className="text-xs text-blue-600 truncate mb-1">
                      Re: {conv.property.title}
                    </p>
                  )}
                  {(conv as any).last_message && (
                    <p className="text-sm text-gray-500 truncate">
                      {(conv as any).last_message}
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  const renderChat = () => {
    const otherUser = newMessageContext?.agent.user || 
      (currentUser.role === 'buyer' ? activeConversation?.agent : activeConversation?.buyer);
    const property = newMessageContext?.property || activeConversation?.property;

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <button 
            onClick={() => {
              setActiveConversation(null);
              setMessages([]);
              setShowConversationList(true);
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ChevronLeftIcon size={20} />
          </button>
          
          <img 
            src={otherUser?.avatar_url} 
            alt={otherUser?.full_name}
            className="w-10 h-10 rounded-full object-cover"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900 truncate">
                {otherUser?.full_name}
              </span>
              {newMessageContext?.agent.verification_status === 'approved' && (
                <CheckCircleIcon size={14} className="text-blue-600" />
              )}
            </div>
            {property && (
              <p className="text-xs text-gray-500 truncate">
                {property.title}
              </p>
            )}
          </div>
          
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Property Context Card */}
        {property && (
          <div className="p-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <img 
                src={property.images[0]} 
                alt={property.title}
                className="w-14 h-14 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {property.title}
                </p>
                <p className="text-xs text-gray-500">
                  {property.neighborhood}, {property.location}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">
                Start a conversation with {otherUser?.full_name}
              </p>
            </div>
          )}
          
          {messages.map((message) => {
            const isOwn = message.sender_id === currentUser.id;
            const isOptimistic = message.id.startsWith('temp-');
            return (
              <div 
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl ${
                    isOwn 
                      ? `bg-blue-600 text-white rounded-br-md ${isOptimistic ? 'opacity-70' : ''}` 
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {isOptimistic ? 'Sending...' : formatRelativeTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 py-3 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SendIcon size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg h-[85vh] sm:h-[600px] rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slide-up">
        {showConversationList && !newMessageContext ? renderConversationList() : renderChat()}
      </div>
    </div>
  );
};

export default MessagingPanel;