import React, { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiSliders,
  FiPlusCircle, // Dùng cho Nhập kho
  FiEdit, // Dùng cho Sửa ngưỡng
  FiChevronDown,
  FiNavigation, // Dùng cho Điều chuyển
  FiFilter,
  FiLoader,
  FiEye,
} from "react-icons/fi";

import {
  getInventoryStatusByIds,
  getAvailableVins,
  getAllInventory,
} from "../services/inventoryService";
import {
  getAllVariantsPaginated,
  getVariantDetailsByIds,
  getVariantDetails,
} from "../../catalog/services/vehicleCatalogService";
import Pagination from "./Pagination";
import TransactionModal from "./TransactionModal"; // Modal Nhập kho (RESTOCK)
import TransferRequestModal from "./TransferRequestModal"; // Modal Tạo Yêu Cầu Điều Chuyển
import ReorderLevelModal from "./ReorderLevelModal"; // Modal Sửa Ngưỡng
import VariantDetailsModal from "../../../../components/common/detail/VariantDetailsModal";

// Component để hiển thị badge trạng thái
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
  }
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colorClasses}`}
    >
      {text}
    </span>
  );
};

const InventoryStatusTab = () => {
  const [mergedData, setMergedData] = useState({
    content: [],
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    dealerId: "", // (Lọc dealerId sẽ cần logic khác ở backend)
    status: "",
    minPrice: "",
    maxPrice: "",
    sort: "vehicleModel.modelName,asc",
  });
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Map<variantId, string[]>
  const [vinsMap, setVinsMap] = useState(new Map());
  // variantId đang được tải
  const [loadingVins, setLoadingVins] = useState(null);

  // State cho Modals
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailedVariant, setDetailedVariant] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    // Tạo một timer
    const timer = setTimeout(() => {
      setPage(0); // Reset về trang 0
      setFilters((prevFilters) => ({
        ...prevFilters,
        search: searchTerm, // Cập nhật filter thật sau khi hết 500ms
      }));
    }, 500); // 500ms (nửa giây)

    // Hàm dọn dẹp (cleanup function)
    // Sẽ chạy mỗi khi searchTerm thay đổi (trước khi effect mới chạy)
    return () => {
      clearTimeout(timer); // Hủy timer cũ
    };
  }, [searchTerm, setFilters, setPage]); // Phụ thuộc

  // Danh sách các trường sort thuộc về Inventory
  const inventorySortFields = [
    "availableQuantity,asc",
    "availableQuantity,desc",
    "totalQuantity,asc",
    "totalQuantity,desc",
    "allocatedQuantity,asc",
    "allocatedQuantity,desc",
    "reorderLevel,asc",
    "reorderLevel,desc",
  ];

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setMergedData({ content: [], totalPages: 0 });

    try {
      // Chuẩn bị params chung
      const params = {
        search: filters.search,
        status: filters.status,
        minPrice: filters.minPrice || null,
        maxPrice: filters.maxPrice || null,
        sort: filters.sort,
        page: page,
        size: 10,
      };

      // KIỂM TRA LOGIC "ĐẢO NGƯỢC"
      const isInventorySort = inventorySortFields.includes(params.sort);

      if (isInventorySort) {
        // ========== SORT THEO TỒN KHO ==========

        // Gọi getAllInventory để lấy trang đã sắp xếp
        // (API này sẽ lọc theo 'search' và 'status' phía backend)
        const inventoryResponse = await getAllInventory(params);
        const inventoryPage = inventoryResponse.data.data;

        if (!inventoryPage || inventoryPage.content.length === 0) {
          setIsLoading(false);
          return;
        }

        const inventoryContent = inventoryPage.content;
        const variantIds = inventoryContent.map((inv) => inv.variantId);

        // Lấy chi tiết xe (vehicle details) cho các ID này
        const vehicleResponse = await getVariantDetailsByIds(variantIds);
        const vehicleDetailsList = vehicleResponse.data.data || [];
        const vehicleMap = new Map(
          vehicleDetailsList.map((v) => [v.variantId, v])
        );

        // Gộp: Lấy danh sách Tồn kho làm gốc (để giữ thứ tự)
        const finalMergedContent = inventoryContent.map((inventoryItem) => ({
          ...vehicleMap.get(inventoryItem.variantId), // Chi tiết xe (name, sku)
          ...inventoryItem, // Dữ liệu kho (quantity, status)
        }));

        setMergedData({
          content: finalMergedContent,
          totalPages: inventoryPage.totalPages,
        });
      } else {
        // ========== CASE 2: SORT THEO TÊN/GIÁ ==========

        // Gọi catalog để lấy 10 xe đã sắp xếp theo Tên/Giá
        const vehicleResponse = await getAllVariantsPaginated(params);
        const vehicleData = vehicleResponse.data.data;

        if (!vehicleData || vehicleData.content.length === 0) {
          setIsLoading(false);
          return;
        }

        const variantIds = vehicleData.content.map(
          (variant) => variant.variantId
        );

        // Lấy dữ liệu tồn kho cho 10 xe này
        const inventoryResponse = await getInventoryStatusByIds(variantIds);
        const inventoryList = inventoryResponse.data.data || [];
        const inventoryMap = new Map(
          inventoryList.map((inv) => [inv.variantId, inv])
        );

        // Gộp: Lấy danh sách Xe làm gốc (để giữ thứ tự)
        const finalMergedContent = vehicleData.content.map((variant) => {
          const inventoryInfo = inventoryMap.get(variant.variantId);
          if (inventoryInfo) {
            return {
              ...variant,
              ...inventoryInfo, // Ghi đè status và thêm quantity
              status: inventoryInfo.status, // Đảm bảo status là của inventory
            };
          } else {
            return {
              ...variant,
              availableQuantity: 0,
              allocatedQuantity: 0,
              totalQuantity: 0,
              reorderLevel: 0,
              status: "OUT_OF_STOCK",
            };
          }
        });

        setMergedData({
          content: finalMergedContent,
          totalPages: vehicleData.totalPages,
        });
      }
    } catch (error) {
      console.error("Failed to fetch merged inventory data", error);
      setMergedData({ content: [], totalPages: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleFilterChange = (e) => {
    setPage(0);
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const fetchVinsForVariant = async (variantId) => {
    setLoadingVins(variantId);
    try {
      const response = await getAvailableVins(variantId);
      const vins = response.data.data || [];
      setVinsMap((prevMap) => new Map(prevMap).set(variantId, vins));
    } catch (error) {
      console.error("Failed to fetch VINs", error);
      setVinsMap((prevMap) => new Map(prevMap).set(variantId, [])); // Lưu mảng rỗng nếu lỗi
    } finally {
      setLoadingVins(null);
    }
  };

  const toggleRow = (variantId) => {
    const newSet = new Set(expandedRows);

    if (newSet.has(variantId)) {
      newSet.delete(variantId); // Chỉ đóng lại
    } else {
      newSet.add(variantId); // Mở ra
      // Nếu chưa có data VINs VÀ không đang tải, thì gọi API
      if (!vinsMap.has(variantId) && loadingVins !== variantId) {
        fetchVinsForVariant(variantId);
      }
    }
    setExpandedRows(newSet);
  };

  const openRestockModal = (variantId) => {
    setSelectedVariantId(variantId);
    setIsRestockModalOpen(true);
  };

  const openTransferModal = (variantId) => {
    setSelectedVariantId(variantId);
    setIsTransferModalOpen(true);
  };

  const openReorderModal = (variantId) => {
    setSelectedVariantId(variantId);
    setIsReorderModalOpen(true);
  };

  const openDetailModal = async (variantId) => {
    setSelectedVariantId(variantId); // Set ID
    setIsDetailModalOpen(true); // Mở modal
    setIsLoadingDetail(true); // Bắt đầu loading
    setDetailedVariant(null); // Xóa dữ liệu cũ

    try {
      // Gọi API để lấy chi tiết đầy đủ
      const response = await getVariantDetails(variantId);
      setDetailedVariant(response.data.data);
    } catch (error) {
      console.error("Failed to fetch variant details", error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Hàm đóng chung cho tất cả
  const closeModal = () => {
    setIsRestockModalOpen(false);
    setIsTransferModalOpen(false);
    setIsReorderModalOpen(false);
    setIsDetailModalOpen(false);
    setSelectedVariantId(null);
    setDetailedVariant(null);
  };

  return (
    <div>
      {/* Thanh tìm kiếm và bộ lọc */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Hàng 1: Tìm kiếm  */}
        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên xe, SKU..."
              className="p-2 pl-10 border rounded-lg w-full"
            />
          </div>
        </div>

        {/* Hàng 2: Các bộ lọc chi tiết */}
        <div className="flex flex-wrap items-end gap-4 p-4 bg-gray-50 rounded-lg border">
          <FiFilter className="text-gray-600 text-lg" />

          {/* Lọc Trạng thái  */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="p-2 border rounded-lg bg-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="IN_STOCK">Còn hàng</option>
              <option value="LOW_STOCK">Tồn kho thấp</option>
              <option value="OUT_OF_STOCK">Hết hàng</option>
            </select>
          </div>

          {/* Lọc Giá Tối Thiểu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá từ
            </label>
            <input
              name="minPrice" // Phải khớp với state 'filters'
              type="number"
              placeholder="VD: 50000"
              value={filters.minPrice} // Lấy từ state 'filters'
              onChange={handleFilterChange} // Dùng chung hàm
              className="p-2 border rounded-lg w-full"
            />
          </div>

          {/* Lọc Giá Tối Đa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đến giá
            </label>
            <input
              name="maxPrice" // Phải khớp với state 'filters'
              type="number"
              placeholder="VD: 100000"
              value={filters.maxPrice} // Lấy từ state 'filters'
              onChange={handleFilterChange} // Dùng chung hàm
              className="p-2 border rounded-lg w-full"
            />
          </div>

          {/* Sắp xếp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sắp xếp
            </label>
            <select
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="p-2 border rounded-lg bg-white"
            >
              <option value="vehicleModel.modelName,asc">
                Tên sản phẩm (A-Z)
              </option>
              <option value="vehicleModel.modelName,desc">
                Tên sản phẩm (Z-A)
              </option>
              <option value="price,asc">Giá: Thấp đến Cao</option>
              <option value="price,desc">Giá: Cao đến Thấp</option>

              <option value="availableQuantity,desc">
                Tồn kho: Cao đến Thấp
              </option>
              <option value="availableQuantity,asc">
                Tồn kho: Thấp đến Cao
              </option>
              <option value="totalQuantity,desc">
                Tổng số lượng: Cao đến Thấp
              </option>
              <option value="totalQuantity,asc">
                Tổng số lượng: Thấp đến Cao
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      {isLoading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b text-sm text-gray-600 uppercase">
                <th className="p-3 w-12"></th>
                <th className="p-3 text-left">Sản phẩm</th>
                <th className="p-3 text-center">Kho TT khả dụng</th>
                <th className="p-3 text-center">Đang chờ xuất</th>
                <th className="p-3 text-center">Tổng số lượng</th>
                <th className="p-3 text-center">Ngưỡng (TT)</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {mergedData.content.map(
                (
                  item // Tự động dùng dữ liệu đã gộp
                ) => (
                  <React.Fragment key={item.variantId}>
                    <tr className="border-b hover:bg-gray-50">
                      <td
                        className="p-3 text-center cursor-pointer"
                        onClick={() => toggleRow(item.variantId)}
                      >
                        <FiChevronDown
                          className={`transition-transform ${
                            expandedRows.has(item.variantId) ? "rotate-180" : ""
                          }`}
                        />
                      </td>

                      <td className="p-3">
                        <p className="font-semibold text-gray-800">
                          {item.modelName} - {item.versionName} - {item.color}
                        </p>
                        <p className="text-xs text-gray-500">
                          SKU: {item.skuCode} | Brand: {item.brand}
                        </p>
                      </td>

                      <td className="p-3 text-center text-lg font-bold text-green-600">
                        {item.availableQuantity}
                      </td>
                      <td className="p-3 text-center text-gray-600">
                        {item.allocatedQuantity}
                      </td>
                      <td className="p-3 text-center font-semibold text-blue-600">
                        {item.totalQuantity}
                      </td>
                      <td className="p-3 text-center text-yellow-700 font-medium">
                        {item.reorderLevel}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {/* Nút nhập kho */}
                        <button
                          onClick={() => openRestockModal(item.variantId)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                          title="Nhập kho (Restock)"
                        >
                          <FiPlusCircle />
                        </button>
                        {/* Nút điều chuyển */}
                        <button
                          onClick={() => openTransferModal(item.variantId)}
                          className="p-2 text-purple-600 hover:bg-purple-100 rounded-full"
                          title="Tạo Yêu Cầu Điều Chuyển"
                        >
                          <FiNavigation />
                        </button>
                        {/* Nút sửa ngưỡng */}
                        <button
                          onClick={() => openReorderModal(item.variantId)}
                          className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full"
                          title="Cập nhật ngưỡng"
                        >
                          <FiEdit />
                        </button>
                        {/* Nút xem chi tiết */}
                        <button
                          onClick={() => openDetailModal(item.variantId)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                          title="Xem chi tiết phiên bản"
                        >
                          <FiEye />
                        </button>
                      </td>
                    </tr>
                    {expandedRows.has(item.variantId) && (
                      <tr className="bg-gray-50 border-b">
                        <td colSpan="8" className="p-4">
                          <div className="p-4 bg-white rounded shadow-inner border">
                            <h4 className="font-semibold mb-2 text-gray-800">
                              Các số VIN khả dụng (Kho Trung tâm):
                            </h4>

                            {/* Trạng thái đang tải VINs */}
                            {loadingVins === item.variantId && (
                              <div className="flex items-center text-gray-500">
                                <FiLoader className="animate-spin mr-2" />
                                Đang tải VINs...
                              </div>
                            )}

                            {/* Trạng thái đã tải xong (hoặc chưa tải) */}
                            {loadingVins !== item.variantId &&
                              (() => {
                                const vins = vinsMap.get(item.variantId);

                                // Chưa có dữ liệu (chưa kịp tải)
                                if (!vins) {
                                  return (
                                    <p className="text-sm text-gray-500">
                                      Đang chờ tải...
                                    </p>
                                  );
                                }

                                // Không tìm thấy VIN
                                if (vins.length === 0) {
                                  return (
                                    <p className="text-sm text-gray-500">
                                      Không tìm thấy VIN nào khả dụng.
                                    </p>
                                  );
                                }

                                // Hiển thị danh sách VINs
                                return (
                                  <div className="flex flex-wrap gap-2">
                                    {vins.map((vin) => (
                                      <span
                                        key={vin}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded-full border border-blue-200"
                                      >
                                        {vin}
                                      </span>
                                    ))}
                                  </div>
                                );
                              })()}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {isRestockModalOpen && (
        <TransactionModal
          isOpen={isRestockModalOpen}
          onClose={closeModal}
          onSuccess={fetchInventory}
          variantId={selectedVariantId}
        />
      )}
      {isTransferModalOpen && (
        <TransferRequestModal
          isOpen={isTransferModalOpen}
          onClose={closeModal}
          onSuccess={fetchInventory} // Tải lại kho sau khi tạo yêu cầu
          variantId={selectedVariantId}
        />
      )}
      {isReorderModalOpen && (
        <ReorderLevelModal
          isOpen={isReorderModalOpen}
          onClose={closeModal}
          onSuccess={fetchInventory}
          variantId={selectedVariantId}
        />
      )}
      <VariantDetailsModal
        isOpen={isDetailModalOpen}
        onClose={closeModal}
        variant={detailedVariant} // Truyền dữ liệu chi tiết
        isLoading={isLoadingDetail} // Truyền trạng thái loading
      />

      <Pagination
        currentPage={page}
        totalPages={mergedData.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default InventoryStatusTab;
