import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  rating = 0,
  maxRating = 5,
  size = 16,
  interactive = false,
  onRatingChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(rating);

        return (
          <button
            type="button"
            key={index}
            disabled={!interactive}
            onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
            } focus:outline-none`}
          >
            <Star
              size={size}
              className={`${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300 fill-slate-100'
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
