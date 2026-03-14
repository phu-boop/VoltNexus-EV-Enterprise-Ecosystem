import React, { useState } from 'react';
import { useOrderTracking } from '../hooks/useOrderTracking';
import NoteForm from './NoteForm';
import { useNavigate } from 'react-router-dom';

/**
 * Component hiển thị timeline trạng thái đơn hàng
 */
const TrackingTimeline = ({ 
  trackings = [], 
  currentStatus, 
  loading, 
  orderId, 
  readOnly = false,
  onCreate,
  onEdit,
  onDelete
}) => {
  const [showNoteForm, setShowNoteForm] = useState(false);
  const { addNote } = useOrderTracking(orderId);
  const navigate = useNavigate();

  const handleAddNote = async (noteData) => {
    try {
      await addNote(noteData.notes);
      setShowNoteForm(false);
    } catch (error) {
      console.error('Lỗi thêm ghi chú:', error);
    }
  };

  const handleEditTracking = (tracking) => {
    if (onEdit && tracking.trackId) {
      onEdit(tracking.trackId);
    }
  };

  const handleDeleteTracking = (tracking) => {
    if (onDelete && tracking.trackId) {
      onDelete(tracking.trackId);
    }
  };

  if (loading) {
    return <TimelineSkeleton />;
  }

  const sortedTrackings = [...trackings].sort((a, b) => 
    new Date(b.updateDate) - new Date(a.updateDate)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800">Lịch sử trạng thái</h2>
          {currentStatus && (
            <p className="text-sm text-gray-600 mt-1">
              Trạng thái hiện tại: <span className="font-medium text-gray-900">{getStatusLabel(currentStatus.status)}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {!readOnly && (
          <button
            onClick={() => navigate(`/dealer/orders/${orderId}/tracking/history`)}
            className="flex-1 sm:flex-none bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 px-4 py-2.5 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all duration-200 text-sm font-medium border border-blue-100 hover:border-blue-200 shadow-sm"
          >
            Cập nhật
          </button>
          )}
          {!readOnly && (
            <button
              onClick={() => setShowNoteForm(true)}
              className="flex-1 sm:flex-none bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 px-4 py-2.5 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-200 text-sm font-medium border border-green-100 hover:border-green-200 shadow-sm"
            >
              ✏️ Thêm ghi chú
            </button>
          )}
        </div>
      </div>

      {/* Note Form Modal */}
      {showNoteForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto border border-gray-200 shadow-xl">
            <NoteForm
              onSubmit={handleAddNote}
              onCancel={() => setShowNoteForm(false)}
            />
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-1">
        {sortedTrackings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-300 text-5xl mb-4">⏳</div>
            <p className="text-gray-500 text-lg">Chưa có lịch sử trạng thái</p>
            <p className="text-gray-400 text-sm mt-1">Các cập nhật sẽ xuất hiện ở đây</p>
          </div>
        ) : (
          sortedTrackings.map((tracking, index) => (
            <TimelineItem
              key={tracking.trackId}
              tracking={tracking}
              isLatest={index === 0}
              readOnly={readOnly}
              onEdit={handleEditTracking}
              onDelete={handleDeleteTracking}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Component cho mỗi item trong timeline
const TimelineItem = ({ tracking, isLatest, readOnly, onEdit, onDelete }) => {
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    const icons = {
      CREATED: '🆕',
      DELIVERED: '📦',
      EDITED: '✏️',
      CONFIRMED: '✅',
      REJECTED: '❌',
      IN_PRODUCTION: '🏭',
      READY_FOR_DELIVERY: '🚚',
      CANCELLED: '🗑️',
      DELETED: '⛔',
      ON_HOLD: '⏸️',
      ISSUE_DETECTED: '⚠️'
    };
    return icons[status] || '📌';
  };

  const getStatusColor = (status) => {
    const colors = {
      CREATED: 'bg-blue-100 text-blue-800 border-blue-200',
      DELIVERED: 'bg-green-100 text-green-800 border-green-200',
      EDITED: 'bg-purple-100 text-purple-800 border-purple-200',
      CONFIRMED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      IN_PRODUCTION: 'bg-orange-100 text-orange-800 border-orange-200',
      READY_FOR_DELIVERY: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
      DELETED: 'bg-red-50 text-red-700 border-red-100',
      ON_HOLD: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      ISSUE_DETECTED: 'bg-amber-100 text-amber-800 border-amber-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="flex gap-4 group hover:bg-gray-50/50 rounded-xl p-3 transition-all duration-200">
      {/* Timeline line và dot */}
      <div className="flex flex-col items-center relative">
        <div className={`w-4 h-4 rounded-full border-2 z-10 transition-all duration-300 ${
          isLatest 
            ? 'bg-gradient-to-r from-blue-400 to-cyan-400 border-white shadow-lg shadow-blue-200' 
            : 'bg-white border-gray-300 group-hover:border-blue-300'
        }`} />
        {!isLatest && (
          <div className="w-0.5 h-full bg-gradient-to-b from-gray-200 to-gray-100 group-hover:from-blue-200 group-hover:to-cyan-100 transition-all duration-300 absolute top-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4 min-w-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-xl flex-shrink-0">{getStatusIcon(tracking.status)}</span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
              {tracking.status ? (
                <div className={`px-3 py-1.5 rounded-full border text-sm font-medium ${getStatusColor(tracking.status)}`}>
                  {getStatusLabel(tracking.status)}
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700 text-sm font-medium">
                  Hệ thống
                </div>
              )}
              <div className="text-sm text-gray-500 font-medium truncate">
                {formatDateTime(tracking.updateDate)}
              </div>
            </div>
          </div>
          
          {!readOnly && tracking.status && (
            <div className="flex gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(tracking)}
                  className="text-gray-400 hover:text-blue-500 transition-all duration-200 p-2 hover:bg-blue-50 rounded-lg flex-shrink-0"
                  title="Chỉnh sửa trạng thái"
                >
                  <span className="text-lg">✏️</span>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(tracking)}
                  className="text-gray-400 hover:text-red-500 transition-all duration-200 p-2 hover:bg-red-50 rounded-lg flex-shrink-0"
                  title="Xóa trạng thái"
                >
                  <span className="text-lg">🗑️</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        {tracking.notes && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-25 rounded-xl p-4 mt-3 border border-gray-100">
            <div className="flex items-start gap-2">
              <span className="text-gray-400 text-sm mt-0.5">📝</span>
              <p className="text-sm text-gray-700 leading-relaxed">{tracking.notes}</p>
            </div>
          </div>
        )}

        {/* Updated By */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Cập nhật bởi: <span className="font-medium text-gray-700">{tracking.updatedBy ? `NV-${tracking.updatedBy.slice(-8)}` : 'Hệ thống'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

// Skeleton loading
const TimelineSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex-1">
        <div className="h-7 bg-gray-200 rounded-lg w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-36"></div>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <div className="h-10 bg-gray-200 rounded-xl w-32 flex-1 sm:flex-none"></div>
        <div className="h-10 bg-gray-200 rounded-xl w-32 flex-1 sm:flex-none"></div>
      </div>
    </div>
    <div className="space-y-1">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex gap-4 p-3">
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
            {item !== 3 && <div className="w-0.5 h-full bg-gray-200 absolute top-4"></div>}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-2">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mt-3"></div>
            <div className="h-3 bg-gray-200 rounded w-24 mt-3"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Helper function - Cập nhật theo enum mới
const getStatusLabel = (status) => {
  const labels = {
    CREATED: 'Đơn hàng mới',
    DELIVERED: 'Đã giao hàng',
    EDITED: 'Đã chỉnh sửa',
    CONFIRMED: 'Đã xác nhận',
    REJECTED: 'Đã từ chối',
    IN_PRODUCTION: 'Đang sản xuất',
    READY_FOR_DELIVERY: 'Sẵn sàng giao',
    CANCELLED: 'Đã hủy',
    DELETED: 'Đã xóa',
    ON_HOLD: 'Tạm dừng',
    ISSUE_DETECTED: 'Phát hiện vấn đề'
  };
  return labels[status] || status;
};

export default TrackingTimeline;