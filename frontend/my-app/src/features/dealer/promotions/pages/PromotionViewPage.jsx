// features/customer/promotions/pages/PromotionViewPage.js
import React, { useState, useEffect } from "react";
import { useCustomerPromotions } from "../hooks/useCustomerPromotions";
import PromotionFilter from "../components/PromotionFilter";
import PromotionGrid from "../components/PromotionGrid";
import PromotionDetailsModal from "./PromotionDetailsModal";
import { GiftIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export const PromotionViewPage = () => {
  const [currentDealerId, setCurrentDealerId] = useState(null);
  const [filteredPromotions, setFilteredPromotions] = useState([]);

  useEffect(() => {
    // Lấy dealerId từ sessionStorage khi component mount
    const dealerId = sessionStorage.getItem("dealerId");

    setCurrentDealerId(dealerId);
  }, []);

  const {
    promotions,
    loading,
    error,
    filter,
    setFilter,
    activePromotionsCount,
    upcomingPromotionsCount,
    refresh,
    lastUpdated,
    getDealersByIds,
    getModelsByIds,
  } = useCustomerPromotions();

  // Backend đã lọc sẵn theo dealerId và status (ACTIVE/NEAR)
  useEffect(() => {
    if (promotions && promotions.length > 0) {
      setFilteredPromotions(promotions);
    } else {
      setFilteredPromotions([]);
    }
  }, [promotions]);

  // Tính toán lại số lượng khuyến mãi sau khi lọc
  const activePromotionsCountFiltered = filteredPromotions.filter(
    (p) => p.status === "ACTIVE"
  ).length;
  const upcomingPromotionsCountFiltered = filteredPromotions.filter(
    (p) => p.status === "NEAR"
  ).length;

  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (promotion) => {
    setSelectedPromotion(promotion);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPromotion(null);
  };

  const formatLastUpdated = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100 p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-200/50">
            <div className="text-2xl">😔</div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Đã có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">{error}</p>
          <button
            onClick={refresh}
            className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-3 rounded-2xl font-medium hover:from-slate-700 hover:to-slate-800 transition-all duration-300 shadow-sm"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo nếu chưa có dealerId
  if (!currentDealerId && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100 p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-200/50">
            <div className="text-2xl">🔒</div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Không có quyền truy cập
          </h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            Không tìm thấy thông tin đại lý. Vui lòng đăng nhập lại.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="relative mb-12">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
              <GiftIcon className="h-8 w-8 text-blue-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
              Ưu Đãi & Khuyến Mãi
            </h1>
            {currentDealerId && (
              <div className="flex items-center text-gray-500 text-sm font-medium">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                Dành riêng cho đại lý của bạn
              </div>
            )}
          </div>
        </div>

        {/* Filter & Actions Bar */}
        <div className="flex flex-col space-y-6">
          <PromotionFilter
            selectedFilter={filter}
            onFilterChange={setFilter}
            activePromotionsCount={activePromotionsCountFiltered}
            upcomingPromotionsCount={upcomingPromotionsCountFiltered}
            totalCount={filteredPromotions.length}
          />
          {/* Status and Refresh Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-sm"></span>
                <span className="font-medium text-gray-600">Đang chạy: {activePromotionsCountFiltered}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full shadow-sm"></span>
                <span className="font-medium text-gray-600">Sắp tới: {upcomingPromotionsCountFiltered}</span>
              </div>
              {lastUpdated && (
                <div className="hidden sm:flex items-center text-xs text-gray-400 border-l border-gray-200 pl-6">
                  Cập nhật: {formatLastUpdated(lastUpdated)}
                </div>
              )}
            </div>

            <button
              onClick={refresh}
              disabled={loading}
              className="group flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300 disabled:opacity-50 shadow-sm overflow-hidden relative"
            >
              <ArrowPathIcon
                className={`h-4 w-4 mr-2 transition-transform duration-500 ${loading ? "animate-spin" : "group-hover:rotate-180"}`}
              />
              <span className="text-sm font-semibold whitespace-nowrap">
                {loading ? "Đang cập nhật..." : "Làm mới dữ liệu"}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-10">
          {/* Promotions Grid */}
          <PromotionGrid
            promotions={filteredPromotions}
            onViewDetails={handleViewDetails}
            loading={loading}
          />
        </div>

        {/* Empty State */}
        {!loading && filteredPromotions.length === 0 && currentDealerId && (
          <div className="flex justify-center items-center py-16 px-4">
            <div className="text-center max-w-md">
              <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-200">
                <div className="text-4xl">🎯</div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {filter === "ACTIVE"
                    ? "Chưa có ưu đãi đang diễn ra"
                    : "Chưa có ưu đãi sắp tới"}
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {filter === "ACTIVE"
                    ? "Hiện tại đại lý của bạn không có chương trình ưu đãi nào đang hoạt động."
                    : "Đại lý của bạn chưa có ưu đãi nào sắp diễn ra."}
                </p>

                {filter !== "ACTIVE" && (
                  <button
                    onClick={() => setFilter("ACTIVE")}
                    className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-3 rounded-2xl font-medium hover:from-slate-700 hover:to-slate-800 transition-all duration-300 shadow-sm text-sm"
                  >
                    Xem ưu đãi đang hoạt động
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal chi tiết */}
        <PromotionDetailsModal
          promotion={selectedPromotion}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          getDealersByIds={getDealersByIds}
          getModelsByIds={getModelsByIds}
        />
      </div>
    </div>
  );
};

export default PromotionViewPage;
