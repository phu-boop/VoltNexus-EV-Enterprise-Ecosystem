// features/admin/promotions/components/StatusFilter.js
import React from 'react';

const statusOptions = [
  { value: 'ALL', label: 'Tất cả', color: 'gray' },
  { value: 'DRAFT', label: 'Chờ xác thực', color: 'yellow' },
  { value: 'ACTIVE', label: 'Đang hoạt động', color: 'green' },
  { value: 'EXPIRED', label: 'Đã hết hạn', color: 'red' },
  { value: 'INACTIVE', label: 'Không hoạt động', color: 'gray' },
  { value: 'DELETED', label: 'Đã xoá', color: 'gray' }
];


export const StatusFilter = ({ selectedStatus, onStatusChange, onClearFilters }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((status) => (
          <button
            key={status.value}
            onClick={() => onStatusChange(status.value)}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === status.value
                ? `bg-${status.color}-100 text-${status.color}-800 border border-${status.color}-300 shadow-sm`
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>
      
      {(selectedStatus !== 'ALL') && (
        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
};

export default StatusFilter;