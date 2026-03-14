import React, { useState, useEffect, useCallback } from "react";
import { FiEye, FiSearch, FiFilter, FiLoader } from "react-icons/fi";
import { getB2BOrders } from "../services/evmSalesService";
import { getAllDealersList } from "../../../dealer/ordervariants/services/dealerSalesService";
// (MỚI) Import service từ catalog
import { getVariantDetailsByIds } from "../../catalog/services/vehicleCatalogService";
// (MỚI) Import Modal chi tiết
import B2BOrderDetailsModal from "../components/B2BOrderDetailsModal";

// (MỚI) Component Badge (lấy từ AllocationPage)
const StatusBadge = ({ status }) => {
  let colorClasses = "bg-gray-100 text-gray-800";
  let text = status;
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
  }
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-block ${colorClasses}`}
    >
      {text}
    </span>
  );
};

// Trang Lịch sử Phân phối
const DistributionHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // State cho bộ lọc
  const [filters, setFilters] = useState({
    status: "", // Mặc định "" (tất cả)
    dealerId: "",
    startDate: "",
    endDate: "",
  });

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
  });
  const [dealerMap, setDealerMap] = useState(new Map());

  // --- (MỚI) State cho Modal chi tiết ---
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false); // Trạng thái loading chi tiết

  // --- Tải danh sách đại lý (cho bộ lọc) ---
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

  // --- Hàm tải đơn hàng theo bộ lọc ---
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
        setPagination((prev) => ({
          ...prev,
          page: res.data.data.number,
          totalPages: res.data.data.totalPages,
        }));
      } catch (error) {
        console.error("Failed to fetch order history", error);
        setError("Không thể tải lịch sử đơn hàng.");
      } finally {
        setIsLoading(false);
      }
    },
    [filters, pagination.size]
  );

  // Tải lần đầu
  useEffect(() => {
    fetchHistory(0);
  }, [fetchHistory]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilter = () => {
    setPagination((prev) => ({ ...prev, page: 0 }));
    fetchHistory(0);
  };

  const getDealerName = (dealerId) => {
    return dealerMap.get(dealerId) || `ID: ${dealerId.substring(0, 8)}...`;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      fetchHistory(newPage);
    }
  };

  // --- Hàm mở và "Làm giàu" dữ liệu cho Modal chi tiết ---
  const handleViewDetails = async (order) => {
    setIsDetailLoading(true); // Bắt đầu loading
    setError(null);

    try {
      // Lấy danh sách ID từ đơn hàng
      const variantIds = order.orderItems.map((item) => item.variantId);

      // Gọi API đến vehicle-catalog-service để lấy chi tiết
      const response = await getVariantDetailsByIds(variantIds);
      const vehicleDetailsMap = new Map(
        response.data.data.map((detail) => [detail.variantId, detail])
      );

      // "LÀM GIÀU" (Enrich) các order items
      const enrichedItems = order.orderItems.map((item) => {
        const details = vehicleDetailsMap.get(item.variantId);
        return {
          ...item,
          versionName: details?.versionName || "N/A",
          color: details?.color || "N/A",
          skuCode: details?.skuCode || "N/A",
        };
      });

      // Tạo đơn hàng đã làm giàu
      const enrichedOrder = {
        ...order,
        orderItems: enrichedItems,
      };

      // Mở modal với đơn hàng mới
      setSelectedOrder(enrichedOrder);
      setIsDetailsOpen(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết xe:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể lấy chi tiết xe.";
      setError(errorMsg);
    } finally {
      setIsDetailLoading(false); // Kết thúc loading
    }
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen animate-in fade-in-0 duration-500">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Lịch Sử Phân Phối (Đơn Hàng B2B)
      </h1>

      {/* Thanh Bộ Lọc */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg"
          >
            <option value="">-- Tất cả trạng thái --</option>
            <option value="DELIVERED">Đã giao</option>
            <option value="IN_TRANSIT">Đang vận chuyển</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="CONFIRMED">Chờ xuất kho</option>
          </select>

          <select
            name="dealerId"
            value={filters.dealerId}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg"
          >
            <option value="">-- Tất cả đại lý --</option>
            {[...dealerMap.entries()].map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg"
            title="Từ ngày"
          />
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg"
            title="Đến ngày"
          />

          <button
            onClick={handleApplyFilter}
            disabled={isLoading} // (MỚI) Thêm disabled
            className="flex items-center justify-center bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? (
              <FiLoader className="animate-spin mr-2" />
            ) : (
              <FiFilter className="mr-2" />
            )}
            Lọc
          </button>
        </div>
      </div>

      {/* Bảng Lịch sử */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {isLoading ? (
          <p className="text-gray-500 text-center py-10">
            <FiLoader className="animate-spin h-8 w-8 text-blue-600 mx-auto" />
          </p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            Không tìm thấy đơn hàng nào.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50 text-sm text-gray-600 uppercase">
                  <th className="p-3">Ngày Đặt</th>
                  <th className="p-3">Đại lý</th>
                  <th className="p-3">Mã ĐH</th>
                  <th className="p-3">Tổng Tiền</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">
                      {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-3 font-medium">
                      {getDealerName(order.dealerId)}
                    </td>
                    <td className="p-3 text-xs font-mono">{order.orderId}</td>
                    <td className="p-3 font-semibold text-blue-700">
                      {Number(order.totalAmount).toLocaleString("vi-VN")} VNĐ
                    </td>
                    <td className="p-3">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        // (MỚI) Gắn hàm vào onClick
                        onClick={() => handleViewDetails(order)}
                        // (MỚI) Thêm trạng thái loading
                        disabled={isDetailLoading}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded-full disabled:text-gray-300"
                        title="Xem chi tiết"
                      >
                        <FiEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang */}
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

      {/* (MỚI) Render Modal chi tiết */}
      {isDetailsOpen && (
        <B2BOrderDetailsModal
          isOpen={isDetailsOpen}
          onClose={handleCloseDetailsModal}
          order={selectedOrder}
          dealerMap={dealerMap} // Truyền map đại lý vào
        />
      )}
    </div>
  );
};

export default DistributionHistoryPage;
