import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import StarRating from './StarRating';
import reviewService from '../services/reviewService';

const ReviewForm = ({ modelId, variantId, vehicleModelName, vehicleVariantName, customerId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    reviewText: '',
    performanceRating: 0,
    comfortRating: 0,
    designRating: 0,
    valueRating: 0
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.rating === 0) {
      toast.error('Vui lòng chọn đánh giá sao');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề đánh giá');
      return;
    }

    if (formData.reviewText.length < 10) {
      toast.error('Nội dung đánh giá phải có ít nhất 10 ký tự');
      return;
    }

    setLoading(true);

    try {
      const reviewData = {
        customerId,
        modelId,
        variantId,
        vehicleModelName,
        vehicleVariantName,
        rating: formData.rating,
        title: formData.title,
        reviewText: formData.reviewText,
        performanceRating: formData.performanceRating || null,
        comfortRating: formData.comfortRating || null,
        designRating: formData.designRating || null,
        valueRating: formData.valueRating || null
      };

      const response = await reviewService.createReview(reviewData);

      if (response.code === 200 || response.code === 201) {
        toast.success('Đánh giá của bạn đã được gửi! Chúng tôi sẽ xét duyệt trong thời gian sớm nhất.');
        setFormData({
          rating: 0,
          title: '',
          reviewText: '',
          performanceRating: 0,
          comfortRating: 0,
          designRating: 0,
          valueRating: 0
        });
        if (onSuccess) onSuccess();
      } else {
        toast.error(response.message || 'Không thể gửi đánh giá');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.response?.data?.message?.includes('already')) {
        toast.error('Bạn đã đánh giá xe này rồi!');
      } else {
        toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Viết đánh giá của bạn</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Overall Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đánh giá tổng quan <span className="text-red-500">*</span>
          </label>
          <StarRating
            rating={formData.rating}
            size="xl"
            interactive={true}
            onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Tóm tắt đánh giá của bạn..."
            maxLength={200}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung đánh giá <span className="text-red-500">*</span>
          </label>
          <textarea
            name="reviewText"
            value={formData.reviewText}
            onChange={handleInputChange}
            rows="6"
            placeholder="Chia sẻ trải nghiệm của bạn về xe..."
            minLength={10}
            maxLength={2000}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.reviewText.length}/2000 ký tự
          </p>
        </div>

        {/* Detailed Ratings */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Đánh giá chi tiết (tùy chọn)</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Hiệu suất</label>
              <StarRating
                rating={formData.performanceRating}
                size="md"
                interactive={true}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, performanceRating: rating }))}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Tiện nghi</label>
              <StarRating
                rating={formData.comfortRating}
                size="md"
                interactive={true}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, comfortRating: rating }))}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Thiết kế</label>
              <StarRating
                rating={formData.designRating}
                size="md"
                interactive={true}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, designRating: rating }))}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Giá trị</label>
              <StarRating
                rating={formData.valueRating}
                size="md"
                interactive={true}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, valueRating: rating }))}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>
      </form>
    </div>
  );
};

ReviewForm.propTypes = {
  modelId: PropTypes.number.isRequired,
  variantId: PropTypes.number,
  vehicleModelName: PropTypes.string.isRequired,
  vehicleVariantName: PropTypes.string,
  customerId: PropTypes.number.isRequired,
  onSuccess: PropTypes.func
};

export default ReviewForm;
