import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import StatusBadge from "./StatusBadge.jsx";
import { getVariantDetailsByIds } from "../services/vehicleCatalogService";

const OrderDetailModal = ({ order, onClose }) => {
  const [variantMap, setVariantMap] = useState(new Map());

  useEffect(() => {
    if (order?.orderItems?.length > 0) {
      const variantIds = order.orderItems.map((item) => item.variantId);
      getVariantDetailsByIds(variantIds)
        .then((response) => {
          const map = new Map(
            response.data.data.map((detail) => [detail.variantId, detail])
          );
          setVariantMap(map);
        })
        .catch((err) => console.error("Failed to fetch variant details:", err));
    }
  }, [order]);

  const getVariantDisplayName = (variantId) => {
    const detail = variantMap.get(variantId);
    if (detail) {
      return detail.skuCode || detail.versionName || `Variant #${variantId}`;
    }
    return `Variant #${variantId}`;
  };

  if (!order) return null;

  return (
    // Lớp phủ (Backdrop)
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-60 z-40 flex justify-center items-center p-4 transition-opacity duration-300">
      {/* Nội dung Modal */}
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full z-50 p-6 relative animate-slide-up">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX size={24} />
        </button>

        {/* Tiêu đề Modal */}
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          Chi tiết Đơn hàng
        </h2>
        <p className="text-sm text-gray-500 mb-4">Mã ĐH: {order.orderId}</p>

        {/* Thân Modal */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Ngày đặt:</p>
              <p className="font-medium">
                {new Date(order.orderDate).toLocaleString("vi-VN")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Trạng thái:</p>
              <StatusBadge status={order.orderStatus} />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tổng tiền:</p>
            <p className="text-2xl font-bold text-blue-700">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(order.totalAmount)}
            </p>
          </div>

          {/* Danh sách sản phẩm */}
          <div>
            <h3 className="font-semibold pt-3 border-t mt-3 mb-2">
              Các sản phẩm
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-700 pl-4 space-y-1">
              {order.orderItems?.map((item) => (
                <li key={item.orderItemId}>
                  <span className="font-medium">{item.quantity} x</span>{" "}
                  {getVariantDisplayName(item.variantId)} - Đơn giá:{" "}
                  <span className="font-medium">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item.unitPrice)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Lịch sử theo dõi (Tracking) */}
          {order.orderTrackings && order.orderTrackings.length > 0 && (
            <div>
              <h3 className="font-semibold pt-3 border-t mt-3 mb-2">
                Lịch sử theo dõi
              </h3>
              <div className="space-y-3 text-sm">
                {order.orderTrackings
                  .sort(
                    (a, b) => new Date(b.updateDate) - new Date(a.updateDate)
                  ) // Sắp xếp mới nhất lên đầu
                  .map((track) => (
                    <div
                      key={track.orderTrackingId}
                      className="flex flex-col pb-2 border-b border-gray-100"
                    >
                      <span className="font-medium text-gray-800">
                        {track.status}
                      </span>
                      <span className="text-gray-600">{track.notes}</span>
                      <span className="text-gray-400 text-xs mt-1">
                        {new Date(track.updateDate).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Chân Modal */}
        <div className="text-right mt-6 border-t pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
