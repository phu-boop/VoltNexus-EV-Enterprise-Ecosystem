import React, { useState, useEffect, useCallback } from "react";

import {
  FiCheckCircle,
  FiPackage,
  FiTruck,
  FiList,
  FiXCircle,
  FiAlertTriangle,
  FiEye,
  FiX,
} from "react-icons/fi"; // Thêm FiXCircle
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import {
  getMyB2BOrders,
  confirmDelivery,
  cancelOrderByDealer, // Import hàm hủy
  reportOrderIssue, // Import hàm báo cáo
} from "../services/dealerSalesService";
import { getVariantDetailsByIds } from "../services/vehicleCatalogService";

import OrderDetailModal from "../components/OrderDetailModal.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import LoadingTruck from "../../../../components/common/loading/LoadingTruck.jsx";

const DealerOrdersPage = () => {
  const [activeTab, setActiveTab] = useState("PENDING"); // Mặc định hiển thị tab "Chờ duyệt"
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [variantMap, setVariantMap] = useState(new Map());
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // --- Hàm tải danh sách đơn hàng ---
  const fetchOrders = useCallback(
    async (status, page = 0) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = { status: status, page: page, size: pagination.size };
        const response = await getMyB2BOrders(params); // API của Dealer
        setOrders(response.data.data.content || []);
        setPagination((prev) => ({
          ...prev,
          page: response.data.data.number,
          totalPages: response.data.data.totalPages,
        }));
      } catch (err) {
        console.error("Failed to fetch orders", err);
        setError("Không thể tải danh sách đơn hàng.");
        toast.error("Không thể tải danh sách đơn hàng.");
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.size]
  );

  // Tải lại dữ liệu khi đổi tab hoặc page thay đổi (từ pagination controls)
  useEffect(() => {
    fetchOrders(activeTab, pagination.page);
  }, [activeTab, fetchOrders, pagination.page]); // Thêm pagination.page dependency

  // Fetch variant details when orders change
  useEffect(() => {
    if (orders.length > 0) {
      const allVariantIds = [...new Set(
        orders.flatMap((order) =>
          (order.orderItems || []).map((item) => item.variantId)
        )
      )];
      if (allVariantIds.length > 0) {
        getVariantDetailsByIds(allVariantIds)
          .then((response) => {
            const map = new Map(
              response.data.data.map((detail) => [detail.variantId, detail])
            );
            setVariantMap(map);
          })
          .catch((err) => console.error("Failed to fetch variant details:", err));
      }
    }
  }, [orders]);

  const getVariantDisplayName = (variantId) => {
    const detail = variantMap.get(variantId);
    if (detail) {
      return detail.skuCode || detail.versionName || `Variant #${variantId}`;
    }
    return `Variant #${variantId}`;
  };

  // Hàm đổi trang (cho component Pagination)
  const handlePageChange = (newPage) => {
    if (
      newPage >= 0 &&
      newPage < pagination.totalPages &&
      newPage !== pagination.page
    ) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      // useEffect sẽ tự động gọi fetchOrders khi page thay đổi
    }
  };

  // Hàm đổi tab (reset về trang 0)
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setPagination((prev) => ({ ...prev, page: 0 })); // Reset page khi đổi tab
  };

  // --- HÀM XỬ LÝ XÁC NHẬN NHẬN HÀNG ---
  const handleConfirmDelivery = async (orderId) => {
    const result = await Swal.fire({
      title: "Xác nhận nhận hàng?",
      text: "Bạn chắc chắn đã kiểm tra và nhận đủ hàng?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Đúng, tôi đã nhận!",
      cancelButtonText: "Chưa",
    });

    if (result.isConfirmed) {
      try {
        await confirmDelivery(orderId);
        toast.success("Đã xác nhận nhận hàng thành công!");
        fetchOrders(activeTab, pagination.page); // Tải lại trang hiện tại
      } catch (err) {
        Swal.fire(
          "Lỗi!",
          err.response?.data?.message || "Xác nhận thất bại.",
          "error"
        );
      }
    }
  };

  // --- BÁO CÁO SỰ CỐ (EXCEPTION PATH) ---
  const handleReportIssue = async (orderId) => {
    const { value: formValues } = await Swal.fire({
      title: "Báo cáo sự cố",
      html: `
        <style>
          .swal-label { 
            display: block; 
            text-align: left; 
            margin-top: 1rem; 
            margin-bottom: 0.25rem; 
            font-weight: 500;
          }
          .swal-input, .swal-textarea {
            width: 95%; /* Điều chỉnh để vừa vặn */
            padding: 0.5rem;
            margin: 0 auto;
          }
        </style>
        <div>
          <label for="swal-reason" class="swal-label">Lý do (bắt buộc)</label>
          <input id="swal-reason" class="swal2-input swal-input" placeholder="Ví dụ: Giao thiếu hàng, Xe bị trầy xước...">
          
          <label for="swal-description" class="swal-label">Mô tả chi tiết</label>
          <textarea id="swal-description" class="swal2-textarea swal-textarea" placeholder="Mô tả rõ hơn về sự cố (nếu có)..."></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#f8981d",
      confirmButtonText: "Gửi Báo Cáo",
      cancelButtonText: "Hủy",
      focusConfirm: false,
      // Dùng preConfirm để lấy và xác thực dữ liệu
      preConfirm: () => {
        const reason = document.getElementById("swal-reason").value;
        const description = document.getElementById("swal-description").value;
        if (!reason) {
          Swal.showValidationMessage(`Bạn cần nhập lý do để báo cáo!`);
          return false;
        }
        return { reason, description }; // Trả về object
      },
    });

    // Nếu người dùng submit và preConfirm thành công
    if (formValues) {
      try {
        // Gửi object { reason, description } đến service
        await reportOrderIssue(orderId, formValues);
        toast.success("Đã gửi báo cáo sự cố thành công.");
        fetchOrders(activeTab, pagination.page);
      } catch (err) {
        toast.error(err.response?.data?.message || "Gửi báo cáo thất bại.");
      }
    }
  };

  // --- HÀM XỬ LÝ HỦY ĐƠN (Dealer) ---
  const handleCancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: "Hủy đơn hàng?",
      text: "Bạn chắc chắn muốn hủy đơn đặt hàng này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Đúng, hủy đơn!",
      cancelButtonText: "Không",
    });

    if (result.isConfirmed) {
      try {
        await cancelOrderByDealer(orderId); // Gọi API hủy của dealer
        toast.success("Đơn hàng của bạn đã được hủy.");
        fetchOrders(activeTab, pagination.page); // Tải lại
      } catch (err) {
        toast.error(err.response?.data?.message || "Hủy đơn thất bại.");
      }
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const tabs = [
    { status: "PENDING", label: "Chờ Hãng duyệt" },
    { status: "CONFIRMED", label: "Đã duyệt" },
    { status: "IN_TRANSIT", label: "Đang giao" },
    { status: "DELIVERED", label: "Đã nhận" },
    { status: "CANCELLED", label: "Đã hủy" },
    { status: "DISPUTED", label: "Đang khiếu nại" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Đơn Hàng Của Tôi
      </h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex flex-wrap space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.status}
              onClick={() => handleTabChange(tab.status)} // Dùng handleTabChange
              className={`py-3 px-4 font-medium text-sm rounded-t-lg ${
                activeTab === tab.status
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md min-h-[500px] relative">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {isLoading ? (
          activeTab === "IN_TRANSIT" ? (
            <div className="w-full h-96 flex justify-center items-center">
              <LoadingTruck />
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">
              Đang tải dữ liệu...
            </p>
          )
        ) : orders.length === 0 ? (
          <p className="text-gray-500">Không có đơn hàng nào trong mục này.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="border border-gray-200 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start gap-4"
              >
                {/* Thông tin đơn */}
                <div className="flex-1">
                  <p className="text-sm text-gray-500">
                    Mã ĐH: {order.orderId}
                  </p>
                  <p className="font-semibold">
                    Ngày đặt:{" "}
                    {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                  </p>
                  <p className="font-bold text-lg text-blue-700 mt-1">
                    Tổng:{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.totalAmount)}
                  </p>
                  {order.orderItems && order.orderItems.length > 0 && (
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-2 pl-4">
                      {order.orderItems.map((item) => (
                        <li key={item.orderItemId}>
                          {item.quantity} x {getVariantDisplayName(item.variantId)} - Đơn
                          giá:{" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item.unitPrice)}
                        </li>
                      ))}
                    </ul>
                  )}
                  {order.notes && (
                    <p className="text-sm text-gray-500 mt-2 italic">
                      Ghi chú: {order.notes}
                    </p>
                  )}
                </div>

                {/* Trạng thái và Hành động */}
                <div className="shrink-0 flex flex-col items-end space-y-2 w-full md:w-auto">
                  <StatusBadge status={order.orderStatus} />

                  {/* Nút Xem Chi Tiết (Luôn hiển thị) */}
                  <button
                    onClick={() => handleViewDetails(order)}
                    className="flex items-center justify-center w-full md:w-auto px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition duration-150"
                  >
                    <FiEye className="mr-1" /> Xem Chi Tiết
                  </button>

                  {/* Nút Hủy cho PENDING */}
                  {order.orderStatus === "PENDING" && (
                    <button
                      onClick={() => handleCancelOrder(order.orderId)}
                      className="flex items-center justify-center w-full md:w-auto px-3 py-1.5 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition duration-150"
                      title="Hủy đơn hàng này"
                    >
                      <FiXCircle className="mr-1" /> Hủy Đơn
                    </button>
                  )}

                  {/* Nút Xác Nhận cho IN_TRANSIT */}
                  {/* Hai nút cho IN_TRANSIT */}
                  {order.orderStatus === "IN_TRANSIT" && (
                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                      {/* Nút Báo Cáo (Exception) */}
                      <button
                        onClick={() => handleReportIssue(order.orderId)}
                        className="flex items-center justify-center w-full md:w-auto px-3 py-1.5 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition duration-150"
                      >
                        <FiAlertTriangle className="mr-1" /> Báo Cáo Sự Cố
                      </button>

                      {/* Nút Xác Nhận (Happy Path) */}
                      <button
                        onClick={() => handleConfirmDelivery(order.orderId)}
                        className="flex items-center justify-center w-full md:w-auto px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition duration-150 shadow"
                      >
                        <FiCheckCircle className="mr-1" /> Xác Nhận Đã Nhận
                      </button>
                    </div>
                  )}
                  {/* Không có nút Xóa ở đây */}
                  {/* Có thể thêm nút Xem chi tiết */}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- Component Phân Trang --- */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 0}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Trước
            </button>
            <span>
              Trang {pagination.page + 1} / {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages - 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>
      {isModalOpen && (
        <OrderDetailModal order={selectedOrder} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default DealerOrdersPage;
