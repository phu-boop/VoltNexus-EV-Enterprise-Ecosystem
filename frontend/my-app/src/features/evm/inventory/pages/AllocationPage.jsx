import React, { useState, useEffect, useCallback } from "react";
import {
  FiCheck,
  FiTruck,
  FiList,
  FiTrash2,
  FiXCircle,
  FiLoader,
} from "react-icons/fi";
import Swal from "sweetalert2";
import {
  getB2BOrders,
  approveB2BOrder,
  cancelOrderByStaff,
  deleteOrder,
} from "../services/evmSalesService"; // Service của EVM/Admin
import { getAllDealersList } from "../../../dealer/ordervariants/services/dealerSalesService"; // Service để lấy tên dealer
import { getVariantDetailsByIds } from "../../catalog/services/vehicleCatalogService";
import ShipmentModal from "../components/ShipmentModal"; // Modal nhập VIN khi giao hàng

// (Bạn có thể tách StatusBadge thành component riêng nếu muốn)
const StatusBadge = ({ status }) => {
  let colorClasses = "bg-gray-100 text-gray-800";
  let text = status; // Mặc định hiển thị text gốc

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
    default:
      break; // Giữ màu xám mặc định
  }
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-block ${colorClasses}`}
    >
      {text}
    </span>
  );
};

const AllocationPage = () => {
  const [activeTab, setActiveTab] = useState("PENDING");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
  }); // Thêm state phân trang

  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [orderToShip, setOrderToShip] = useState(null);

  const [dealerMap, setDealerMap] = useState(new Map());
  const [isLoadingDealers, setIsLoadingDealers] = useState(false);
  const [variantMap, setVariantMap] = useState(new Map());

  const [enrichingOrderId, setEnrichingOrderId] = useState(null);

  // --- Hàm tải danh sách đại lý ---
  const fetchDealers = useCallback(async () => {
    setIsLoadingDealers(true);
    try {
      const response = await getAllDealersList();
      const dealers = response.data.data || [];
      const map = new Map();
      dealers.forEach((dealer) => {
        map.set(
          dealer.dealerId,
          dealer.dealerName || `Đại lý ${dealer.dealerId.substring(0, 6)}`
        ); // Thêm tên fallback
      });
      setDealerMap(map);
    } catch (error) {
      console.error("Failed to fetch dealers", error);
      setError("Không thể tải danh sách đại lý.");
    } finally {
      setIsLoadingDealers(false);
    }
  }, []);

  // --- Hàm tải danh sách đơn hàng ---
  const fetchOrders = useCallback(
    async (status, page = 0) => {
      setIsLoading(true);
      setError(null); // Reset lỗi mỗi khi fetch
      try {
        const params = { status: status, page: page, size: pagination.size };
        const res = await getB2BOrders(params);
        setOrders(res.data.data.content || []);
        setPagination((prev) => ({
          ...prev,
          page: res.data.data.number,
          totalPages: res.data.data.totalPages,
        }));
      } catch (error) {
        console.error("Failed to fetch orders", error);
        setError("Không thể tải danh sách đơn hàng.");
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.size]
  ); // Chỉ phụ thuộc size để không fetch lại khi page thay đổi từ pagination controls

  // --- useEffect ---
  useEffect(() => {
    fetchDealers(); // Tải dealers 1 lần
  }, [fetchDealers]);

  useEffect(() => {
    fetchOrders(activeTab, 0); // Fetch orders khi tab thay đổi, reset về trang 0
  }, [activeTab, fetchOrders]); // fetchOrders giờ ổn định hơn

  // Fetch variant details for list display
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

  // --- Các hàm xử lý hành động ---
  const handleApprove = async (orderId) => {
    // Thay thế window.confirm
    const result = await Swal.fire({
      title: "Duyệt đơn hàng?",
      text: "Gửi yêu cầu duyệt đơn hàng này và phân bổ kho?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#28a745", // Màu xanh lá
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Đúng, duyệt ngay!",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await approveB2BOrder(orderId);
        // Thay thế alert
        Swal.fire(
          "Đã gửi!",
          "Yêu cầu duyệt đã được gửi. Đang tải lại danh sách...",
          "success"
        );
        fetchOrders(activeTab, pagination.page);
      } catch (error) {
        // Thay thế alert
        Swal.fire(
          "Lỗi!",
          `Lỗi gửi yêu cầu: ${error.response?.data?.message || error.message}`,
          "error"
        );
      }
    }
  };

  const handleCancelOrder = async (orderId) => {
    // Thay thế window.confirm
    const result = await Swal.fire({
      title: "Hủy đơn hàng?",
      text: "Bạn chắc chắn muốn gửi yêu cầu hủy đơn hàng này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33", // Màu đỏ
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Đúng, hủy đơn!",
      cancelButtonText: "Không",
    });

    if (result.isConfirmed) {
      try {
        await cancelOrderByStaff(orderId);
        // Thay thế alert
        Swal.fire(
          "Đã gửi!",
          "Yêu cầu hủy đơn đã được gửi. Đang tải lại...",
          "success"
        );
        fetchOrders(activeTab, pagination.page);
      } catch (error) {
        // Thay thế alert
        Swal.fire(
          "Lỗi!",
          `Lỗi hủy đơn: ${error.response?.data?.message || error.message}`,
          "error"
        );
      }
    }
  };

  const handleDeleteOrder = async (orderId) => {
    // Thay thế window.confirm
    const result = await Swal.fire({
      title: "Xóa vĩnh viễn?",
      text: "Đơn hàng đã hủy này sẽ bị xóa vĩnh viễn! Không thể hoàn tác.",
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa ngay!",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteOrder(orderId);
        // Thay thế alert
        Swal.fire("Đã xóa!", "Xóa đơn hàng thành công.", "success");
        fetchOrders(activeTab, pagination.page);
      } catch (error) {
        // Thay thế alert
        Swal.fire(
          "Lỗi!",
          `Lỗi xóa đơn: ${error.response?.data?.message || error.message}`,
          "error"
        );
      }
    }
  };

  const handleOpenShipModal = async (orderToShip) => {
    // 1. Đặt trạng thái loading cho nút này
    setEnrichingOrderId(orderToShip.orderId);
    setError(null);

    try {
      // 2. Lấy danh sách ID từ đơn hàng
      const variantIds = orderToShip.orderItems.map((item) => item.variantId);

      // 3. Gọi API đến vehicle-catalog-service để lấy chi tiết
      const response = await getVariantDetailsByIds(variantIds);
      const vehicleDetailsMap = new Map(
        response.data.data.map((detail) => [detail.variantId, detail])
      );

      // 4. "LÀM GIÀU" (Enrich) các order items
      const enrichedItems = orderToShip.orderItems.map((item) => {
        const details = vehicleDetailsMap.get(item.variantId);
        return {
          ...item, // Giữ thông tin cũ (variantId, quantity, unitPrice...)
          // Thêm thông tin mới
          versionName: details?.versionName || "N/A",
          color: details?.color || "N/A",
          skuCode: details?.skuCode || "N/A",
        };
      });

      // 5. Tạo đơn hàng đã làm giàu
      const enrichedOrder = {
        ...orderToShip,
        orderItems: enrichedItems,
      };

      // 6. Mở modal với đơn hàng mới
      setOrderToShip(enrichedOrder);
      setIsShipModalOpen(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết xe:", err);
      const errorMsg =
        err.response?.data?.message ||
        "Không thể lấy chi tiết xe để giao hàng.";
      setError(errorMsg); // Hiển thị lỗi chung
      Swal.fire("Lỗi!", errorMsg, "error"); // Báo lỗi cho user
    } finally {
      // 7. Tắt trạng thái loading
      setEnrichingOrderId(null);
    }
  };

  const handleCloseShipModal = (didShip) => {
    setIsShipModalOpen(false);
    setOrderToShip(null);
    if (didShip) {
      fetchOrders(activeTab, pagination.page);
    }
  };

  const getDealerName = (dealerId) => {
    if (isLoadingDealers) return "...";
    return dealerMap.get(dealerId) || `ID: ${dealerId.substring(0, 8)}...`;
  };

  // Hàm đổi trang (cho component Pagination nếu có)
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchOrders(activeTab, newPage);
    }
  };

  const tabs = [
    { status: "PENDING", label: "Chờ Xác Nhận" },
    { status: "CONFIRMED", label: "Chờ Xuất Kho" },
    { status: "IN_TRANSIT", label: "Đang Vận Chuyển" },
    { status: "DELIVERED", label: "Đã Giao Hàng" },
    { status: "CANCELLED", label: "Đã Hủy" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen animate-in fade-in-0 duration-500">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Điều Phối Đơn Hàng B2B
      </h1>

      {/* Thanh Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex flex-wrap space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.status}
              onClick={() => setActiveTab(tab.status)}
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

      {/* Bảng danh sách đơn hàng */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {isLoading ? (
          <p className="text-gray-500">Đang tải đơn hàng...</p>
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
                    Đại lý: {getDealerName(order.dealerId)}
                  </p>
                  <p className="text-sm text-gray-600">
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

                  {order.orderStatus === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleApprove(order.orderId)}
                        className="flex items-center justify-center w-full md:w-32 px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition duration-150"
                      >
                        <FiCheck className="mr-1" /> Duyệt
                      </button>
                      <button
                        onClick={() => handleCancelOrder(order.orderId)}
                        className="flex items-center justify-center w-full md:w-32 px-3 py-1.5 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition duration-150"
                      >
                        <FiXCircle className="mr-1" /> Hủy
                      </button>
                    </>
                  )}
                  {order.orderStatus === "CONFIRMED" && (
                    <button
                      onClick={() => handleOpenShipModal(order)}
                      // (MỚI) Thêm logic disabled
                      disabled={enrichingOrderId === order.orderId}
                      className="flex items-center justify-center w-full md:w-32 px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition duration-150 disabled:bg-gray-400 disabled:cursor-wait"
                    >
                      {/* (MỚI) Thêm icon loading */}
                      {enrichingOrderId === order.orderId ? (
                        <FiLoader className="animate-spin mr-1" />
                      ) : (
                        <FiTruck className="mr-1" />
                      )}
                      {enrichingOrderId === order.orderId
                        ? "Đang tải..."
                        : "Giao hàng"}
                    </button>
                  )}
                  {order.orderStatus === "CANCELLED" && (
                    <button
                      onClick={() => handleDeleteOrder(order.orderId)}
                      className="flex items-center justify-center w-full md:w-32 px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition duration-150"
                      title="Xóa đơn hàng vĩnh viễn"
                    >
                      <FiTrash2 className="mr-1" /> Xóa
                    </button>
                  )}
                  {/* Có thể thêm nút xem chi tiết ở đây nếu cần */}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- Component Phân Trang --- */}
        {/* Bạn có thể tạo component Pagination riêng và truyền props vào */}
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

      {/* Modal nhập VIN */}
      {isShipModalOpen && (
        <ShipmentModal
          isOpen={isShipModalOpen}
          onClose={handleCloseShipModal}
          order={orderToShip} // Truyền cả object order vào modal
        />
      )}
    </div>
  );
};

export default AllocationPage;
