import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MailIcon, PhoneIcon, MessageIcon, CheckCircleIcon, AlertCircleIcon, XIcon } from '@/components/icons/Icons';
import { useLanguage } from '@/contexts/AuthContext';

// ── Inline ContactModal ───────────────────────────────────────────────
 
interface ContactModalProps {
  onClose: () => void;
}
 
const MAX_MESSAGE_LENGTH = 500;
 
const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { t } = useLanguage();
 
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    else if (phone.trim().length < 7) newErrors.phone = 'Enter a valid phone number';
    if (!message.trim()) newErrors.message = 'Message is required';
    else if (message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
 
    setSubmitting(true);
    setError(null);
 
    try {
      // 1. Find admin user id
      const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .single();
 
      if (adminError || !adminUser) {
        setError('Could not reach support. Please email hello@propspera.com directly.');
        setSubmitting(false);
        return;
      }
 
      // 2. Create a synthetic sender record or use a placeholder id
      // We insert a message from a "guest" using their email as identifier
      // Since sender_id requires a valid users.id, we use the admin's id as both
      // and embed the contact info in the message body
      const messageBody = `📬 Contact Form Submission\n\nFrom: ${email}\nPhone: ${phone}\n\n${message}`;
 
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          sender_id: adminUser.id,   // self-message to admin inbox
          receiver_id: adminUser.id,
          content: messageBody,
          is_read: false,
          created_at: new Date().toISOString()
        });
 
      if (msgError) throw msgError;
 
      // 3. Send email notification to admin via edge function
      try {
        await supabase.functions.invoke('send-inquiry-notification', {
          body: {
            type: 'contact_form',
            agentEmail: 'hello@propspera.com',
            agentName: 'PropSpera Admin',
            senderEmail: email,
            senderPhone: phone,
            message: message
          }
        });
      } catch (emailErr) {
        console.warn('Email notification failed but message was saved:', emailErr);
      }
 
      setSuccess(true);
    } catch (err: any) {
      console.error('Contact form error:', err);
      setError('Failed to send message. Please try again or email hello@propspera.com.');
    } finally {
      setSubmitting(false);
    }
  };
 
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{t('contactTitle')}</h2>
              <p className="text-blue-200 text-sm mt-0.5">{t('contactSubtitle')}</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            >
              <XIcon size={18} className="text-white" />
            </button>
          </div>
        </div>
 
        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('contactSuccess')}</h3>
              <p className="text-gray-500 text-sm mb-6">
                {t('contactSuccessMsg').replace('{email}', email)}
              </p>
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MailIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
                    placeholder="your@email.com"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.email ? 'ring-2 ring-red-400' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
 
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <PhoneIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); if (errors.phone) setErrors(p => ({ ...p, phone: '' })); }}
                    placeholder="+250 7XX XXX XXX"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${errors.phone ? 'ring-2 ring-red-400' : ''}`}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
 
              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => {
                    if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                      setMessage(e.target.value);
                      if (errors.message) setErrors(p => ({ ...p, message: '' }));
                    }
                  }}
                  placeholder="How can we help you? Tell us about your property needs, questions, or feedback..."
                  rows={5}
                  className={`w-full px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none ${errors.message ? 'ring-2 ring-red-400' : ''}`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.message
                    ? <p className="text-red-500 text-xs">{errors.message}</p>
                    : <span />
                  }
                  <p className={`text-xs ml-auto ${message.length >= MAX_MESSAGE_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
                    {message.length}/{MAX_MESSAGE_LENGTH}
                  </p>
                </div>
              </div>
 
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircleIcon size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
 
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageIcon size={18} />
                    {t('contactSend')}
                  </>
                )}
              </button>
 
              <p className="text-center text-xs text-gray-400">
                Or email us directly at{' '}
                <a href="mailto:hello@propspera.com" className="text-blue-600 hover:underline">
                  hello@propspera.com
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
 

export default ContactModal;
