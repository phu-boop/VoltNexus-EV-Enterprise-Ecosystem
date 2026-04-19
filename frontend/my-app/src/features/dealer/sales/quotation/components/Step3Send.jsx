// sales/quotation/components/Step3Send.js
import React from 'react';

const Step3Send = ({ quotationDetail, sendData, onChange, onSubmit, onBack, errorMessage }) => {
  const isFormValid = () => {
    return sendData.validUntil;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { 
        color: 'bg-amber-50 text-amber-700 border border-amber-200',
        text: 'Chờ xử lý',
        icon: '⏳'
      },
      'SENT': { 
        color: 'bg-blue-50 text-blue-700 border border-blue-200',
        text: 'Đã gửi',
        icon: '📤'
      },
      'CONFIRMED': { 
        color: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        text: 'Đã xác nhận',
        icon: '✅'
      },
      'EXPIRED': { 
        color: 'bg-rose-50 text-rose-700 border border-rose-200',
        text: 'Hết hạn',
        icon: '❌'
      }
    };
    const config = statusConfig[status] || { 
      color: 'bg-gray-50 text-gray-700 border border-gray-200',
      text: status,
      icon: '📋'
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full ${config.color}`}>
        <span>{config.icon}</span>
        {config.text}
      </span>
    );
  };

  // Function to format date for datetime-local input
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  // Set default validUntil to 7 days from now if not set
  const getDefaultValidUntil = () => {
    if (sendData.validUntil) return sendData.validUntil;
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return formatDateForInput(nextWeek);
  };

  return (
    <div className="max-w-6xl mx-auto">

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-800">Có lỗi xảy ra</h3>
              <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quotation Summary Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Thông Tin Báo Giá</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Mã báo giá:</span>
                    <span className="font-mono font-semibold text-gray-900 text-sm">{quotationDetail?.quotationId || 'Chưa có'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ngày tạo:</span>
                    <span className="font-medium text-gray-900">{formatDate(quotationDetail?.quotationDate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Trạng thái:</span>
                    {getStatusBadge(quotationDetail?.status || 'PENDING')}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Khuyến mãi áp dụng:</span>
                    <span className="font-medium text-gray-900">
                      {quotationDetail?.appliedPromotions?.length > 0 
                        ? `${quotationDetail.appliedPromotions.length} khuyến mãi`
                        : 'Không có'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tổng chiết khấu:</span>
                    <span className="font-semibold text-red-600">
                      -{formatPrice(quotationDetail?.discountAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Applied Promotions Card */}
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

          {/* Send Configuration Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-green-50 to-green-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Cài Đặt Gửi</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Valid Until */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Thời hạn hiệu lực *
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    name="validUntil"
                    value={sendData.validUntil || getDefaultValidUntil()}
                    onChange={onChange}
                    required
                    min={formatDateForInput(new Date())}
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white text-gray-900 shadow-sm"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Báo giá sẽ hết hạn sau thời gian này
                </p>
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Điều khoản và điều kiện
                </label>
                <textarea
                  name="termsConditions"
                  value={sendData.termsConditions}
                  onChange={onChange}
                  rows="6"
                  placeholder="Nhập điều khoản và điều kiện sẽ gửi cho khách hàng..."
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white text-gray-900 resize-vertical placeholder-gray-400 shadow-sm"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    Điều khoản rõ ràng giúp khách hàng hiểu rõ về báo giá
                  </p>
                  <span className="text-sm text-gray-500">
                    {sendData.termsConditions?.length || 0} ký tự
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="space-y-6">
          {/* Price Summary Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
            <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-gray-100">
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
                  <>
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
                  </>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-semibold text-gray-900">Giá cuối cùng</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(quotationDetail?.finalPrice || 0)}
                    </span>
                  </div>
                  {quotationDetail?.discountAmount > 0 && (
                    <div className="text-right text-sm text-green-600 mt-1">
                      Tiết kiệm {formatPrice(quotationDetail.discountAmount)}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={(e) => { e.preventDefault(); onSubmit(); }}
                  disabled={!isFormValid()}
                  className="w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Gửi Báo Giá
                </button>
                <button
                  onClick={onBack}
                  className="w-full py-3.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Quay Lại
                </button>
              </div>

              <div className="text-center mt-4">
                <p className="text-xs text-gray-500">
                  Bước 3/4 - Gửi báo giá
                </p>
              </div>
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-blue-800 mb-2">Thông Tin Quan Trọng</h4>
              <ul className="text-sm text-blue-700 space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Báo giá sẽ được gửi qua email cho khách hàng</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Khách hàng có thể xác nhận trực tuyến</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Báo giá sẽ tự động hết hạn sau thời gian đã đặt</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Send;