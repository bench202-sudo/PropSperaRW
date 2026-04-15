import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Agent, Property, AdminStats } from '@/types';
import { formatPrice, formatDate } from '@/data/mockData';
import { 
  XIcon, CheckCircleIcon, ClockIcon, UsersIcon, BuildingIcon, 
  TrendingUpIcon, AlertCircleIcon, EyeIcon, RefreshIcon, BellIcon, MailIcon
} from '@/components/icons/Icons';
import AdminNotifications from './AdminNotifications';
import AdminEmailDashboard from './AdminEmailDashboard';
import { useLanguage } from '@/contexts/AuthContext';
 
interface AdminDashboardProps {
  onClose: () => void;
}
 
type TabType = 'overview' | 'agents' | 'listings' | 'notifications' | 'emails';
 
interface DBAgent {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  license_number: string;
  bio: string | null;
  years_experience: number;
  specializations: string[];
  verification_status: 'pending' | 'approved' | 'rejected';
  verification_documents: string[];
  avatar_url: string | null;
  total_listings: number;
  rating: number;
  is_active: boolean;
  admin_notes: string | null;
  feedback_message: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}
 
interface DBProperty {
  id: string;
  agent_id: string | null;
  title: string;
  description: string | null;
  property_type: string;
  listing_type: string;
  price: number;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  location: string;
  neighborhood: string | null;
  address: string | null;
  images: string[];
  amenities: string[];
  status: 'pending' | 'approved' | 'rejected' | 'sold' | 'rented';
  featured: boolean;
  views: number;
  hidden?: boolean;
  admin_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
  agent?: DBAgent;
}
 
const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [agents, setAgents] = useState<DBAgent[]>([]);
  const [properties, setProperties] = useState<DBProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);
  const [propertyImageIndex, setPropertyImageIndex] = useState<Record<string, number>>({});
 
  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });
 
      if (agentsError) { setError('Failed to load agents. Please try again.'); return; }
 
      const userIds = [...new Set(agentsData.map((a: any) => a.user_id).filter(Boolean))];
      let usersMap: Record<string, any> = {};
 
      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, full_name, email, phone, avatar_url')
          .in('id', userIds);
        usersMap = Object.fromEntries((usersData || []).map((u: any) => [u.id, u]));
      }
 
      const combined = (agentsData || []).map((agent: any) => ({
        ...agent,
        is_active: agent.is_active !== false,
        full_name: agent.user_id && usersMap[agent.user_id] ? usersMap[agent.user_id].full_name : agent.full_name,
        email: agent.user_id && usersMap[agent.user_id] ? usersMap[agent.user_id].email : agent.email,
        phone: agent.user_id && usersMap[agent.user_id] ? usersMap[agent.user_id].phone : agent.phone,
        avatar_url: agent.user_id && usersMap[agent.user_id] ? usersMap[agent.user_id].avatar_url : agent.avatar_url,
      }));
 
      setAgents(combined);
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };
 
  const fetchProperties = async () => {
    setPropertiesLoading(true);
    try {
      const { data: propsData, error: propsError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
 
      if (propsError) { setError('Failed to load properties.'); return; }
 
      const agentIds = [...new Set(propsData.map((p: any) => p.agent_id).filter(Boolean))];
      let agentsMap: Record<string, any> = {};
 
      if (agentIds.length > 0) {
        const { data: agentsData } = await supabase.from('agents').select('*').in('id', agentIds);
        if (agentsData) {
          const userIds = [...new Set(agentsData.map((a: any) => a.user_id).filter(Boolean))];
          if (userIds.length > 0) {
            const { data: usersData } = await supabase.from('users').select('id, full_name, email, phone, avatar_url').in('id', userIds);
            if (usersData) {
              const usersMap = Object.fromEntries(usersData.map((u: any) => [u.id, u]));
              agentsMap = Object.fromEntries(agentsData.map((agent: any) => [agent.id, {
                ...agent,
                full_name: agent.user_id && usersMap[agent.user_id] ? usersMap[agent.user_id].full_name : agent.full_name,
                email: agent.user_id && usersMap[agent.user_id] ? usersMap[agent.user_id].email : agent.email,
                avatar_url: agent.user_id && usersMap[agent.user_id] ? usersMap[agent.user_id].avatar_url : agent.avatar_url,
              }]));
            }
          }
        }
      }
 
      setProperties((propsData || []).map((p: any) => ({ ...p, agent: p.agent_id ? (agentsMap[p.agent_id] || null) : null })));
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setPropertiesLoading(false);
    }
  };
 
  const fetchUnreadCount = async () => {
    try {
      const { count } = await supabase.from('admin_notifications').select('*', { count: 'exact', head: true }).eq('is_read', false);
      setUnreadNotifications(count || 0);
    } catch (err) {}
  };
 
  useEffect(() => {
    fetchAgents();
    fetchProperties();
    fetchUnreadCount();
  }, []);
 
  // ── PATCH 1: Compute inactive agents and hidden listings ──────────────────
  const inactiveAgents = agents.filter(a => a.is_active === false);
  const hiddenListings = properties.filter(p => p.hidden === true);
 
  const stats: AdminStats = {
    total_agents: agents.length,
    pending_agents: agents.filter(a => a.verification_status === 'pending').length,
    approved_agents: agents.filter(a => a.verification_status === 'approved' && a.is_active !== false).length,
    total_listings: properties.length,
    pending_listings: properties.filter(p => p.status === 'pending').length,
    approved_listings: properties.filter(p => p.status === 'approved' && !p.hidden).length,
    total_buyers: 1,
    total_messages: 4
  };
  // ── End Patch 1 ───────────────────────────────────────────────────────────
 
  const handleAgentAction = async (agentId: string, action: 'approve' | 'reject', feedback?: string) => {
    setActionLoading(agentId);
    try {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      const agent = agents.find(a => a.id === agentId);
      const updateData: any = { verification_status: newStatus, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      if (feedback) updateData.feedback_message = feedback;
 
      const { error } = await supabase.from('agents').update(updateData).eq('id', agentId);
      if (error) { setError(`Failed to ${action} agent.`); return; }
 
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, verification_status: newStatus, reviewed_at: new Date().toISOString(), feedback_message: feedback || null } : a));
 
      if (action === 'approve' && agent?.user_id) {
        await supabase.from('users').update({ role: 'agent' }).eq('id', agent.user_id);
      }
 
      if (agent) {
        try {
          await supabase.functions.invoke('send-agent-notification', {
            body: { type: action === 'approve' ? 'agent_approved' : 'agent_rejected', agentEmail: agent.email, agentName: agent.full_name, feedbackMessage: feedback }
          });
        } catch (e) {}
      }
      fetchUnreadCount();
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setActionLoading(null);
    }
  };
 
  const handleToggleAgentActive = async (agentId: string, currentIsActive: boolean) => {
    setActionLoading(agentId);
    try {
      const newIsActive = !currentIsActive;
      const { error } = await supabase
        .from('agents')
        .update({ is_active: newIsActive, updated_at: new Date().toISOString() })
        .eq('id', agentId);
 
      if (error) { setError('Failed to update agent status.'); return; }
 
      await supabase
        .from('properties')
        .update({ hidden: !newIsActive, updated_at: new Date().toISOString() })
        .eq('agent_id', agentId);
 
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, is_active: newIsActive } : a));
      await fetchProperties();
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setActionLoading(null);
    }
  };
 
  const handlePropertyAction = async (propertyId: string, action: 'approve' | 'reject') => {
    setActionLoading(propertyId);
    try {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      const { error } = await supabase.from('properties').update({ status: newStatus, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', propertyId);
      if (error) { setError(`Failed to ${action} property.`); return; }
      await fetchProperties();
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setActionLoading(null);
    }
  };
 
  const handleToggleFeatured = async (propertyId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase.from('properties').update({ featured: !currentFeatured, updated_at: new Date().toISOString() }).eq('id', propertyId);
      if (error) { setError('Failed to update featured status.'); return; }
      await fetchProperties();
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };
 
  const pendingAgents = agents.filter(a => a.verification_status === 'pending');
  const pendingProperties = properties.filter(p => p.status === 'pending');
 
  const getDocumentUrl = (path: string) => {
    const { data } = supabase.storage.from('agent-documents').getPublicUrl(path);
    return data.publicUrl;
  };
 
  const renderOverview = () => (
    <div className="p-5 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircleIcon size={20} className="text-red-600 mt-0.5" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button onClick={() => setError(null)}><XIcon size={16} /></button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {/* ── PATCH 2: Total Agents card with inactive count ── */}
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center"><UsersIcon size={20} className="text-white" /></div>
            <span className="text-sm text-gray-600">{t('totalAgents')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total_agents}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.approved_agents} {t('verifiedCount')}, {stats.pending_agents} {t('pendingCount')}</p>
          {inactiveAgents.length > 0 && (
            <p className="text-xs text-red-500 mt-0.5 font-medium">{inactiveAgents.length} {t('inactiveCount')}</p>
          )}
        </div>
        {/* ── PATCH 3: Total Listings card with deactivated count ── */}
        <div className="bg-emerald-50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center"><BuildingIcon size={20} className="text-white" /></div>
            <span className="text-sm text-gray-600">{t('totalListingsLabel')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total_listings}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.approved_listings} {t('liveCount')}, {stats.pending_listings} {t('pendingCount')}</p>
          {hiddenListings.length > 0 && (
            <p className="text-xs text-red-500 mt-0.5 font-medium">{hiddenListings.length} {t('deactivatedCount')}</p>
          )}
        </div>
        <div className="bg-amber-50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center"><ClockIcon size={20} className="text-white" /></div>
            <span className="text-sm text-gray-600">{t('pendingReview')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending_agents + stats.pending_listings}</p>
          <p className="text-xs text-gray-500 mt-1">{t('requiresAttention')}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center"><TrendingUpIcon size={20} className="text-white" /></div>
            <span className="text-sm text-gray-600">{t('totalViews')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{properties.reduce((sum, p) => sum + (p.views || 0), 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{t('acrossAllListings')}</p>
        </div>
      </div>
 
      {unreadNotifications > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => setActiveTab('notifications')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center"><BellIcon size={20} className="text-white" /></div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-800">{t('newNotifications')}</h3>
              <p className="text-sm text-blue-700">You have {unreadNotifications} unread notification{unreadNotifications !== 1 ? 's' : ''}</p>
            </div>
            <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">View</span>
          </div>
        </div>
      )}
 
      {(pendingAgents.length > 0 || pendingProperties.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircleIcon size={20} className="text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">{t('actionRequired')}</h3>
              <p className="text-sm text-amber-700 mt-1">
                You have {pendingAgents.length} agent{pendingAgents.length !== 1 ? 's' : ''} and {pendingProperties.length} listing{pendingProperties.length !== 1 ? 's' : ''} awaiting approval.
              </p>
            </div>
          </div>
        </div>
      )}
 
      {pendingAgents.length === 0 && pendingProperties.length === 0 && !loading && !propertiesLoading && (
        <div className="text-center py-8">
          <CheckCircleIcon size={48} className="text-green-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">{t('allCaughtUp')}</h3>
          <p className="text-sm text-gray-500 mt-1">{t('noPendingItems')}</p>
        </div>
      )}
    </div>
  );
 
  const renderAgents = () => (
    <div className="p-5">
      <div className="flex justify-end mb-4">
        <button onClick={fetchAgents} disabled={loading} className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50">
          <RefreshIcon size={16} className={loading ? 'animate-spin' : ''} />
          {t('refresh')}
        </button>
      </div>
 
      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : agents.length === 0 ? (
        <div className="text-center py-12">
          <UsersIcon size={48} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">{t('noAgentApplications')}</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => {
            const isExpanded = expandedAgent === agent.id;
            return (
            <div key={agent.id} className={`bg-white border rounded-xl overflow-hidden ${!agent.is_active ? 'border-red-200 opacity-75' : 'border-gray-200'}`}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {agent.avatar_url ? (
                    <img src={agent.avatar_url} alt={agent.full_name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-xl">{agent.full_name?.charAt(0)?.toUpperCase() || 'A'}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{agent.full_name}</h4>
                      {agent.verification_status === 'approved' && <CheckCircleIcon size={16} className="text-blue-600" />}
                      {!agent.is_active && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">{t('deactivated')}</span>}
                    </div>
                    <p className="text-sm text-gray-500">{agent.company_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{agent.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {agent.verification_status === 'pending' ? (
                        <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium"><ClockIcon size={12} />{t('pendingStatus')}</span>
                      ) : agent.verification_status === 'approved' ? (
                        <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium"><CheckCircleIcon size={12} />{t('verifiedAgent')}</span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">{t('rejectedStatus')}</span>
                      )}
                      <span className="text-xs text-gray-400">{formatDate(agent.created_at)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors flex-shrink-0"
                  >
                    <EyeIcon size={14} />
                    {isExpanded ? t('hide') : t('view')}
                  </button>
                </div>
              </div>
 
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('contactInfo')}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><p className="text-xs text-gray-400">Email</p><p className="text-gray-900 font-medium">{agent.email || '—'}</p></div>
                      <div><p className="text-xs text-gray-400">Phone</p><p className="text-gray-900 font-medium">{agent.phone || '—'}</p></div>
                      <div><p className="text-xs text-gray-400">License No.</p><p className="text-gray-900 font-medium">{agent.license_number || '—'}</p></div>
                      <div><p className="text-xs text-gray-400">Experience</p><p className="text-gray-900 font-medium">{agent.years_experience} years</p></div>
                    </div>
                  </div>
                  {agent.bio && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Bio</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{agent.bio}</p>
                    </div>
                  )}
                  {agent.specializations && agent.specializations.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Specializations</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.specializations.map((spec) => (
                          <span key={spec} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">{spec}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {agent.verification_documents && agent.verification_documents.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Verification Documents</p>
                      <div className="flex flex-wrap gap-2">
                        {agent.verification_documents.map((doc, idx) => (
                          <a key={idx} href={getDocumentUrl(doc)} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition-colors">
                            <EyeIcon size={14} />Document {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {agent.feedback_message && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Admin Feedback</p>
                      <p className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg p-3">{agent.feedback_message}</p>
                    </div>
                  )}
                </div>
              )}
 
              <div className="flex gap-2 p-4 pt-0">
                {agent.verification_status === 'pending' && (
                  <>
                    <button onClick={() => handleAgentAction(agent.id, 'approve')} disabled={actionLoading === agent.id} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50">
                      {actionLoading === agent.id ? t('processing') : t('approveAgent')}
                    </button>
                    <button onClick={() => handleAgentAction(agent.id, 'reject')} disabled={actionLoading === agent.id} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50">
                      Reject
                    </button>
                  </>
                )}
                {agent.verification_status === 'approved' && (
                  <button onClick={() => handleToggleAgentActive(agent.id, agent.is_active)} disabled={actionLoading === agent.id}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${agent.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                    {actionLoading === agent.id ? t('processing') : agent.is_active ? t('deactivateAgent') : t('reactivateAgent')}
                  </button>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
 
  const renderListings = () => (
    <div className="p-5">
      <div className="flex justify-end mb-4">
        <button onClick={fetchProperties} disabled={propertiesLoading} className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50">
          <RefreshIcon size={16} className={propertiesLoading ? 'animate-spin' : ''} />
          {t('refresh')}
        </button>
      </div>
 
      {propertiesLoading ? (
        <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12">
          <BuildingIcon size={48} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">{t('noPropertyListings')}</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((property) => {
            const isExpanded = expandedProperty === property.id;
            const imgIdx = propertyImageIndex[property.id] || 0;
            return (
            <div key={property.id} className={`bg-white border border-gray-200 rounded-xl overflow-hidden ${property.hidden ? 'opacity-60 border-red-200' : ''}`}>
              <div className="p-4">
                <div className="flex gap-3">
                  <img src={property.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200'} alt={property.title} className="w-24 h-20 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-gray-900 truncate">{property.title}</h4>
                      <button
                        onClick={() => setExpandedProperty(isExpanded ? null : property.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors flex-shrink-0"
                      >
                        <EyeIcon size={13} />
                        {isExpanded ? 'Hide' : 'View'}
                      </button>
                    </div>
                    <p className="text-sm font-medium text-blue-600 mt-0.5">{formatPrice(property.price)}</p>
                    <p className="text-xs text-gray-500 mt-1">{property.neighborhood} · {property.property_type} · {property.listing_type}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {property.status === 'pending' ? (
                        <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium"><ClockIcon size={12} />{t('pendingStatus')}</span>
                      ) : property.status === 'approved' ? (
                        <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium"><CheckCircleIcon size={12} />{t('liveStatus')}</span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">Rejected</span>
                      )}
                      {property.hidden && (
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">{t('deactivated')}</span>
                      )}
                      {property.featured && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">{t('featured')}</span>}
                      <span className="flex items-center gap-1 text-xs text-gray-500"><EyeIcon size={12} />{property.views || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  {property.agent?.avatar_url ? (
                    <img src={property.agent.avatar_url} alt={property.agent.full_name} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-xs">{property.agent?.full_name?.charAt(0)?.toUpperCase() || 'A'}</span>
                    </div>
                  )}
                  <span className="text-xs text-gray-600">by {property.agent?.full_name || t('unknownAgent')}</span>
                  <span className="text-xs text-gray-400">· {formatDate(property.created_at)}</span>
                </div>
              </div>
 
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50">
                  {property.images && property.images.length > 0 && (
                    <div className="relative">
                      <img src={property.images[imgIdx]} alt={property.title} className="w-full h-52 object-cover" />
                      {property.images.length > 1 && (
                        <div className="absolute inset-0 flex items-center justify-between px-2">
                          <button onClick={() => setPropertyImageIndex(prev => ({ ...prev, [property.id]: Math.max(0, (prev[property.id] || 0) - 1) }))}
                            className="w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center text-sm hover:bg-black/70">‹</button>
                          <button onClick={() => setPropertyImageIndex(prev => ({ ...prev, [property.id]: Math.min(property.images.length - 1, (prev[property.id] || 0) + 1) }))}
                            className="w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center text-sm hover:bg-black/70">›</button>
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        {imgIdx + 1}/{property.images.length}
                      </div>
                    </div>
                  )}
                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('propertyDetails')}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><p className="text-xs text-gray-400">Price</p><p className="text-gray-900 font-semibold text-blue-600">{formatPrice(property.price)}</p></div>
                        <div><p className="text-xs text-gray-400">Type</p><p className="text-gray-900 font-medium capitalize">{property.property_type} · {property.listing_type}</p></div>
                        {property.bedrooms && <div><p className="text-xs text-gray-400">Bedrooms</p><p className="text-gray-900 font-medium">{property.bedrooms}</p></div>}
                        {property.bathrooms && <div><p className="text-xs text-gray-400">Bathrooms</p><p className="text-gray-900 font-medium">{property.bathrooms}</p></div>}
                        {property.area_sqm && <div><p className="text-xs text-gray-400">Area</p><p className="text-gray-900 font-medium">{property.area_sqm} m²</p></div>}
                        <div><p className="text-xs text-gray-400">Location</p><p className="text-gray-900 font-medium">{property.neighborhood || property.location}</p></div>
                      </div>
                    </div>
                    {property.description && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{property.description}</p>
                      </div>
                    )}
                    {property.amenities && property.amenities.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Amenities</p>
                        <div className="flex flex-wrap gap-1">
                          {property.amenities.map((a) => (
                            <span key={a} className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs">{a}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {property.address && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</p>
                        <p className="text-sm text-gray-700">{property.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
 
              <div className="flex gap-2 p-4 pt-0">
                {property.status === 'pending' ? (
                  <>
                    <button onClick={() => handlePropertyAction(property.id, 'approve')} disabled={actionLoading === property.id} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50">
                      {actionLoading === property.id ? t('processing') : t('approve')}
                    </button>
                    <button onClick={() => handlePropertyAction(property.id, 'reject')} disabled={actionLoading === property.id} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50">
                      Reject
                    </button>
                  </>
                ) : property.status === 'approved' && (
                  <button onClick={() => handleToggleFeatured(property.id, property.featured)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${property.featured ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {property.featured ? t('removeFeatured') : t('markFeatured')}
                  </button>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
 
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className={`bg-gray-50 w-full ${activeTab === 'emails' ? 'max-w-3xl' : 'max-w-lg'} max-h-[95vh] overflow-hidden rounded-t-2xl sm:rounded-2xl animate-slide-up flex flex-col transition-all duration-300`}>
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">{t('adminTitle')}</h2>
            <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"><XIcon size={20} /></button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['overview', 'notifications', 'emails', 'agents', 'listings'] as TabType[]).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap flex items-center gap-1 ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {tab === 'notifications' && <BellIcon size={16} />}
                {tab === 'emails' && <MailIcon size={16} />}
                {tab}
                {tab === 'notifications' && unreadNotifications > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>{unreadNotifications}</span>
                )}
                {tab === 'agents' && pendingAgents.length > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab ? 'bg-white text-blue-600' : 'bg-amber-500 text-white'}`}>{pendingAgents.length}</span>
                )}
                {tab === 'listings' && pendingProperties.length > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab ? 'bg-white text-blue-600' : 'bg-amber-500 text-white'}`}>{pendingProperties.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'notifications' && (
            <AdminNotifications
              onApproveAgent={(agentId, feedback) => handleAgentAction(agentId, 'approve', feedback)}
              onRejectAgent={(agentId, feedback) => handleAgentAction(agentId, 'reject', feedback)}
              actionLoading={actionLoading}
            />
          )}
          {activeTab === 'emails' && <AdminEmailDashboard />}
          {activeTab === 'agents' && renderAgents()}
          {activeTab === 'listings' && renderListings()}
        </div>
      </div>
    </div>
  );
};
 
export default AdminDashboard;
