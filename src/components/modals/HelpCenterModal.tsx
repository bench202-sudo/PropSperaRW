import React from 'react';
import { useLanguage } from '@/contexts/AuthContext';
import { XIcon } from '@/components/icons/Icons';
import { supportContentByLanguage } from '@/lib/i18n/supportContent';

// ── Inline HelpCenterModal ───────────────────────────────────────────
 
interface HelpCenterModalProps { onClose: () => void; }
 
const HelpCenterModal: React.FC<HelpCenterModalProps> = ({ onClose }) => {
  const { t, language } = useLanguage();
  const content = supportContentByLanguage[language].helpCenter;
 
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden animate-slide-up flex flex-col">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{t('helpCenter')}</h2>
              <p className="text-emerald-100 text-sm mt-0.5">{content.subtitle}</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
              <XIcon size={18} className="text-white" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6 text-sm text-gray-700 leading-relaxed">
          <p className="text-gray-600 italic">{content.intro}</p>

          {content.sections.map((section) => (
            <section key={section.title}>
              <h3 className="font-bold text-gray-900 text-base mb-3">{section.icon} {section.title}</h3>
              <div className="space-y-3">
                {section.blocks.map((block) => (
                  <div
                    key={block.title}
                    className={block.tone === 'warning'
                      ? 'bg-amber-50 border border-amber-200 rounded-xl p-4'
                      : 'bg-gray-50 rounded-xl p-4'}
                  >
                    <p className={block.tone === 'warning' ? 'font-semibold text-amber-800 mb-2' : 'font-semibold text-gray-900 mb-2'}>
                      {block.title}
                    </p>
                    {block.body && (
                      <p className={block.tone === 'warning' ? 'text-amber-700 text-sm' : 'text-gray-600'}>{block.body}</p>
                    )}
                    {block.items && (
                      block.ordered ? (
                        <ol className={block.tone === 'warning' ? 'list-decimal list-inside space-y-1 text-amber-700 text-sm' : 'list-decimal list-inside space-y-1 text-gray-600'}>
                          {block.items.map((item) => <li key={item}>{item}</li>)}
                        </ol>
                      ) : (
                        <ul className={block.tone === 'warning' ? 'list-disc list-inside space-y-1 text-amber-700 text-sm' : 'list-disc list-inside space-y-1 text-gray-600'}>
                          {block.items.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      )
                    )}
                    {block.footnote && <p className="text-gray-500 text-xs mt-2">{block.footnote}</p>}
                  </div>
                ))}
              </div>
            </section>
          ))}

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <p className="text-sm text-emerald-700">{content.outro}</p>
          </div>
 
        </div>
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors">{t('close')}</button>
        </div>
      </div>
    </div>
  );
};
 

export default HelpCenterModal;
