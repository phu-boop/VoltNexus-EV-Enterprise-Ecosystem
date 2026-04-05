import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FiSearch, FiEdit, FiPackage, FiTruck, FiAlertCircle, FiArrowRight, FiExternalLink } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getMyStock } from "../services/dealerSalesService";
import DealerReorderModal from "../components/DealerReorderModal";
import StatusBadge from "../components/StatusBadge";
import DealerStatsGrid from "../components/DealerStatsGrid";

const DealerInventoryStockPage = () => {
  const navigate = useNavigate();
  const [stock, setStock] = useState([]);
  const [filters, setFilters] = useState({ search: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Hàm tải dữ liệu
  const fetchMyStock = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { search: filters.search };
      const res = await getMyStock(params);
      setStock(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch dealer stock", err);
      setError("Không thể tải dữ liệu tồn kho.");
    } finally {
      setIsLoading(false);
    }
  }, [filters.search]);

  useEffect(() => {
    fetchMyStock();
  }, [fetchMyStock]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const openReorderModal = (item) => {
    setSelectedItem(item);
    setIsReorderModalOpen(true);
  };

  const closeReorderModal = () => {
    setIsReorderModalOpen(false);
    setSelectedItem(null);
  };

  // Tính toán stats
  const stats = useMemo(() => {
    return {
      totalUnits: stock.reduce((sum, item) => sum + item.availableQuantity, 0),
      lowStock: stock.filter(item => item.status === "LOW_STOCK" || item.status === "OUT_OF_STOCK").length,
      inTransit: stock.reduce((sum, item) => sum + item.allocatedQuantity, 0),
      deliveredThisMonth: stock.length // Tạm thời lấy length, thực tế cần API hoặc logic riêng
    };
  }, [stock]);

  return (
    <div className="p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
              <FiPackage size={28} />
            </div>
            Kho Xe Của Tôi
          </h1>
          <p className="text-slate-500 font-medium">Quản lý và theo dõi tồn kho trực tiếp tại đại lý của bạn</p>
        </div>
        <button
          onClick={() => navigate("../catalog")}
          className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-bold rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-400 transition-all active:scale-95 group"
        >
          <FiExternalLink className="text-blue-500 group-hover:rotate-12 transition-transform" />
          Xem danh mục xe
        </button>
      </div>

      {/* Stats Grid */}
      <DealerStatsGrid stats={stats} />

      {/* Search & Filter bar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8 flex flex-wrap gap-4 items-center animate-in slide-in-from-top-4 duration-500 delay-200 fill-mode-both">
        <div className="relative flex-1 min-w-[300px]">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Tìm theo tên xe, phiên bản, màu sắc hoặc mã SKU..."
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner font-medium"
          />
        </div>
        <div className="h-10 w-px bg-slate-100 mx-2 hidden lg:block"></div>
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
          Hiển thị <span className="text-slate-900 font-bold">{stock.length}</span> sản phẩm trong kho
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500 delay-300 fill-mode-both">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="font-bold animate-pulse text-sm">Đang đồng bộ dữ liệu kho...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-rose-500 flex flex-col items-center gap-2">
            <FiAlertCircle size={48} className="opacity-20" />
            <p className="font-bold">{error}</p>
          </div>
        ) : stock.length === 0 ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center gap-4">
            <div className="p-6 bg-slate-50 rounded-full">
              <FiPackage size={48} className="opacity-20" />
            </div>
            <div>
              <p className="text-lg font-black text-slate-900 mb-1 tracking-tight">Kho của bạn đang trống</p>
              <p className="text-sm font-medium italic">Bạn chưa có sản phẩm nào hoặc không tìm thấy kết quả phù hợp.</p>
            </div>
            <button
              onClick={() => navigate("../catalog")}
              className="mt-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
            >
              Khám phá sản phẩm ngay
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">
                  <th className="px-8 py-5 text-left">Thông tin sản phẩm</th>
                  <th className="px-6 py-5 text-left">Mã SKU / Định danh</th>
                  <th className="px-6 py-5 text-center">Tồn khả dụng</th>
                  <th className="px-6 py-5 text-center">Đang vận chuyển</th>
                  <th className="px-6 py-5 text-center whitespace-nowrap">Ngưỡng cảnh báo</th>
                  <th className="px-6 py-5 text-center">Trạng thái</th>
                  <th className="px-8 py-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stock.map((item) => (
                  <tr key={item.variantId} className="group hover:bg-blue-50/30 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center p-2 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:rotate-6">
                          <FiPackage size={20} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors">
                            {item.modelName} {item.versionName}
                          </p>
                          <p className="text-xs font-bold text-slate-400 group-hover:text-slate-500">{item.color}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-mono text-xs text-slate-500 font-bold">
                      <span className="px-2 py-1 bg-slate-100 rounded-md">{item.skuCode}</span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`text-xl font-black ${item.availableQuantity <= item.reorderLevel ? "text-rose-600" : "text-emerald-600"
                          }`}>
                          {item.availableQuantity}
                        </span>
                        <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-700 ${item.availableQuantity <= item.reorderLevel ? "bg-rose-500" : "bg-emerald-500"
                              }`}
                            style={{ width: `${Math.min((item.availableQuantity / (item.reorderLevel * 2 || 10)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-slate-400 font-bold">
                        <FiTruck size={14} className={item.allocatedQuantity > 0 ? "text-indigo-500 animate-bounce" : ""} />
                        <span className={item.allocatedQuantity > 0 ? "text-indigo-600" : ""}>{item.allocatedQuantity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-xs font-black text-slate-600">
                        {item.reorderLevel}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex justify-center">
                        <StatusBadge status={item.status} />
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform duration-300">
                        <button
                          onClick={() => openReorderModal(item)}
                          className="p-3 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 rounded-2xl transition-all"
                          title="Cập nhật ngưỡng đặt lại"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => navigate("../orders/new", { state: { reorderItem: item } })}
                          className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all hover:scale-110 active:scale-95"
                          title="Đặt hàng ngay"
                        >
                          <FiArrowRight size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Cập Nhật */}
      <DealerReorderModal
        isOpen={isReorderModalOpen}
        onClose={closeReorderModal}
        onSuccess={fetchMyStock}
        variantId={selectedItem?.variantId}
        currentReorderLevel={selectedItem?.reorderLevel}
      />

      <div className="h-12"></div>
    </div>
  );
};

export default DealerInventoryStockPage;
