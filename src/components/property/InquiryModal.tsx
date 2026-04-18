import React, { useState } from 'react';
import { Property } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth, useLanguage } from '@/contexts/AuthContext';
import { XIcon, MessageIcon, CheckCircleIcon } from '@/components/icons/Icons';
import { formatPrice } from '@/data/mockData';

interface InquiryModalProps {
  property: Property;
  onClose: () => void;
  onSuccess: () => void;
}

const InquiryModal: React.FC<InquiryModalProps> = ({ property, onClose, onSuccess }) => {
  const { appUser } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: appUser?.full_name || '',
    email: appUser?.email || '',
    phone: appUser?.phone || '',
    message: `Hi, I'm interested in this property: ${property.title}. Please contact me with more details.`
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<'pending' | 'sent' | 'failed' | null>(null);

  // Send email notification to the agent via edge function
  const sendAgentNotification = async (inquiryId: string) => {
    try {
      setNotificationStatus('pending');
      console.log('Sending email notification to agent for inquiry:', inquiryId);

      const { data, error: fnError } = await supabase.functions.invoke('send-inquiry-notification', {
        body: {
          inquiry_id: inquiryId,
          agent_id: property.agent_id,
          property_id: property.id,
          property_title: property.title,
          property_price: formatPrice(property.price, property.currency),
          property_location: property.neighborhood || property.location || 'Kigali',
          property_type: property.property_type,
          buyer_name: formData.name.trim(),
          buyer_email: formData.email.trim(),
          buyer_phone: formData.phone.trim() || undefined,
          message: formData.message.trim()
        }
      });

      if (fnError) {
        console.warn('Agent notification function error:', fnError);
        setNotificationStatus('failed');
        return;
      }

      if (data?.email_sent) {
        setNotificationStatus('sent');
        console.log('Agent email notification sent successfully:', data);
      } else {
        setNotificationStatus('failed');
        console.warn('Agent email notification was not sent:', data?.warning || 'Unknown reason');
      }
    } catch (notifErr) {
      console.warn('Failed to send agent notification (non-blocking):', notifErr);
      setNotificationStatus('failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate form
    if (!formData.name.trim()) {
      setError(t('pleaseEnterName'));
      setLoading(false);
      return;
    }
    if (!formData.email.trim()) {
      setError(t('pleaseEnterEmail'));
      setLoading(false);
      return;
    }
    if (!formData.message.trim()) {
      setError(t('pleaseEnterMessage'));
      setLoading(false);
      return;
    }

    try {
      console.log('Sending inquiry with data:', {
        property_id: property.id,
        agent_id: property.agent_id,
        user_id: appUser?.id,
        buyer_name: formData.name.trim(),
        buyer_email: formData.email.trim(),
      });

      console.log('About to send inquiry...');

      const { data: insertedData, error: insertError } = await supabase
        .from('inquiries')
        .insert({
          property_id: property.id,
          agent_id: property.agent_id,
          user_id: appUser?.id || null,
          buyer_name: formData.name.trim(),
          buyer_email: formData.email.trim(),
          buyer_phone: formData.phone.trim() || null,
          message: formData.message.trim(),
          property_title: property.title,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      console.log('Insert completed');
      console.log('Error if any:', insertError);

      if (insertError) {
        console.log('Full error details:', JSON.stringify(insertError, null, 2));
        console.error('Error creating inquiry:', insertError);
        throw new Error('Failed to send inquiry. Please try again.');
      }

      // Send email notification to agent (non-blocking - don't let it prevent success)
      const inquiryId = insertedData?.id;
      if (inquiryId) {
        // Fire and forget - notification is sent in background
        sendAgentNotification(inquiryId);
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl p-6 text-center animate-scale-up">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('inquirySent')}</h2>
          <p className="text-gray-600 mb-4">
            {t('inquirySentMsg')}
          </p>

          {/* Email notification status indicator */}
          <div className="flex items-center justify-center gap-2 text-sm">
            {notificationStatus === 'pending' && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                <span>{t('notifyingAgentEmail')}</span>
              </div>
            )}
            {notificationStatus === 'sent' && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                <CheckCircleIcon size={14} className="text-green-600" />
                <span>{t('agentNotifiedByEmail')}</span>
              </div>
            )}
            {notificationStatus === 'failed' && (
              <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{t('inquirySavedDashboard')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg max-h-[95vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageIcon size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{t('contactAgentTitle')}</h2>
              <p className="text-sm text-gray-500">{t('sendInquiryAbout')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XIcon size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Property Preview */}
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex gap-3">
            <img
              src={property.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200'}
              alt={property.title}
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 line-clamp-1">{property.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-1">{property.neighborhood}</p>
              <p className="text-blue-600 font-semibold mt-1">
                {formatPrice(property.price)}
                {property.listing_type === 'rent' && <span className="text-gray-500 font-normal">/month</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Email notification info banner */}
        <div className="px-5 pt-4">
          <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 flex-shrink-0 mt-0.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <p className="text-sm text-emerald-700">
              {t('agentEmailNoticeText')}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('yourName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder={t('fullNamePlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('email')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder={t('emailPlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('phone')} <span className="text-gray-400">{t('optionalLabel')}</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="+250 7XX XXX XXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('description').charAt(0).toUpperCase() + t('description').slice(1)} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder={t('writeMessagePlaceholder')}
              required
            />
          </div>

          {/* Agent Info */}
          {property.agent && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <img
                src={property.agent.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(property.agent.user?.full_name || 'Agent')}&background=2563eb&color=fff`}
                alt={property.agent.user?.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Your message will be sent to</p>
                <p className="font-medium text-gray-900">{property.agent.user?.full_name}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <MessageIcon size={20} />
                Send Inquiry
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            By sending this inquiry, you agree to be contacted by the agent regarding this property.
          </p>
        </form>
      </div>
    </div>
  );
};

export default InquiryModal;
