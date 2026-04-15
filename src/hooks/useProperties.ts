import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Property, Agent, SearchFilters } from '@/types';
import { mockProperties, mockAgents } from '@/data/mockData';
 
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
  built_area: number | null;
  furnished: string | null;
  location: string;
  neighborhood: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  amenities: string[];
  status: 'pending' | 'approved' | 'rejected' | 'sold' | 'rented';
  featured: boolean;
  views: number;
  hidden: boolean;
  created_at: string;
  updated_at: string;
}
 
const transformProperty = (dbProperty: DBProperty, agentsMap: Record<string, any>): Property => {
  const agent = dbProperty.agent_id ? agentsMap[dbProperty.agent_id] : undefined;
  return {
    id: dbProperty.id,
    agent_id: dbProperty.agent_id || '',
    agent,
    title: dbProperty.title,
    description: dbProperty.description || undefined,
    property_type: dbProperty.property_type as Property['property_type'],
    listing_type: dbProperty.listing_type as Property['listing_type'],
    price: dbProperty.price,
    currency: dbProperty.currency,
    bedrooms: dbProperty.bedrooms || undefined,
    bathrooms: dbProperty.bathrooms || undefined,
    area_sqm: dbProperty.area_sqm || undefined,
    built_area: dbProperty.built_area || undefined,
    furnished: dbProperty.furnished || undefined,
    location: dbProperty.location,
    neighborhood: dbProperty.neighborhood || undefined,
    address: dbProperty.address || undefined,
    latitude: dbProperty.latitude || undefined,
    longitude: dbProperty.longitude || undefined,
    images: dbProperty.images || [],
    amenities: dbProperty.amenities || [],
    status: dbProperty.status,
    featured: dbProperty.featured,
    views: dbProperty.views,
    created_at: dbProperty.created_at,
  } as Property;
};
 
export const useProperties = (userRole?: string | null) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
 
    try {
      // Fetch properties, agents, and users ALL IN PARALLEL
      const [propsResult, agentsResult] = await Promise.all([
        supabase
          .from('properties')
          .select('*')
          .eq('hidden', false)
          .order('created_at', { ascending: false }),
        supabase
          .from('agents')
          .select('*')
      ]);
 
      if (propsResult.error) {
        console.error('Error fetching properties:', propsResult.error);
        setProperties([]);
        return;
      }
 
      const propsData = propsResult.data || [];
      const agentsData = agentsResult.data || [];
 
      if (propsData.length === 0) {
        setProperties([]);
        return;
      }
 
      // Get all unique user_ids from agents
      const userIds = [...new Set(agentsData.map((a: any) => a.user_id).filter(Boolean))];
 
      // Fetch users for agents
      let usersMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, full_name, email, phone, avatar_url, created_at')
          .in('id', userIds);
 
        if (usersData) {
          usersMap = Object.fromEntries(usersData.map((u: any) => [u.id, u]));
        }
      }
 
      // Build agents map
      const agentsMap: Record<string, any> = Object.fromEntries(
        agentsData.map((agent: any) => {
          const user = agent.user_id ? usersMap[agent.user_id] : null;
          return [
            agent.id,
            {
              id: agent.id,
              user_id: agent.user_id || '',
              company_name: agent.company_name || '',
              license_number: agent.license_number || '',
              bio: agent.bio || '',
              years_experience: agent.years_experience || 0,
              specializations: agent.specializations || [],
              verification_status: agent.verification_status,
              verification_documents: agent.verification_documents || [],
              total_listings: agent.total_listings || 0,
              rating: agent.rating || 0,
              avatar_url: user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Agent')}&background=2563eb&color=fff`,
              created_at: agent.created_at,
              user: user ? {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                phone: user.phone,
                role: 'agent' as const,
                avatar_url: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=2563eb&color=fff`,
                created_at: user.created_at
              } : undefined
            }
          ];
        })
      );
 
      const transformedProperties = propsData.map((p: any) => transformProperty(p, agentsMap));
      setProperties(transformedProperties);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);
 
  const refetch = useCallback(() => {
    fetchProperties();
  }, [fetchProperties]);
 
  return { properties, loading, error, refetch };
};
 
export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
 
    try {
      // Fetch agents and users IN PARALLEL
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .eq('verification_status', 'approved')
        .eq('is_active', true)
        .order('rating', { ascending: false });
 
      if (agentsError) {
        console.error('Error fetching agents:', agentsError);
        setAgents([]);
        return;
      }
 
      if (!agentsData || agentsData.length === 0) {
        setAgents([]);
        return;
      }
 
      const userIds = [...new Set(agentsData.map((a: any) => a.user_id).filter(Boolean))];
      let usersMap: Record<string, any> = {};
 
      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, full_name, email, phone, avatar_url, created_at')
          .in('id', userIds);
 
        if (usersData) {
          usersMap = Object.fromEntries(usersData.map((u: any) => [u.id, u]));
        }
      }
 
      const transformedAgents: Agent[] = agentsData.map((agent: any) => {
        const user = agent.user_id ? usersMap[agent.user_id] : null;
        return {
          id: agent.id,
          user_id: agent.user_id || '',
          company_name: agent.company_name || '',
          license_number: agent.license_number || '',
          bio: agent.bio || '',
          years_experience: agent.years_experience || 0,
          specializations: agent.specializations || [],
          verification_status: agent.verification_status,
          verification_documents: agent.verification_documents || [],
          total_listings: agent.total_listings || 0,
          rating: agent.rating || 0,
          avatar_url: user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Agent')}&background=2563eb&color=fff`,
          created_at: agent.created_at,
          user: user ? {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            role: 'agent' as const,
            avatar_url: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=2563eb&color=fff`,
            created_at: user.created_at
          } : undefined
        };
      });
 
      setAgents(transformedAgents);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);
 
  const refetch = useCallback(() => {
    fetchAgents();
  }, [fetchAgents]);
 
  return { agents, loading, error, refetch };
};
 
export default useProperties;

