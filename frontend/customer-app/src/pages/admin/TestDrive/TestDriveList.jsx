import { useState, useEffect } from 'react';
import { filterTestDrives, confirmTestDrive, cancelTestDrive, completeTestDrive } from '../../../services/testDriveAdminService';
import Loading from '../../../components/ui/Loading';

const STATUS_COLORS = {
  SCHEDULED: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  CONFIRMED: 'bg-green-100 text-green-800 border-green-300',
  COMPLETED: 'bg-blue-100 text-blue-800 border-blue-300',
  CANCELLED: 'bg-red-100 text-red-800 border-red-300'
};

const STATUS_LABELS = {
  SCHEDULED: 'Đang chờ',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy'
};

export default function TestDriveList({ onViewDetail, onOpenCalendar }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    // Admin xem tất cả dealers, không filter theo dealerId
    statuses: [], // Changed from status string to statuses array
    startDate: null,
    endDate: null
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAppointments();
  }, [filters]);

  const loadAppointments = async () => {
    try {
      setLoading(true);

      // Convert date strings to ISO datetime format for backend LocalDateTime
      const filterRequest = {
        ...filters,
        statuses: filters.statuses.length > 0 ? filters.statuses : null,
        startDate: filters.startDate ? `${filters.startDate}T00:00:00` : null,
        endDate: filters.endDate ? `${filters.endDate}T23:59:59` : null
      };

      const response = await filterTestDrives(filterRequest);
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    if (!window.confirm('Xác nhận lịch hẹn này?')) return;

    try {
      await confirmTestDrive(id);
      loadAppointments();
      alert('Đã xác nhận lịch hẹn thành công!');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCancel = async (id) => {
    const reason = window.prompt('Nhập lý do hủy:');
    if (!reason) return;

    try {
      await cancelTestDrive(id, reason);
      loadAppointments();
      alert('Đã hủy lịch hẹn!');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm('Đánh dấu hoàn thành lịch hẹn này?')) return;

    try {
      await completeTestDrive(id);
      loadAppointments();
      alert('Đã hoàn thành lịch hẹn!');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      apt.customerName?.toLowerCase().includes(search) ||
      apt.customerPhone?.includes(search) ||
      apt.vehicleModelName?.toLowerCase().includes(search)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý lịch lái thử</h1>
          <p className="text-gray-500 mt-1">Quản lý và theo dõi lịch hẹn lái thử xe</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onOpenCalendar}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            📅 Xem lịch
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-4">🔍 Bộ lọc</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Tìm khách hàng, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <select
            value={filters.statuses.length > 0 ? filters.statuses[0] : ''}
            onChange={(e) => {
              const value = e.target.value;
              setFilters({ ...filters, statuses: value ? [value] : [] });
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="SCHEDULED">Đang chờ</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>

          <input
            type="date"
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <input
            type="date"
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold">Danh sách lịch hẹn ({filteredAppointments.length})</h3>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <Loading message="Đang tải dữ liệu..." />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              📭 Không có lịch hẹn nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Mã</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Khách hàng</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Xe</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ngày giờ</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Địa điểm</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nhân viên</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.appointmentId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono">#{apt.appointmentId}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{apt.customerName || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{apt.customerPhone || ''}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{apt.vehicleModelName}</div>
                        {apt.vehicleVariantName && (
                          <div className="text-xs text-gray-500">{apt.vehicleVariantName}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{formatDate(apt.appointmentDate)}</div>
                        <div className="text-xs text-gray-500">{formatTime(apt.appointmentDate)}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{apt.testDriveLocation || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{apt.staffName || 'Chưa phân công'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${STATUS_COLORS[apt.status] || 'bg-gray-100 text-gray-800'}`}>
                          {STATUS_LABELS[apt.status] || apt.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => onViewDetail(apt.appointmentId)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Xem chi tiết"
                          >
                            👁️
                          </button>

                          {apt.status === 'SCHEDULED' && (
                            <button
                              onClick={() => handleConfirm(apt.appointmentId)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Xác nhận"
                            >
                              ✅
                            </button>
                          )}

                          {(apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED') && (
                            <button
                              onClick={() => handleCancel(apt.appointmentId)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Hủy"
                            >
                              ❌
                            </button>
                          )}

                          {apt.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleComplete(apt.appointmentId)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Hoàn thành"
                            >
                              ✔️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
