// features/customer/promotions/components/PromotionFilter.js
import React from 'react';
import { FunnelIcon } from '@heroicons/react/24/outline';

const filterOptions = [
  { 
    value: 'ACTIVE', 
    label: 'Đang diễn ra'
  },
  { 
    value: 'NEAR', 
    label: 'Sắp diễn ra'
  },
];

export const PromotionFilter = ({ 
  selectedFilter, 
  onFilterChange, 
  activePromotionsCount, 
  upcomingPromotionsCount,
  totalCount 
}) => {
  const getCount = (filterValue) => {
    switch (filterValue) {
      case 'ACTIVE': return activePromotionsCount;
      case 'NEAR': return upcomingPromotionsCount;
      default: return 0;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Header Section */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg border">
            <FunnelIcon className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Lọc khuyến mãi</h2>
            <p className="text-gray-500 text-sm">Chọn loại ưu đãi bạn muốn xem</p>
          </div>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3">
          {filterOptions.map((filter) => {
            const count = getCount(filter.value);
            const isSelected = selectedFilter === filter.value;
            
            return (
              <button
                key={filter.value}
                onClick={() => onFilterChange(filter.value)}
                className={`px-4 py-2 rounded border transition-colors min-w-[120px] ${
                  isSelected
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="font-medium text-sm">
                    {filter.label}
                  </span>
                  <span className="text-xs mt-1">
                    {count} ưu đãi
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Đang hoạt động:</span>
              <span className="font-semibold">{activePromotionsCount}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">Sắp diễn ra:</span>
              <span className="font-semibold">{upcomingPromotionsCount}</span>
            </div>
          </div>
          
          <div className="sm:ml-auto">
            <span className="text-gray-500">
              Tổng cộng: <strong className="text-gray-700">{totalCount}</strong> ưu đãi
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionFilter;