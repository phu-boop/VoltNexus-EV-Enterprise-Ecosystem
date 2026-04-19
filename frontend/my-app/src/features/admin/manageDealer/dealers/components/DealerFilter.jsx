import React, { useState } from 'react';
import {
  FiSearch,
  FiFilter,
  FiMap,
  FiActivity,
  FiChevronDown,
  FiChevronUp,
  FiXCircle,
  FiMapPin
} from 'react-icons/fi';

const DealerFilter = ({ filters, onFilterChange, onClearFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'ACTIVE', label: 'Đang hoạt động' },
    { value: 'SUSPENDED', label: 'Tạm ngừng' },
    { value: 'INACTIVE', label: 'Không hoạt động' },
  ];

  const hasActiveFilters = filters.search || filters.city || filters.status;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden transition-all duration-500">
      {/* Search Bar - Header */}
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Tìm theo tên, mã đại lý hoặc email..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-3xl text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center justify-center gap-2 px-6 py-4 rounded-3xl font-black text-[10px] tracking-widest uppercase transition-all flex-1 sm:flex-none ${isExpanded || hasActiveFilters
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-100'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
          >
            <FiFilter size={16} />
            Bộ lọc nâng cao
            {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </button>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="p-4 bg-rose-50 text-rose-500 rounded-3xl hover:bg-rose-100 transition-all shadow-sm active:scale-90"
              title="Xóa bộ lọc"
            >
              <FiXCircle size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Drawer */}
      <div
        className={`bg-slate-50 border-t border-slate-100 transition-all duration-500 ease-in-out px-4 sm:px-6 overflow-hidden ${isExpanded ? 'max-h-96 py-6 opacity-100' : 'max-h-0 py-0 opacity-0'
          }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          {/* City filter */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Thành phố / Tỉnh
            </label>
            <div className="relative group">
              <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={filters.city || ''}
                onChange={(e) => onFilterChange('city', e.target.value)}
                placeholder="Nhập tên địa phương..."
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Trạng thái vận hành
            </label>
            <div className="relative group">
              <FiActivity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
              <select
                value={filters.status || ''}
                onChange={(e) => onFilterChange('status', e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400 group-focus-within:text-blue-500">
                <FiChevronDown size={18} />
              </div>
            </div>
          </div>

          <div className="flex items-end">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 w-full flex items-center gap-3">
              <div className="p-2 bg-white text-blue-600 rounded-xl shadow-sm">
                <FiMap size={18} />
              </div>
              <p className="text-[10px] font-bold text-blue-700 leading-tight">
                Hệ thống tự động đồng bộ hóa kết quả dựa trên các thay đổi tức thời.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerFilter;