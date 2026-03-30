import React, { useState, useEffect, useCallback } from "react";
import {
  FiCheck,
  FiTruck,
  FiList,
  FiTrash2,
  FiXCircle,
  FiLoader,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiArrowRight,
  FiExternalLink,
  FiActivity,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
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
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.includes('/admin/') ? '/evm/admin' : '/evm/staff';

  const [activeTab, setActiveTab] = useState("PENDING");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
  });

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
    <div className="min-h-screen bg-slate-50/50 -m-6 p-6 animate-in fade-in-0 duration-500 m-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Điều Phối Đơn Hàng B2B</h1>
          <p className="text-slate-500 mt-1">Quản lý và phê duyệt vận chuyển xe tới hệ thống đại lý.</p>
        </div>
      </div>

      {/* Thanh Tabs Hiện Đại */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <nav className="flex overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.status}
              onClick={() => setActiveTab(tab.status)}
              className={`flex-1 min-w-[150px] py-4 px-6 text-sm font-semibold transition-all relative ${activeTab === tab.status
                ? "text-blue-600 bg-blue-50/30"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
            >
              {tab.label}
              {activeTab === tab.status && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
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
          <div className="grid grid-cols-1 gap-6">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Basic Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100 rounded-xl text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <FiFileText size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Mã đơn hàng</p>
                          <p className="text-sm font-mono font-bold text-slate-700">{order.orderId}</p>
                        </div>
                      </div>
                      <StatusBadge status={order.orderStatus} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <FiUser className="text-slate-400" size={16} />
                        <div>
                          <p className="text-xs text-slate-500">Đại lý ủy quyền</p>
                          <button
                            onClick={() => navigate(`${basePath}/dealers/manage?dealerId=${order.dealerId}`)}
                            className="text-sm font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1 group/link"
                          >
                            {getDealerName(order.dealerId)}
                            <FiExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FiCalendar className="text-slate-400" size={16} />
                        <div>
                          <p className="text-xs text-slate-500">Ngày yêu cầu</p>
                          <p className="text-sm font-bold text-slate-900">{new Date(order.orderDate).toLocaleDateString("vi-VN", { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FiList size={14} />
                        Danh sách sản phẩm ({order.orderItems?.length || 0})
                      </p>
                      <div className="space-y-2">
                        {order.orderItems?.map((item) => (
                          <div key={item.orderItemId} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
                                {item.quantity}
                              </span>
                              <span className="font-medium text-slate-700">{getVariantDisplayName(item.variantId)}</span>
                            </div>
                            <span className="font-mono text-slate-500">
                              {new Intl.NumberFormat("vi-VN").format(item.unitPrice)} đ
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-between items-center text-blue-700 font-bold">
                        <span className="text-xs uppercase tracking-wider">Tổng giá trị đơn</span>
                        <span className="text-lg">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="bg-amber-50 text-amber-700 p-3 rounded-lg text-xs italic border border-amber-100/50">
                        <strong>Ghi chú:</strong> {order.notes}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="lg:w-48 flex lg:flex-col items-center justify-center gap-3 lg:border-l lg:border-slate-100 lg:pl-6">
                    {order.orderStatus === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleApprove(order.orderId)}
                          className="flex-1 lg:w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all active:scale-95"
                        >
                          <FiCheck /> Duyệt
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order.orderId)}
                          className="flex-1 lg:w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-amber-200 text-amber-600 rounded-xl font-bold text-sm hover:bg-amber-50 transition-all active:scale-95"
                        >
                          <FiXCircle /> Hủy bỏ
                        </button>
                      </>
                    )}
                    {order.orderStatus === "CONFIRMED" && (
                      <button
                        onClick={() => handleOpenShipModal(order)}
                        disabled={enrichingOrderId === order.orderId}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:bg-slate-300 disabled:shadow-none active:scale-95"
                      >
                        {enrichingOrderId === order.orderId ? (
                          <FiLoader className="animate-spin" />
                        ) : (
                          <FiTruck />
                        )}
                        {enrichingOrderId === order.orderId ? "Đang xử lý..." : "Xuất Kho Ngay"}
                      </button>
                    )}
                    {order.orderStatus === "CANCELLED" && (
                      <button
                        onClick={() => handleDeleteOrder(order.orderId)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl font-bold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95"
                      >
                        <FiTrash2 /> Xoá hồ sơ
                      </button>
                    )}
                    {(order.orderStatus === "IN_TRANSIT" || order.orderStatus === "DELIVERED") && (
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Vận chuyển</p>
                        <div className="w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-slate-50 text-slate-400">
                          <FiActivity size={20} />
                        </div>
                      </div>
                    )}
                  </div>
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
