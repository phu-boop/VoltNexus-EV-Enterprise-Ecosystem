// sales/quotation/components/Step4Complete.js
import React from 'react';

const Step4Complete = ({ quotationDetail }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không có thời hạn';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusConfig = (status) => {
    const config = {
      'SENT': {
        color: 'bg-blue-50 text-blue-700 border border-blue-200',
        text: 'Đã gửi',
        icon: '📤',
        description: 'Báo giá đã được gửi thành công cho khách hàng'
      },
      'PENDING': {
        color: 'bg-amber-50 text-amber-700 border border-amber-200',
        text: 'Chờ xử lý',
        icon: '⏳',
        description: 'Báo giá đang chờ xử lý'
      },
      'CONFIRMED': {
        color: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        text: 'Đã xác nhận',
        icon: '✅',
        description: 'Khách hàng đã xác nhận báo giá'
      },
      'EXPIRED': {
        color: 'bg-rose-50 text-rose-700 border border-rose-200',
        text: 'Hết hạn',
        icon: '❌',
        description: 'Báo giá đã hết hạn'
      }
    };
    return config[status] || config.PENDING;
  };

  const statusConfig = getStatusConfig(quotationDetail?.status);

  return (
    <div className="max-w-6xl mx-auto">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quotation Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Trạng Thái Báo Giá</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl ${statusConfig.color}`}>
                    <span className="text-lg">{statusConfig.icon}</span>
                    <span className="font-semibold">{statusConfig.text}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Mã báo giá</div>
                  <div className="font-mono font-semibold text-gray-900 text-sm">{quotationDetail?.quotationId}</div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-blue-800 font-medium">{statusConfig.description}</p>
                    <p className="text-blue-700 text-sm mt-1">
                      Khách hàng sẽ nhận được email với báo giá đầy đủ và có thể xác nhận trực tuyến.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quotation Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Chi Tiết Báo Giá</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Thông tin cơ bản</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ngày tạo:</span>
                      <span className="font-medium text-gray-900">{formatDate(quotationDetail?.quotationDate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ngày hết hạn:</span>
                      <span className="font-medium text-gray-900">{formatDate(quotationDetail?.validUntil)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">ID Khách hàng:</span>
                      <span className="font-medium text-gray-900">{quotationDetail?.customerId}</span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="space-y-6">
                  <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Thông tin xe</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Model ID:</span>
                      <span className="font-medium text-gray-900">{quotationDetail?.modelId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Phiên bản:</span>
                      <span className="font-medium text-gray-900">Variant {quotationDetail?.variantId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Nhân viên phụ trách:</span>
                      <span className="font-medium text-gray-900 text-sm">{quotationDetail?.staffId}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              {quotationDetail?.termsConditions && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-4">Điều khoản & Điều kiện</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-gray-700 leading-relaxed">{quotationDetail.termsConditions}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Applied Promotions */}
          {quotationDetail?.appliedPromotions && quotationDetail.appliedPromotions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-purple-50 to-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Khuyến Mãi Đã Áp Dụng</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {quotationDetail.appliedPromotions.map((promotion, index) => (
                    <div key={promotion.promotionId} className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{promotion.promotionName}</h4>
                          <span className="text-xl font-bold text-red-600">
                            -{(promotion.discountRate * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{promotion.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            {new Date(promotion.startDate).toLocaleDateString('vi-VN')} → {new Date(promotion.endDate).toLocaleDateString('vi-VN')}
                          </span>
                          {promotion.status === 'ACTIVE' && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                              Đang hoạt động
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="space-y-8">
          {/* Price Summary Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
            <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-emerald-50 to-green-50">
              <h3 className="text-lg font-semibold text-gray-900 text-center">Tổng Quan Giá</h3>
            </div>
            
            <div className="p-6">
              {/* Price Breakdown */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-600">Giá cơ sở</span>
                  <span className="font-semibold text-gray-900">{formatPrice(quotationDetail?.basePrice || 0)}</span>
                </div>
                
                {quotationDetail?.discountAmount > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex justify-between items-center text-red-700 font-semibold mb-2">
                      <span>Tổng chiết khấu</span>
                      <span>-{formatPrice(quotationDetail?.discountAmount || 0)}</span>
                    </div>
                    {quotationDetail?.appliedPromotions && quotationDetail.appliedPromotions.length > 0 && (
                      <div className="text-sm text-red-600">
                        Bao gồm {quotationDetail.appliedPromotions.length} khuyến mãi
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-semibold text-gray-900">Giá cuối cùng</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {formatPrice(quotationDetail?.finalPrice || 0)}
                    </span>
                  </div>
                  {quotationDetail?.discountAmount > 0 && (
                    <div className="text-right text-sm text-emerald-600 mt-1">
                      Tiết kiệm {formatPrice(quotationDetail.discountAmount)}
                    </div>
                  )}
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-blue-800 mb-3 text-sm uppercase tracking-wide">Bước tiếp theo</h4>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Theo dõi email xác nhận từ khách hàng</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Liên hệ khách hàng sau 24-48 giờ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Chuẩn bị các thủ tục tiếp theo khi khách hàng đồng ý</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => window.print()}
                  className="w-full py-3.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  In báo giá
                </button>
                
                <button
                  onClick={() => window.location.href = '/dealer/staff/list/quotations'}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Quản lý báo giá
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Tạo báo giá mới
                </button>
              </div>

              <div className="text-center mt-4">
                <p className="text-xs text-gray-500">
                  Bước 4/4 - Hoàn thành
                </p>
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-blue-800 mb-2">Cần hỗ trợ?</h4>
              <p className="text-sm text-blue-700 mb-3">
                Liên hệ với quản lý hoặc bộ phận hỗ trợ nếu bạn cần giúp đỡ
              </p>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium underline">
                Liên hệ hỗ trợ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Complete;