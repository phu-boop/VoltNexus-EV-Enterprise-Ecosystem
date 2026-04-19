import { useState, useEffect } from 'react';
import { getStatistics } from '../../../services/testDriveAdminService';
import Loading from '../../../components/ui/Loading';

export default function TestDriveStatistics({ onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });

  useEffect(() => {
    loadStatistics();
  }, [dateRange]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await getStatistics(null, dateRange.startDate, dateRange.endDate); // Admin views all dealers
      setStats(response.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = 'blue' }) => (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-${color}-600 text-sm font-medium`}>{title}</p>
          <p className={`text-3xl font-bold text-${color}-900 mt-2`}>{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );

  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return ((value / total) * 100).toFixed(1);
  };

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
    maxWidth: '72rem',
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
            <h2 className="text-2xl font-bold text-gray-900">📊 Thống kê lịch lái thử</h2>
            <p className="text-gray-500 mt-1">Phân tích và báo cáo chi tiết</p>
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

        {/* Date Filter */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
              <input
                type="date"
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
              <input
                type="date"
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setDateRange({ startDate: null, endDate: null })}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <Loading message="Đang tải thống kê..." />
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Tổng lịch hẹn"
                  value={stats.totalAppointments || 0}
                  icon="📋"
                  color="blue"
                />
                <StatCard
                  title="Đang chờ"
                  value={stats.scheduledCount || 0}
                  icon="⏳"
                  color="yellow"
                />
                <StatCard
                  title="Đã xác nhận"
                  value={stats.confirmedCount || 0}
                  icon="✅"
                  color="green"
                />
                <StatCard
                  title="Hoàn thành"
                  value={stats.completedCount || 0}
                  icon="🎉"
                  color="blue"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard
                  title="Đã hủy"
                  value={stats.cancelledCount || 0}
                  icon="❌"
                  color="red"
                />
                <StatCard
                  title="Tỷ lệ hoàn thành"
                  value={`${calculatePercentage(stats.completedCount, stats.totalAppointments)}%`}
                  icon="📈"
                  color="green"
                />
              </div>

              {/* Status Breakdown */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Phân bố theo trạng thái</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Đang chờ', count: stats.scheduledCount, color: 'yellow' },
                    { label: 'Đã xác nhận', count: stats.confirmedCount, color: 'green' },
                    { label: 'Hoàn thành', count: stats.completedCount, color: 'blue' },
                    { label: 'Đã hủy', count: stats.cancelledCount, color: 'red' }
                  ].map(({ label, count, color }) => {
                    const percentage = calculatePercentage(count, stats.totalAppointments);
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{label}</span>
                          <span>{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`bg-${color}-500 h-2 rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Staff Statistics */}
              {stats.appointmentsByStaff && Object.keys(stats.appointmentsByStaff).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">👥 Thống kê theo nhân viên</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.appointmentsByStaff)
                      .sort((a, b) => b[1] - a[1]) // Sort by count descending
                      .map(([staffId, count], index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <span className="font-medium">{staffId}</span>
                          <span className="text-gray-600">{count} lịch</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Additional Stats */}
              {stats.appointmentsByModel && Object.keys(stats.appointmentsByModel).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">🚗 Xe được yêu cầu nhiều nhất</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.appointmentsByModel)
                      .sort((a, b) => b[1] - a[1]) // Sort by count descending
                      .map(([modelName, count], index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <span className="font-medium">{modelName}</span>
                          <span className="text-gray-600">{count} lịch</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Daily Stats */}
              {stats.appointmentsByDay && Object.keys(stats.appointmentsByDay).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">📅 Thống kê theo ngày</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium">Ngày</th>
                          <th className="px-4 py-2 text-right text-sm font-medium">Số lịch hẹn</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {Object.entries(stats.appointmentsByDay)
                          .sort((a, b) => a[0].localeCompare(b[0])) // Sort by date
                          .map(([date, count], index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm">{new Date(date).toLocaleDateString('vi-VN')}</td>
                              <td className="px-4 py-2 text-sm text-right font-medium">{count}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Không có dữ liệu thống kê
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
