import React from 'react';

const QuotationTable = ({ quotations, loading, error, onView, onDelete, canDelete }) => {
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status) => {
    const colors = {
      DRAFT: 'bg-slate-100 text-slate-700',
      PENDING: 'bg-amber-50 text-amber-700',
      SENT: 'bg-blue-50 text-blue-700',
      ACCEPTED: 'bg-emerald-50 text-emerald-700',
      COMPLETE: 'bg-green-50 text-green-700',
      REJECTED: 'bg-rose-50 text-rose-700',
      EXPIRED: 'bg-gray-100 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const getStatusText = (status) => {
    const statusMap = {
      DRAFT: 'Bản nháp',
      PENDING: 'Chờ xử lý',
      SENT: 'Đã gửi',
      ACCEPTED: 'Đã chấp nhận',
      COMPLETE: 'Hoàn thành',
      REJECTED: 'Từ chối',
      EXPIRED: 'Hết hạn'
    };
    return statusMap[status] || status;
  };

  // Enhanced Skeleton Loading
  const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-gray-100 last:border-0">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-28"></div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-3">
          <div className="h-8 bg-gray-200 rounded w-12"></div>
          <div className="h-8 bg-gray-200 rounded w-12"></div>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-50/80 border-b border-gray-100">
              <tr>
                {['Mã BG', 'Khách hàng', 'Model', 'Phiên bản', 'Giá trị', 'Ngày tạo', 'Trạng thái', 'Thao tác'].map((header) => (
                  <th key={header} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(6)].map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-rose-50 to-rose-50/60 border border-rose-200 rounded-2xl p-8 text-center">
        <div className="text-rose-600 font-semibold text-lg mb-2">Đã xảy ra lỗi</div>
        <div className="text-rose-500 text-sm">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!quotations.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="text-gray-600 font-semibold text-lg mb-1">Không có báo giá nào</div>
        <div className="text-gray-400 text-sm">Hãy tạo báo giá mới để bắt đầu</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Mã BG
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Model
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Phiên bản
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Giá trị
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {quotations.map((quotation) => (
              <tr 
                key={quotation.quotationId} 
                className="hover:bg-gray-50/50 transition-all duration-200 group border-b border-gray-100 last:border-0"
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900 font-mono bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                    #{quotation.quotationId?.slice(-8)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700">
                    ID: {quotation.customerId}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700 font-medium">
                    {quotation.modelId}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">
                    {quotation.variantId}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-emerald-600">
                    {formatCurrency(quotation.finalPrice)}
                  </div>
                  {quotation.discountAmount > 0 && (
                    <div className="text-xs text-rose-500 line-through mt-1">
                      {formatCurrency(quotation.basePrice)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {formatDate(quotation.quotationDate)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1.5 text-xs font-medium rounded-full ${getStatusColor(quotation.status)}`}>
                    {getStatusText(quotation.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onView(quotation)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md"
                    >
                      Xem
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => onDelete(quotation.quotationId)}
                        className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer */}
      <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị <span className="font-semibold text-gray-700">{quotations.length}</span> báo giá
          </div>
          <div className="text-xs text-gray-400">
            Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationTable;