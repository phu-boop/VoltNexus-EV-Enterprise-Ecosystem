import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import StarRating from '../components/StarRating';
import reviewService from '../services/reviewService';

const MyReviewsPage = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get customer info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const customerId = user.customerId;

  useEffect(() => {
    if (customerId) {
      loadReviews();
    } else {
      navigate('/login');
    }
  }, [customerId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewService.getCustomerReviews(customerId);
      if (response.code === 200) {
        setReviews(response.result || []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { label: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Bị từ chối', color: 'bg-red-100 text-red-800' },
      HIDDEN: { label: 'Đã ẩn', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Đánh giá của tôi</h1>
        <button
          onClick={() => navigate('/vehicles')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Xem xe để đánh giá
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Chưa có đánh giá nào
          </h3>
          <p className="text-gray-500 mb-4">
            Bạn chưa viết đánh giá nào cho xe
          </p>
          <button
            onClick={() => navigate('/vehicles')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Xem danh sách xe
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.reviewId} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {review.vehicleModelName}
                      {review.vehicleVariantName && ` - ${review.vehicleVariantName}`}
                    </h3>
                    {getStatusBadge(review.status)}
                  </div>
                  <div className="flex items-center gap-4">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <h4 className="font-semibold text-gray-800 mb-2">{review.title}</h4>
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

              {/* Helpful Count */}
              <div className="flex items-center gap-4 pt-3 border-t">
                <span className="text-sm text-gray-600">
                  👍 {review.helpfulCount} người thấy hữu ích
                </span>
                {review.isVerifiedPurchase && (
                  <span className="text-sm text-green-600">
                    ✓ Đã mua xe
                  </span>
                )}
              </div>

              {/* Status Messages */}
              {review.status === 'PENDING' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⏳ Đánh giá của bạn đang chờ được xét duyệt
                  </p>
                </div>
              )}
              {review.status === 'REJECTED' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    ❌ Đánh giá của bạn đã bị từ chối
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviewsPage;
