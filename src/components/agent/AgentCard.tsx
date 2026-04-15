import React from 'react';
import { Agent } from '@/types';
import { CheckCircleIcon, ClockIcon, StarIcon, BuildingIcon, MessageIcon } from '@/components/icons/Icons';
import { useLanguage } from '@/contexts/AuthContext';
 
interface AgentCardProps {
  agent: Agent;
  onSelect: (agent: Agent) => void;
  onContact?: (agent: Agent) => void;
  showStatus?: boolean;
}
 
const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelect, onContact, showStatus = false }) => {
  const { t } = useLanguage();
 
  const handleContactClick = (e: React.MouseEvent) => { e.stopPropagation(); if (onContact) onContact(agent); };
 
  const getStatusBadge = () => {
    switch (agent.verification_status) {
      case 'approved': return <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium"><CheckCircleIcon size={12} />{t('verifiedAgent')}</span>;
      case 'pending': return <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium"><ClockIcon size={12} />{t('pendingStatus')}</span>;
      case 'rejected': return <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">{t('rejectedStatus')}</span>;
      default: return null;
    }
  };
 
  return (
    <div onClick={() => onSelect(agent)} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-all group">
      <div className="flex items-start gap-4">
        <div className="relative">
          <img src={agent.user?.avatar_url} alt={agent.user?.full_name} className="w-16 h-16 rounded-full object-cover" />
          {agent.verification_status === 'approved' && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <CheckCircleIcon size={14} className="text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{agent.user?.full_name}</h3>
            {showStatus && getStatusBadge()}
          </div>
          <p className="text-sm text-gray-500 mb-2">{agent.company_name}</p>
          <div className="flex items-center gap-4 text-sm">
            {agent.rating > 0 && <div className="flex items-center gap-1"><StarIcon size={14} filled className="text-amber-400" /><span className="font-medium">{agent.rating}</span></div>}
            <div className="flex items-center gap-1 text-gray-500"><BuildingIcon size={14} /><span>{agent.total_listings} {t('listingsLabel')}</span></div>
            <span className="text-gray-500">{agent.years_experience} {t('yrsExp')}</span>
          </div>
        </div>
        {onContact && agent.verification_status === 'approved' && (
          <button onClick={handleContactClick} className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors">
            <MessageIcon size={18} />
          </button>
        )}
      </div>
      {agent.specializations.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
          {agent.specializations.slice(0, 3).map((spec, index) => (
            <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">{spec}</span>
          ))}
        </div>
      )}
    </div>
  );
};
 
export default AgentCard;

