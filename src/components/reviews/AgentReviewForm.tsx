import React, { useState } from 'react';
import StarRating from '@/components/reviews/StarRating';
import { SendIcon } from '@/components/icons/Icons';
import { submitAgentReview } from '@/hooks/useAgentReviews';
import { useLanguage } from '@/contexts/AuthContext';

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
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError(t('pleaseSelectRating'));
      return;
    }
    if (reviewText.trim().length < 10) {
      setError(t('reviewTooShort'));
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
      setError(err.message || t('reviewFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5">
      <h4 className="font-semibold text-gray-900 mb-1 text-lg">{t('shareExperienceTitle').replace('{name}', agentName)}</h4>
      <p className="text-sm text-gray-500 mb-4">{t('shareExperienceSubtitle')}</p>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('yourRating')}
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
          {t('yourReview')}
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder={t('reviewTextPlaceholder')}
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
          maxLength={2000}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">{t('minCharsHint')}</span>
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
              {t('submittingBtn')}
            </>
          ) : (
            <>
              <SendIcon size={16} />
              {t('submitReviewBtn')}
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
