import React, { useState, useEffect, useCallback } from "react";
import { getTransactionHistory } from "../services/inventoryService";
import { getVariantDetailsByIds } from "../../catalog/services/vehicleCatalogService";
import { dealerService } from "../../../admin/manageDealer/dealers/services/dealerService"; // Fix path
// import Pagination from '../../../../components/Pagination';

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

    // Tùy chọn: Thêm màu sắc cho từng loại nếu muốn
    let className = "px-2 py-1 rounded text-xs font-medium ";
    if (
      [
        "INITIAL_STOCK",
        "RESTOCK",
        "ADJUSTMENT_ADD",
        "RETURN_FROM_DEALER",
      ].includes(type)
    ) {
      className += "bg-green-100 text-green-800"; // Màu xanh lá cho hành động Tăng
    } else if (["SALE", "ADJUSTMENT_SUBTRACT"].includes(type)) {
      className += "bg-red-100 text-red-800"; // Màu đỏ cho hành động Giảm/Bán
    } else if (["TRANSFER_TO_DEALER", "TRANSFER_TO_CENTRAL"].includes(type)) {
      className += "bg-blue-100 text-blue-800"; // Màu xanh dương cho Điều chuyển
    } else {
      className += "bg-gray-100 text-gray-800"; // Mặc định
    }
    return <span className={className}>{label}</span>;
  };

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
          className="p-2 border rounded-lg"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="p-2 border rounded-lg"
        />
      </div>

      {isLoading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            {/* Header của bảng */}
            <thead>
              <tr className="bg-gray-50 border-b text-sm text-gray-600 uppercase">
                <th className="p-3">Thời gian</th>
                <th className="p-3">Sản phẩm</th>
                <th className="p-3">Loại Giao Dịch</th>
                <th className="p-3 text-center">Số Lượng</th>
                <th className="p-3">Từ Kho</th>
                <th className="p-3">Đến Kho</th>
                <th className="p-3">Người thực hiện</th>
              </tr>
            </thead>
            <tbody>
              {history.content.map((tx) => (
                <tr
                  key={tx.transactionId}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3">
                    {new Date(tx.transactionDate).toLocaleString("vi-VN")}
                  </td>
                  <td className="p-3">
                    <p className="font-semibold">
                      {tx.versionName} - {tx.color}
                    </p>
                    <p className="text-xs text-gray-500">SKU: {tx.skuCode}</p>
                  </td>
                  <td className="p-3">
                    {renderTransactionType(tx.transactionType)}
                  </td>
                  <td className="p-3 text-center font-medium">{tx.quantity}</td>
                  <td className="p-3">
                    {tx.fromDealerId
                      ? (dealersMap.get(tx.fromDealerId) || `Đại lý #${tx.fromDealerId}`)
                      : "Kho Trung Tâm"}
                  </td>
                  <td className="p-3">
                    {tx.toDealerId
                      ? (dealersMap.get(tx.toDealerId) || `Đại lý #${tx.toDealerId}`)
                      : "Kho Trung Tâm"}
                  </td>
                  <td className="p-3">{tx.staffId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* <Pagination currentPage={page} totalPages={history.totalPages} onPageChange={setPage} /> */}
    </div>
  );
};

export default TransactionHistoryTab;
