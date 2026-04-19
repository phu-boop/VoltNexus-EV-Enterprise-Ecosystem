import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Star, MessageSquare, FileText, CheckCircle } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose, appointment, onSubmit }) => {
  const [formData, setFormData] = useState({
    feedbackRating: 0,
    feedbackComment: '',
    staffNotes: '',
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ngăn body scroll khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.feedbackRating === 0) {
      alert('Vui lòng chọn đánh giá sao!');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(appointment.appointmentId, formData);
      // Reset form
      setFormData({
        feedbackRating: 0,
        feedbackComment: '',
        staffNotes: '',
      });
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Có lỗi xảy ra khi gửi phản hồi!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, feedbackRating: rating });
  };

  const modalContent = (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Ghi Kết Quả Lái Thử</h2>
              <p className="text-blue-100 text-sm">
                #{appointment.appointmentId} - {appointment.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto">
          {/* Appointment Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start text-sm text-blue-800">
              <MessageSquare className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold">Lịch lái thử:</span>
                <span className="ml-2">
                  {appointment.customerName} - {appointment.vehicleModel}
                </span>
                {appointment.appointmentDate && (
                  <div className="text-blue-700 mt-1">
                    📅 {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Đánh Giá Của Khách Hàng <span className="text-red-500">*</span>
            </label>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="flex items-center justify-center space-x-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoveredRating || formData.feedbackRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {formData.feedbackRating > 0 && (
                <div className="text-center">
                  <span className="text-lg font-semibold text-gray-700">
                    {formData.feedbackRating}/5
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.feedbackRating === 5 && '🌟 Xuất sắc!'}
                    {formData.feedbackRating === 4 && '😊 Rất tốt!'}
                    {formData.feedbackRating === 3 && '🙂 Tốt'}
                    {formData.feedbackRating === 2 && '😐 Trung bình'}
                    {formData.feedbackRating === 1 && '😞 Cần cải thiện'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Comment */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phản Hồi Của Khách Hàng
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5 pointer-events-none" />
              <textarea
                value={formData.feedbackComment}
                onChange={(e) => setFormData({ ...formData, feedbackComment: e.target.value })}
                placeholder="Khách hàng nói gì về trải nghiệm lái thử? (tùy chọn)"
                rows={4}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white resize-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 ml-1">
              💬 Ghi lại những nhận xét, ý kiến của khách hàng về xe, dịch vụ...
            </p>
          </div>

          {/* Staff Notes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ghi Chú Của Nhân Viên
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5 pointer-events-none" />
              <textarea
                value={formData.staffNotes}
                onChange={(e) => setFormData({ ...formData, staffNotes: e.target.value })}
                placeholder="Đánh giá tiềm năng mua hàng, các bước tiếp theo... (tùy chọn)"
                rows={4}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white resize-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 ml-1">
              📝 Ghi chú nội bộ: mức độ quan tâm, khả năng chốt đơn, kế hoạch follow-up...
            </p>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-semibold mb-1">Lưu ý</p>
              <p>Kết quả lái thử sẽ được lưu vào hệ thống và có thể được sử dụng để phân tích, đánh giá chất lượng dịch vụ.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center justify-center font-semibold disabled:opacity-50"
            >
              <X className="w-5 h-5 mr-2" />
              Đóng
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.feedbackRating === 0}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Lưu Kết Quả
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default FeedbackModal;
