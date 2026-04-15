import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export interface AgentReview {
  id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
  agent_id: string;
  rating: number;
  review_text: string;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface AgentRatingSummary {
  avg_rating: number;
  review_count: number;
  distribution: { [key: number]: number };
}

export type AgentReviewSortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'most_helpful';

const DEFAULT_RATING_SUMMARY: AgentRatingSummary = {
  avg_rating: 0,
  review_count: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

// Hook to fetch reviews for a specific agent
export function useAgentReviews(agentId: string | null) {
  const [reviews, setReviews] = useState<AgentReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!agentId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('agent_reviews')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.warn('Error fetching agent reviews:', fetchError.message);
        setReviews([]);
        return;
      }
      setReviews((data as AgentReview[]) || []);
    } catch (err: any) {
      console.warn('Error fetching agent reviews:', err);
      setError(err?.message || 'Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, loading, error, refetch: fetchReviews };
}

// Hook to get rating summary for an agent
export function useAgentRating(agentId: string | null): AgentRatingSummary {
  const [rating, setRating] = useState<AgentRatingSummary>(DEFAULT_RATING_SUMMARY);

  useEffect(() => {
    if (!agentId) return;

    const fetchRating = async () => {
      try {
        const { data, error } = await supabase
          .from('agent_reviews')
          .select('rating')
          .eq('agent_id', agentId);

        if (error) {
          console.warn('Error fetching agent rating:', error.message);
          setRating(DEFAULT_RATING_SUMMARY);
          return;
        }
        if (!data || data.length === 0) {
          setRating(DEFAULT_RATING_SUMMARY);
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
        console.warn('Error fetching agent rating:', err);
        setRating(DEFAULT_RATING_SUMMARY);
      }
    };

    fetchRating();
  }, [agentId]);

  return rating;
}

// Hook for user's votes on agent reviews
export function useAgentReviewVotes(reviewIds: string[], userId: string | null) {
  const [votes, setVotes] = useState<Record<string, 'helpful' | 'not_helpful'>>({});

  useEffect(() => {
    if (!userId || reviewIds.length === 0) return;

    const fetchVotes = async () => {
      try {
        const { data, error } = await supabase
          .from('agent_review_votes')
          .select('review_id, vote_type')
          .eq('user_id', userId)
          .in('review_id', reviewIds);

        if (error) {
          console.warn('Error fetching agent review votes:', error.message);
          return;
        }
        if (!data) return;

        const votesMap: Record<string, 'helpful' | 'not_helpful'> = {};
        data.forEach((v: { review_id: string; vote_type: string }) => {
          votesMap[v.review_id] = v.vote_type as 'helpful' | 'not_helpful';
        });
        setVotes(votesMap);
      } catch (err) {
        console.warn('Error fetching agent review votes:', err);
      }
    };

    fetchVotes();
  }, [reviewIds.join(','), userId]);

  return votes;
}

// Submit a new agent review
export async function submitAgentReview(
  agentId: string,
  reviewerId: string,
  reviewerName: string,
  reviewerAvatar: string | null,
  rating: number,
  reviewText: string
): Promise<{ data: AgentReview | null; error: string | null }> {
  try {
    // Check if user already reviewed this agent
    const { data: existing, error: checkError } = await supabase
      .from('agent_reviews')
      .select('id')
      .eq('agent_id', agentId)
      .eq('reviewer_id', reviewerId)
      .maybeSingle();

    if (checkError) {
      console.warn('Error checking existing agent review:', checkError.message);
    }

    if (existing) {
      return { data: null, error: 'You have already reviewed this agent.' };
    }

    const { data, error } = await supabase
      .from('agent_reviews')
      .insert({
        agent_id: agentId,
        reviewer_id: reviewerId,
        reviewer_name: reviewerName,
        reviewer_avatar: reviewerAvatar,
        rating,
        review_text: reviewText,
      })
      .select()
      .single();

    if (error) throw error;

    // Update agent's average rating
    await updateAgentAverageRating(agentId);

    return { data: data as AgentReview, error: null };
  } catch (err: any) {
    console.error('Error submitting agent review:', err);
    return { data: null, error: err?.message || 'Failed to submit review' };
  }
}

// Delete an agent review
export async function deleteAgentReview(reviewId: string, agentId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('agent_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;

    // Update agent's average rating
    await updateAgentAverageRating(agentId);

    return { error: null };
  } catch (err: any) {
    return { error: err?.message || 'Failed to delete review' };
  }
}

// Vote on an agent review (helpful / not helpful)
export async function voteOnAgentReview(
  reviewId: string,
  userId: string,
  voteType: 'helpful' | 'not_helpful'
): Promise<{ error: string | null }> {
  try {
    // Check if user already voted
    const { data: existing, error: checkError } = await supabase
      .from('agent_review_votes')
      .select('id, vote_type')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.warn('Error checking existing vote:', checkError.message);
    }

    if (existing) {
      if (existing.vote_type === voteType) {
        // Remove vote (toggle off)
        await supabase.from('agent_review_votes').delete().eq('id', existing.id);
        const field = voteType === 'helpful' ? 'helpful_count' : 'not_helpful_count';
        const { data: review } = await supabase
          .from('agent_reviews')
          .select(field)
          .eq('id', reviewId)
          .single();
        if (review) {
          await supabase
            .from('agent_reviews')
            .update({ [field]: Math.max(0, (review as any)[field] - 1) })
            .eq('id', reviewId);
        }
      } else {
        // Change vote
        const oldField = existing.vote_type === 'helpful' ? 'helpful_count' : 'not_helpful_count';
        const newField = voteType === 'helpful' ? 'helpful_count' : 'not_helpful_count';

        await supabase
          .from('agent_review_votes')
          .update({ vote_type: voteType })
          .eq('id', existing.id);

        const { data: review } = await supabase
          .from('agent_reviews')
          .select('helpful_count, not_helpful_count')
          .eq('id', reviewId)
          .single();

        if (review) {
          await supabase
            .from('agent_reviews')
            .update({
              [oldField]: Math.max(0, (review as any)[oldField] - 1),
              [newField]: ((review as any)[newField] || 0) + 1,
            })
            .eq('id', reviewId);
        }
      }
    } else {
      // New vote
      await supabase.from('agent_review_votes').insert({
        review_id: reviewId,
        user_id: userId,
        vote_type: voteType,
      });

      const field = voteType === 'helpful' ? 'helpful_count' : 'not_helpful_count';
      const { data: review } = await supabase
        .from('agent_reviews')
        .select(field)
        .eq('id', reviewId)
        .single();

      if (review) {
        await supabase
          .from('agent_reviews')
          .update({ [field]: ((review as any)[field] || 0) + 1 })
          .eq('id', reviewId);
      }
    }

    return { error: null };
  } catch (err: any) {
    console.error('Error voting on agent review:', err);
    return { error: err?.message || 'Failed to vote' };
  }
}

// Update agent's average rating in the agents table
async function updateAgentAverageRating(agentId: string): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('agent_reviews')
      .select('rating')
      .eq('agent_id', agentId);

    if (error) {
      console.warn('Error fetching ratings for average:', error.message);
      return;
    }

    if (!data || data.length === 0) {
      // No reviews, reset rating to 0
      await supabase
        .from('agents')
        .update({ rating: 0 })
        .eq('id', agentId);
      return;
    }

    const sum = data.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0);
    const avg = Math.round((sum / data.length) * 10) / 10;

    await supabase
      .from('agents')
      .update({ rating: avg })
      .eq('id', agentId);
  } catch (err) {
    console.warn('Error updating agent average rating:', err);
  }
}
