import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FiCheckCircle,
  FiPackage,
  FiTruck,
  FiList,
  FiXCircle,
  FiAlertTriangle,
  FiEye,
  FiX,
  FiCalendar,
  FiDollarSign,
  FiArrowRight,
  FiPlus,
  FiSearch,
  FiClock
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import {
  getMyB2BOrders,
  confirmDelivery,
  cancelOrderByDealer,
  reportOrderIssue,
} from "../services/dealerSalesService";
import { getVariantDetailsByIds } from "../services/vehicleCatalogService";

import OrderDetailModal from "../components/OrderDetailModal.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import LoadingTruck from "../../../../components/common/loading/LoadingTruck.jsx";
import DealerStatsGrid from "../components/DealerStatsGrid";

const DealerOrdersPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("PENDING");
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

  const fetchOrders = useCallback(
    async (status, page = 0) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = { status: status, page: page, size: pagination.size };
        const response = await getMyB2BOrders(params);
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

  useEffect(() => {
    fetchOrders(activeTab, pagination.page);
  }, [activeTab, fetchOrders, pagination.page]);

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
      return detail.versionName || detail.skuCode || `Variant #${variantId}`;
    }
    return `Variant #${variantId}`;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages && newPage !== pagination.page) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleConfirmDelivery = async (orderId) => {
    const result = await Swal.fire({
      title: "Xác nhận nhận hàng?",
      text: "Bạn chắc chắn đã kiểm tra và nhận đủ hàng?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Đúng, tôi đã nhận!",
      cancelButtonText: "Quay lại",
      background: '#fff',
      customClass: {
        title: 'text-2xl font-bold text-slate-900',
        popup: 'rounded-3xl shadow-2xl border-none'
      }
    });

    if (result.isConfirmed) {
      try {
        await confirmDelivery(orderId);
        toast.success("Đã xác nhận nhận hàng thành công!");
        fetchOrders(activeTab, pagination.page);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: err.response?.data?.message || "Xác nhận thất bại.",
          confirmButtonColor: "#0f172a"
        });
      }
    }
  };

  const handleReportIssue = async (orderId) => {
    const { value: formValues } = await Swal.fire({
      title: "Báo cáo sự cố",
      html: `
        <div class="text-left space-y-4 p-2">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 pl-1">Lý do (bắt buộc)</label>
            <input id="swal-reason" class="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-orange-500 transition-all font-medium" placeholder="VD: Giao thiếu hàng, Trầy xước...">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 pl-1">Mô tả chi tiết</label>
            <textarea id="swal-description" class="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-orange-500 transition-all resize-none" placeholder="Mô tả cụ thể trạng thái thực tế..."></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      confirmButtonText: "Gửi Báo Cáo",
      cancelButtonText: "Hủy",
      background: '#fff',
      customClass: {
        title: 'text-2xl font-bold text-slate-900',
        popup: 'rounded-[32px] shadow-2xl border-none'
      },
      preConfirm: () => {
        const reason = document.getElementById("swal-reason").value;
        const description = document.getElementById("swal-description").value;
        if (!reason) {
          Swal.showValidationMessage(`Bạn cần nhập lý do để báo cáo!`);
          return false;
        }
        return { reason, description };
      },
    });

    if (formValues) {
      try {
        await reportOrderIssue(orderId, formValues);
        toast.success("Đã gửi báo cáo sự cố thành công.");
        fetchOrders(activeTab, pagination.page);
      } catch (err) {
        toast.error(err.response?.data?.message || "Gửi báo cáo thất bại.");
      }
    }
  };

  const handleCancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: "Hủy đơn hàng?",
      text: "Bạn chắc chắn muốn hủy đơn đặt hàng này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f43f5e",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Đúng, hủy đơn!",
      cancelButtonText: "Quay lại",
      background: '#fff',
      customClass: {
        title: 'text-2xl font-bold text-slate-900',
        popup: 'rounded-3xl shadow-2xl border-none'
      }
    });

    if (result.isConfirmed) {
      try {
        await cancelOrderByDealer(orderId);
        toast.success("Đơn hàng của bạn đã được hủy.");
        fetchOrders(activeTab, pagination.page);
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
    { status: "PENDING", label: "Chờ duyệt", icon: FiClock },
    { status: "CONFIRMED", label: "Đã duyệt", icon: FiCheckCircle },
    { status: "IN_TRANSIT", label: "Đang giao", icon: FiTruck },
    { status: "DELIVERED", label: "Đã nhận", icon: FiPackage },
    { status: "CANCELLED", label: "Đã hủy", icon: FiXCircle },
    { status: "DISPUTED", label: "Khiếu nại", icon: FiAlertTriangle },
  ];

  // Tính toán stats cho orders
  const stats = useMemo(() => {
    return {
      totalUnits: orders.length, // Tạm thời, thực tế cần tổng số xe
      lowStock: activeTab === "PENDING" ? orders.length : 0,
      inTransit: activeTab === "IN_TRANSIT" ? orders.length : 0,
      deliveredThisMonth: activeTab === "DELIVERED" ? orders.length : 0
    };
  }, [orders, activeTab]);

  return (
    <div className="p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
              <FiList size={28} />
            </div>
            Đơn Hàng Của Tôi
          </h1>
          <p className="text-slate-500 font-medium font-inter">Theo dõi trạng thái và quản lý lịch sử đặt hàng B2B</p>
        </div>
        <button
          onClick={() => navigate("./new")}
          className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 group"
        >
          <FiPlus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Tạo đơn hàng mới
        </button>
      </div>

      {/* Stats Grid */}
      <DealerStatsGrid stats={stats} />

      {/* Tabs Layout */}
      <div className="mb-8 overflow-x-auto no-scrollbar">
        <div className="bg-white p-1.5 rounded-3xl shadow-sm border border-slate-100 inline-flex gap-1 min-w-full md:min-w-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.status}
                onClick={() => handleTabChange(tab.status)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all duration-500 whitespace-nowrap ${activeTab === tab.status
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative min-h-[500px]">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 font-bold animate-in bounce-in duration-500">
            <FiAlertTriangle />
            {error}
          </div>
        )}

        {isLoading ? (
          activeTab === "IN_TRANSIT" ? (
            <div className="w-full h-96 flex flex-col justify-center items-center gap-6">
              <LoadingTruck />
              <p className="font-black text-slate-400 animate-pulse uppercase tracking-widest text-xs">Đang truy vấn hành trình đơn hàng...</p>
            </div>
          ) : (
            <div className="w-full h-96 flex flex-col justify-center items-center gap-4 text-slate-300">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="font-bold text-sm tracking-tighter">Đang tải danh sách...</p>
            </div>
          )
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center py-32 text-slate-300 animate-in zoom-in-95 duration-500">
            <div className="p-8 bg-slate-50 rounded-full mb-6">
              <FiPackage size={64} className="opacity-20" />
            </div>
            <p className="text-xl font-black text-slate-900 tracking-tight mb-2">Chưa có đơn hàng nào</p>
            <p className="text-sm font-medium italic mb-8">Danh sách đang trống trong mục này.</p>
            <button
              onClick={() => navigate("./new")}
              className="px-8 py-3 bg-indigo-50 text-indigo-600 font-black rounded-2xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
            >
              Tạo đơn đầu tiên ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-6 duration-700">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white p-8 rounded-[38px] shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl hover:border-indigo-100 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-bl-[100px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] bg-slate-50 px-2.5 py-1 rounded-lg"># {order.orderId}</span>
                        <StatusBadge status={order.orderStatus} />
                      </div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <FiCalendar className="text-slate-400" />
                        {new Date(order.orderDate).toLocaleDateString("vi-VN", { day: '2-digit', month: 'long', year: 'numeric' })}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 mb-1">Tổng giá trị</p>
                      <p className="text-2xl font-black text-indigo-700 tracking-tighter">
                        {new Intl.NumberFormat("vi-VN").format(order.totalAmount)}
                        <span className="text-sm ml-1">₫</span>
                      </p>
                    </div>
                  </div>

                  {order.orderItems && order.orderItems.length > 0 && (
                    <div className="space-y-3 mb-8">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Danh sách sản phẩm ({order.orderItems.length})</p>
                      {order.orderItems.map((item) => (
                        <div key={item.orderItemId} className="flex justify-between items-center bg-slate-50/50 p-3 rounded-2xl border border-transparent hover:border-indigo-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 font-black text-xs">
                              {item.quantity}
                            </div>
                            <span className="text-sm font-bold text-slate-700 truncate max-w-[180px] md:max-w-[250px]">
                              {getVariantDisplayName(item.variantId)}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-400 italic">
                            @{new Intl.NumberFormat("vi-VN").format(item.unitPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {order.notes && (
                    <div className="bg-amber-50/50 border border-amber-100/50 p-4 rounded-2xl mb-6">
                      <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1 opacity-60">Ghi chú đại lý</p>
                      <p className="text-xs text-amber-700 italic font-medium leading-relaxed">"{order.notes}"</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50 relative z-10 lg:flex-nowrap">
                  <button
                    onClick={() => handleViewDetails(order)}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl text-sm hover:bg-slate-100 transition-all active:scale-95"
                  >
                    <FiEye /> Chi Tiết
                  </button>

                  {order.orderStatus === "PENDING" && (
                    <button
                      onClick={() => handleCancelOrder(order.orderId)}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-600 font-bold rounded-2xl text-sm hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm shadow-rose-100"
                    >
                      <FiXCircle size={18} /> Hủy Đơn
                    </button>
                  )}

                  {order.orderStatus === "IN_TRANSIT" && (
                    <>
                      <button
                        onClick={() => handleReportIssue(order.orderId)}
                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-orange-50 text-orange-600 font-bold rounded-2xl text-sm hover:bg-orange-500 hover:text-white transition-all active:scale-95"
                      >
                        <FiAlertTriangle size={18} /> Sự Cố
                      </button>

                      <button
                        onClick={() => handleConfirmDelivery(order.orderId)}
                        className="flex-[2] flex items-center justify-center gap-2 py-4 bg-emerald-600 text-white font-bold rounded-2xl text-sm hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95"
                      >
                        <FiCheckCircle size={18} /> Đã Nhận Hàng
                      </button>
                    </>
                  )}

                  {order.orderStatus === "DELIVERED" && (
                    <button
                      onClick={() => navigate("./new", { state: { reorderOrder: order } })}
                      className="flex-1 flex items-center justify-center gap-2 py-4 bg-indigo-50 text-indigo-600 font-bold rounded-2xl text-sm hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                    >
                      <FiArrowRight /> Tái Đặt Hàng
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- Component Phân Trang UI Premium --- */}
        {pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-6">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 0}
              className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <FiX className="rotate-90" />
            </button>
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm text-sm font-black text-slate-900">
              <span className="text-indigo-600">{pagination.page + 1}</span>
              <span className="text-slate-300 mx-2">/</span>
              <span>{pagination.totalPages}</span>
            </div>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages - 1}
              className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <FiArrowRight />
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <OrderDetailModal order={selectedOrder} onClose={handleCloseModal} />
      )}

      <div className="h-20"></div>
    </div>
  );
};

export default DealerOrdersPage;
