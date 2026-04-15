import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Review {
  id: string;
  property_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  rating: number;
  review_text: string;
  photos: string[];
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewVote {
  id: string;
  review_id: string;
  user_id: string;
  vote_type: 'helpful' | 'not_helpful';
}

export interface PropertyRating {
  avg_rating: number;
  review_count: number;
  distribution: { [key: number]: number };
}

export interface ReviewFormData {
  rating: number;
  review_text: string;
  photos: string[];
}

const DEFAULT_RATING: PropertyRating = {
  avg_rating: 0,
  review_count: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

// Hook to fetch reviews for a specific property
export function usePropertyReviews(propertyId: string | null) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('property_reviews')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.warn('Error fetching reviews:', fetchError.message);
        setReviews([]);
        return;
      }
      setReviews((data as Review[]) || []);
    } catch (err: any) {
      console.warn('Error fetching reviews:', err);
      setError(err?.message || 'Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, loading, error, refetch: fetchReviews };
}

// Hook to get rating summary for a property
export function usePropertyRating(propertyId: string | null): PropertyRating {
  const [rating, setRating] = useState<PropertyRating>(DEFAULT_RATING);

  useEffect(() => {
    if (!propertyId) return;
    
    const fetchRating = async () => {
      try {
        const { data, error } = await supabase
          .from('property_reviews')
          .select('rating')
          .eq('property_id', propertyId);

        if (error) {
          console.warn('Error fetching rating:', error.message);
          setRating(DEFAULT_RATING);
          return;
        }
        if (!data || data.length === 0) {
          setRating(DEFAULT_RATING);
          return;
        }

        const dist: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sum = 0;
        data.forEach((r: { rating: number }) => {
          dist[r.rating] = (dist[r.rating] || 0) + 1;
          sum += r.rating;
        });

        setRating({
          avg_rating: Math.round((sum / data.length) * 10) / 10,
          review_count: data.length,
          distribution: dist,
        });
      } catch (err) {
        console.warn('Error fetching rating:', err);
        setRating(DEFAULT_RATING);
      }
    };

    fetchRating();
  }, [propertyId]);

  return rating;
}

// Hook to get ratings for multiple properties at once (for property cards)
export function usePropertyRatings(propertyIds: string[]) {
  const [ratings, setRatings] = useState<Record<string, PropertyRating>>({});

  useEffect(() => {
    if (propertyIds.length === 0) return;

    const fetchRatings = async () => {
      try {
        const { data, error } = await supabase
          .from('property_reviews')
          .select('property_id, rating')
          .in('property_id', propertyIds);

        if (error) {
          console.warn('Error fetching ratings:', error.message);
          return;
        }
        if (!data) return;

        const ratingsMap: Record<string, PropertyRating> = {};
        
        // Group by property_id
        const grouped: Record<string, number[]> = {};
        data.forEach((r: { property_id: string; rating: number }) => {
          if (!grouped[r.property_id]) grouped[r.property_id] = [];
          grouped[r.property_id].push(r.rating);
        });

        Object.entries(grouped).forEach(([pid, ratingsList]) => {
          const dist: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          let sum = 0;
          ratingsList.forEach(r => {
            dist[r] = (dist[r] || 0) + 1;
            sum += r;
          });
          ratingsMap[pid] = {
            avg_rating: Math.round((sum / ratingsList.length) * 10) / 10,
            review_count: ratingsList.length,
            distribution: dist,
          };
        });

        setRatings(ratingsMap);
      } catch (err) {
        console.warn('Error fetching ratings:', err);
      }
    };

    fetchRatings();
  }, [propertyIds.join(',')]);

  return ratings;
}

// Hook for user's votes on reviews
export function useReviewVotes(reviewIds: string[], userId: string | null) {
  const [votes, setVotes] = useState<Record<string, 'helpful' | 'not_helpful'>>({});

  useEffect(() => {
    if (!userId || reviewIds.length === 0) return;

    const fetchVotes = async () => {
      try {
        const { data, error } = await supabase
          .from('review_votes')
          .select('review_id, vote_type')
          .eq('user_id', userId)
          .in('review_id', reviewIds);

        if (error) {
          console.warn('Error fetching votes:', error.message);
          return;
        }
        if (!data) return;

        const votesMap: Record<string, 'helpful' | 'not_helpful'> = {};
        data.forEach((v: { review_id: string; vote_type: string }) => {
          votesMap[v.review_id] = v.vote_type as 'helpful' | 'not_helpful';
        });
        setVotes(votesMap);
      } catch (err) {
        console.warn('Error fetching votes:', err);
      }
    };

    fetchVotes();
  }, [reviewIds.join(','), userId]);

  return votes;
}

// Submit a new review
export async function submitReview(
  propertyId: string,
  userId: string,
  userName: string,
  userAvatar: string | null,
  formData: ReviewFormData
): Promise<{ data: Review | null; error: string | null }> {
  try {
    // Check if user already reviewed this property
    const { data: existing, error: checkError } = await supabase
      .from('property_reviews')
      .select('id')
      .eq('property_id', propertyId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.warn('Error checking existing review:', checkError.message);
    }

    if (existing) {
      return { data: null, error: 'You have already reviewed this property.' };
    }

    const { data, error } = await supabase
      .from('property_reviews')
      .insert({
        property_id: propertyId,
        user_id: userId,
        user_name: userName,
        user_avatar: userAvatar,
        rating: formData.rating,
        review_text: formData.review_text,
        photos: formData.photos,
      })
      .select()
      .single();

    if (error) throw error;
    return { data: data as Review, error: null };
  } catch (err: any) {
    console.error('Error submitting review:', err);
    return { data: null, error: err?.message || 'Failed to submit review' };
  }
}

// Delete a review
export async function deleteReview(reviewId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('property_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
    return { error: null };
  } catch (err: any) {
    return { error: err?.message || 'Failed to delete review' };
  }
}

// Vote on a review (helpful / not helpful)
export async function voteOnReview(
  reviewId: string,
  userId: string,
  voteType: 'helpful' | 'not_helpful'
): Promise<{ error: string | null }> {
  try {
    // Check if user already voted
    const { data: existing, error: checkError } = await supabase
      .from('review_votes')
      .select('id, vote_type')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.warn('Error checking existing vote:', checkError.message);
    }

    if (existing) {
      if (existing.vote_type === voteType) {
        // Remove vote
        await supabase.from('review_votes').delete().eq('id', existing.id);
        // Update count
        const field = voteType === 'helpful' ? 'helpful_count' : 'not_helpful_count';
        const { data: review } = await supabase
          .from('property_reviews')
          .select(field)
          .eq('id', reviewId)
          .single();
        if (review) {
          await supabase
            .from('property_reviews')
            .update({ [field]: Math.max(0, (review as any)[field] - 1) })
            .eq('id', reviewId);
        }
      } else {
        // Change vote
        const oldField = existing.vote_type === 'helpful' ? 'helpful_count' : 'not_helpful_count';
        const newField = voteType === 'helpful' ? 'helpful_count' : 'not_helpful_count';
        
        await supabase
          .from('review_votes')
          .update({ vote_type: voteType })
          .eq('id', existing.id);

        // Update counts
        const { data: review } = await supabase
          .from('property_reviews')
          .select('helpful_count, not_helpful_count')
          .eq('id', reviewId)
          .single();
        
        if (review) {
          await supabase
            .from('property_reviews')
            .update({
              [oldField]: Math.max(0, (review as any)[oldField] - 1),
              [newField]: ((review as any)[newField] || 0) + 1,
            })
            .eq('id', reviewId);
        }
      }
    } else {
      // New vote
      await supabase.from('review_votes').insert({
        review_id: reviewId,
        user_id: userId,
        vote_type: voteType,
      });

      const field = voteType === 'helpful' ? 'helpful_count' : 'not_helpful_count';
      const { data: review } = await supabase
        .from('property_reviews')
        .select(field)
        .eq('id', reviewId)
        .single();
      
      if (review) {
        await supabase
          .from('property_reviews')
          .update({ [field]: ((review as any)[field] || 0) + 1 })
          .eq('id', reviewId);
      }
    }

    return { error: null };
  } catch (err: any) {
    console.error('Error voting on review:', err);
    return { error: err?.message || 'Failed to vote' };
  }
}

// Upload review photos to storage
export async function uploadReviewPhoto(
  file: File,
  propertyId: string,
  userId: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `reviews/${propertyId}/${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('property-images')
      .getPublicUrl(fileName);

    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    console.error('Error uploading photo:', err);
    return { url: null, error: err?.message || 'Failed to upload photo' };
  }
}
