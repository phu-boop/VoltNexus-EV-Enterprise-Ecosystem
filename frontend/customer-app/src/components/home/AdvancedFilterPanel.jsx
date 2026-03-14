import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

const AdvancedFilterPanel = ({ filters, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
      priceMin: "",
      priceMax: "",
      vehicleType: "",
      rangeMin: "",
      rangeMax: "",
      sortBy: "name",
    });
  };

  const hasActiveFilters = useMemo(() => {
    return !!(filters.search || filters.priceMin || filters.priceMax || 
              filters.rangeMin || filters.rangeMax || filters.vehicleType);
  }, [filters]);

  return (
    <div className="relative z-20 max-w-7xl mx-auto px-4 -mt-12 mb-12">
      <div className="bg-white rounded-2xl shadow-2xl shadow-blue-900/10 border border-gray-100 p-4">
        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 font-semibold text-gray-700"
          >
            <SlidersHorizontal className="w-5 h-5" />
            Bộ lọc {hasActiveFilters && <span className="text-blue-600">({[filters.search, filters.priceMin, filters.priceMax, filters.rangeMin, filters.rangeMax, filters.vehicleType].filter(v => v).length})</span>}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm xe điện..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${isOpen ? "block" : "hidden lg:grid"}`}>
          {/* Price Range */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Mức giá (triệu VNĐ)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Từ"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange("priceMin", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Đến"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange("priceMax", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Loại xe
            </label>
            <select
              value={filters.vehicleType}
              onChange={(e) => handleFilterChange("vehicleType", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="suv">SUV</option>
              <option value="sedan">Sedan</option>
              <option value="hatchback">Hatchback</option>
            </select>
          </div>

          {/* Range */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Quãng đường (km)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Từ"
                value={filters.rangeMin}
                onChange={(e) => handleFilterChange("rangeMin", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Đến"
                value={filters.rangeMax}
                onChange={(e) => handleFilterChange("rangeMax", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Sắp xếp
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Tên A-Z</option>
              <option value="price-low">Giá thấp → cao</option>
              <option value="price-high">Giá cao → thấp</option>
              <option value="range">Quãng đường</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
            {filters.search && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                Tìm: {filters.search}
                <button
                  onClick={() => handleFilterChange("search", "")}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(filters.priceMin || filters.priceMax) && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                Giá: {filters.priceMin || "0"} - {filters.priceMax || "∞"} triệu
                <button
                  onClick={() => {
                    handleFilterChange("priceMin", "");
                    handleFilterChange("priceMax", "");
                  }}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(filters.rangeMin || filters.rangeMax) && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                Quãng đường: {filters.rangeMin || "0"} - {filters.rangeMax || "∞"} km
                <button
                  onClick={() => {
                    handleFilterChange("rangeMin", "");
                    handleFilterChange("rangeMax", "");
                  }}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFilterPanel;
