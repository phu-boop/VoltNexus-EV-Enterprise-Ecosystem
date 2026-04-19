import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import testDriveService from '../services/testDriveService';
import { getVehicleById } from '../services/vehicleService';
import { useAuth } from '../auth/AuthProvider';
import { Calendar, Clock, MapPin, Car, User, Phone, Mail, FileText, AlertCircle } from 'lucide-react';

const TestDriveDetailPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { email } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    loadAppointment();
  }, [appointmentId]);

  const loadAppointment = async () => {
    setLoading(true);
    try {
      const response = await testDriveService.getAppointmentById(appointmentId);
      if (response.success || response.code === 200) {
        let appointmentData = response.data || response.result;
        
        // If vehicleModelName is missing, fetch from vehicle service
        if (!appointmentData.vehicleModelName && appointmentData.modelId) {
          try {
            const vehicleResponse = await getVehicleById(appointmentData.modelId);
            if (vehicleResponse.data) {
              appointmentData.vehicleModelName = vehicleResponse.data.modelName;
            }
          } catch (error) {
            console.error('Error fetching vehicle info:', error);
          }
        }
        
        setAppointment(appointmentData);
      }
    } catch (error) {
      console.error('Error loading appointment:', error);
      toast.error('Không thể tải chi tiết lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancellationReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy');
      return;
    }

    try {
      const response = await testDriveService.cancelAppointment(
        appointmentId,
        cancellationReason,
        email || 'customer'
      );

      if (response.success || response.code === 200) {
        toast.success('Đã hủy lịch hẹn thành công');
        setShowCancelModal(false);
        loadAppointment();
      } else {
        toast.error(response.message || 'Không thể hủy lịch hẹn');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      SCHEDULED: { label: 'Đã đặt', color: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: 'Đã xác nhận', color: 'bg-green-100 text-green-800' },
      COMPLETED: { label: 'Hoàn thành', color: 'bg-blue-100 text-blue-800' },
      CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
      EXPIRED: { label: 'Hết hạn', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDateTime = (dateString, timeSlot) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Use appointmentTime from backend if available
    const displayTime = timeSlot || date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${day}, ${displayTime}`;
  };

  const canCancelAppointment = (appointment) => {
    return ['SCHEDULED', 'CONFIRMED'].includes(appointment.status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Không tìm thấy lịch hẹn
          </h3>
          <button
            onClick={() => navigate('/my-test-drives')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/my-test-drives')}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
        >
          ← Quay lại 
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Chi tiết lịch lái thử</h1>
          {getStatusBadge(appointment.status)}
        </div>
        <p className="text-sm text-gray-500 mt-2">Mã lịch hẹn: #{appointment.appointmentId}</p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Vehicle Info */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex items-start gap-4">
            <Car className="w-8 h-8 mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {appointment.vehicleModelName || 'Xe điện'}
                {appointment.vehicleVariantName && ` - ${appointment.vehicleVariantName}`}
              </h2>
              {appointment.modelId && (
                <p className="text-blue-100">Model ID: {appointment.modelId}</p>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 space-y-6">
          {/* Time & Location */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase">Thông tin lịch hẹn</h3>
              
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Ngày giờ</p>
                  <p className="font-medium text-gray-800">{formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Địa điểm</p>
                  <p className="font-medium text-gray-800">{appointment.testDriveLocation || 'Chưa xác định'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase">Thông tin khách hàng</h3>
              
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Họ tên</p>
                  <p className="font-medium text-gray-800">{appointment.customerName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium text-gray-800">{appointment.customerPhone}</p>
                </div>
              </div>

              {appointment.customerEmail && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">{appointment.customerEmail}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {appointment.customerNotes && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ghi chú của khách hàng</p>
                  <p className="text-gray-700">{appointment.customerNotes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Cancellation Info */}
          {appointment.status === 'CANCELLED' && appointment.cancellationReason && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm text-red-600 font-medium mb-1">Lý do hủy</p>
                  <p className="text-red-700">{appointment.cancellationReason}</p>
                  {appointment.cancelledBy && (
                    <p className="text-sm text-red-600 mt-1">Hủy bởi: {appointment.cancelledBy}</p>
                  )}
                  {appointment.cancelledAt && (
                    <p className="text-sm text-red-600">Thời gian: {formatDateTime(appointment.cancelledAt)}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {appointment.status === 'EXPIRED' && appointment.cancellationReason && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Lý do hết hạn</p>
                  <p className="text-gray-700">{appointment.cancellationReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => navigate('/my-test-drives')}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Quay lại
            </button>
            {canCancelAppointment(appointment) && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Hủy lịch
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Hủy lịch hẹn
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Bạn có chắc chắn muốn hủy lịch lái thử xe{' '}
              <strong>{appointment.vehicleModelName}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do hủy <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows="3"
                placeholder="Nhập lý do hủy lịch..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancellationReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={handleCancelConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestDriveDetailPage;
