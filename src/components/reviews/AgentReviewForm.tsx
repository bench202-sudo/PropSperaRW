import React, { useState } from 'react';
import StarRating from '@/components/reviews/StarRating';
import { SendIcon } from '@/components/icons/Icons';
import { submitAgentReview } from '@/hooks/useAgentReviews';

interface AgentReviewFormProps {
  agentId: string;
  agentName: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

const AgentReviewForm: React.FC<AgentReviewFormProps> = ({
  agentId,
  agentName,
  reviewerId,
  reviewerName,
  reviewerAvatar,
  onSuccess,
  onCancel,
}) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (reviewText.trim().length < 10) {
      setError('Please write at least 10 characters in your review');
      return;
    }

    setSubmitting(true);

    try {
      const { error: submitError } = await submitAgentReview(
        agentId,
        reviewerId,
        reviewerName,
        reviewerAvatar,
        rating,
        reviewText.trim()
      );

      if (submitError) {
        setError(submitError);
        return;
      }

      // Reset form
      setRating(0);
      setReviewText('');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5">
      <h4 className="font-semibold text-gray-900 mb-1 text-lg">Rate {agentName}</h4>
      <p className="text-sm text-gray-500 mb-4">Share your experience working with this agent</p>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating
        </label>
        <StarRating
          rating={rating}
          interactive
          onChange={setRating}
          size={28}
          showLabel
        />
      </div>

      {/* Review Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="How was your experience with this agent? Were they professional, responsive, and helpful?"
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
          maxLength={2000}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">Min 10 characters</span>
          <span className={`text-xs ${reviewText.length > 1800 ? 'text-amber-500' : 'text-gray-400'}`}>
            {reviewText.length}/2000
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <SendIcon size={16} />
              Submit Review
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default AgentReviewForm;
