import PropTypes from 'prop-types';

const StarRating = ({ rating, maxStars = 5, size = 'md', showCount = false, reviewCount = 0, interactive = false, onRatingChange }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const handleStarClick = (star) => {
    if (interactive && onRatingChange) {
      onRatingChange(star);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        const isHalfFilled = !isFilled && starValue - 0.5 <= rating;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleStarClick(starValue)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${!interactive ? 'cursor-default' : ''}`}
          >
            {isHalfFilled ? (
              <svg className={sizes[size]} fill="currentColor" viewBox="0 0 20 20">
                <defs>
                  <linearGradient id={`half-${index}`}>
                    <stop offset="50%" stopColor="#FCD34D" />
                    <stop offset="50%" stopColor="#D1D5DB" />
                  </linearGradient>
                </defs>
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  fill={`url(#half-${index})`}
                />
              </svg>
            ) : (
              <svg
                className={`${sizes[size]} ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </button>
        );
      })}
      {showCount && reviewCount > 0 && (
        <span className="ml-2 text-sm text-gray-600">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  maxStars: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  showCount: PropTypes.bool,
  reviewCount: PropTypes.number,
  interactive: PropTypes.bool,
  onRatingChange: PropTypes.func
};

export default StarRating;
