import { useState, useEffect } from 'react';
import { getTestDriveById } from '../../../services/testDriveAdminService';
import Loading from '../../../components/ui/Loading';

const STATUS_COLORS = {
  SCHEDULED: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  CONFIRMED: 'bg-green-100 text-green-800 border-green-300',
  COMPLETED: 'bg-blue-100 text-blue-800 border-blue-300',
  CANCELLED: 'bg-red-100 text-red-800 border-red-300'
};

const STATUS_LABELS = {
  SCHEDULED: 'Đang chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy'
};

export default function TestDriveDetail({ appointmentId, onClose }) {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appointmentId) {
      loadAppointment();
    }
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const response = await getTestDriveById(appointmentId);
      setAppointment(response.data);
    } catch (error) {
      console.error('Error loading appointment:', error);
      alert('Lỗi khi tải thông tin lịch hẹn');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!appointmentId) return null;

  // Inline styles để đảm bảo overlay bán trong suốt hoạt động
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
    padding: '1rem'
  };

  const modalStyle = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    maxWidth: '42rem',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    zIndex: 50
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Chi tiết lịch lái thử</h2>
            <p className="text-gray-500 mt-1">Mã lịch hẹn: #{appointmentId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-normal leading-none transition-colors"
            title="Đóng"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <Loading message="Đang tải..." />
            </div>
          ) : appointment ? (
            <div className="space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${STATUS_COLORS[appointment.status]}`}>
                  {STATUS_LABELS[appointment.status]}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  👤 Thông tin khách hàng
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Họ tên</label>
                    <p className="mt-1 text-gray-900">{appointment.customerName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Số điện thoại</label>
                    <p className="mt-1 text-gray-900">{appointment.customerPhone || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <p className="mt-1 text-gray-900">{appointment.customerEmail || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  🚗 Thông tin xe
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Dòng xe</label>
                    <p className="mt-1 text-gray-900">{appointment.vehicleModelName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Phiên bản</label>
                    <p className="mt-1 text-gray-900">{appointment.vehicleVariantName || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  📅 Chi tiết lịch hẹn
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Ngày giờ hẹn</label>
                    <p className="mt-1 text-gray-900">{formatDateTime(appointment.appointmentDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Địa điểm lái thử</label>
                    <p className="mt-1 text-gray-900">{appointment.testDriveLocation || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Nhân viên phụ trách</label>
                    <p className="mt-1 text-gray-900">{appointment.staffName || 'Chưa phân công'}</p>
                  </div>
                  {appointment.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Ghi chú</label>
                      <p className="mt-1 text-gray-900 whitespace-pre-wrap">{appointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cancellation Info */}
              {appointment.status === 'CANCELLED' && appointment.cancellationReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                    ⚠️ Lý do hủy
                  </h3>
                  <p className="text-red-800">{appointment.cancellationReason}</p>
                  {appointment.cancelledAt && (
                    <p className="text-sm text-red-600 mt-2">
                      Thời gian hủy: {formatDateTime(appointment.cancelledAt)}
                    </p>
                  )}
                </div>
              )}

              {/* Timestamps */}
              <div className="border-t pt-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Ngày tạo:</span>
                  <span>{formatDateTime(appointment.createdAt)}</span>
                </div>
                {appointment.updatedAt && (
                  <div className="flex justify-between mt-1">
                    <span>Cập nhật lần cuối:</span>
                    <span>{formatDateTime(appointment.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Không tìm thấy thông tin lịch hẹn
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
