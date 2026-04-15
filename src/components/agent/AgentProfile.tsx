import React, { useState } from 'react';
import { Agent, Property } from '@/types';
import { 
  XIcon, CheckCircleIcon, ClockIcon, StarIcon, BuildingIcon, 
  PhoneIcon, MailIcon, CalendarIcon, MessageSquareIcon
} from '@/components/icons/Icons';
import { formatDate } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useAgentRating } from '@/hooks/useAgentReviews';
import PropertyCard from '@/components/property/PropertyCard';
import AgentReviewsSection from '@/components/reviews/AgentReviewsSection';

interface AgentProfileProps {
  agent: Agent;
  properties: Property[];
  onClose: () => void;
  onContact: (agent: Agent) => void;
  onSelectProperty: (property: Property) => void;
  onLoginRequired?: () => void;
}

type ProfileTab = 'about' | 'reviews';

const AgentProfile: React.FC<AgentProfileProps> = ({ 
  agent, 
  properties,
  onClose, 
  onContact,
  onSelectProperty,
  onLoginRequired
}) => {
  const { appUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('about');
  const agentProperties = properties.filter(p => p.agent_id === agent.id && p.status === 'approved');
  const agentRating = useAgentRating(agent.id);

  const displayRating = agentRating.review_count > 0 ? agentRating.avg_rating : agent.rating;
  const reviewCount = agentRating.review_count;

  const handleLoginRequired = () => {
    if (onLoginRequired) {
      onLoginRequired();
    }
  };

  const currentUserId = appUser?.id || null;
  const currentUserName = appUser?.full_name || null;
  const currentUserAvatar = appUser?.avatar_url || null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl animate-slide-up">
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <XIcon size={20} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={agent.avatar_url} 
                alt={agent.full_name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white/30"
              />
              {agent.verification_status === 'approved' && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <CheckCircleIcon size={20} className="text-blue-600" />
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-1">{agent.full_name}</h2>
              <p className="text-blue-100">{agent.company_name}</p>
              
              <div className="flex items-center gap-3 mt-2">
                {agent.verification_status === 'approved' ? (
                  <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs">
                    <CheckCircleIcon size={12} />
                    Verified Agent
                  </span>
                ) : (
                  <span className="flex items-center gap-1 bg-amber-500/80 px-2 py-1 rounded-full text-xs">
                    <ClockIcon size={12} />
                    Pending Verification
                  </span>
                )}
                {displayRating > 0 && (
                  <span className="flex items-center gap-1 text-sm">
                    <StarIcon size={14} filled className="text-amber-300" />
                    <span className="font-semibold">{displayRating}</span>
                    {reviewCount > 0 && (
                      <span className="text-blue-200 text-xs">({reviewCount})</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3 p-4 border-b border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{agent.total_listings}</p>
            <p className="text-xs text-gray-500">Listings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{agent.years_experience}</p>
            <p className="text-xs text-gray-500">Years Exp.</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{displayRating || '-'}</p>
            <p className="text-xs text-gray-500">Rating</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{reviewCount}</p>
            <p className="text-xs text-gray-500">Reviews</p>
          </div>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-3 text-sm font-semibold text-center transition-colors relative ${
              activeTab === 'about'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <BuildingIcon size={16} />
              About
            </div>
            {activeTab === 'about' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-3 text-sm font-semibold text-center transition-colors relative ${
              activeTab === 'reviews'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <MessageSquareIcon size={16} />
              Reviews
              {reviewCount > 0 && (
                <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {reviewCount}
                </span>
              )}
            </div>
            {activeTab === 'reviews' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>
        
        <div className="p-5">
          {activeTab === 'about' && (
            <>
              {agent.bio && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-600 leading-relaxed">{agent.bio}</p>
                </div>
              )}
              
              {agent.specializations.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {agent.specializations.map((spec, index) => (
                      <span 
                        key={index}
                        className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  {agent.phone && (
                    <a 
                      href={`tel:${agent.phone}`}
                      className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <PhoneIcon size={18} />
                      </div>
                      <span>{agent.phone}</span>
                    </a>
                  )}
                  {agent.email && (
                    <a 
                      href={`mailto:${agent.email}`}
                      className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <MailIcon size={18} />
                      </div>
                      <span>{agent.email}</span>
                    </a>
                  )}
                  <div className="flex items-center gap-3 text-gray-500">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <CalendarIcon size={18} />
                    </div>
                    <span>Member since {formatDate(agent.created_at)}</span>
                  </div>
                </div>
              </div>
              
              {agentProperties.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Active Listings ({agentProperties.length})
                  </h3>
                  <div className="grid gap-4">
                    {agentProperties.slice(0, 3).map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onSelect={onSelectProperty}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'reviews' && (
            <AgentReviewsSection
              agentId={agent.id}
              agentName={agent.full_name || 'this agent'}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserAvatar={currentUserAvatar}
              onLoginRequired={handleLoginRequired}
            />
          )}
        </div>
        
        <div className="p-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <button 
            onClick={() => onContact(agent)}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Contact Agent
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentProfile;