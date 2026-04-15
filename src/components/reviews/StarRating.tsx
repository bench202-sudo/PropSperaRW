import React, { useState } from 'react';
import { StarIcon } from '@/components/icons/Icons';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showLabel?: boolean;
  className?: string;
}

const ratingLabels: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 20,
  interactive = false,
  onChange,
  showLabel = false,
  className = '',
}) => {
  const [hovered, setHovered] = useState<number>(0);

  const displayRating = hovered || rating;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {Array.from({ length: maxStars }, (_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= displayRating;
          const isHalf = !isFilled && starValue - 0.5 <= displayRating;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              className={`relative transition-transform ${
                interactive
                  ? 'cursor-pointer hover:scale-110 active:scale-95'
                  : 'cursor-default'
              }`}
              onClick={() => interactive && onChange?.(starValue)}
              onMouseEnter={() => interactive && setHovered(starValue)}
              onMouseLeave={() => interactive && setHovered(0)}
            >
              {isHalf ? (
                <div className="relative" style={{ width: size, height: size }}>
                  <StarIcon
                    size={size}
                    className="text-gray-200"
                    filled
                  />
                  <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                    <StarIcon
                      size={size}
                      className="text-amber-400"
                      filled
                    />
                  </div>
                </div>
              ) : (
                <StarIcon
                  size={size}
                  filled={isFilled}
                  className={
                    isFilled
                      ? 'text-amber-400'
                      : interactive && hovered >= starValue
                      ? 'text-amber-300'
                      : 'text-gray-200'
                  }
                />
              )}
            </button>
          );
        })}
      </div>
      {showLabel && interactive && displayRating > 0 && (
        <span className="text-sm font-medium text-gray-600 ml-1">
          {ratingLabels[displayRating] || ''}
        </span>
      )}
    </div>
  );
};

export default StarRating;
