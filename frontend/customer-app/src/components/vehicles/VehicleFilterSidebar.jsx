import { useState, useEffect } from "react";

export default function VehicleFilterSidebar({ filters, onFilterChange, onClearFilters }) {
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || '',
    max: filters.maxPrice || ''
  });

  const [rangeKm, setRangeKm] = useState({
    min: filters.minRange || '',
    max: filters.maxRange || ''
  });

  // Quick price filter presets (in VNĐ)
  const quickPriceRanges = [
    { label: "< 500 triệu", min: null, max: 500000000 },
    { label: "500 - 800 triệu", min: 500000000, max: 800000000 },
    { label: "800 - 1.2 tỷ", min: 800000000, max: 1200000000 },
    { label: "> 1.2 tỷ", min: 1200000000, max: null },
  ];

  // Quick range presets (in km)
  const quickRangePresets = [
    { label: "< 300 km", min: null, max: 300 },
    { label: "300 - 450 km", min: 300, max: 450 },
    { label: "450 - 600 km", min: 450, max: 600 },
    { label: "> 600 km", min: 600, max: null },
  ];

  // Sync local state with filters
  useEffect(() => {
    setPriceRange({
      min: filters.minPrice || '',
      max: filters.maxPrice || ''
    });
  }, [filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    setRangeKm({
      min: filters.minRange || '',
      max: filters.maxRange || ''
    });
  }, [filters.minRange, filters.maxRange]);

  const colors = ["Đen", "Trắng", "Xám", "Đỏ", "Xanh", "Bạc", "Nâu"];

  const handleColorToggle = (color) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    onFilterChange({ colors: newColors });
  };

  const handlePriceChange = () => {
    onFilterChange({
      minPrice: priceRange.min ? parseInt(priceRange.min) : null,
      maxPrice: priceRange.max ? parseInt(priceRange.max) : null
    });
  };

  const handleRangeChange = () => {
    onFilterChange({
      minRange: rangeKm.min ? parseInt(rangeKm.min) : null,
      maxRange: rangeKm.max ? parseInt(rangeKm.max) : null
    });
  };

  const handleStatusChange = (status) => {
    onFilterChange({ status: status === filters.status ? null : status });
  };

  const applyQuickPrice = (min, max) => {
    setPriceRange({ min: min || '', max: max || '' });
    onFilterChange({ minPrice: min, maxPrice: max });
  };

  const applyQuickRange = (min, max) => {
    setRangeKm({ min: min || '', max: max || '' });
    onFilterChange({ minRange: min, maxRange: max });
  };

  const isQuickPriceActive = (min, max) => {
    return filters.minPrice === min && filters.maxPrice === max;
  };

  const isQuickRangeActive = (min, max) => {
    return filters.minRange === min && filters.maxRange === max;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Bộ lọc</h2>
        <button
          onClick={onClearFilters}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Xóa tất cả
        </button>
      </div>

      <div className="space-y-6">
        {/* Price Range */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            Khoảng giá
          </h3>
          
          {/* Quick Price Filters */}
          <div className="mb-3 space-y-1">
            {quickPriceRanges.map((range, idx) => (
              <button
                key={idx}
                onClick={() => applyQuickPrice(range.min, range.max)}
                className={`w-full px-3 py-2 text-sm text-left rounded-lg border transition-all ${
                  isQuickPriceActive(range.min, range.max)
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Custom Price Range */}
          <div className="space-y-2">
            <div className="text-xs text-gray-500 font-medium mb-1">Hoặc nhập tùy chỉnh (VNĐ):</div>
            <input
              type="number"
              placeholder="Giá tối thiểu"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              onBlur={handlePriceChange}
              onKeyPress={(e) => e.key === 'Enter' && handlePriceChange()}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Giá tối đa"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              onBlur={handlePriceChange}
              onKeyPress={(e) => e.key === 'Enter' && handlePriceChange()}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Range (km) Filter */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
             Phạm vi hoạt động
          </h3>
          
          {/* Quick Range Filters */}
          <div className="mb-3 space-y-1">
            {quickRangePresets.map((range, idx) => (
              <button
                key={idx}
                onClick={() => applyQuickRange(range.min, range.max)}
                className={`w-full px-3 py-2 text-sm text-left rounded-lg border transition-all ${
                  isQuickRangeActive(range.min, range.max)
                    ? 'bg-green-600 text-white border-green-600 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Custom Range */}
          <div className="space-y-2">
            <div className="text-xs text-gray-500 font-medium mb-1">Hoặc nhập tùy chỉnh (km):</div>
            <input
              type="number"
              placeholder="Tối thiểu"
              value={rangeKm.min}
              onChange={(e) => setRangeKm(prev => ({ ...prev, min: e.target.value }))}
              onBlur={handleRangeChange}
              onKeyPress={(e) => e.key === 'Enter' && handleRangeChange()}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Tối đa"
              value={rangeKm.max}
              onChange={(e) => setRangeKm(prev => ({ ...prev, max: e.target.value }))}
              onBlur={handleRangeChange}
              onKeyPress={(e) => e.key === 'Enter' && handleRangeChange()}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        
        
      </div>
    </div>
  );
}
