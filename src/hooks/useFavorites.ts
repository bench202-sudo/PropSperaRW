import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface FavoriteRecord {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

export const useFavorites = (userId: string | null) => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteRecords, setFavoriteRecords] = useState<FavoriteRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all favorites for the current user from the database
  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      setFavoriteIds([]);
      setFavoriteRecords([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching favorites:', fetchError);
        setError(fetchError.message);
        return;
      }

      if (data) {
        setFavoriteRecords(data);
        setFavoriteIds(data.map((f: FavoriteRecord) => f.property_id));
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load favorites when userId changes
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Toggle a favorite (add or remove)
  const toggleFavorite = useCallback(async (propertyId: string): Promise<boolean> => {
    if (!userId) return false;

    const isFavorited = favoriteIds.includes(propertyId);

    if (isFavorited) {
      // Remove favorite - optimistic update
      setFavoriteIds(prev => prev.filter(id => id !== propertyId));
      setFavoriteRecords(prev => prev.filter(r => r.property_id !== propertyId));

      try {
        const { error: deleteError } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('property_id', propertyId);

        if (deleteError) {
          // If delete fails (e.g., record didn't exist in DB for mock properties), 
          // keep the optimistic update - it's already removed from local state
          console.warn('Could not delete favorite from database:', deleteError.message);
        }
        return true;
      } catch (err) {
        console.warn('Error removing favorite:', err);
        return true; // Keep the optimistic update
      }
    } else {
      // Add favorite - optimistic update
      const tempRecord: FavoriteRecord = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        property_id: propertyId,
        created_at: new Date().toISOString()
      };

      setFavoriteIds(prev => [propertyId, ...prev]);
      setFavoriteRecords(prev => [tempRecord, ...prev]);

      try {
        const { data, error: insertError } = await supabase
          .from('favorites')
          .insert({
            user_id: userId,
            property_id: propertyId
          })
          .select()
          .single();

        if (insertError) {
          // If insert fails (e.g., foreign key violation for mock properties),
          // keep the optimistic update so the UI still works for the session
          console.warn('Could not save favorite to database:', insertError.message);
          return true;
        }

        // Replace temp record with real one from database
        if (data) {
          setFavoriteRecords(prev =>
            prev.map(r => r.id === tempRecord.id ? data : r)
          );
        }
        return true;
      } catch (err) {
        // Keep the optimistic update even if the database operation fails
        console.warn('Error adding favorite:', err);
        return true;
      }
    }
  }, [userId, favoriteIds]);

  // Check if a property is favorited
  const isFavorite = useCallback((propertyId: string): boolean => {
    return favoriteIds.includes(propertyId);
  }, [favoriteIds]);

  return {
    favoriteIds,
    favoriteRecords,
    loading,
    error,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavorites,
    count: favoriteIds.length
  };
};

export default useFavorites;
