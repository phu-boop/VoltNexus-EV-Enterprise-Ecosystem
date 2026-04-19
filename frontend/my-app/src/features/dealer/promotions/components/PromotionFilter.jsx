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
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-2">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Header Section */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-50/50 rounded-2xl border border-blue-100">
            <FunnelIcon className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bộ lọc ưu đãi</h2>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Khám phá các chương trình hiện hành</p>
          </div>
        </div>

        {/* Filter Tabs (Segmented Control) */}
        <div className="flex p-1.5 bg-gray-50 rounded-2xl border border-gray-100 w-fit self-center md:self-auto">
          {filterOptions.map((filter) => {
            const count = getCount(filter.value);
            const isSelected = selectedFilter === filter.value;

            return (
              <button
                key={filter.value}
                onClick={() => onFilterChange(filter.value)}
                className={`relative px-6 py-2.5 rounded-xl transition-all duration-300 min-w-[140px] flex flex-col items-center group ${isSelected
                  ? 'bg-white shadow-md border border-gray-100'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <span className={`text-sm font-bold ${isSelected ? 'text-blue-600' : 'text-gray-500Group-hover:text-gray-700'}`}>
                  {filter.label}
                </span>
                <span className="text-[10px] font-semibold mt-0.5 opacity-60">
                  {count} chương trình
                </span>
                {isSelected && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PromotionFilter;