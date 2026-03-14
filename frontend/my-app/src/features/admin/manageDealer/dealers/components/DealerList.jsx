// DealerList.jsx
import React from 'react';
import DealerCard from './DealerCard';
import DealerFilter from './DealerFilter';
import Skeleton from 'react-loading-skeleton';

const DealerList = ({ 
  dealers, 
  loading, 
  error, 
  filters, 
  onFilterChange, 
  onClearFilters,
  onEdit,
  onDelete,
  onSuspend,
  onActivate,
  onRefresh 
}) => {
  // Skeleton loading component
  const SkeletonDealerCard = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Skeleton height={24} width="70%" className="mb-2" />
          <Skeleton height={16} width="40%" />
        </div>
        <Skeleton height={32} width={100} />
      </div>
      <div className="space-y-3">
        <Skeleton height={16} width="90%" />
        <Skeleton height={16} width="80%" />
        <Skeleton height={16} width="60%" />
      </div>
      <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
        <Skeleton height={32} width={80} />
        <Skeleton height={32} width={60} />
        <Skeleton height={32} width={60} />
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-red-800">Đã xảy ra lỗi</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 transform hover:scale-105 shadow-md"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
      <DealerFilter
        filters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <SkeletonDealerCard key={index} />
          ))}
        </div>
      ) : dealers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Không có đại lý nào</h3>
            <p className="mt-2 text-sm text-gray-500">
              {filters.search || filters.city || filters.status 
                ? 'Thử thay đổi bộ lọc để tìm thêm kết quả.' 
                : 'Bắt đầu bằng cách thêm đại lý mới.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
              Hiển thị <span className="font-semibold text-gray-900">{dealers.length}</span> đại lý
            </p>
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 transform hover:scale-105 shadow-md flex items-center font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Làm mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dealers.map((dealer) => (
              <DealerCard
                key={dealer.dealerId}
                dealer={dealer}
                onEdit={onEdit}
                onDelete={onDelete}
                onSuspend={onSuspend}
                onActivate={onActivate}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
 export default DealerList; // DealerCard.jsx
