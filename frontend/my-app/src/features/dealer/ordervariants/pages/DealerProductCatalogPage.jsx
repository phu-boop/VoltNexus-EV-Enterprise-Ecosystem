import React, { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../../../auth/AuthProvider";
import { FiEye, FiLoader, FiFilter } from "react-icons/fi";
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

const fetchVariantsFromAPI = async (page, params) => {
  const apiParams = {
    ...params, // Sẽ chứa: sort, minPrice, maxPrice
    page: page,
    size: 10,
  };

  // Xóa các giá trị rỗng để không gửi lên backend
  if (!apiParams.minPrice) delete apiParams.minPrice;
  if (!apiParams.maxPrice) delete apiParams.maxPrice;

  const response = await getAllVariantsPaginated(apiParams);
  return response.data.data;
};

const DealerProductCatalogPage = () => {
  const [variants, setVariants] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { userData } = useAuthContext(); // Lấy thông tin user (để lấy dealerId)

  // State cho chức năng so sánh
  const [compareItems, setCompareItems] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareData, setCompareData] = useState([]);
  const [isLoadingCompare, setIsLoadingCompare] = useState(false);

  // State cho phiên bản chi tiết
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  // State cho sắp xếp và lọc giá
  const [sort, setSort] = useState("vehicleModel.modelName,asc"); // Sắp xếp mặc định
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const loadData = useCallback(
    async (loadPage, isFilterChange = false) => {
      setIsLoading(true);
      try {
        const params = { sort, minPrice, maxPrice };
        const pageData = await fetchVariantsFromAPI(loadPage, params);

        if (isFilterChange) {
          // Nếu là do đổi bộ lọc, ta phải *thay thế* danh sách cũ
          setVariants(pageData.content);
        } else {
          // Nếu là "Xem thêm" (loadPage > 0), ta *nối* vào danh sách
          setVariants((prevVariants) => [...prevVariants, ...pageData.content]);
        }

        setHasNextPage(!pageData.last);
      } catch (error) {
        console.error("Failed to fetch variants:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [page, sort, minPrice, maxPrice]
  );

  // useEffect để xử lý "load more"
  useEffect(() => {
    // Chỉ chạy khi page > 0 (nghĩa là bấm "Xem thêm")
    if (page > 0) {
      loadData(page, false);
    }
  }, [page]);

  // useEffect để xử lý khi filter thay đổi
  useEffect(() => {
    loadData(0, true);
  }, [sort, minPrice, maxPrice]);

  // Xử lý thêm/bớt xe khỏi khay so sánh
  const handleToggleCompare = (variant) => {
    setCompareItems((prevItems) => {
      const isSelected = prevItems.some(
        (item) => item.variantId === variant.variantId
      );

      if (isSelected) {
        return prevItems.filter((item) => item.variantId !== variant.variantId);
      } else {
        if (prevItems.length >= 3) {
          // Giới hạn 3 xe
          Swal.fire(
            "Thông báo",
            "Chỉ có thể so sánh tối đa 3 sản phẩm.",
            "warning"
          );
          return prevItems;
        }
        return [...prevItems, variant];
      }
    });
  };

  // Xử lý gọi API khi bấm nút "So sánh"
  const handleCompareSubmit = async () => {
    if (compareItems.length < 2) {
      Swal.fire("Thông báo", "Cần chọn ít nhất 2 sản phẩm để so sánh.", "info");
      return;
    }

    if (!userData || !userData.memberId) {
      console.error(
        "Lỗi: Không tìm thấy thông tin user hoặc profileId.",
        userData
      );
      Swal.fire(
        "Lỗi!",
        "Lỗi thông tin người dùng. Vui lòng thử đăng nhập lại.",
        "error"
      );
      setIsLoadingCompare(false);
      return;
    }

    setIsLoadingCompare(true);
    try {
      const variantIds = compareItems.map((item) => item.variantId);
      const dealerId = userData.memberId; // Dòng này bây giờ đã an toàn

      const response = await getComparisonDetails(variantIds, dealerId);

      setCompareData(response.data.data);
      setIsCompareModalOpen(true);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu so sánh:", error);
      Swal.fire(
        "Lỗi!",
        "Không thể tải dữ liệu so sánh. Vui lòng thử lại.",
        "error"
      );
    } finally {
      setIsLoadingCompare(false);
    }
  };

  const handleViewDetails = async (variantId) => {
    setIsLoadingDetail(true);
    setIsDetailModalOpen(true); // Mở modal ngay (để hiện loading)
    try {
      const response = await getVariantDetails(variantId);
      setSelectedVariant(response.data.data); // Tải dữ liệu chi tiết
    } catch (error) {
      console.error("Lỗi khi tải chi tiết xe:", error);
      Swal.fire("Lỗi!", "Không thể tải chi tiết sản phẩm.", "error");
      setIsDetailModalOpen(false); // Đóng modal nếu lỗi
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedVariant(null); // Xóa dữ liệu cũ khi đóng
  };

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(0);
    setHasNextPage(true);
  };

  const handleApplyPriceFilter = () => {
    setPage(0);
    setHasNextPage(true);
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Danh mục Sản phẩm</h1>

      {/* THÊM: Thanh Lọc và Sắp xếp */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-end">
        <FiFilter className="text-2xl text-gray-600" />

        {/* Sắp xếp */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700">
            Sắp xếp
          </label>
          <select
            value={sort}
            onChange={handleSortChange}
            className="p-2 border rounded-lg w-full"
          >
            <option value="vehicleModel.modelName,asc">Tên A-Z</option>
            <option value="vehicleModel.modelName,desc">Tên Z-A</option>
            <option value="price,asc">Giá: Thấp đến Cao</option>
            <option value="price,desc">Giá: Cao đến Thấp</option>
          </select>
        </div>

        {/* Lọc giá */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700">
            Giá từ
          </label>
          <input
            type="number"
            placeholder="VD: 50000"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="p-2 border rounded-lg w-full"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700">
            Đến giá
          </label>
          <input
            type="number"
            placeholder="VD: 100000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="p-2 border rounded-lg w-full"
          />
        </div>

        {/* Nút Áp dụng (chỉ cần reset page) */}
        <button
          onClick={handleApplyPriceFilter}
          className="p-2 bg-blue-600 text-white rounded-lg"
        >
          Áp dụng
        </button>
      </div>

      {isLoading && page === 0 ? (
        <p>Đang tải danh sách xe...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {variants.map((variant) => (
            <ProductCard
              key={variant.variantId}
              variant={variant}
              onCompareToggle={handleToggleCompare}
              onViewDetails={() => handleViewDetails(variant.variantId)}
              isSelected={compareItems.some(
                (item) => item.variantId === variant.variantId
              )}
            />
          ))}
        </div>
      )}

      <div className="text-center mt-8">
        {/* Chỉ hiện nút nếu còn trang tiếp theo */}
        {hasNextPage && (
          <button
            onClick={handleLoadMore}
            disabled={isLoading} // Vô hiệu hóa khi đang tải
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg disabled:bg-gray-400 flex items-center gap-2 mx-auto"
          >
            {isLoading ? (
              <>
                <FiLoader className="animate-spin" />{" "}
                {/* Icon quay từ CompareTray */}
                Đang tải...
              </>
            ) : (
              "Xem thêm"
            )}
          </button>
        )}

        {/* Báo khi đã hết sản phẩm */}
        {!hasNextPage && variants.length > 0 && (
          <p className="text-gray-500">Đã hết sản phẩm.</p>
        )}
      </div>

      <VariantDetailsModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        variant={selectedVariant} // Dữ liệu chi tiết
        isLoading={isLoadingDetail}
      />

      <CompareTray
        items={compareItems}
        onSubmit={handleCompareSubmit}
        onRemove={handleToggleCompare} // Dùng lại hàm toggle để remove
        isLoading={isLoadingCompare}
      />

      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        data={compareData}
      />

      <div className="h-24"></div>
    </div>
  );
};

export default DealerProductCatalogPage;
