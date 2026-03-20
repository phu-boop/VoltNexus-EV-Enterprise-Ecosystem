import React from "react";
import { FiX } from "react-icons/fi";

// Component Badge (tái sử dụng từ các trang của bạn)
const StatusBadge = ({ status }) => {
  let colorClasses = "bg-gray-100 text-gray-800";
  let text = status;
  switch (status) {
    case "PENDING":
      colorClasses = "bg-yellow-100 text-yellow-800";
      text = "Chờ duyệt";
      break;
    case "CONFIRMED":
      colorClasses = "bg-blue-100 text-blue-800";
      text = "Chờ xuất kho";
      break;
    case "IN_TRANSIT":
      colorClasses = "bg-cyan-100 text-cyan-800";
      text = "Đang giao";
      break;
    case "DELIVERED":
      colorClasses = "bg-green-100 text-green-800";
      text = "Đã giao";
      break;
    case "CANCELLED":
      colorClasses = "bg-red-100 text-red-800";
      text = "Đã hủy";
      break;
  }
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-block ${colorClasses}`}
    >
      {text}
    </span>
  );
};

/**
 * Modal hiển thị chi tiết đầy đủ của một Đơn hàng B2B.
 */
const B2BOrderDetailsModal = ({ isOpen, onClose, order, dealerMap }) => {
  if (!isOpen || !order) return null;

  const dealerName =
    dealerMap?.get(order.dealerId) ||
    `Đại lý (ID: ${order.dealerId.substring(0, 8)}...)`;

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-60 z-50 flex justify-center items-center p-4 animate-in fade-in-0">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Chi tiết Lệnh điều phối
            </h2>
            <p className="text-sm text-gray-500 font-mono">
              ID: {order.orderId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Thông tin chung */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Đại lý nhận</p>
              <p className="font-semibold">{dealerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ngày đặt</p>
              <p className="font-semibold">
                {new Date(order.orderDate).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Trạng thái</p>
              <StatusBadge status={order.orderStatus} />
            </div>
          </div>

          {/* Danh sách Sản phẩm */}
          <div>
            <h4 className="font-semibold text-lg mb-2">Chi tiết sản phẩm</h4>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 text-sm text-gray-600">
                  <tr>
                    <th className="p-3 text-left">Sản phẩm</th>
                    <th className="p-3 text-center">Số lượng</th>
                    <th className="p-3 text-right">Đơn giá</th>
                    <th className="p-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item) => (
                    <tr key={item.orderItemId} className="border-t">
                      <td className="p-3">
                        <p className="font-medium text-gray-900">
                          {/* Dữ liệu đã được làm giàu */}
                          {item.versionName} - {item.color}
                        </p>
                        <p className="text-xs text-gray-500">
                          SKU: {item.skuCode} | VariantID: {item.variantId}
                        </p>
                      </td>
                      <td className="p-3 text-center font-medium">
                        {item.quantity}
                      </td>
                      <td className="p-3 text-right text-gray-700">
                        {Number(item.unitPrice).toLocaleString("vi-VN")} VNĐ
                      </td>
                      <td className="p-3 text-right font-semibold text-gray-900">
                        {Number(item.totalPrice).toLocaleString("vi-VN")} VNĐ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tổng tiền và Ghi chú */}
          <div className="flex justify-between items-start">
            {order.notes ? (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">
                <p className="font-semibold mb-1">Ghi chú từ Đại lý:</p>
                <p className="italic">{order.notes}</p>
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic">
                Không có ghi chú.
              </div>
            )}

            <div className="text-right">
              <p className="text-sm text-gray-500">Tổng tiền</p>
              <p className="text-2xl font-bold text-blue-600">
                {Number(order.totalAmount).toLocaleString("vi-VN")} VNĐ
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default B2BOrderDetailsModal;
