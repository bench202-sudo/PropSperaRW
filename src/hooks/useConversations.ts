import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Conversation } from '@/types';
import { User as AppUser } from '@/types';

// Fetches and polls conversations for the current user.
// Extracted from AppLayout.tsx to keep it clean and testable.
export function useConversations(appUser: AppUser | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!appUser) {
      setConversations([]);
      return;
    }

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${appUser.id},receiver_id.eq.${appUser.id}`)
        .order('created_at', { ascending: false });

      if (error || !data) return;

      // Collect unique partner IDs (excluding self-messages)
      const partnerIds = [
        ...new Set(
          data
            .map((msg: any) =>
              msg.sender_id === appUser.id ? msg.receiver_id : msg.sender_id
            )
            .filter((id: string) => id !== appUser.id)
        ),
      ];

      if (partnerIds.length === 0) {
        setConversations([]);
        return;
      }

      const { data: usersData } = await supabase
        .from('users')
        .select('id, full_name, email, phone, avatar_url, role')
        .in('id', partnerIds);

      const usersMap = new Map(
        (usersData || []).map((u: any) => [u.id, u])
      );

      const convMap = new Map<string, Conversation>();

      for (const msg of data) {
        const partnerId =
          msg.sender_id === appUser.id ? msg.receiver_id : msg.sender_id;
        const partnerUser = usersMap.get(partnerId);

        if (!convMap.has(partnerId)) {
          const isAgentRole = appUser.role !== 'buyer';
          convMap.set(partnerId, {
            id: `conv-${appUser.id}-${partnerId}`,
            agent_id: isAgentRole ? appUser.id : partnerId,
            buyer_id: isAgentRole ? partnerId : appUser.id,
            agent: isAgentRole ? appUser : partnerUser,
            buyer: isAgentRole ? partnerUser : appUser,
            property_id: msg.property_id,
            last_message_at: msg.created_at,
            created_at: msg.created_at,
            last_message: msg.content,
            unread_count:
              !msg.read && msg.receiver_id === appUser.id ? 1 : 0,
          } as unknown as Conversation);
        } else {
          const conv = convMap.get(partnerId)!;
          if (!msg.read && msg.receiver_id === appUser.id) {
            conv.unread_count = (conv.unread_count || 0) + 1;
          }
        }
      }

      setConversations(Array.from(convMap.values()));
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [appUser]);

  const unreadCount = conversations.reduce(
    (sum, c) => sum + (c.unread_count || 0),
    0
  );

  return { conversations, unreadCount };
}
