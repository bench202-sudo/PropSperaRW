import React, { useState, useMemo } from 'react';
import { usePropertyReviews, usePropertyRating, useReviewVotes, voteOnReview, deleteReview } from '@/hooks/useReviews';
import ReviewForm from '@/components/reviews/ReviewForm';
import ReviewCard from '@/components/reviews/ReviewCard';
import StarRating from '@/components/reviews/StarRating';
import { StarIcon, ChevronDownIcon, PlusIcon } from '@/components/icons/Icons';

interface ReviewsSectionProps {
  propertyId: string;
  currentUserId: string | null;
  currentUserName: string | null;
  currentUserAvatar: string | null;
  onLoginRequired: () => void;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'most_helpful';

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  propertyId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onLoginRequired,
}) => {
  const { reviews, loading, refetch } = usePropertyReviews(propertyId);
  const rating = usePropertyRating(propertyId);
  const reviewIds = useMemo(() => reviews.map(r => r.id), [reviews]);
  const votes = useReviewVotes(reviewIds, currentUserId);

  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [votingReviewId, setVotingReviewId] = useState<string | null>(null);

  // Check if current user already reviewed
  const hasReviewed = useMemo(() => {
    return reviews.some(r => r.user_id === currentUserId);
  }, [reviews, currentUserId]);

  // Sort and filter reviews
  const displayedReviews = useMemo(() => {
    let filtered = [...reviews];

    // Filter by rating
    if (filterRating !== null) {
      filtered = filtered.filter(r => r.rating === filterRating);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'most_helpful':
        filtered.sort((a, b) => b.helpful_count - a.helpful_count);
        break;
    }

    return filtered;
  }, [reviews, sortBy, filterRating]);

  const handleVote = async (reviewId: string, voteType: 'helpful' | 'not_helpful') => {
    if (!currentUserId) {
      onLoginRequired();
      return;
    }
    setVotingReviewId(reviewId);
    await voteOnReview(reviewId, currentUserId, voteType);
    await refetch();
    setVotingReviewId(null);
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete your review?')) return;
    await deleteReview(reviewId);
    await refetch();
  };

  const handleReviewSuccess = () => {
    setShowForm(false);
    refetch();
  };

  const handleWriteReview = () => {
    if (!currentUserId) {
      onLoginRequired();
      return;
    }
    setShowForm(true);
  };

  return (
    <div className="mt-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-gray-900">
          Reviews & Ratings
        </h3>
        {!hasReviewed && !showForm && (
          <button
            onClick={handleWriteReview}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <PlusIcon size={16} />
            Write Review
          </button>
        )}
      </div>

      {/* Rating Summary */}
      {rating.review_count > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-5 mb-5 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Overall Rating */}
            <div className="flex flex-col items-center justify-center sm:pr-6 sm:border-r border-gray-200">
              <span className="text-4xl font-bold text-gray-900">{rating.avg_rating}</span>
              <StarRating rating={Math.round(rating.avg_rating)} size={18} />
              <span className="text-sm text-gray-500 mt-1">
                {rating.review_count} {rating.review_count === 1 ? 'review' : 'reviews'}
              </span>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map(star => {
                const count = rating.distribution[star] || 0;
                const percentage = rating.review_count > 0
                  ? (count / rating.review_count) * 100
                  : 0;

                return (
                  <button
                    key={star}
                    onClick={() => setFilterRating(filterRating === star ? null : star)}
                    className={`flex items-center gap-2 w-full group transition-colors rounded px-1 py-0.5 ${
                      filterRating === star ? 'bg-blue-100' : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xs font-medium text-gray-600 w-3">{star}</span>
                    <StarIcon size={12} filled className="text-amber-400" />
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active filter indicator */}
          {filterRating !== null && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-500">
                Showing {filterRating}-star reviews
              </span>
              <button
                onClick={() => setFilterRating(null)}
                className="text-xs text-blue-600 font-medium hover:text-blue-700"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
      )}

      {/* Review Form */}
      {showForm && currentUserId && currentUserName && (
        <div className="mb-5">
          <ReviewForm
            propertyId={propertyId}
            userId={currentUserId}
            userName={currentUserName}
            userAvatar={currentUserAvatar}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Sort Controls */}
      {reviews.length > 1 && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            {displayedReviews.length} {displayedReviews.length === 1 ? 'review' : 'reviews'}
            {filterRating !== null ? ` (filtered)` : ''}
          </span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-sm text-gray-700 cursor-pointer hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="most_helpful">Most Helpful</option>
            </select>
            <ChevronDownIcon size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayedReviews.length > 0 ? (
        <div className="space-y-3">
          {displayedReviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              userVote={votes[review.id] || null}
              onVote={handleVote}
              onDelete={handleDelete}
              votingDisabled={votingReviewId === review.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <StarIcon size={24} className="text-gray-300" />
          </div>
          <h4 className="font-semibold text-gray-700 mb-1">
            {filterRating !== null ? 'No reviews match this filter' : 'No Reviews Yet'}
          </h4>
          <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
            {filterRating !== null
              ? 'Try clearing the filter to see all reviews.'
              : 'Be the first to share your experience with this property.'}
          </p>
          {filterRating !== null ? (
            <button
              onClick={() => setFilterRating(null)}
              className="text-sm text-blue-600 font-medium hover:text-blue-700"
            >
              Clear filter
            </button>
          ) : !hasReviewed && !showForm ? (
            <button
              onClick={handleWriteReview}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Write the First Review
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
