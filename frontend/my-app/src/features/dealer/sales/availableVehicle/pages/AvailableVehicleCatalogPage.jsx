import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// Giả sử bạn import AuthProvider từ vị trí đúng
import { useAuthContext } from "../../../../auth/AuthProvider";
import { FiSearch, FiLoader, FiAlertTriangle } from "react-icons/fi";
import { useAvailableVehicles } from "../hooks/useAvailableVehicles";
import { useVehicleDetails } from "../hooks/useVehicleDetails";

import AvailableVehicleCard from "../components/AvailableVehicleCard";
import VariantDetailsModal from "../../../../../components/common/detail/VariantDetailsModal";
import CompareTray from "../../../../../components/common/CompareTray";
import CompareModal from "../../../../../components/common/CompareModal";
import { useVehicleCompare } from "../hooks/useVehicleCompare";

const VEHICLES_PER_PAGE = 10;

const AvailableVehicleCatalogPage = () => {
  const navigate = useNavigate();
  const { userData } = useAuthContext() || {};

  const role = userData?.roles?.[0]?.name;

  // Hook lấy danh sách xe
  const { vehicles, isLoading, error, searchQuery, setSearchQuery } =
    useAvailableVehicles();

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

  // Reset số lượng hiển thị khi tìm kiếm thay đổi
  // (Chúng ta cần đợi hook `useAvailableVehicles` chạy xong,
  // nên logic reset sẽ dựa trên `isLoading`)
  useState(() => {
    if (!isLoading) {
      setVisibleCount(VEHICLES_PER_PAGE);
    }
  }, [isLoading, searchQuery]); // Reset khi hết loading hoặc query thay đổi

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
    // Thêm padding-bottom để CompareTray không che mất nội dung
    <div className="animate-in fade-in-0 duration-500 p-6 pb-32">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Xe Có Sẵn Để Bán
      </h1>

      {/* Thanh tìm kiếm  */}
      <div className="mb-6">
        <div className="relative max-w-lg">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Model, Phiên bản, Màu, hoặc SKU..."
            className="w-full p-3 pl-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Lưới sản phẩm */}
      {renderContent()}

      {/* Modal xem chi tiết  */}
      <VariantDetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        variant={variantDetails}
        isLoading={isDetailLoading}
      />

      {/* KHAY SO SÁNH */}
      <CompareTray
        items={selectedItems}
        onRemove={handleRemoveFromTray}
        onSubmit={handleSubmitCompare}
        isLoading={isCompareLoading}
      />

      {/* MODAL SO SÁNH */}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={handleCloseCompareModal}
        data={compareData}
      />
    </div>
  );
};

export default AvailableVehicleCatalogPage;
