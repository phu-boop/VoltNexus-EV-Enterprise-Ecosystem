import React from 'react';
import { useSalesOrders } from '../hooks/useSalesOrders';

/**
 * Component chứa các hành động với đơn hàng
 * @param {Object} order - Đơn hàng hiện tại
 * @param {function} onActionComplete - Callback khi hành động hoàn thành
 */
const OrderActions = ({ order, onActionComplete }) => {
  const { updateStatus, approveOrder } = useSalesOrders();

  const handleStatusChange = async (newStatus) => {
    try {
      await updateStatus(order.orderId, newStatus);
      onActionComplete?.('Cập nhật trạng thái thành công');
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error);
    }
  };

  const handleApprove = async () => {
    try {
      const managerId = sessionStorage.getItem('profileId');
      await approveOrder(order.orderId, managerId);
      onActionComplete?.('Duyệt đơn hàng thành công');
    } catch (error) {
      console.error('Lỗi duyệt đơn hàng:', error);
    }
  };

  const getAvailableStatuses = (currentStatus) => {
    const statusFlow = {
      PENDING: ['APPROVED', 'CONFIRMED', 'CANCELLED'],
      APPROVED: ['CONFIRMED', 'IN_PRODUCTION', 'CANCELLED'],
      CONFIRMED: ['IN_PRODUCTION', 'CANCELLED'],
      IN_PRODUCTION: ['READY_FOR_DELIVERY', 'CANCELLED'],
      READY_FOR_DELIVERY: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: []
    };
    return statusFlow[currentStatus] || [];
  };

  const availableStatuses = getAvailableStatuses(order.orderStatusB2C);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Hành động</h3>
      
      <div className="space-y-3">
        {/* Duyệt đơn hàng */}
        {!order.managerApproval && order.orderStatusB2C === 'PENDING' && (
          <button
            onClick={handleApprove}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            📋 Duyệt đơn hàng
          </button>
        )}

        {/* Thay đổi trạng thái */}
        {availableStatuses.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thay đổi trạng thái
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableStatuses.map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className="bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  {getStatusLabel(status)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Thông tin phê duyệt */}
        {order.managerApproval && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 text-sm">
              ✅ Đã được phê duyệt bởi quản lý
            </p>
            {order.approvalDate && (
              <p className="text-green-600 text-xs mt-1">
                Ngày duyệt: {new Date(order.approvalDate).toLocaleDateString('vi-VN')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function
const getStatusLabel = (status) => {
  const labels = {
    APPROVED: 'Duyệt',
    CONFIRMED: 'Xác nhận',
    IN_PRODUCTION: 'Sản xuất',
    READY_FOR_DELIVERY: 'Sẵn sàng giao',
    DELIVERED: 'Đã giao',
    CANCELLED: 'Hủy'
  };
  return labels[status] || status;
};

export default OrderActions;