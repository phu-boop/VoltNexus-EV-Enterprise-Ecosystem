import React, { useState, useEffect } from 'react';
import { useOrderTracking } from '../hooks/useOrderTracking';
import StatusBadge from './StatusBadge';

/**
 * Modal để tạo hoặc cập nhật tracking record
 * @param {boolean} isOpen - Trạng thái mở/đóng modal
 * @param {function} onClose - Callback khi đóng modal
 * @param {string} orderId - ID của đơn hàng
 * @param {Object} existingTracking - Tracking record hiện tại (nếu là update)
 * @param {function} onSuccess - Callback khi thành công
 */
const TrackingModal = ({ isOpen, onClose, orderId, existingTracking, onSuccess }) => {
  const { addTracking, updateTracking } = useOrderTracking(orderId);
  const [formData, setFormData] = useState({
    status: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Cập nhật status options theo enum mới
  const statusOptions = [
    'CREATED',
    'CONFIRMED',
    'IN_PRODUCTION',
    'READY_FOR_DELIVERY',
    'DELIVERED',
    'EDITED',
    'REJECTED',
    'CANCELLED',
    'ON_HOLD',
    'ISSUE_DETECTED',
    'DELETED'
  ];

  useEffect(() => {
    if (existingTracking) {
      setFormData({
        status: existingTracking.status || '',
        notes: existingTracking.notes || ''
      });
    } else {
      setFormData({
        status: 'CREATED',
        notes: ''
      });
    }
  }, [existingTracking, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.status) return;

    setSubmitting(true);
    try {
      const updatedBy = sessionStorage.getItem('profileId');
      const trackingData = {
        orderId: orderId,
        statusB2C: formData.status,
        notes: formData.notes,
        updatedBy: updatedBy
      };

      if (existingTracking) {
        await updateTracking(existingTracking.trackId, trackingData);
      } else {
        await addTracking(trackingData);
      }

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Lỗi khi lưu tracking:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ status: '', notes: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl border border-gray-200 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {existingTracking ? 'Cập nhật trạng thái' : 'Thêm trạng thái mới'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {existingTracking ? 'Chỉnh sửa thông tin tracking' : 'Thêm trạng thái mới cho đơn hàng'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 hover:bg-gray-100 rounded-lg"
          >
            <span className="text-lg">✕</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Trạng thái đơn hàng
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData({ ...formData, status })}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    formData.status === status
                      ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      formData.status === status ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <StatusBadge 
                        status={status} 
                        showIcon={false} 
                        className="text-sm font-medium"
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gray-600">📝</span>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Ghi chú
              </label>
            </div>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Nhập ghi chú về tình trạng đơn hàng..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none transition-all duration-200 bg-gray-50/50"
            />
            <p className="text-sm text-gray-500 mt-2">
              💡 Ghi chú giúp theo dõi chi tiết tình trạng đơn hàng
            </p>
          </div>

          {/* Selected Status Preview */}
          {formData.status && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-25 rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-3 font-medium">Trạng thái sẽ được cập nhật:</p>
              <div className="flex items-center gap-3">
                <StatusBadge status={formData.status} size="lg" />
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {existingTracking ? 'Cập nhật' : 'Thêm mới'}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium disabled:opacity-50 border border-gray-200 hover:border-gray-300"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={!formData.status || submitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>💾</span>
                  <span>{existingTracking ? 'Cập nhật' : 'Thêm trạng thái'}</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrackingModal;