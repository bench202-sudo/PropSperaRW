import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth, useLanguage } from '@/contexts/AuthContext';
import { Property, PropertyStatus } from '@/types';
import { 
  XIcon, PlusIcon, EditIcon, EyeIcon, BuildingIcon, CheckCircleIcon, 
  ClockIcon, RefreshIcon, InboxIcon, MapPinIcon, TagIcon, MessageIcon
} from '@/components/icons/Icons';
import EditPropertyModal from '@/components/property/EditPropertyModal';
import AddPropertyModal from '@/components/property/AddPropertyModal';
import InquiriesPanel from '@/components/agent/InquiriesPanel';
 
interface AgentDashboardProps { onClose: () => void; }
interface AgentStats {
  totalListings: number; approvedListings: number; pendingListings: number;
  soldRentedListings: number; totalViews: number; totalInquiries: number; newInquiries: number;
}
type FilterStatus = 'all' | 'approved' | 'pending' | 'sold' | 'rented' | 'rejected';
 
const AgentDashboard: React.FC<AgentDashboardProps> = ({ onClose }) => {
  const { appUser } = useAuth();
  const { t } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInquiriesPanel, setShowInquiriesPanel] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [stats, setStats] = useState<AgentStats>({
    totalListings: 0, approvedListings: 0, pendingListings: 0,
    soldRentedListings: 0, totalViews: 0, totalInquiries: 0, newInquiries: 0
  });
 
  useEffect(() => { fetchAgentData(); }, [appUser]);

  // Auto-refresh inquiry count when a new inquiry arrives via Realtime
  useEffect(() => {
    if (!agentId) return;
    const channel = supabase
      .channel(`inquiries:agent:${agentId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'inquiries', filter: `agent_id=eq.${agentId}` },
        () => {
          setStats(prev => ({
            ...prev,
            totalInquiries: prev.totalInquiries + 1,
            newInquiries: prev.newInquiries + 1,
          }));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [agentId]);
 
  const fetchAgentData = async () => {
    if (!appUser?.id) return;
    setLoading(true);
    try {
      let { data: agentData, error: agentError } = await supabase
        .from('agents').select('id, verification_status').eq('user_id', appUser.id).single();
 
      if (agentError && (appUser.role === 'agent' || appUser.role === 'homeowner')) {
        const isHomeowner = appUser.role === 'homeowner';
        const { data: newAgent, error: createError } = await supabase
          .from('agents').insert({
            user_id: appUser.id,
            verification_status: isHomeowner ? 'approved' : 'pending',
            years_experience: 0, specializations: [], verification_documents: [],
            total_listings: 0, rating: 0
          }).select('id, verification_status').single();
        if (createError) { setLoading(false); return; }
        agentData = newAgent;
      } else if (agentError) { setLoading(false); return; }
 
      if (!agentData) { setLoading(false); return; }
      setAgentId(agentData.id);
      setAgentStatus(agentData.verification_status);
      const effectivelyApproved = agentData.verification_status === 'approved' || appUser.role === 'homeowner';
      if (!effectivelyApproved) { setLoading(false); return; }
 
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties').select('*').eq('agent_id', agentData.id).order('created_at', { ascending: false });
      if (propertiesError) { setLoading(false); return; }
 
      const transformedProperties: Property[] = (propertiesData || []).map(p => ({
        id: p.id, agent_id: p.agent_id, title: p.title, description: p.description,
        property_type: p.property_type, listing_type: p.listing_type, price: p.price,
        currency: p.currency || 'RWF', bedrooms: p.bedrooms, bathrooms: p.bathrooms,
        area_sqm: p.area_sqm, location: p.location || 'Kigali, Rwanda',
        neighborhood: p.neighborhood, address: p.address,
        images: p.images || [], video_url: p.video_url ?? null, amenities: p.amenities || [],
        status: p.status, featured: p.featured || false, views: p.views || 0, created_at: p.created_at
      }));
      setProperties(transformedProperties);
 
      const { data: allInquiries } = await supabase
        .from('inquiries').select('*').eq('agent_id', agentData.id);
      const totalInquiryCount = allInquiries?.length || 0;
      const newInquiryCount = allInquiries?.filter(i => i.status === 'pending').length || 0;
 
      setStats({
        totalListings: transformedProperties.length,
        approvedListings: transformedProperties.filter(p => p.status === 'approved').length,
        pendingListings: transformedProperties.filter(p => p.status === 'pending').length,
        soldRentedListings: transformedProperties.filter(p => p.status === 'sold' || p.status === 'rented').length,
        totalViews: transformedProperties.reduce((sum, p) => sum + (p.views || 0), 0),
        totalInquiries: totalInquiryCount, newInquiries: newInquiryCount
      });
    } catch (err) { console.error('Error:', err); } 
    finally { setLoading(false); }
  };
 
  const filteredProperties = useMemo(() => {
    if (filterStatus === 'all') return properties;
    return properties.filter(p => p.status === filterStatus);
  }, [properties, filterStatus]);
 
  const handleMarkStatus = async (propertyId: string, newStatus: 'sold' | 'rented') => {
    setActionLoading(propertyId);
    try {
      const { error } = await supabase.from('properties')
        .update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', propertyId);
      if (error) throw error;
      setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, status: newStatus } : p));
      setStats(prev => ({ ...prev, approvedListings: prev.approvedListings - 1, soldRentedListings: prev.soldRentedListings + 1 }));
    } catch (err) { console.error('Error:', err); } 
    finally { setActionLoading(null); }
  };
 
  const handleReactivate = async (propertyId: string) => {
    setActionLoading(propertyId);
    try {
      const { error } = await supabase.from('properties')
        .update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', propertyId);
      if (error) throw error;
      setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, status: 'approved' } : p));
      setStats(prev => ({ ...prev, approvedListings: prev.approvedListings + 1, soldRentedListings: prev.soldRentedListings - 1 }));
    } catch (err) { console.error('Error:', err); } 
    finally { setActionLoading(null); }
  };
 
  const handleEditSuccess = () => { setShowEditModal(false); setSelectedProperty(null); fetchAgentData(); };
  const handleAddSuccess = () => { setShowAddModal(false); fetchAgentData(); };
  const formatPrice = (price: number, currency?: string) => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
    }
    return `${new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(price)} RWF`;
  };
 
  const getStatusBadge = (status: PropertyStatus) => {
    const styles: Record<PropertyStatus, string> = {
      pending: 'bg-amber-100 text-amber-700', approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700', sold: 'bg-purple-100 text-purple-700', rented: 'bg-blue-100 text-blue-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };
 
  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      all: t('allLabel'), approved: t('activeLabel'), pending: t('pendingLabel'),
      sold: t('sold'), rented: t('rented'), rejected: t('rejected')
    };
    return map[status] || status;
  };
 
  if (!loading && agentStatus !== 'approved' && appUser?.role !== 'homeowner') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClockIcon size={32} className="text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('accountPendingApproval')}</h2>
          <p className="text-gray-600 mb-6">{t('accountPendingMsg')}</p>
          <button onClick={onClose} className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">{t('close')}</button>
        </div>
      </div>
    );
  }
 
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white w-full h-full lg:w-[95vw] lg:h-[95vh] lg:max-w-7xl lg:rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold">{t('agentDashboard')}</h1>
              <p className="text-blue-100 text-sm">{t('manageListings')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowInquiriesPanel(true)}
                className="relative flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <MessageIcon size={20} />
                <span className="hidden sm:inline text-sm font-medium">{t('inquiries')}</span>
                {stats.newInquiries > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {stats.newInquiries > 9 ? '9+' : stats.newInquiries}
                  </span>
                )}
              </button>
              <button onClick={fetchAgentData} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title={t('refresh')}>
                <RefreshIcon size={20} />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <XIcon size={20} />
              </button>
            </div>
          </div>
 
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <BuildingIcon size={18} className="text-blue-200" />
                <span className="text-blue-100 text-xs">{t('totalListings')}</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalListings}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircleIcon size={18} className="text-green-300" />
                <span className="text-blue-100 text-xs">{t('activeLabel')}</span>
              </div>
              <p className="text-2xl font-bold">{stats.approvedListings}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <ClockIcon size={18} className="text-amber-300" />
                <span className="text-blue-100 text-xs">{t('pendingLabel')}</span>
              </div>
              <p className="text-2xl font-bold">{stats.pendingListings}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <EyeIcon size={18} className="text-blue-200" />
                <span className="text-blue-100 text-xs">{t('totalViews')}</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalViews}</p>
            </div>
            <button onClick={() => setShowInquiriesPanel(true)}
              className="bg-white/10 backdrop-blur rounded-xl p-3 text-left hover:bg-white/20 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <MessageIcon size={18} className="text-emerald-300" />
                <span className="text-blue-100 text-xs">{t('inquiries')}</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{stats.totalInquiries}</p>
                {stats.newInquiries > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {stats.newInquiries} {t('new')}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
 
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              {(['all', 'approved', 'pending', 'sold', 'rented', 'rejected'] as FilterStatus[]).map((status) => (
                <button key={status} onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    filterStatus === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {getStatusLabel(status)}
                  {status === 'all' && ` (${properties.length})`}
                  {status === 'approved' && ` (${stats.approvedListings})`}
                  {status === 'pending' && ` (${stats.pendingListings})`}
                  {status === 'sold' && ` (${properties.filter(p => p.status === 'sold').length})`}
                  {status === 'rented' && ` (${properties.filter(p => p.status === 'rented').length})`}
                  {status === 'rejected' && ` (${properties.filter(p => p.status === 'rejected').length})`}
                </button>
              ))}
            </div>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              <PlusIcon size={18} />
              <span>{t('addProperty')}</span>
            </button>
          </div>
 
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">{t('loadingYourProperties')}</p>
                </div>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <InboxIcon size={40} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {filterStatus === 'all' ? t('noPropertiesYet') : `${t('noFilteredProperties').replace('{status}', getStatusLabel(filterStatus))}`}
                </h3>
                <p className="text-gray-500 mb-4">
                  {filterStatus === 'all' ? t('startByAdding') : t('tryDifferentFilter')}
                </p>
                {filterStatus === 'all' && (
                  <button onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    {t('addFirstProperty')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredProperties.map((property) => (
                  <div key={property.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
                        <img src={property.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300'}
                          alt={property.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 p-3 sm:p-4 flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">{property.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(property.status)}`}>
                            {getStatusLabel(property.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                          <MapPinIcon size={14} /><span className="line-clamp-1">{property.neighborhood}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                          <span className="font-semibold text-blue-600">
                            {formatPrice(property.price, property.currency)}{property.listing_type === 'rent' && '/mo'}
                          </span>
                          <span className="flex items-center gap-1"><EyeIcon size={14} />{property.views} {t('views')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <span className="px-2 py-0.5 bg-gray-100 rounded">{property.property_type}</span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded">
                            {property.listing_type === 'sale' ? t('forSaleTag') : t('forRentTag')}
                          </span>
                          {property.featured && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded">{t('featured')}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-auto">
                          <button onClick={() => { setSelectedProperty(property); setShowEditModal(true); }}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <EditIcon size={14} />{t('edit')}
                          </button>
                          {property.status === 'approved' && (
                            property.listing_type === 'sale' ? (
                              <button onClick={() => handleMarkStatus(property.id, 'sold')} disabled={actionLoading === property.id}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50">
                                <TagIcon size={14} />{actionLoading === property.id ? t('updating') : t('markSold')}
                              </button>
                            ) : (
                              <button onClick={() => handleMarkStatus(property.id, 'rented')} disabled={actionLoading === property.id}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50">
                                <TagIcon size={14} />{actionLoading === property.id ? t('updating') : t('markRented')}
                              </button>
                            )
                          )}
                          {(property.status === 'sold' || property.status === 'rented') && (
                            <button onClick={() => handleReactivate(property.id)} disabled={actionLoading === property.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50">
                              <RefreshIcon size={14} />{actionLoading === property.id ? t('updating') : t('reactivateAgent')}
                            </button>
                          )}
                          {property.status === 'pending' && (
                            <span className="text-xs text-amber-600 italic">{t('awaitingApproval')}</span>
                          )}
                          {property.status === 'rejected' && (
                            <span className="text-xs text-red-600 italic">{t('contactAdminDetails')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
 
      {showEditModal && selectedProperty && (
        <EditPropertyModal property={selectedProperty}
          onClose={() => { setShowEditModal(false); setSelectedProperty(null); }} onSuccess={handleEditSuccess} />
      )}
      {showAddModal && (
        <AddPropertyModal onClose={() => setShowAddModal(false)} onSuccess={handleAddSuccess} />
      )}
      {showInquiriesPanel && agentId && (
        <InquiriesPanel agentId={agentId} onClose={() => { setShowInquiriesPanel(false); fetchAgentData(); }} />
      )}
    </div>
  );
};
 
export default AgentDashboard;
