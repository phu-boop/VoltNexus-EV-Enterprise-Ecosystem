import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrderTracking } from '../hooks/useOrderTracking';
import TrackingTimeline from '../components/TrackingTimeline';
import TrackingModal from '../components/TrackingModal';
import StatusBadge from '../components/StatusBadge';

/**
 * Trang chi tiết lịch sử theo dõi đơn hàng
 * Hiển thị toàn bộ timeline và cho phép quản lý tracking records
 */
const TrackingHistoryPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { trackings, currentStatus, loading, error, fetchTrackings } = useOrderTracking(orderId);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTracking, setEditingTracking] = useState(null);

  const handleAddTracking = () => {
    setEditingTracking(null);
    setIsModalOpen(true);
  };

  const handleEditTracking = (tracking) => {
    setEditingTracking(tracking);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchTrackings(); // Refresh data
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">Lỗi tải dữ liệu</div>
          <p className="text-gray-500 mb-4">{error}</p>
          <div className="space-x-3">
            <button 
              onClick={fetchTrackings}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Thử lại
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Header */}
        <div className="mb-6">
          <nav className="flex items-center space-x-4 text-sm">
            <Link 
              to="/dealer/orders" 
              className=" hover:text-blue-700 font-medium"
            >
              📦 Danh sách đơn hàng
            </Link>
            <span className="text-gray-400">/</span>
            <Link 
              to={`/dealer/orders/${orderId}`}
              className="hover:text-blue-700 font-medium"
            >
              Đơn hàng #{orderId?.slice(-8)}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Lịch sử theo dõi</span>
          </nav>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Lịch sử theo dõi đơn hàng
              </h1>
              <p className="text-gray-600">
                Theo dõi toàn bộ lịch sử trạng thái của đơn hàng <strong>#{orderId?.slice(-8)}</strong>
              </p>
              
              {/* Order Summary */}
              <div className="flex flex-wrap gap-4 mt-4">
                {currentStatus && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Trạng thái hiện tại:</span>
                    <StatusBadge status={currentStatus.status} />
                  </div>
                )}
                {currentStatus?.updateDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Cập nhật lúc:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(currentStatus.updateDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(`/dealer/orders/${orderId}`)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                ← Quay lại đơn hàng
              </button>
              <button
                onClick={handleAddTracking}
                className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <span>➕</span>
                Cập nhật trạng thái
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng số bản ghi</p>
                <p className="text-2xl font-bold text-gray-900">{trackings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">⏱️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái hiện tại</p>
                <div className="mt-1">
                  {currentStatus ? (
                    <StatusBadge status={currentStatus.status} className="text-xs" />
                  ) : (
                    <span className="text-gray-500 text-sm">Chưa có</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-xl">📅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cập nhật gần nhất</p>
                <p className="text-sm font-medium text-gray-900">
                  {trackings.length > 0 ? 
                    formatDate(trackings[0].updateDate) : 
                    'Chưa có'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Timeline */}
        <div className="">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Dòng thời gian trạng thái
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Toàn bộ lịch sử cập nhật trạng thái đơn hàng theo thời gian
            </p>
          </div>
          
          <TrackingTimeline 
            trackings={trackings}
            currentStatus={currentStatus}
            loading={loading}
            orderId={orderId}
            onEditTracking={handleEditTracking}
          />
        </div>

        {/* Tracking Modal */}
        <TrackingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          orderId={orderId}
          existingTracking={editingTracking}
          onSuccess={handleModalSuccess}
        />
      </div>
    </div>
  );
};

export default TrackingHistoryPage;