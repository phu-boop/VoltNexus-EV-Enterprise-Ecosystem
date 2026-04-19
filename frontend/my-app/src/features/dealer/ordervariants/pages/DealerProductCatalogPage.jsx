import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthContext } from "../../../auth/AuthProvider";
import { FiEye, FiLoader, FiFilter, FiTrendingUp, FiLayers, FiSearch, FiChevronDown, FiZap } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getAllVariantsPaginated,
  getComparisonDetails,
  getVariantDetails,
} from "../services/vehicleCatalogService";
import VariantDetailsModal from "../../../../components/common/detail/VariantDetailsModal";
import ProductCard from "../../../../components/common/ProductCard";
import CompareTray from "../../../../components/common/CompareTray";
import CompareModal from "../../../../components/common/CompareModal";
import DealerStatsGrid from "../components/DealerStatsGrid";

const fetchVariantsFromAPI = async (page, params) => {
  const apiParams = {
    ...params,
    page: page,
    size: 12, // Tăng lên 12 để lưới 4 cột cân đối hơn
  };

  if (!apiParams.minPrice) delete apiParams.minPrice;
  if (!apiParams.maxPrice) delete apiParams.maxPrice;

  const response = await getAllVariantsPaginated(apiParams);
  return response.data.data;
};

const DealerProductCatalogPage = () => {
  const navigate = useNavigate();
  const [variants, setVariants] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { userData } = useAuthContext();

  const [compareItems, setCompareItems] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareData, setCompareData] = useState([]);
  const [isLoadingCompare, setIsLoadingCompare] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const [sort, setSort] = useState("vehicleModel.modelName,asc");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const loadData = useCallback(
    async (loadPage, isFilterChange = false) => {
      setIsLoading(true);
      try {
        const params = { sort, minPrice, maxPrice };
        const pageData = await fetchVariantsFromAPI(loadPage, params);

        if (isFilterChange) {
          setVariants(pageData.content);
        } else {
          setVariants((prevVariants) => [...prevVariants, ...pageData.content]);
        }

        setHasNextPage(!pageData.last);
      } catch (error) {
        console.error("Failed to fetch variants:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [sort, minPrice, maxPrice]
  );

  useEffect(() => {
    if (page > 0) {
      loadData(page, false);
    }
  }, [page, loadData]);

  useEffect(() => {
    loadData(0, true);
  }, [sort, minPrice, maxPrice, loadData]);

  const handleToggleCompare = (variant) => {
    setCompareItems((prevItems) => {
      const isSelected = prevItems.some(
        (item) => item.variantId === variant.variantId
      );

      if (isSelected) {
        return prevItems.filter((item) => item.variantId !== variant.variantId);
      } else {
        if (prevItems.length >= 3) {
          Swal.fire({
            icon: "warning",
            title: "Giới hạn so sánh",
            text: "Quý đối tác chỉ có thể so sánh tối đa 3 sản phẩm cùng lúc.",
            confirmButtonColor: "#0f172a"
          });
          return prevItems;
        }
        return [...prevItems, variant];
      }
    });
  };

  const handleCompareSubmit = async () => {
    if (compareItems.length < 2) {
      Swal.fire({
        icon: "info",
        title: "Thông báo",
        text: "Vui lòng chọn ít nhất 2 sản phẩm để thực hiện so sánh chi tiết.",
        confirmButtonColor: "#3b82f6"
      });
      return;
    }

    if (!userData || !userData.memberId) {
      Swal.fire("Lỗi!", "Phiên đăng nhập không hợp lệ.", "error");
      return;
    }

    setIsLoadingCompare(true);
    try {
      const variantIds = compareItems.map((item) => item.variantId);
      const response = await getComparisonDetails(variantIds, userData.memberId);
      setCompareData(response.data.data);
      setIsCompareModalOpen(true);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu so sánh:", error);
      Swal.fire("Lỗi!", "Không thể tải dữ liệu so sánh.", "error");
    } finally {
      setIsLoadingCompare(false);
    }
  };

  const handleViewDetails = async (variantId) => {
    setIsLoadingDetail(true);
    setIsDetailModalOpen(true);
    try {
      const response = await getVariantDetails(variantId);
      setSelectedVariant(response.data.data);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết xe:", error);
      Swal.fire("Lỗi!", "Không thể tải chi tiết sản phẩm.", "error");
      setIsDetailModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedVariant(null);
  };

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  // Tính toán stats cho Catalog
  const stats = useMemo(() => {
    return {
      totalUnits: variants.length,
      lowStock: 0,
      inTransit: 0,
      deliveredThisMonth: 0
    };
  }, [variants]);

  return (
    <div className="p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
              <FiLayers size={28} />
            </div>
            Danh mục Sản phẩm
          </h1>
          <p className="text-slate-500 font-medium italic">Khám phá và so sánh các dòng xe điện cao cấp của VoltNexus</p>
        </div>
      </div>

      <DealerStatsGrid stats={stats} />

      {/* Modern Filter Bar */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-8 flex flex-wrap gap-6 items-end animate-in slide-in-from-top-4 duration-500 delay-200 fill-mode-both">
        <div className="flex-1 min-w-[240px]">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
            <FiTrendingUp className="text-blue-500" /> Sắp xếp theo
          </label>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(0); }}
              className="w-full pl-4 pr-10 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="vehicleModel.modelName,asc">Tên Model: A → Z</option>
              <option value="vehicleModel.modelName,desc">Tên Model: Z → A</option>
              <option value="price,asc">Giá bán: Thấp đến Cao</option>
              <option value="price,desc">Giá bán: Cao đến Thấp</option>
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex-[1.5] min-w-[300px] flex gap-3">
          <div className="flex-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Giá từ ($)</label>
            <input
              type="number"
              placeholder="VD: 50.000"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Đến giá ($)</label>
            <input
              type="number"
              placeholder="VD: 150.000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <button
          onClick={() => { setPage(0); setHasNextPage(true); }}
          className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
        >
          <FiSearch size={18} />
          Lọc kết quả
        </button>
      </div>

      {isLoading && page === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center gap-6 text-slate-300">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="font-black text-sm uppercase tracking-widest animate-pulse">Đang nạp danh mục sản phẩm...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
          {variants.map((variant) => (
            <div key={variant.variantId} className="group relative">
              <ProductCard
                variant={variant}
                onCompareToggle={handleToggleCompare}
                onViewDetails={() => handleViewDetails(variant.variantId)}
                isSelected={compareItems.some(
                  (item) => item.variantId === variant.variantId
                )}
              />
              <div className="absolute top-4 left-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg">
                  <FiZap className="text-blue-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Infinite Scroll / Load More UI */}
      <div className="text-center mt-20 pb-32">
        {hasNextPage ? (
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="group relative px-12 py-5 bg-white border-2 border-slate-100 rounded-[32px] text-slate-900 font-black text-sm hover:border-blue-500 hover:text-blue-600 shadow-sm hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <FiLoader className="animate-spin text-blue-600" size={20} />
                <span>Đang tải thêm...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span>Xem thêm dòng sản phẩm</span>
                <FiChevronDown className="group-hover:translate-y-1 transition-transform" />
              </div>
            )}
          </button>
        ) : variants.length > 0 && (
          <div className="flex flex-col items-center gap-2 text-slate-300">
            <div className="h-px w-24 bg-slate-100"></div>
            <p className="text-xs font-black uppercase tracking-[0.3em]">Hết danh mục</p>
          </div>
        )}
      </div>

      <VariantDetailsModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        variant={selectedVariant}
        isLoading={isLoadingDetail}
      />

      <CompareTray
        items={compareItems}
        onSubmit={handleCompareSubmit}
        onRemove={handleToggleCompare}
        isLoading={isLoadingCompare}
      />

      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        data={compareData}
      />
    </div>
  );
};

export default DealerProductCatalogPage;
