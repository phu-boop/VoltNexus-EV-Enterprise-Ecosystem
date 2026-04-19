import React, { useState, useEffect, useCallback } from "react";
import {
  FiClock,
  FiPackage,
  FiArrowRight,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiActivity,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiRepeat
} from "react-icons/fi";
import { getTransactionHistory } from "../services/inventoryService";
import { getVariantDetailsByIds } from "../../catalog/services/vehicleCatalogService";
import { dealerService } from "../../../admin/manageDealer/dealers/services/dealerService";
import Pagination from "./Pagination";

const TRANSACTION_TYPE_LABELS = {
  INITIAL_STOCK: "Nhập kho ban đầu",
  RESTOCK: "Bổ sung hàng",
  TRANSFER_TO_DEALER: "Xuất đến đại lý",
  TRANSFER_TO_CENTRAL: "Chuyển về kho TT",
  SALE: "Bán hàng",
  ADJUSTMENT_ADD: "Điều chỉnh tăng",
  ADJUSTMENT_SUBTRACT: "Điều chỉnh giảm",
  ALLOCATE: "Chuẩn bị",
  RETURN_FROM_DEALER: "Trả hàng từ đại lý",
};

const TransactionHistoryTab = () => {
  const [history, setHistory] = useState({ content: [], totalPages: 0 });
  const [filters, setFilters] = useState({ startDate: "", endDate: "" });
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [dealersMap, setDealersMap] = useState(new Map()); // Map lưu tên đại lý

  // Fetch danh sách đại lý 1 lần khi mount
  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const response = await dealerService.getBasicList();

        // Check code loosely (1000 or "1000")
        if (response.data && (response.data.code == 1000 || response.data.code === "1000")) {
          // Try different field names for the list
          const dealers = response.data.data || response.data.result || response.data.payload;

          const map = new Map();
          if (Array.isArray(dealers)) {
            dealers.forEach(d => {
              // Ưu tiên dealerId/dealerName, fallback về id/name
              const id = d.dealerId || d.id;
              const name = d.dealerName || d.name;
              if (id && name) {
                map.set(id, name);
              }
            });
          }
          setDealersMap(map);
        }
      } catch (error) {
        error.message();
      }
    };
    fetchDealers();
  }, []);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      // Lấy lịch sử giao dịch (chỉ có variantId)
      const params = { ...filters, page, size: 10 };
      const historyResponse = await getTransactionHistory(params);
      const historyData = historyResponse.data.data;

      if (historyData && historyData.content.length > 0) {
        // Thu thập tất cả các variantId
        const variantIds = historyData.content.map((tx) => tx.variantId);

        // Gọi API vehicle-service để lấy chi tiết tên, sku...
        const detailsResponse = await getVariantDetailsByIds(variantIds);
        const vehicleDetails = detailsResponse.data.data || [];
        const detailsMap = new Map(vehicleDetails.map((v) => [v.variantId, v]));

        // Gộp hai luồng dữ liệu lại
        const mergedContent = historyData.content.map((tx) => {
          const details = detailsMap.get(tx.variantId);
          return {
            ...tx, // Dữ liệu giao dịch (quantity, type, staffId...)
            versionName: details ? details.versionName : "Không tìm thấy",
            color: details ? details.color : `(ID: ${tx.variantId})`,
            skuCode: details ? details.skuCode : "N/A",
          };
        });

        setHistory({
          content: mergedContent,
          totalPages: historyData.totalPages,
        });
      } else {
        setHistory({ content: [], totalPages: 0 });
      }
    } catch (error) {
      error.message();
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Helper function để render badge màu sắc (Tùy chọn thêm cho đẹp)
  const renderTransactionType = (type) => {
    const label = TRANSACTION_TYPE_LABELS[type] || type;

    let Icon = FiActivity;
    let colorClass = "bg-slate-100 text-slate-600 border-slate-200";

    if (["INITIAL_STOCK", "RESTOCK", "ADJUSTMENT_ADD", "RETURN_FROM_DEALER"].includes(type)) {
      Icon = FiArrowDownLeft;
      colorClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
    } else if (["SALE", "ADJUSTMENT_SUBTRACT"].includes(type)) {
      Icon = FiArrowUpRight;
      colorClass = "bg-rose-50 text-rose-700 border-rose-100";
    } else if (["TRANSFER_TO_DEALER", "TRANSFER_TO_CENTRAL", "ALLOCATE"].includes(type)) {
      Icon = FiRepeat;
      colorClass = "bg-blue-50 text-blue-700 border-blue-100";
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${colorClass}`}>
        <Icon size={14} />
        {label}
      </span>
    );
  };

  return (
    <div>
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <FiCalendar className="text-slate-400" />
          <span className="text-sm font-medium text-slate-600">Khoảng thời gian:</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
          <span className="text-slate-300"> đến </span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-4 py-4 text-left">Thời gian</th>
                <th className="px-4 py-4 text-left">Sản phẩm</th>
                <th className="px-4 py-4 text-left">Loại Giao Dịch</th>
                <th className="px-4 py-4 text-center">Số Lượng</th>
                <th className="px-4 py-4 text-left">Nguồn & Đích</th>
                <th className="px-4 py-4 text-left">Nhân viên</th>
              </tr>
            </thead>
            <tbody>
              {history.content.map((tx) => (
                <tr
                  key={tx.transactionId}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">
                        {new Date(tx.transactionDate).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(tx.transactionDate).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-slate-900 leading-tight">
                        {tx.versionName}
                      </p>
                      <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-wider">
                        {tx.color} | SKU: {tx.skuCode}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {renderTransactionType(tx.transactionType)}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-mono font-bold text-sm ${tx.quantity > 0 ? "bg-slate-100 text-slate-700" : "bg-rose-50 text-rose-600"
                      }`}>
                      {tx.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium text-slate-500">
                        {tx.fromDealerId
                          ? (dealersMap.get(tx.fromDealerId) || `ĐL #${tx.fromDealerId.substring(0, 6)}`)
                          : "Kho Trung Tâm"}
                      </span>
                      <FiArrowRight className="text-slate-300" />
                      <span className="font-medium text-slate-900">
                        {tx.toDealerId
                          ? (dealersMap.get(tx.toDealerId) || `ĐL #${tx.toDealerId.substring(0, 6)}`)
                          : "Kho Trung Tâm"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <FiUser size={12} />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 capitalize">{tx.staffId}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-6 border-t border-slate-100 pt-6">
        <Pagination currentPage={page} totalPages={history.totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default TransactionHistoryTab;
