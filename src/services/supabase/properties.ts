// Supabase service functions for property data.
// These functions encapsulate all DB queries for properties and agents,
// making it easy to swap the data source or add caching in the future.

import { supabase } from '@/lib/supabase';

export interface DBProperty {
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
  video_url: string | null;
  amenities: string[];
  status: 'pending' | 'approved' | 'rejected' | 'sold' | 'rented';
  featured: boolean;
  views: number;
  hidden: boolean;
  created_at: string;
  updated_at: string;
}

/** Fetch all non-hidden properties and the full agents catalog in parallel. */
export async function fetchPropertiesAndAgents(): Promise<{
  properties: DBProperty[];
  agents: any[];
  error: string | null;
}> {
  const [propsResult, agentsResult] = await Promise.all([
    supabase
      .from('properties')
      .select('*')
      .eq('hidden', false)
      .order('created_at', { ascending: false }),
    supabase.from('agents').select('*'),
  ]);

  if (propsResult.error) {
    return { properties: [], agents: [], error: propsResult.error.message };
  }

  return {
    properties: (propsResult.data || []) as DBProperty[],
    agents: agentsResult.data || [],
    error: null,
  };
}

/** Fetch user rows for a set of user IDs. */
export async function fetchUsersByIds(userIds: string[]): Promise<Record<string, any>> {
  if (userIds.length === 0) return {};

  const { data } = await supabase
    .from('users')
    .select('id, full_name, email, phone, avatar_url, created_at')
    .in('id', userIds);

  return Object.fromEntries((data || []).map((u: any) => [u.id, u]));
}

/** Fetch approved, active agents ordered by rating. */
export async function fetchApprovedAgents(): Promise<{ agents: any[]; error: string | null }> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('verification_status', 'approved')
    .eq('is_active', true)
    .order('rating', { ascending: false });

  if (error) return { agents: [], error: error.message };
  return { agents: data || [], error: null };
}
