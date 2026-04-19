// sales/quotation/components/Step2Calculation.js
import React, { useMemo } from 'react';

const Step2Calculation = ({ quotationDetail, calculationData, promotions, onChange, onSubmit, onBack, errorMessage }) => {
  const calculationResult = useMemo(() => {
    const basePrice = Number(quotationDetail?.basePrice || 0);
    
    // Lấy danh sách chi tiết các KM đã chọn để hiển thị breakdown
    const selectedPromos = promotions.filter(promo => 
      calculationData.promotionIds.includes(promo.promotionId)
    );

    const promotionDiscount = selectedPromos.reduce((total, promo) => {
      const rate = Number(promo.discountRate || 0);
      return total + (basePrice * rate);
    }, 0);

    const additionalRate = Number(calculationData.additionalDiscountRate || 0);
    const additionalDiscount = basePrice * (additionalRate / 100);
    
    const totalDiscount = promotionDiscount + additionalDiscount;
    const finalPrice = basePrice - totalDiscount;

    return {
      basePrice,
      selectedPromos,
      promotionDiscount,
      additionalDiscount,
      totalDiscount,
      finalPrice,
      discountPercentage: basePrice > 0 ? (totalDiscount / basePrice) * 100 : 0
    };
  }, [calculationData, promotions, quotationDetail]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getPromotionStatusBadge = (status) => {
    const statusConfig = {
      'ACTIVE': { 
        color: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        text: 'Đang áp dụng',
        icon: '✅'
      },
      'EXPIRED': { 
        color: 'bg-rose-50 text-rose-700 border border-rose-200',
        text: 'Đã hết hạn',
        icon: '❌'
      },
      'UPCOMING': { 
        color: 'bg-blue-50 text-blue-700 border border-blue-200',
        text: 'Sắp diễn ra',
        icon: '⏳'
      }
    };
    const config = statusConfig[status] || { 
      color: 'bg-gray-50 text-gray-700 border border-gray-200',
      text: status,
      icon: '📋'
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <span className="text-xs">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">

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
            <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-gray-100">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Mã Báo Giá</div>
                  <div className="font-mono font-semibold text-gray-900 text-lg">{quotationDetail?.quotationId}</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-xs text-blue-600 uppercase tracking-wide font-medium mb-2">Giá Cơ Sở</div>
                  <div className="font-semibold text-blue-700 text-lg">
                    {formatPrice(quotationDetail?.basePrice || 0)}
                  </div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="text-xs text-amber-600 uppercase tracking-wide font-medium mb-2">Trạng Thái</div>
                  <div className="font-semibold text-amber-700">BẢN NHÁP</div>
                </div>
              </div>
            </div>
          </div>

          {/* Promotions Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Khuyến Mãi Khả Dụng</h3>
                </div>
                <span className="bg-purple-100 text-purple-700 text-sm font-medium px-3 py-1 rounded-full">
                  {promotions.length} chương trình
                </span>
              </div>
            </div>
            <div className="p-6">
              {promotions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg mb-2">Không có khuyến mãi khả dụng</p>
                  <p className="text-gray-400 text-sm">Hiện tại không có chương trình khuyến mãi nào cho dòng xe này</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {promotions.map(promotion => (
                    <label
                      key={promotion.promotionId}
                      className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        calculationData.promotionIds.includes(promotion.promotionId)
                          ? 'border-purple-500 bg-purple-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="promotionIds"
                        value={promotion.promotionId}
                        checked={calculationData.promotionIds.includes(promotion.promotionId)}
                        onChange={onChange}
                        className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{promotion.promotionName}</h4>
                            <p className="text-gray-600 text-sm mt-1">{promotion.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-red-600">
                              -{(promotion.discountRate * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {formatPrice(quotationDetail?.basePrice * promotion.discountRate)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4 text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(promotion.startDate).toLocaleDateString('vi-VN')}
                            </span>
                            <span>→</span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(promotion.endDate).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          {getPromotionStatusBadge(promotion.status)}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Additional Discount Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Chiết Khấu Bổ Sung</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tỷ lệ chiết khấu (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="additionalDiscountRate"
                      value={calculationData.additionalDiscountRate}
                      onChange={onChange}
                      step="0.1"
                      min="0"
                      max="100"
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg font-medium text-gray-900 bg-white shadow-sm"
                      placeholder="0.0"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-gray-500 font-medium">%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Nhập tỷ lệ chiết khấu bổ sung từ 0-100%</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
                  <div className="text-sm text-orange-600 font-medium mb-2">GIÁ TRỊ CHIẾT KHẤU</div>
                  <div className="text-2xl font-bold text-orange-700">
                    -{formatPrice(calculationResult.additionalDiscount)}
                  </div>
                  {calculationData.additionalDiscountRate > 0 && (
                    <div className="text-sm text-orange-600 mt-2">
                      Tương đương {calculationData.additionalDiscountRate}% giá xe
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Calculation Summary Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
            <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 text-center">Tổng Hợp Tính Toán</h3>
            </div>
            
            <div className="p-6">
              {/* Price Breakdown */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-600">Giá cơ sở</span>
                  <span className="font-semibold text-gray-900">{formatPrice(calculationResult.basePrice)}</span>
                </div>
                
                {calculationResult.selectedPromos.length > 0 && (
                  <div className="space-y-2 py-2 border-t border-gray-50 mt-2">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Chi tiết khuyến mãi</div>
                    {calculationResult.selectedPromos.map(promo => (
                      <div key={promo.promotionId} className="flex justify-between items-center text-sm text-red-600">
                        <span className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                          {promo.promotionName}
                        </span>
                        <span className="font-medium">-{formatPrice(calculationResult.basePrice * promo.discountRate)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 text-red-600 border-t border-dashed border-red-100">
                      <span className="font-medium">Tổng khuyến mãi</span>
                      <span className="font-bold">-{formatPrice(calculationResult.promotionDiscount)}</span>
                    </div>
                  </div>
                )}

                {calculationResult.additionalDiscount > 0 && (
                  <div className="flex justify-between items-center text-red-600">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      Chiết khấu bổ sung
                    </span>
                    <span className="font-semibold">-{formatPrice(calculationResult.additionalDiscount)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Tổng chiết khấu</span>
                    <span className="font-semibold text-red-600">-{formatPrice(calculationResult.totalDiscount)}</span>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    ({calculationResult.discountPercentage.toFixed(1)}% giá xe)
                  </div>
                </div>
              </div>

              {/* Final Price */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 text-center mb-6">
                <div className="text-sm text-blue-600 font-medium mb-2">GIÁ CUỐI CÙNG</div>
                <div className="text-3xl font-bold text-blue-700">
                  {formatPrice(calculationResult.finalPrice)}
                </div>
                {calculationResult.totalDiscount > 0 && (
                  <div className="text-sm text-blue-600 mt-2">
                    Đã tiết kiệm {formatPrice(calculationResult.totalDiscount)}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={(e) => { e.preventDefault(); onSubmit(); }}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Xác Nhận Tính Toán
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
                  Bước 2/4 - Tính toán giá
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {calculationResult.totalDiscount > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h4 className="font-semibold text-emerald-800 mb-2">Khách hàng tiết kiệm được</h4>
                <div className="text-2xl font-bold text-emerald-700 mb-2">
                  {formatPrice(calculationResult.totalDiscount)}
                </div>
                <div className="text-sm text-emerald-600">
                  Tương đương {calculationResult.discountPercentage.toFixed(1)}% giá trị xe
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step2Calculation;