import React from 'react';
import { useLanguage } from '@/contexts/AuthContext';
import { XIcon } from '@/components/icons/Icons';
import { supportContentByLanguage } from '@/lib/i18n/supportContent';

// ── Inline PrivacyPolicyModal ────────────────────────────────────────
 
interface PrivacyPolicyModalProps { onClose: () => void; }
 
const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
  const { t, language } = useLanguage();
  const content = supportContentByLanguage[language].privacyPolicy;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden animate-slide-up flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{t('privacyPolicy')}</h2>
              <p className="text-blue-200 text-sm mt-0.5">{content.updatedLabel}</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
              <XIcon size={18} className="text-white" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5 text-sm text-gray-700 leading-relaxed">
          {content.sections.map((section) => (
            <section key={section.title}>
              <h3 className="font-bold text-gray-900 text-base mb-2">{section.title}</h3>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mb-2">{paragraph}</p>
              ))}
              {section.bullets && (
                <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600 mb-2">
                  {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              )}
              {section.subSections?.map((subSection) => (
                <div key={subSection.title} className="mt-3">
                  <h4 className="font-semibold text-gray-800 mb-1">{subSection.title}</h4>
                  {subSection.paragraphs?.map((paragraph) => (
                    <p key={paragraph} className="mb-2">{paragraph}</p>
                  ))}
                  {subSection.bullets && (
                    <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600 mb-2">
                      {subSection.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                    </ul>
                  )}
                  {subSection.note && <p className="text-gray-400 italic">({subSection.note})</p>}
                </div>
              ))}
              {section.links && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                  {section.links.map((link) => (
                    <p key={link.href}>
                      {link.icon}{' '}
                      <a href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined} className="text-blue-600 hover:underline font-medium">
                        {link.label}
                      </a>
                    </p>
                  ))}
                </div>
              )}
              {section.note && <p className="mt-2">{section.note}</p>}
            </section>
          ))}
 
        </div>
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
 

export default PrivacyPolicyModal;
