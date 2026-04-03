import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FiEye,
  FiSearch,
  FiFilter,
  FiLoader,
  FiCalendar,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
  FiSettings,
  FiExternalLink
} from "react-icons/fi";
import { getB2BOrders } from "../services/evmSalesService";
import { getAllDealersList } from "../../../dealer/ordervariants/services/dealerSalesService";
import { getVariantDetailsByIds } from "../../catalog/services/vehicleCatalogService";
import B2BOrderDetailsModal from "../components/B2BOrderDetailsModal";

// --- Custom Status Badge ---
const StatusBadge = ({ status }) => {
  const configs = {
    PENDING: { color: "amber", text: "Chờ duyệt", icon: FiClock },
    CONFIRMED: { color: "blue", text: "Chờ xuất kho", icon: FiCheckCircle },
    IN_TRANSIT: { color: "cyan", text: "Đang giao", icon: FiTrendingUp },
    DELIVERED: { color: "green", text: "Đã giao", icon: FiCheckCircle },
    CANCELLED: { color: "red", text: "Đã hủy", icon: FiXCircle },
  };

  const config = configs[status] || { color: "slate", text: status, icon: FiSettings };
  const { color, text, icon: Icon } = config;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-${color}-50 text-${color}-700 border border-${color}-100 shadow-sm`}>
      <Icon size={12} className={`text-${color}-500`} />
      {text}
    </span>
  );
};

const DistributionHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    status: "",
    dealerId: "",
    startDate: "",
    endDate: "",
  });

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });

  const [dealerMap, setDealerMap] = useState(new Map());
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // --- Summary Stats Calculation ---
  const statsSummary = useMemo(() => {
    if (!orders || orders.length === 0) return { total: 0, pending: 0, delivered: 0, value: 0 };

    return {
      total: pagination.totalElements,
      pending: orders.filter(o => ["PENDING", "CONFIRMED"].includes(o.orderStatus)).length,
      delivered: orders.filter(o => o.orderStatus === "DELIVERED").length,
      value: orders.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0)
    };
  }, [orders, pagination.totalElements]);

  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const response = await getAllDealersList();
        const map = new Map();
        response.data.data.forEach((dealer) => {
          map.set(dealer.dealerId, dealer.dealerName);
        });
        setDealerMap(map);
      } catch (error) {
        console.error("Failed to fetch dealers", error);
      }
    };
    fetchDealers();
  }, []);

  const fetchHistory = useCallback(
    async (pageToFetch = 0) => {
      setIsLoading(true);
      setError(null);

      const params = {
        page: pageToFetch,
        size: pagination.size,
      };
      if (filters.status) params.status = filters.status;
      if (filters.dealerId) params.dealerId = filters.dealerId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      try {
        const res = await getB2BOrders(params);
        setOrders(res.data.data.content || []);
        setPagination({
          page: res.data.data.number,
          size: res.data.data.size,
          totalPages: res.data.data.totalPages,
          totalElements: res.data.data.totalElements
        });
      } catch (error) {
        console.error("Failed to fetch order history", error);
        setError("Không thể tải lịch sử đơn hàng.");
      } finally {
        setIsLoading(false);
      }
    },
    [filters, pagination.size]
  );

  useEffect(() => {
    fetchHistory(0);
  }, [fetchHistory]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilter = () => {
    fetchHistory(0);
  };

  const getDealerName = (dealerId) => {
    return dealerMap.get(dealerId) || `Đại lý: ${dealerId.substring(0, 8)}...`;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchHistory(newPage);
    }
  };

  const handleViewDetails = async (order) => {
    setIsDetailLoading(true);
    try {
      const variantIds = order.orderItems.map((item) => item.variantId);
      const response = await getVariantDetailsByIds(variantIds);
      const vehicleDetailsMap = new Map(
        response.data.data.map((detail) => [detail.variantId, detail])
      );

      const enrichedItems = order.orderItems.map((item) => {
        const details = vehicleDetailsMap.get(item.variantId);
        return {
          ...item,
          versionName: details?.versionName || "N/A",
          color: details?.color || "N/A",
          skuCode: details?.skuCode || "N/A",
        };
      });

      setSelectedOrder({ ...order, orderItems: enrichedItems });
      setIsDetailsOpen(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết xe:", err);
      setError(err.response?.data?.message || "Không thể lấy chi tiết xe.");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const statCards = [
    { label: "Tổng Đơn Phân Phối", value: statsSummary.total, icon: FiSearch, color: "blue" },
    { label: "Đang Chờ Xử Lý", value: statsSummary.pending, icon: FiClock, color: "amber" },
    { label: "Giao Thành Công", value: statsSummary.delivered, icon: FiCheckCircle, color: "green" },
    { label: "Giá Trị Lưu Thông", value: statsSummary.value.toLocaleString("vi-VN"), icon: FiTrendingUp, color: "indigo", unit: "VNĐ" }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 -m-6 p-6 animate-in fade-in-0 duration-500 m-10">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg ring-4 ring-blue-50">
              <FiCalendar className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Lịch Sử Phân Phối</h1>
              <p className="text-slate-500 mt-0.5">Theo dõi luồng vận chuyển xe tới hệ thống đại lý toàn quốc.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <h3 className="text-2xl font-black text-slate-900 leading-none">{stat.value}</h3>
                  {stat.unit && <span className="text-xs font-bold text-slate-400">{stat.unit}</span>}
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-slate-100 rounded-lg">
            <FiFilter className="text-slate-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Bộ lọc tìm kiếm</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1">Trạng thái</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="CONFIRMED">Chờ xuất kho</option>
              <option value="IN_TRANSIT">Đang giao</option>
              <option value="DELIVERED">Đã giao</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1">Đại lý</label>
            <select
              name="dealerId"
              value={filters.dealerId}
              onChange={handleFilterChange}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">Tất cả đại lý</option>
              {[...dealerMap.entries()].map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1">Từ ngày</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1">Đến ngày</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleApplyFilter}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white p-2.5 rounded-xl font-bold hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-lg shadow-slate-200"
            >
              {isLoading ? <FiLoader className="animate-spin" /> : <FiSearch />}
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
            <FiXCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày Đặt</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Đại lý Đối tác</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mã Đơn Hàng</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Giá Trị</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng Thái</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-4">
                      <div className="h-6 bg-slate-50 rounded-lg w-full" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-4 bg-slate-50 rounded-full">
                        <FiSearch size={32} className="text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-medium">Không tìm thấy đơn hàng nào khớp với bộ lọc.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">
                          {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                          {new Date(order.orderDate).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-800 bg-slate-100/50 px-2.5 py-1 rounded-lg border border-slate-200/50">
                        {getDealerName(order.dealerId)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-medium text-slate-500 italic">
                        #{order.orderId.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-black text-slate-900 uppercase">
                          {Number(order.totalAmount).toLocaleString("vi-VN")}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">VNĐ</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewDetails(order)}
                        disabled={isDetailLoading}
                        className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all group-hover:scale-110"
                        title="Xem chi tiết"
                      >
                        <FiExternalLink size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-200 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Trang {pagination.page + 1} / {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 0}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages - 1}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {isDetailsOpen && (
        <B2BOrderDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => { setIsDetailsOpen(false); setSelectedOrder(null); }}
          order={selectedOrder}
          dealerMap={dealerMap}
        />
      )}
    </div>
  );
};

export default DistributionHistoryPage;
