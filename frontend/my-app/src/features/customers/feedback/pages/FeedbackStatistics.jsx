import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBarChart2, FiTrendingUp, FiClock, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getComplaintStatistics, COMPLAINT_TYPES, COMPLAINT_SEVERITIES, COMPLAINT_STATUSES } from '../services/feedbackService';

const FeedbackStatistics = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const dealerId = 1; // TODO: Get from session
  const basePath = sessionStorage.getItem('roles')?.includes('DEALER_MANAGER') 
    ? '/dealer/manager' 
    : '/dealer/staff';

  useEffect(() => {
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  }, []);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      loadStatistics();
    }
  }, [dateRange]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await getComplaintStatistics(dealerId, dateRange.startDate, dateRange.endDate);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
      toast.error('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  const formatHours = (hours) => {
    if (!hours) return 'N/A';
    if (hours < 24) return `${hours.toFixed(1)} giờ`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days} ngày ${remainingHours.toFixed(0)} giờ`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`${basePath}/feedback`)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Quay lại</span>
          </button>
        </div>

        {/* Title Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Thống kê Phản hồi & Khiếu nại
              </h1>
              <p className="text-gray-600 flex items-center">
                <FiBarChart2 className="w-4 h-4 mr-2" />
                Báo cáo tổng hợp và phân tích xu hướng
              </p>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center space-x-3">
              <div>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <span className="text-gray-600">đến</span>
              <div>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {statistics && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200/80 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Tổng phản hồi</p>
                  <FiBarChart2 className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{statistics.totalComplaints || 0}</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-200/80 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Mới nhận</p>
                  <FiBarChart2 className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600">{statistics.byStatus?.NEW || 0}</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-200/80 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Đang xử lý</p>
                  <FiClock className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-yellow-600">{statistics.byStatus?.IN_PROGRESS || 0}</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-200/80 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Đã giải quyết</p>
                  <FiTrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">{statistics.byStatus?.RESOLVED || 0}</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-red-200/80 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-red-600">Khẩn cấp</p>
                  <FiAlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-600">{statistics.bySeverity?.CRITICAL || 0}</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* By Status */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Theo trạng thái</h3>
                <div className="space-y-3">
                  {Object.entries(statistics.byStatus || {}).map(([status, count]) => {
                    const statusInfo = COMPLAINT_STATUSES[status] || {};
                    const total = statistics.totalComplaints || 1;
                    const percentage = ((count / total) * 100).toFixed(1);
                    
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {statusInfo.label || status}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* By Severity */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Theo mức độ</h3>
                <div className="space-y-3">
                  {Object.entries(statistics.bySeverity || {}).map(([severity, count]) => {
                    const severityInfo = COMPLAINT_SEVERITIES[severity] || {};
                    const total = statistics.totalComplaints || 1;
                    const percentage = ((count / total) * 100).toFixed(1);
                    
                    return (
                      <div key={severity}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {severityInfo.label || severity}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              severity === 'CRITICAL' ? 'bg-red-600' :
                              severity === 'HIGH' ? 'bg-orange-600' :
                              severity === 'MEDIUM' ? 'bg-yellow-600' : 'bg-green-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* By Type */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Theo loại phản hồi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(statistics.byType || {}).map(([type, count]) => {
                  const typeInfo = COMPLAINT_TYPES[type] || {};
                  return (
                    <div key={type} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="text-3xl mb-2">{typeInfo.icon || '📝'}</div>
                      <p className="text-sm text-gray-600 mb-1">{typeInfo.label || type}</p>
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Thời gian giải quyết TB</h3>
                  <FiClock className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatHours(statistics.averageResolutionTimeHours)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Từ tạo đến giải quyết</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Thời gian phản hồi TB</h3>
                  <FiClock className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatHours(statistics.averageFirstResponseTimeHours)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Thời gian phản hồi đầu tiên</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-red-200/80 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-red-700">Quá hạn SLA</h3>
                  <FiAlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {statistics.overdueComplaints || 0}
                </p>
                <p className="text-xs text-red-500 mt-1">Phản hồi chưa xử lý kịp thời</p>
              </div>
            </div>

            {/* Staff Performance */}
            {statistics.byStaff && Object.keys(statistics.byStaff).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Hiệu suất nhân viên</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Nhân viên
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Số phản hồi
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          % Tổng số
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(statistics.byStaff).map(([staffName, count]) => {
                        const total = statistics.totalComplaints || 1;
                        const percentage = ((count / total) * 100).toFixed(1);
                        return (
                          <tr key={staffName} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {staffName || 'Chưa gán'}
                            </td>
                            <td className="px-6 py-4 text-sm text-center text-gray-700">
                              {count}
                            </td>
                            <td className="px-6 py-4 text-sm text-center text-gray-700">
                              {percentage}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackStatistics;
