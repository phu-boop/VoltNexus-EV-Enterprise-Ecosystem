import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/AuthProvider';
import testDriveService from '../services/testDriveService';

const MyTestDrivesPage = () => {
  const navigate = useNavigate();
  const { memberId, email, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, SCHEDULED, CONFIRMED, COMPLETED, CANCELLED
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    if (!isAuthenticated() || !memberId) {
      navigate('/login');
      return;
    }
    loadAppointments();
  }, [memberId, isAuthenticated]);

  const loadAppointments = async () => {
    if (!memberId) return;
    
    setLoading(true);
    try {
      const response = await testDriveService.getMyAppointments(memberId);
      
      // Handle different response formats
      if (response.success || response.code === 200) {
        const appointments = response.data || response.result || [];
        setAppointments(appointments);
      } else {
        console.error('Failed to load appointments:', response);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Không thể tải danh sách lịch hẹn');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'ALL') return true;
    return apt.status === filter;
  });

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
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
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

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancellationReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy');
      return;
    }

    try {
      const response = await testDriveService.cancelAppointment(
        tedAppointment.appointmentId,
        cancellationReason,
        user.email || 'customer'
      );

      if (response.code === 200) {
        toast.success('Đã hủy lịch hẹn thành công');
        setShowCancelModal(false);
        setCancellationReason('');
        setSelectedAppointment(null);
        loadAppointments();
      } else {
        toast.error(response.message || 'Không thể hủy lịch hẹn');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lịch lái thử của tôi</h1>
        <button
          onClick={() => navigate('/test-drive')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Đặt lịch mới
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex border-b overflow-x-auto">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'SCHEDULED', label: 'Đã đặt' },
            { key: 'CONFIRMED', label: 'Đã xác nhận' },
            { key: 'COMPLETED', label: 'Hoàn thành' },
            { key: 'CANCELLED', label: 'Đã hủy' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                filter === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-sm">
                ({appointments.filter(a => tab.key === 'ALL' || a.status === tab.key).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Chưa có lịch hẹn nào
          </h3>
          <p className="text-gray-500 mb-4">
            {filter === 'ALL' 
              ? 'Bạn chưa đặt lịch lái thử nào'
              : `Không có lịch hẹn nào với trạng thái "${filter}"`
            }
          </p>
          {filter === 'ALL' && (
            <button
              onClick={() => navigate('/test-drive')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Đặt lịch ngay
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map(appointment => (
            <div key={appointment.appointmentId} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {appointment.vehicleModelName}
                    {appointment.vehicleVariantName && ` - ${appointment.vehicleVariantName}`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Mã lịch hẹn: #{appointment.appointmentId}
                  </p>
                </div>
                {getStatusBadge(appointment.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">📅 Thời gian</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">📍 Địa điểm</p>
                  <p className="text-sm font-medium text-gray-800">
                    {appointment.testDriveLocation || 'Chưa xác định'}
                  </p>
                </div>
              </div>

              {appointment.customerNotes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Ghi chú:</p>
                  <p className="text-sm text-gray-700">{appointment.customerNotes}</p>
                </div>
              )}

              {appointment.status === 'CANCELLED' && appointment.cancellationReason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 mb-1">Lý do hủy:</p>
                  <p className="text-sm text-red-700">{appointment.cancellationReason}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => navigate(`/test-drives/${appointment.appointmentId}`)}
                  className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Xem chi tiết
                </button>
                {canCancelAppointment(appointment) && (
                  <button
                    onClick={() => handleCancelClick(appointment)}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Hủy lịch
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Hủy lịch hẹn
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Bạn có chắc chắn muốn hủy lịch lái thử xe{' '}
              <strong>{selectedAppointment?.vehicleModelName}</strong>?
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
                  setSelectedAppointment(null);
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

export default MyTestDrivesPage;
