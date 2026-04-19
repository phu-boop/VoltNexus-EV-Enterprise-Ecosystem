import { FiUser, FiCalendar, FiArrowRight, FiAlertCircle, FiClock, FiFileText } from 'react-icons/fi';
import { COMPLAINT_TYPES, COMPLAINT_SEVERITIES, COMPLAINT_STATUSES, COMPLAINT_CHANNELS } from '../services/feedbackService';

const FeedbackCard = ({ complaint, onViewDetail, onRefresh }) => {
  const typeInfo = COMPLAINT_TYPES[complaint.complaintType] || {};
  const severityInfo = COMPLAINT_SEVERITIES[complaint.severity] || {};
  const statusInfo = COMPLAINT_STATUSES[complaint.status] || {};
  const channelInfo = COMPLAINT_CHANNELS[complaint.channel] || {};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) {
      return `${diffHours}h trước`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    }
    return formatDate(dateString);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Header với background gradient */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {/* Left: Code & Icon */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
              {typeInfo.icon ? <typeInfo.icon className="w-6 h-6" /> : <FiFileText className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {complaint.complaintCode}
              </h3>
              <p className="text-sm text-gray-600">{typeInfo.label || complaint.complaintType}</p>
            </div>
          </div>

          {/* Right: Status & Severity badges - inline */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusInfo.color || 'bg-gray-100 text-gray-700'}`}>
              {statusInfo.label || complaint.status}
            </span>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${severityInfo.color || 'bg-gray-100 text-gray-700'}`}>
              {severityInfo.label || complaint.severity}
            </span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6">
        {/* Grid Layout - 2 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Customer Info */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiUser className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">Khách hàng</p>
                <p className="font-semibold text-gray-900">{complaint.customerName || 'N/A'}</p>
                {complaint.customerPhone && (
                  <p className="text-sm text-gray-600">{complaint.customerPhone}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiFileText className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Nội dung phản hồi</p>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {complaint.description || 'Không có mô tả'}
                </p>
              </div>
            </div>

            {/* Resolution (if resolved) */}
            {complaint.status === 'RESOLVED' && complaint.resolution && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700 font-semibold mb-1">✓ Đã giải quyết</p>
                <p className="text-sm text-green-800 line-clamp-2">{complaint.resolution}</p>
              </div>
            )}
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-3">
            {/* Time */}
            <div className="flex items-center text-sm">
              <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Thời gian</p>
                <p className="font-medium text-gray-700">{getTimeAgo(complaint.createdAt)}</p>
              </div>
            </div>

            {/* Channel */}
            {complaint.channel && (
              <div className="flex items-center text-sm">
                {channelInfo.icon && <channelInfo.icon className="w-4 h-4 mr-2 text-gray-400" />}
                <div>
                  <p className="text-xs text-gray-500">Kênh tiếp nhận</p>
                  <p className="font-medium text-gray-700">{channelInfo.label || complaint.channel}</p>
                </div>
              </div>
            )}

            {/* Assigned Staff */}
            <div className="flex items-center text-sm">
              <FiUser className="w-4 h-4 mr-2 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">Người xử lý</p>
                {complaint.assignedStaffName ? (
                  <p className="font-medium text-blue-700">{complaint.assignedStaffName}</p>
                ) : (
                  <p className="text-xs text-yellow-700 font-medium flex items-center">
                    <FiAlertCircle className="w-3 h-3 mr-1" />
                    Chưa phân công
                  </p>
                )}
              </div>
            </div>

            {/* Critical Alert */}
            {complaint.severity === 'CRITICAL' && !complaint.firstResponseAt && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700 font-semibold flex items-center">
                  <FiAlertCircle className="w-3 h-3 mr-1" />
                  Cần xử lý gấp!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Action Button */}
        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={() => onViewDetail(complaint.complaintId)}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Xem chi tiết
            <FiArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackCard;
