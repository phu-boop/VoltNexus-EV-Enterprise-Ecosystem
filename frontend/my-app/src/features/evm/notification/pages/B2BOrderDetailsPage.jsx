// ví dụ file /src/pages/evm/B2BOrderDetailsPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import ResolveDisputeModal from "../components/ResolveDisputeModal";
import { useB2BOrderDetails } from "../hooks/useStaffNotifications";
import { getVariantDetailsByIds } from "../../catalog/services/vehicleCatalogService";
import {
  FiLoader,
  FiAlertTriangle,
  FiDollarSign,
  FiCalendar,
  FiBox,
} from "react-icons/fi";

// Hàm định dạng tiền tệ (ví dụ: 10000000 -> 10.000.000 ₫)
const formatCurrency = (amount) => {
  if (typeof amount !== "number") {
    amount = Number(amount) || 0;
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Hàm định dạng ngày (ví dụ: 2025-11-08T14:07:28.120005 -> 8/11/2025)
const formatDate = (isoString) => {
  if (!isoString) return "Không rõ";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("vi-VN");
  } catch (error) {
    return "Ngày không hợp lệ";
  }
};

const B2BOrderDetailsPage = () => {
  const { orderId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [variantMap, setVariantMap] = useState(new Map());

  const { data: order, isLoading, isError } = useB2BOrderDetails(orderId);

  // Fetch variant details when order loads
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

  const disputeReason = useMemo(() => {
    if (!order || !order.orderTrackings) return null;
    // Tìm tracking có status "ĐÃ BÁO CÁO SỰ CỐ"
    const disputeTracking = order.orderTrackings.find(
      (track) => track.status === "ĐÃ BÁO CÁO SỰ CỐ"
    );
    // Trích xuất "notes" (đây là lý do)
    return disputeTracking ? disputeTracking.notes : "Không tìm thấy lý do.";
  }, [order]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <FiLoader className="w-10 h-10 animate-spin text-blue-600" />
        <span className="ml-3 text-lg text-gray-700">Đang tải chi tiết...</span>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-lg">
        <FiAlertTriangle className="w-10 h-10 text-red-600" />
        <span className="mt-3 text-lg text-red-700">
          Lỗi! Không thể tải chi tiết đơn hàng.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* ===== CẬP NHẬT GIAO DIỆN ===== */}

      {/* Tiêu đề */}
      <h1 className="text-xl font-bold text-gray-800">Chi tiết đơn hàng</h1>
      <p className="text-sm text-gray-500 mb-4">Mã ĐH: {orderId}</p>

      {/* Thông tin cơ bản */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="text-xs font-semibold text-gray-500 flex items-center">
            <FiCalendar className="w-4 h-4 mr-1" />
            NGÀY ĐẶT
          </label>
          <p className="text-lg font-bold text-gray-900">
            {formatDate(order.orderDate)}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="text-xs font-semibold text-gray-500 flex items-center">
            <FiDollarSign className="w-4 h-4 mr-1" />
            TỔNG TIỀN
          </label>
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(order.totalAmount)}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="text-xs font-semibold text-gray-500">
            TRẠNG THÁI
          </label>
          <p>
            <span
              className={`font-semibold px-3 py-1 rounded-full text-sm ${
                order.orderStatus === "DISPUTED"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {order.orderStatus}
            </span>
          </p>
        </div>
      </div>

      {/* Chi tiết Items */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
          <FiBox className="w-5 h-5 mr-2" />
          Các sản phẩm
        </h2>
        <div className="space-y-2">
          {order.orderItems.map((item) => (
            <div
              key={item.orderItemId}
              className="p-3 bg-blue-50 rounded-md border border-blue-200"
            >
              <p className="font-semibold text-blue-900">
                {item.quantity} x {getVariantDisplayName(item.variantId)}
              </p>
              <p className="text-sm text-blue-700">
                Đơn giá: {formatCurrency(item.unitPrice)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Nút giải quyết (chỉ hiện khi có khiếu nại) */}
      {order.orderStatus === "DISPUTED" && (
        <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-900">
            Đơn hàng đang bị khiếu nại!
          </h3>
          <p className="text-yellow-800 mt-1 mb-4">
            <strong>Lý do:</strong> {disputeReason}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-semibold"
          >
            Giải quyết Khiếu nại
          </button>
        </div>
      )}

      {/* =============================== */}

      {/* Modal chỉ hiện khi isModalOpen = true */}
      {isModalOpen && (
        <ResolveDisputeModal
          orderId={orderId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default B2BOrderDetailsPage;
