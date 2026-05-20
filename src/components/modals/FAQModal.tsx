import React from 'react';
import { useLanguage } from '@/contexts/AuthContext';
import { XIcon } from '@/components/icons/Icons';
import { supportContentByLanguage } from '@/lib/i18n/supportContent';

// ── Inline FAQModal ──────────────────────────────────────────────────
 
interface FAQModalProps { onClose: () => void; }
 
const FAQModal: React.FC<FAQModalProps> = ({ onClose }) => {
  const { t, language } = useLanguage();
  const content = supportContentByLanguage[language].faq;
 
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden animate-slide-up flex flex-col">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{t('faq')}</h2>
              <p className="text-amber-100 text-sm mt-0.5">{content.subtitle}</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
              <XIcon size={18} className="text-white" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <p className="text-sm text-gray-600 italic">
            {content.intro}
          </p>
          {content.sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-gray-900 text-base mb-3">{section.icon} {section.title}</h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.question} className="bg-gray-50 rounded-xl p-4">
                    <p className="font-semibold text-gray-900 text-sm mb-1">{item.question}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-sm text-amber-700">
              {content.outro}
            </p>
            <a href="mailto:hello@propspera.com" className="inline-block mt-2 text-sm text-amber-700 font-medium hover:underline">📧 hello@propspera.com</a>
          </div>
        </div>
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors">{t('close')}</button>
        </div>
      </div>
    </div>
  );
};
 

export default FAQModal;
