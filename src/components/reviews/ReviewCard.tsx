import React, { useState } from 'react';
import { Review } from '@/hooks/useReviews';
import StarRating from '@/components/reviews/StarRating';
import { ThumbsUpIcon, ThumbsDownIcon, TrashIcon, FlagIcon } from '@/components/icons/Icons';
import { formatRelativeTime } from '@/data/mockData';

interface ReviewCardProps {
  review: Review;
  currentUserId: string | null;
  userVote: 'helpful' | 'not_helpful' | null;
  onVote: (reviewId: string, voteType: 'helpful' | 'not_helpful') => void;
  onDelete?: (reviewId: string) => void;
  votingDisabled?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  currentUserId,
  userVote,
  onVote,
  onDelete,
  votingDisabled = false,
}) => {
  const [showFullText, setShowFullText] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const isOwnReview = currentUserId === review.user_id;
  const isLongText = review.review_text.length > 300;
  const displayText = isLongText && !showFullText
    ? review.review_text.slice(0, 300) + '...'
    : review.review_text;

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              {review.user_avatar ? (
                <img
                  src={review.user_avatar}
                  alt={review.user_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {review.user_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 text-sm">
                  {review.user_name}
                </span>
                {isOwnReview && (
                  <span className="text-[10px] font-medium bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                    You
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {formatRelativeTime(review.created_at)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} size={14} />
            <span className="text-sm font-bold text-gray-700">{review.rating}.0</span>
          </div>
        </div>

        {/* Review Text */}
        <p className="text-gray-700 text-sm leading-relaxed mb-3">
          {displayText}
        </p>
        {isLongText && (
          <button
            onClick={() => setShowFullText(!showFullText)}
            className="text-blue-600 text-xs font-medium hover:text-blue-700 mb-3"
          >
            {showFullText ? 'Show less' : 'Read more'}
          </button>
        )}

        {/* Photos */}
        {review.photos && review.photos.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {review.photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => setSelectedPhoto(photo)}
                className="w-16 h-16 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
              >
                <img
                  src={photo}
                  alt={`Review photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-4">
            {/* Helpful */}
            <button
              onClick={() => !votingDisabled && onVote(review.id, 'helpful')}
              disabled={votingDisabled || !currentUserId}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                userVote === 'helpful'
                  ? 'text-green-600'
                  : 'text-gray-400 hover:text-green-600'
              } ${(!currentUserId || votingDisabled) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={!currentUserId ? 'Sign in to vote' : 'Helpful'}
            >
              <ThumbsUpIcon size={14} filled={userVote === 'helpful'} />
              <span>Helpful{review.helpful_count > 0 ? ` (${review.helpful_count})` : ''}</span>
            </button>

            {/* Not Helpful */}
            <button
              onClick={() => !votingDisabled && onVote(review.id, 'not_helpful')}
              disabled={votingDisabled || !currentUserId}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                userVote === 'not_helpful'
                  ? 'text-red-500'
                  : 'text-gray-400 hover:text-red-500'
              } ${(!currentUserId || votingDisabled) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={!currentUserId ? 'Sign in to vote' : 'Not helpful'}
            >
              <ThumbsDownIcon size={14} filled={userVote === 'not_helpful'} />
              <span>{review.not_helpful_count > 0 ? `(${review.not_helpful_count})` : ''}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Delete own review */}
            {isOwnReview && onDelete && (
              <button
                onClick={() => onDelete(review.id)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <TrashIcon size={13} />
                <span>Delete</span>
              </button>
            )}
            {/* Report */}
            {!isOwnReview && currentUserId && (
              <button
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-amber-500 transition-colors"
                title="Report review"
              >
                <FlagIcon size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={selectedPhoto}
            alt="Review photo"
            className="max-w-full max-h-[85vh] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <span className="text-xl font-bold">&times;</span>
          </button>
        </div>
      )}
    </>
  );
};

export default ReviewCard;
