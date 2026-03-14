import React from 'react';
import { convertToSalesOrder } from '../services/quotationService.js';
import Swal from 'sweetalert2';

const QuotationModal = ({ quotation, isOpen, onClose, loading }) => {
  if (!isOpen) return null;

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getStatusColor = (status) => {
    const colors = {
      DRAFT: 'bg-blue-100 text-blue-800 border border-blue-200',
      PENDING: 'bg-amber-100 text-amber-800 border border-amber-200',
      SENT: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      ACCEPTED: 'bg-green-100 text-green-800 border border-green-200',
      COMPLETE: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      REJECTED: 'bg-red-100 text-red-800 border border-red-200',
      EXPIRED: 'bg-gray-100 text-gray-800 border border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const handleConvertOrder = async (quotationId) => {
    const result = await Swal.fire({
      title: 'Xác nhận chuyển đơn hàng',
      text: 'Bạn có chắc muốn chuyển quotation này thành Sales Order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
    });

    if (result.isConfirmed) {
      try {
        const response = await convertToSalesOrder(quotationId);
        Swal.fire({
          title: 'Thành công!',
          text: 'Quotation đã được chuyển thành Sales Order.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
        window.location.href = `/dealer/orders/${response.data.orderId}`;
      } catch (error) {
        Swal.fire({
          title: 'Lỗi!',
          text: 'Không thể chuyển đơn hàng. Vui lòng thử lại.',
          icon: 'error',
          confirmButtonColor: '#3b82f6',
        });
        console.error(error);
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-8 text-center shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!quotation) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-blue-100 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Báo giá #{quotation.quotationId?.slice(-8)}
                </h2>
                <p className="text-sm text-gray-600 mt-1">Chi tiết thông tin báo giá</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-xl transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status & Quick Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(quotation.status)}`}>
                {getStatusText(quotation.status)}
              </span>
              <div className="text-sm text-gray-600">
                Ngày tạo: <span className="font-medium text-gray-900">{formatDate(quotation.quotationDate)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(quotation.finalPrice)}</div>
              {quotation.discountAmount > 0 && (
                <div className="text-sm text-red-600 line-through">{formatCurrency(quotation.basePrice)}</div>
              )}
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-4 bg-blue-500 rounded-full"></div>
                <h3 className="font-semibold text-gray-900">Thông tin cơ bản</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Mã báo giá</span>
                  <span className="text-sm font-mono text-gray-900">{quotation.quotationId}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Hiệu lực đến</span>
                  <span className="text-sm text-gray-900">{formatDate(quotation.validUntil)}</span>
                </div>
              </div>
            </div>

            {/* IDs Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-4 bg-indigo-500 rounded-full"></div>
                <h3 className="font-semibold text-gray-900">Thông tin ID</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Dealer ID</span>
                  <span className="text-sm font-mono text-gray-900 text-xs">{quotation.dealerId}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Customer ID</span>
                  <span className="text-sm text-gray-900">{quotation.customerId}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Model ID</span>
                  <span className="text-sm text-gray-900">{quotation.modelId}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Variant ID</span>
                  <span className="text-sm text-gray-900">{quotation.variantId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-4 bg-green-500 rounded-full"></div>
              <h3 className="font-semibold text-gray-900">Chi tiết giá</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="text-sm text-blue-700 mb-1">Giá gốc</div>
                <div className="text-lg font-bold text-blue-900">{formatCurrency(quotation.basePrice)}</div>
              </div>
              {quotation.discountAmount > 0 && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <div className="text-sm text-red-700 mb-1">Giảm giá</div>
                  <div className="text-lg font-bold text-red-900">-{formatCurrency(quotation.discountAmount)}</div>
                </div>
              )}
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="text-sm text-green-700 mb-1">Giá cuối cùng</div>
                <div className="text-lg font-bold text-green-900">{formatCurrency(quotation.finalPrice)}</div>
              </div>
            </div>
          </div>

          {/* Applied Promotions */}
          {quotation.appliedPromotions && quotation.appliedPromotions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-4 bg-purple-500 rounded-full"></div>
                <h3 className="font-semibold text-gray-900">Khuyến mãi áp dụng</h3>
              </div>
              <div className="space-y-3">
                {quotation.appliedPromotions.map((promo, index) => (
                  <div key={index} className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-purple-900">{promo.promotionName}</h4>
                      <span className="text-lg font-bold text-purple-600">-{(promo.discountRate * 100).toFixed(1)}%</span>
                    </div>
                    <p className="text-sm text-purple-700 mb-2">{promo.description}</p>
                    <div className="flex text-xs text-purple-500 justify-between">
                      <span>{new Date(promo.startDate).toLocaleDateString('vi-VN')}</span>
                      <span>→</span>
                      <span>{new Date(promo.endDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terms and Conditions */}
          {quotation.termsConditions && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-4 bg-gray-500 rounded-full"></div>
                <h3 className="font-semibold text-gray-900">Điều khoản và điều kiện</h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{quotation.termsConditions}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Staff ID: <span className="font-mono text-gray-700">{quotation.staffId}</span>
            </div>
            <div className="flex gap-3">
              {quotation.status === "ACCEPTED" && (
                <button
                  onClick={() => handleConvertOrder(quotation.quotationId)}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Chuyển thành đơn hàng
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationModal;