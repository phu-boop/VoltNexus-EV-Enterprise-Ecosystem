import React, { useState, useEffect, useCallback } from "react";
import { FiSearch, FiEdit } from "react-icons/fi";
import { getMyStock } from "../services/dealerSalesService";
import DealerReorderModal from "../components/DealerReorderModal";

// Component Badge (copy từ InventoryStatusTab)
const StatusBadge = ({ status }) => {
  let colorClasses = "bg-gray-100 text-gray-800";
  let text = "Không xác định";
  switch (status) {
    case "IN_STOCK":
      colorClasses = "bg-green-100 text-green-800";
      text = "Còn hàng";
      break;
    case "LOW_STOCK":
      colorClasses = "bg-yellow-100 text-yellow-800";
      text = "Tồn kho thấp";
      break;
    case "OUT_OF_STOCK":
      colorClasses = "bg-red-100 text-red-800";
      text = "Hết hàng";
      break;
    default:
      text = status || "Không xác định";
  }
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colorClasses}`}
    >
      {text}
    </span>
  );
};

const DealerInventoryStockPage = () => {
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
  }, [filters]);

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

  return (
    <div className="animate-in fade-in-0 duration-500 p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Kho Xe Của Tôi</h1>

      {/* Thanh tìm kiếm */}
      <div className="mb-6">
        <div className="relative max-w-lg">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Tìm theo Model, Phiên bản, Màu, hoặc SKU..."
            className="w-full p-3 pl-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Bảng dữ liệu */}
      {isLoading ? (
        <p>Đang tải...</p>
      ) : error ? (
        <p className="text-center text-red-500 py-10">{error}</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b text-sm text-gray-600 uppercase">
                <th className="p-3 text-left">
                  Sản phẩm (Model, Phiên bản, Màu)
                </th>
                <th className="p-3 text-left">SKU</th>
                <th className="p-3 text-center">Khả dụng (để bán)</th>
                <th className="p-3 text-center">Đang vận chuyển</th>
                <th className="p-3 text-center">Ngưỡng đặt lại</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((item) => (
                <tr key={item.variantId} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <p className="font-semibold text-gray-800">
                      {item.modelName} {item.versionName}
                    </p>
                    <p className="text-xs text-gray-500">{item.color}</p>
                  </td>
                  <td className="p-3 text-gray-600">{item.skuCode}</td>
                  <td className="p-3 text-center text-lg font-bold text-green-600">
                    {item.availableQuantity}
                  </td>
                  <td className="p-3 text-center text-gray-600">
                    {item.allocatedQuantity}
                  </td>
                  <td className="p-3 text-center text-gray-600">
                    {item.reorderLevel}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => openReorderModal(item)}
                      className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full"
                      title="Cập nhật ngưỡng đặt lại"
                    >
                      <FiEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stock.length === 0 && (
            <p className="text-center text-gray-500 py-10">
              Kho của bạn chưa có xe nào hoặc không tìm thấy kết quả.
            </p>
          )}
        </div>
      )}

      {isReorderModalOpen &&
        selectedItem && ( // Chỉ render khi modal mở và có item được chọn
          <DealerReorderModal
            isOpen={isReorderModalOpen}
            onClose={closeReorderModal}
            onSuccess={fetchMyStock} // Gọi lại fetchMyStock sau khi thành công
            variantId={selectedItem.variantId}
            currentReorderLevel={selectedItem.reorderLevel} // Truyền ngưỡng hiện tại
          />
        )}
    </div>
  );
};

export default DealerInventoryStockPage;
