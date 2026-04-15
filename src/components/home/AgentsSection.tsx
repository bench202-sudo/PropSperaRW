import React from 'react';
import { Agent } from '@/types';
import AgentCard from '@/components/agent/AgentCard';
import { ChevronRightIcon, ShieldCheckIcon, SearchIcon } from '@/components/icons/Icons';
import { useLanguage } from '@/contexts/AuthContext';
 
interface AgentsSectionProps {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
  onContactAgent: (agent: Agent) => void;
  onBecomeAgent: () => void;
  onViewAllAgents?: () => void;
}
 
const AgentsSection: React.FC<AgentsSectionProps> = ({
  agents,
  onSelectAgent,
  onContactAgent,
  onBecomeAgent,
  onViewAllAgents
}) => {
  const { t } = useLanguage();
  const verifiedAgents = agents.filter(a =>
    a.verification_status === 'approved' && (a as any).is_active !== false
  );
 
  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheckIcon size={24} className="text-blue-600" />
              <span className="text-blue-600 font-semibold">{t('verifiedProfessionals')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('meetTopAgents')}</h2>
            <p className="text-gray-500">{t('agentsSectionSubtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            {onViewAllAgents && (
              <button onClick={onViewAllAgents}
                className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                <SearchIcon size={18} />
                {t('findAgent')}
              </button>
            )}
            <button onClick={onBecomeAgent}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              {t('becomeAgent')}
              <ChevronRightIcon size={18} />
            </button>
          </div>
        </div>
 
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {verifiedAgents.slice(0, 6).map((agent) => (
            <AgentCard key={agent.id} agent={agent} onSelect={onSelectAgent} onContact={onContactAgent} />
          ))}
        </div>
 
        {onViewAllAgents && verifiedAgents.length > 6 && (
          <div className="mt-8 text-center">
            <button onClick={onViewAllAgents}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm">
              {t('viewAllAgents').replace('{count}', verifiedAgents.length.toString())}
              <ChevronRightIcon size={18} />
            </button>
          </div>
        )}
 
        <div className="mt-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{t('whyVerifiedAgents')}</h3>
              <p className="text-blue-100 max-w-xl">{t('whyVerifiedAgentsDesc')}</p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">100%</p>
                <p className="text-blue-200 text-sm">{t('verified')}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">24h</p>
                <p className="text-blue-200 text-sm">{t('response')}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">4.8</p>
                <p className="text-blue-200 text-sm">{t('avgRating')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
 
export default AgentsSection;
