import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import StarRating from './StarRating';
import reviewService from '../services/reviewService';

const ReviewList = ({ modelId }) => {
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
    loadRatingSummary();
  }, [modelId]);

  const loadReviews = async () => {
    try {
      const response = await reviewService.getReviewsByModel(modelId);
      if (response.code === 200) {
        setReviews(response.result || []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRatingSummary = async () => {
    try {
      const response = await reviewService.getRatingSummary(modelId);
      if (response.code === 200) {
        setRatingSummary(response.result);
      }
    } catch (error) {
      console.error('Error loading rating summary:', error);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await reviewService.markHelpful(reviewId);
      toast.success('Cảm ơn phản hồi của bạn!');
      loadReviews(); // Reload to update helpful count
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      toast.error('Không thể đánh dấu đánh giá này');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {ratingSummary && ratingSummary.totalReviews > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-800 mb-2">
                {ratingSummary.averageRating.toFixed(1)}
              </div>
              <StarRating rating={ratingSummary.averageRating} size="lg" />
              <p className="text-sm text-gray-600 mt-2">
                {ratingSummary.totalReviews} đánh giá
              </p>
            </div>

            <div className="flex-1">
              {[5, 4, 3, 2, 1].map(star => {
                const count = ratingSummary.ratingDistribution[star] || 0;
                const percentage = ratingSummary.ratingPercentages[star] || 0;

                return (
                  <div key={star} className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-600 w-12">{star} sao</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Chưa có đánh giá nào
          </h3>
          <p className="text-gray-500">
            Hãy là người đầu tiên đánh giá chiếc xe này!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.reviewId} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-800">{review.customerName}</h4>
                    {review.isVerifiedPurchase && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        ✓ Đã mua xe
                      </span>
                    )}
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              <h5 className="font-semibold text-gray-800 mb-2">{review.title}</h5>
              <p className="text-gray-600 mb-4">{review.reviewText}</p>

              {/* Detailed Ratings */}
              {(review.performanceRating || review.comfortRating || review.designRating || review.valueRating) && (
                <div className="grid grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  {review.performanceRating && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Hiệu suất</p>
                      <StarRating rating={review.performanceRating} size="sm" />
                    </div>
                  )}
                  {review.comfortRating && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tiện nghi</p>
                      <StarRating rating={review.comfortRating} size="sm" />
                    </div>
                  )}
                  {review.designRating && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Thiết kế</p>
                      <StarRating rating={review.designRating} size="sm" />
                    </div>
                  )}
                  {review.valueRating && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Giá trị</p>
                      <StarRating rating={review.valueRating} size="sm" />
                    </div>
                  )}
                </div>
              )}

              {/* Helpful Button */}
              <div className="flex items-center gap-4 pt-3 border-t">
                <button
                  onClick={() => handleMarkHelpful(review.reviewId)}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  👍 Hữu ích ({review.helpfulCount})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

ReviewList.propTypes = {
  modelId: PropTypes.number.isRequired
};

export default ReviewList;
