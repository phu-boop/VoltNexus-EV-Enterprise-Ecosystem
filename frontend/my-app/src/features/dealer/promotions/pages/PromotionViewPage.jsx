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

  // Lọc khuyến mãi theo dealerId và status
  useEffect(() => {
    if (currentDealerId && promotions && promotions.length > 0) {
      const filtered = promotions.filter((promotion) => {
        try {
          const dealerIds = promotion.applicableDealers || [];

          const isForThisDealer = dealerIds.includes(currentDealerId);
          const isStatusValid = promotion.status === "ACTIVE" || promotion.status === "NEAR" || promotion.status === "UPCOMING";

          return isForThisDealer && isStatusValid;
        } catch (error) {
          return false;
        }
      });

      setFilteredPromotions(filtered);
    } else {
      setFilteredPromotions([]);
    }
  }, [promotions, currentDealerId]);

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
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            <div className="inline-flex items-center justify-center w-15 h-15 mr-5 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl shadow-sm border border-blue-200/50 mb-6">
              <GiftIcon className="h-10 w-10 text-blue-600" />
            </div>
            Ưu Đãi & Khuyến Mãi
          </h1>
          {currentDealerId && (
            <p className="text-gray-600 text-sm">
              Hiển thị khuyến mãi cho đại lý của bạn
            </p>
          )}
        </div>

        {/* Filter Section */}
        <PromotionFilter
          selectedFilter={filter}
          onFilterChange={setFilter}
          activePromotionsCount={activePromotionsCountFiltered}
          upcomingPromotionsCount={upcomingPromotionsCountFiltered} // Đã đổi từ upcomingPromotionsCount sang NEAR
          totalCount={filteredPromotions.length}
        />
        {/* Refresh and Info Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>Đang hoạt động: {activePromotionsCountFiltered}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Sắp diễn ra: {upcomingPromotionsCountFiltered}</span>
            </div>
            {lastUpdated && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Cập nhật: {formatLastUpdated(lastUpdated)}</span>
              </div>
            )}
          </div>

          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center px-5 py-3 bg-white border border-gray-200 rounded-2xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 disabled:opacity-50 shadow-sm"
          >
            <ArrowPathIcon
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            <span className="text-sm font-medium">
              {loading ? "Đang tải..." : "Làm mới"}
            </span>
          </button>
        </div>

        {/* Promotions Grid */}
        <PromotionGrid
          promotions={filteredPromotions}
          onViewDetails={handleViewDetails}
          loading={loading}
        />

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
