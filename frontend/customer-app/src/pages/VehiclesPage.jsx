import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import VehicleGrid from "../components/home/VehicleGrid";
import VehicleFilterSidebar from "../components/vehicles/VehicleFilterSidebar";
import { searchVehicles, getVehicles } from "../services/vehicleService";
import { toast } from "react-toastify";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function VehiclesPage() {
  const [filters, setFilters] = useState({
    minPrice: null,
    maxPrice: null,
    brands: [],
    minRange: null,
    maxRange: null,
    colors: [],
    status: null,
    page: 0,
    size: 12,
    sort: null // No default sort, let backend use its default
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearchTerm]);

  // Check if we have active filters (including sort selection)
  const hasActiveFilters = useMemo(() => {
    return !!(
      searchTerm ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.minRange ||
      filters.maxRange ||
      filters.brands.length > 0 ||
      filters.colors.length > 0 ||
      filters.status ||
      filters.sort // Any sort selection is considered an active filter
    );
  }, [filters, searchTerm]);

  // Convert filters to API parameters
  const searchParams = useMemo(() => {
    const params = {
      page: filters.page,
      size: filters.size,
    };

    // Only add sort parameters if sort is selected
    if (filters.sort) {
      const [sortField, sortDirection] = filters.sort.split(',');
      params.sortBy = sortField === 'price' ? 'basePrice' :
        sortField === 'rangeKm' ? 'baseRangeKm' :
          sortField === 'motorPower' ? 'motorPower' : 'modelName';
      params.direction = sortDirection?.toUpperCase() || 'ASC';
    }

    if (searchTerm) params.keyword = searchTerm;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.minRange) params.minRange = filters.minRange;
    if (filters.maxRange) params.maxRange = filters.maxRange;
    if (filters.status) params.status = filters.status;

    return params;
  }, [filters, searchTerm]);

  // Fetch vehicles with filters
  const { data: vehiclesData, isLoading, error, refetch } = useQuery({
    queryKey: ['vehicles', searchParams, hasActiveFilters],
    queryFn: async () => {
      try {
        if (hasActiveFilters) {
          // Use searchVehicles when filters are active
          const response = await searchVehicles(searchParams);
          return response.data || { content: [], totalElements: 0 };
        } else {
          // Use getVehicles without sort parameter (backend doesn't support 'price,asc' format)
          // Backend will use default sorting
          const response = await getVehicles(filters.page, filters.size, null);
          return response.data || { content: [], totalElements: 0 };
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        toast.error("Không thể tải danh sách xe");
        return { content: [], totalElements: 0 };
      }
    },
  });

  const vehicles = vehiclesData?.content || [];
  const totalVehicles = vehiclesData?.totalElements || 0;
  const totalPages = vehiclesData?.totalPages || 0;

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 0 }));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setFilters(prev => ({ ...prev, page: 0 }));
  };

  const handleSortChange = (sortValue) => {
    setFilters(prev => ({ ...prev, sort: sortValue, page: 0 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      minPrice: null,
      maxPrice: null,
      brands: [],
      minRange: null,
      maxRange: null,
      colors: [],
      status: null,
      page: 0,
      size: 12,
      sort: null
    });
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">Khám phá Xe Điện</h1>
          <p className="text-lg text-blue-100">
            Tìm kiếm và so sánh các mẫu xe điện hiện đại nhất
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              🌍 Thân thiện môi trường
            </span>
            <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              ⚡ Hiệu suất cao
            </span>
            <span className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              💸 Tiết kiệm chi phí
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên xe, hãng xe..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {localSearchTerm && (
                  <button
                    onClick={() => setLocalSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                {localSearchTerm && localSearchTerm !== searchTerm && (
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Sort */}
            <div className="md:w-64">
              <select
                value={filters.sort || ""}
                onChange={(e) => handleSortChange(e.target.value || null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
              >
                <option value="">Sắp xếp mặc định</option>
                <option value="price,asc">Giá: Thấp → Cao</option>
                <option value="price,desc">Giá: Cao → Thấp</option>
                <option value="rangeKm,desc">Phạm vi: Xa nhất</option>
                <option value="motorPower,desc">Công suất: Mạnh nhất</option>
              </select>
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md font-medium"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {showFilters ? 'Ẩn bộ lọc' : 'Hiển thị bộ lọc'}
              {hasActiveFilters && (
                <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs">
                  {[searchTerm, filters.minPrice, filters.maxPrice, filters.minRange, filters.maxRange, ...filters.colors].filter(v => v).length}
                </span>
              )}
            </button>
          </div>

          {/* Active Filters Display */}
          {(filters.colors.length > 0 || filters.minPrice || filters.maxPrice || filters.minRange || filters.maxRange || filters.status) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Bộ lọc đang áp dụng:</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 hover:bg-red-50 px-3 py-1 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                  Xóa tất cả
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm flex items-center gap-2 shadow-sm">
                    🔍 {searchTerm}
                  </span>
                )}
                {filters.colors.map(color => (
                  <span key={color} className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-sm shadow-sm">
                    🎨 {color}
                  </span>
                ))}
                {(filters.minPrice || filters.maxPrice) && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-sm shadow-sm">
                    💰 {filters.minPrice?.toLocaleString('vi-VN') || '0'} - {filters.maxPrice?.toLocaleString('vi-VN') || '∞'} VNĐ
                  </span>
                )}
                {(filters.minRange || filters.maxRange) && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-sm shadow-sm">
                    🔋 {filters.minRange || '0'} - {filters.maxRange || '∞'} km
                  </span>
                )}
                {filters.status && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full text-sm shadow-sm">
                    {filters.status === 'AVAILABLE' ? '✅' : '❌'} {filters.status === 'AVAILABLE' ? 'Còn hàng' : 'Ngừng sản xuất'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block md:w-64 flex-shrink-0`}>
            <VehicleFilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </aside>

          {/* Vehicle Grid */}
          <main className="flex-1">
            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-gray-700 flex items-center gap-2">
                <span className="text-2xl"></span>
                Tìm thấy <span className="font-bold text-blue-600 text-lg">{totalVehicles}</span> xe điện
                {hasActiveFilters && <span className="text-sm text-gray-500">(đang lọc)</span>}
              </p>
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Đang tải...
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-20">
                <p className="text-red-600 mb-4">Đã xảy ra lỗi khi tải dữ liệu</p>
                <button
                  onClick={() => refetch()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && vehicles.length === 0 && (
              <div className="text-center py-20">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xl text-gray-600 mb-2">Không tìm thấy xe nào</p>
                <p className="text-gray-500 mb-4">Thử điều chỉnh bộ lọc hoặc tìm kiếm của bạn</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {/* Vehicle Grid */}
            {!isLoading && vehicles.length > 0 && (
              <>
                <VehicleGrid vehicles={vehicles} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={filters.page === 0}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Trước
                      </button>

                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handlePageChange(index)}
                          className={`px-4 py-2 border rounded-lg transition-colors ${filters.page === index
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          {index + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={filters.page >= totalPages - 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Sau
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div >
  );
}
