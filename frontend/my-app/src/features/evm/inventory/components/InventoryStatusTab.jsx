import React, { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiSliders,
  FiPlusCircle,
  FiEdit,
  FiChevronDown,
  FiNavigation,
  FiFilter,
  FiLoader,
  FiEye,
  FiArrowRight,
  FiExternalLink,
  FiCopy,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

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
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.includes('/admin/') ? '/evm/admin' : '/evm/staff';

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
      {/* Thanh tìm kiếm và bộ lọc cải tiến */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          {/* Tìm kiếm chính */}
          <div className="lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wider">Tìm kiếm sản phẩm</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tên xe, SKU, màu sắc..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
              />
            </div>
          </div>

          {/* Trạng thái */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wider">Trạng thái</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
            >
              <option value="">Tất cả</option>
              <option value="IN_STOCK">Còn hàng</option>
              <option value="LOW_STOCK">Tồn kho thấp</option>
              <option value="OUT_OF_STOCK">Hết hàng</option>
            </select>
          </div>

          {/* Lọc giá */}
          <div className="lg:col-span-3 flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wider">Giá từ</label>
              <input
                name="minPrice"
                type="number"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wider">Đến</label>
              <input
                name="maxPrice"
                type="number"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
              />
            </div>
          </div>

          {/* Sắp xếp */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wider">Sắp xếp</label>
            <select
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm"
            >
              <option value="vehicleModel.modelName,asc">Tên sản phẩm (A-Z)</option>
              <option value="vehicleModel.modelName,desc">Tên sản phẩm (Z-A)</option>
              <option value="price,asc">Giá: Thấp đến Cao</option>
              <option value="price,desc">Giá: Cao đến Thấp</option>
              <option value="availableQuantity,desc">Tồn kho: Cao đến Thấp</option>
              <option value="availableQuantity,asc">Tồn kho: Thấp đến Cao</option>
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
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-4 w-12"></th>
                <th className="px-4 py-4 text-left">Phiên Bản Sản Phẩm</th>
                <th className="px-4 py-4 text-center">Khả dụng</th>
                <th className="px-4 py-4 text-center">Chờ xuất</th>
                <th className="px-4 py-4 text-center">Tổng số</th>
                <th className="px-4 py-4 text-center">Ngưỡng</th>
                <th className="px-4 py-4 text-left">Trạng thái</th>
                <th className="px-4 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {mergedData.content.map(
                (
                  item // Tự động dùng dữ liệu đã gộp
                ) => (
                  <React.Fragment key={item.variantId}>
                    <tr className="group border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
                      <td
                        className="px-4 py-4 text-center cursor-pointer text-slate-400 group-hover:text-blue-600 transition-colors"
                        onClick={() => toggleRow(item.variantId)}
                      >
                        <FiChevronDown
                          size={20}
                          className={`mx-auto transition-transform duration-300 ${expandedRows.has(item.variantId) ? "rotate-180" : ""
                            }`}
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <button
                            onClick={() => navigate(`${basePath}/products/catalog?modelId=${item.modelId}`)}
                            className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-left flex items-center gap-1"
                          >
                            {item.modelName} - {item.versionName}
                            <FiExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              SKU: {item.skuCode}
                            </span>
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              Màu: {item.color}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center font-mono font-bold text-emerald-600 text-lg">
                        {item.availableQuantity}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-500 font-mono">
                        {item.allocatedQuantity}
                      </td>
                      <td className="px-4 py-4 text-center font-mono font-bold text-blue-600">
                        {item.totalQuantity}
                      </td>
                      <td className="px-4 py-4 text-center text-amber-600 font-mono font-semibold">
                        {item.reorderLevel}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openRestockModal(item.variantId)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Nhập kho hàng loạt"
                          >
                            <FiPlusCircle size={18} />
                          </button>
                          <button
                            onClick={() => openTransferModal(item.variantId)}
                            className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                            title="Tạo lệnh điều chuyển"
                          >
                            <FiNavigation size={18} />
                          </button>
                          <button
                            onClick={() => openReorderModal(item.variantId)}
                            className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                            title="Cấu hình ngưỡng an toàn"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => openDetailModal(item.variantId)}
                            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <FiEye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has(item.variantId) && (
                      <tr className="bg-gray-50 border-b">
                        <td colSpan="8" className="p-4">
                          <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-100 shadow-inner">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                <div className="w-1 h-4 bg-blue-600 rounded-full" />
                                Danh sách VIN khả dụng (Kho Trung tâm)
                              </h4>
                              <button
                                onClick={() => navigate(`${basePath}/distribution/allocation`)}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group/btn"
                              >
                                Tới phân bổ lô hàng
                                <FiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                              </button>
                            </div>

                            {loadingVins === item.variantId && (
                              <div className="flex items-center justify-center py-8 text-slate-400">
                                <FiLoader className="animate-spin mr-2" size={20} />
                                <span className="text-sm font-medium">Đang truy vấn dữ liệu theo thời gian thực...</span>
                              </div>
                            )}

                            {loadingVins !== item.variantId &&
                              (() => {
                                const vins = vinsMap.get(item.variantId);
                                if (!vins) return <div className="h-20" />;

                                if (vins.length === 0) {
                                  return (
                                    <div className="py-8 text-center text-slate-400 bg-white rounded-lg border border-dashed border-slate-200">
                                      <p className="text-sm">Không tìm thấy mã định danh (VIN) nào đang khả dụng tại kho trung tâm.</p>
                                    </div>
                                  );
                                }

                                return (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {vins.map((vin) => (
                                      <div
                                        key={vin}
                                        className="group/vin flex items-center justify-between px-3 py-2 bg-white border border-slate-200 text-[11px] font-mono font-bold text-slate-700 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                                      >
                                        <span>{vin}</span>
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(vin);
                                            // Optional: Show toast
                                          }}
                                          className="text-slate-300 hover:text-blue-500 transition-colors opacity-0 group-hover/vin:opacity-100"
                                        >
                                          <FiCopy size={12} />
                                        </button>
                                      </div>
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
