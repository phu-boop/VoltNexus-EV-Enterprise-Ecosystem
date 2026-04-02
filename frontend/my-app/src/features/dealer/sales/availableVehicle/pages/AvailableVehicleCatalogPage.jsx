import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../../auth/AuthProvider";
import { useAvailableVehicles } from "../hooks/useAvailableVehicles";
import { useVehicleDetails } from "../hooks/useVehicleDetails";
import { useVehicleCompare } from "../hooks/useVehicleCompare";

import AvailableVehicleCard from "../components/AvailableVehicleCard";
import VariantDetailsModal from "../../../../../components/common/detail/VariantDetailsModal";
import CompareTray from "../../../../../components/common/CompareTray";
import CompareModal from "../../../../../components/common/CompareModal";
import VehicleFilters from "../components/VehicleFilters";
import { FiSearch, FiLoader, FiAlertTriangle, FiGrid, FiList, FiRefreshCw, FiChevronRight } from "react-icons/fi";

const VEHICLES_PER_PAGE = 10;

const AvailableVehicleCatalogPage = () => {
  const navigate = useNavigate();
  const { userData } = useAuthContext() || {};

  const role = userData?.roles?.[0]?.name;

  // Hook lấy danh sách xe
  const { 
    vehicles, 
    isLoading, 
    error, 
    searchQuery, 
    setSearchQuery,
    filters,
    setFilters
  } = useAvailableVehicles();

  const [visibleCount, setVisibleCount] = useState(VEHICLES_PER_PAGE);

  // Hook quản lý modal chi tiết
  const {
    variantDetails,
    isLoading: isDetailLoading,
    isModalOpen,
    openModal,
    closeModal,
  } = useVehicleDetails();

  // Quản lý chức năng so sánh
  const {
    selectedItems,
    compareData,
    isCompareModalOpen,
    isCompareLoading,
    compareError,
    handleCompareToggle,
    handleRemoveFromTray,
    handleSubmitCompare,
    handleCloseCompareModal,
    isCompared,
  } = useVehicleCompare();

  // Xử lý khi nhấn nút "Tạo Báo Giá"
  const handleCreateQuote = (variantId) => {
    const basePath =
      role === "DEALER_MANAGER" ? "/dealer/manager" : "/dealer/staff";
    if (!role) {
      console.error("Không thể xác định vai trò người dùng.");
      return;
    }
    navigate(`${basePath}/quotes/create`, {
      state: { selectedVariantId: variantId },
    });
  };

  // Chỉ hiển thị số lượng xe trong `visibleCount`
  const visibleVehicles = useMemo(() => {
    return vehicles.slice(0, visibleCount);
  }, [vehicles, visibleCount]);

  // Kiểm tra xem còn xe để tải thêm không
  const hasMoreVehicles = visibleCount < vehicles.length;

  // Hàm để tải thêm xe
  const loadMoreVehicles = () => {
    setVisibleCount((prevCount) => prevCount + VEHICLES_PER_PAGE);
  };

  // Xử lý khi nhấn "Xem Chi Tiết"
  const handleViewDetails = (variantId) => {
    openModal(variantId);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilters({
      brand: "",
      model: "",
      bodyType: "",
      minPrice: null,
      maxPrice: null,
      color: "",
    });
  };

  useState(() => {
    if (!isLoading) {
      setVisibleCount(VEHICLES_PER_PAGE);
    }
  }, [isLoading, searchQuery, filters]);

  const renderContent = () => {
    if (isLoading && vehicles.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <FiLoader className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-500 py-10">
          <FiAlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      );
    }

    if (vehicles.length === 0) {
      return (
        <p className="text-center text-gray-500 py-10">
          {searchQuery
            ? "Không tìm thấy xe nào phù hợp."
            : "Hiện không có xe nào sẵn sàng để bán."}
        </p>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* SỬ DỤNG `visibleVehicles` THAY VÌ `vehicles` */}
          {visibleVehicles.map((item) => (
            <AvailableVehicleCard
              key={item.variantId}
              vehicle={item}
              onViewDetails={handleViewDetails}
              onCreateQuote={handleCreateQuote}
              onCompareToggle={handleCompareToggle}
              isCompared={isCompared(item.variantId)}
            />
          ))}
        </div>

        {/* === NÚT XEM THÊM === */}
        <div className="mt-10 text-center">
          {/* Chỉ hiển thị nút khi còn xe để tải */}
          {hasMoreVehicles && (
            <button
              onClick={loadMoreVehicles}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center mx-auto"
            >
              Xem thêm{" "}
              {Math.min(VEHICLES_PER_PAGE, vehicles.length - visibleCount)} xe
            </button>
          )}

          {/* Hiển thị khi đã tải hết xe */}
          {!hasMoreVehicles && vehicles.length > VEHICLES_PER_PAGE && (
            <p className="text-gray-500">Bạn đã xem hết xe có sẵn.</p>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 pb-32 animate-in fade-in-0 duration-700">
      <div className="max-w-[1600px] mx-auto">
        {/* Breadcrumbs & Header */}
        <div className="mb-10">
          <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            <span className="hover:text-blue-500 cursor-pointer">Dealer</span>
            <FiChevronRight size={12} />
            <span className="hover:text-blue-500 cursor-pointer">Sales</span>
            <FiChevronRight size={12} />
            <span className="text-slate-800 italic underline decoration-blue-500 decoration-2 underline-offset-4">Available Vehicles</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2 italic">
                Catalog <span className="text-blue-600 font-extralight not-italic">Xe Sẵn Có</span>
              </h1>
              <p className="text-slate-500 font-medium">Khám phá và tư vấn bộ sưu tập xe đang có mặt tại kho.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                  {vehicles.length} sản phẩm <span className="text-slate-400 font-medium italic">đã tìm thấy</span>
                </span>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="p-3 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 transition-all hover:rotate-180 duration-500"
              >
                <FiRefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar FILTERS */}
          <aside className="w-full lg:w-80 shrink-0">
            <VehicleFilters 
              filters={filters} 
              setFilters={setFilters} 
              onReset={handleResetFilters} 
            />
          </aside>

          {/* Results Area */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="relative w-full md:max-w-md group">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm model, sku, đời xe..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                />
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                  <button className="p-2 bg-white text-blue-600 rounded-lg shadow-sm">
                    <FiGrid size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                    <FiList size={18} />
                  </button>
                </div>
                
                <select className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-slate-100 transition-all appearance-none cursor-pointer pr-10 relative">
                  <option>Mới nhất</option>
                  <option>Giá: Thấp đến Cao</option>
                  <option>Giá: Cao đến Thấp</option>
                </select>
              </div>
            </div>

            {/* Main Content Render */}
            <div className="min-h-[600px]">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>

      {/* Modal & Overlays */}
      <VariantDetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        variant={variantDetails}
        isLoading={isDetailLoading}
      />

      <CompareTray
        items={selectedItems}
        onRemove={handleRemoveFromTray}
        onSubmit={handleSubmitCompare}
        isLoading={isCompareLoading}
      />

      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={handleCloseCompareModal}
        data={compareData}
      />
    </div>
  );
};

export default AvailableVehicleCatalogPage;
