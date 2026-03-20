import React, { useState } from "react";

/**
 * Component Card hiển thị thông tin chi tiết của một Order Item
 * @param {Object} item - Order item data
 * @param {function} onEdit - Callback khi click edit
 * @param {function} onDelete - Callback khi click delete
 * @param {boolean} readOnly - Chế độ chỉ đọc
 */
const OrderItemCard = ({
  item,
  onEdit,
  onDelete,
  readOnly = false,
  showActions = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const calculateSubtotal = () => {
    return (item.unitPrice || 0) * (item.quantity || 0);
  };

  const calculateDiscountAmount = () => {
    const subtotal = calculateSubtotal();
    return subtotal * ((item.discount || 0) / 100);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                #{item.variantId}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Biến thể #{item.variantId}
              </h3>
              <p className="text-sm text-gray-500">
                Mã: {item.orderItemId?.slice(-8)}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(item.finalPrice)}
            </div>
            {item.discount > 0 && (
              <div className="text-xs text-red-500 line-through">
                {formatCurrency(calculateSubtotal())}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thông tin cơ bản */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <InfoRow label="Số lượng" value={item.quantity} />
            <InfoRow label="Đơn giá" value={formatCurrency(item.unitPrice)} />
          </div>
          <div className="space-y-2">
            <InfoRow
              label="Giảm giá"
              value={`${item.discount}%`}
              valueClassName={item.discount > 0 ? "text-red-600" : ""}
            />
            <InfoRow
              label="Tiết kiệm"
              value={formatCurrency(calculateDiscountAmount())}
              valueClassName="text-green-600"
            />
          </div>
        </div>

        {/* Thông tin mở rộng */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <InfoRow label="Mã Order Item" value={item.orderItemId} />
            <InfoRow label="Mã biến thể" value={item.variantId} />
            {item.itemNotes && (
              <div>
                <span className="text-xs font-medium text-gray-500">
                  Ghi chú:
                </span>
                <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-2 rounded">
                  {item.itemNotes}
                </p>
              </div>
            )}
            {(item.color || item.specifications) && (
              <div className="grid grid-cols-2 gap-4">
                {item.color && <InfoRow label="Màu sắc" value={item.color} />}
                {item.specifications && (
                  <div className="col-span-2">
                    <span className="text-xs font-medium text-gray-500">
                      Thông số kỹ thuật:
                    </span>
                    <p className="text-sm text-gray-700 mt-1">
                      {item.specifications}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer với actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            {isExpanded ? "Ẩn chi tiết" : "Xem chi tiết"}
            <span
              className={`transform transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>

          {showActions && !readOnly && (
            <div className="flex space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(item)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center gap-1"
                >
                  ✏️ Sửa
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(item.orderItemId)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center gap-1"
                >
                  🗑️ Xóa
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-component cho từng dòng thông tin
const InfoRow = ({ label, value, valueClassName = "" }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-600">{label}:</span>
    <span className={`font-medium ${valueClassName}`}>{value}</span>
  </div>
);

export default OrderItemCard;
