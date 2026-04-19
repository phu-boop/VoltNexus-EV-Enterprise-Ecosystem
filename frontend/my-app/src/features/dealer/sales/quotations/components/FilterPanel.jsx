import React, { useState } from 'react';
import { XMarkIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const FilterPanel = ({ filters, onApply, onClear, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'DRAFT', label: 'Bản nháp' },
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'SENT', label: 'Đã gửi' },
    { value: 'ACCEPTED', label: 'Đã chấp nhận' },
    { value: 'COMPLETE', label: 'Hoàn thành' },
    { value: 'REJECTED', label: 'Từ chối' },
    { value: 'EXPIRED', label: 'Hết hạn' }
  ];

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      status: '',
      customer: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    };
    setLocalFilters(clearedFilters);
    onClear();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 animate-in slide-in-from-top duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-gray-800">Bộ lọc</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors duration-200"
        >
          <XMarkIcon className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Trạng thái
          </label>
          <select
            value={localFilters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-white transition-all duration-200"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Từ ngày
          </label>
          <div className="relative">
            <CalendarDaysIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="date"
              value={localFilters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-white transition-all duration-200"
            />
          </div>
        </div>

        {/* Date To */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Đến ngày
          </label>
          <div className="relative">
            <CalendarDaysIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="date"
              value={localFilters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-white transition-all duration-200"
            />
          </div>
        </div>

        {/* Customer Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Khách hàng
          </label>
          <input
            type="text"
            value={localFilters.customer}
            onChange={(e) => handleFilterChange('customer', e.target.value)}
            placeholder="ID khách hàng..."
            className="w-full px-2 py-1.5 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-white transition-all duration-200"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={handleClear}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
        >
          Xóa bộ lọc
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            Hủy
          </button>
          <button
            onClick={handleApply}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;