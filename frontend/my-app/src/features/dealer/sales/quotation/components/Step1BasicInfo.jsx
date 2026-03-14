// sales/quotation/components/Step1BasicInfo.js
import React, { useState } from 'react';

const Step1BasicInfo = ({ formData, customers, models, variants, onChange, onSubmit, errorMessage }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    const customer = customers.find(c => c.customerId == customerId);
    setSelectedCustomer(customer);
    onChange(e);
  };

  const handleModelChange = (e) => {
    const modelId = e.target.value;
    const model = models.find(m => m.modelId == modelId);
    setSelectedModel(model);
    setSelectedVariant(null);
    onChange(e);
  };

  const handleVariantChange = (e) => {
    const variantId = e.target.value;
    const variant = variants.find(v => v.variantId == variantId);
    setSelectedVariant(variant);
    onChange(e);
  };

  const isFormValid = () => {
    return formData.customerId && formData.modelId && formData.variantId && formData.basePrice;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'COMING_SOON': { 
        color: 'bg-blue-50 text-blue-700 border border-blue-200', 
        text: 'Sắp ra mắt',
        icon: '🕒'
      },
      'IN_PRODUCTION': { 
        color: 'bg-emerald-50 text-emerald-700 border border-emerald-200', 
        text: 'Đang sản xuất',
        icon: '⚡'
      },
      'DISCONTINUED': { 
        color: 'bg-rose-50 text-rose-700 border border-rose-200', 
        text: 'Ngừng sản xuất',
        icon: '⏹️'
      },
      'NEW': {
        color: 'bg-green-50 text-green-700 border border-green-200',
        text: 'Mới',
        icon: '🆕'
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

  const getCustomerTypeText = (type) => {
    const types = {
      'INDIVIDUAL': 'Cá nhân',
      'BUSINESS': 'Doanh nghiệp'
    };
    return types[type] || type;
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
        {/* Left Column - Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Thông Tin Khách Hàng</h3>
              </div>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Chọn khách hàng *
              </label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleCustomerChange}
                required
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300 text-gray-700 shadow-sm"
              >
                <option value="" className="text-gray-400">Chọn khách hàng...</option>
                {(Array.isArray(customers) ? customers : []).map(customer => (
                  <option key={customer.customerId} value={customer.customerId} className="text-gray-700">
                    {customer.customerCode} - {customer.firstName} {customer.lastName} - {customer.phone}
                  </option>
                ))}
              </select>

              {/* Customer Details */}
              {selectedCustomer && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Mã KH:</span>
                      <span className="font-semibold text-gray-800 ml-2">{selectedCustomer.customerCode}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Loại KH:</span>
                      <span className="font-semibold text-gray-800 ml-2">
                        {getCustomerTypeText(selectedCustomer.customerType)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="font-semibold text-gray-800 ml-2">{selectedCustomer.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Trạng thái:</span>
                      <span className="ml-2">{getStatusBadge(selectedCustomer.status)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Selection Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Lựa Chọn Xe</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Dòng xe *
                </label>
                <select
                  name="modelId"
                  value={formData.modelId}
                  onChange={handleModelChange}
                  required
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300 text-gray-700 shadow-sm"
                >
                  <option value="" className="text-gray-400">Chọn dòng xe...</option>
                  {(Array.isArray(models) ? models : []).map(model => (
                    <option key={model.modelId} value={model.modelId} className="text-gray-700">
                      {model.modelName} - {model.brand}
                    </option>
                  ))}
                </select>

                {/* Model Details */}
                {selectedModel && (
                  <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
                    <span>Hãng: <strong className="text-gray-800">{selectedModel.brand}</strong></span>
                    <span className="text-gray-300">•</span>
                    <span>Trạng thái: {getStatusBadge(selectedModel.status)}</span>
                  </div>
                )}
              </div>

              {/* Variant Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Phiên bản *
                </label>
                <select
                  name="variantId"
                  value={formData.variantId}
                  onChange={handleVariantChange}
                  required
                  disabled={!formData.modelId}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300 text-gray-700 shadow-sm disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <option value="" className="text-gray-400">
                    {formData.modelId ? 'Chọn phiên bản...' : 'Vui lòng chọn dòng xe trước'}
                  </option>
                  {(Array.isArray(variants) ? variants : []).map(variant => (
                    <option key={variant.variantId} value={variant.variantId} className="text-gray-700">
                      {variant.versionName} - {variant.color} - {formatPrice(variant.price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Base Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Giá cơ sở *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={onChange}
                    required
                    step="0.01"
                    placeholder="Nhập giá cơ sở"
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300 text-gray-700 pr-32 placeholder-gray-400 shadow-sm"
                  />
                  {formData.basePrice && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-emerald-600 font-semibold text-lg">
                        {formatPrice(formData.basePrice)}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">Giá cơ sở sẽ được sử dụng để tính toán các khoản phí khác</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Preview & Details */}
        <div className="space-y-6">
          {/* Variant Details Card */}
          {selectedVariant && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              <div className="px-6 py-4 border-b border-gray-50 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Chi Tiết Phiên Bản</h3>
                </div>
              </div>
              
              <div className="p-6">
                {/* Variant Image */}
                {selectedVariant.imageUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden shadow-sm">
                    <img 
                      src={selectedVariant.imageUrl} 
                      alt={selectedVariant.versionName}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}

                {/* Basic Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{selectedVariant.versionName}</h4>
                      <p className="text-gray-600">{selectedVariant.color}</p>
                    </div>
                    {getStatusBadge(selectedVariant.status)}
                  </div>
                  
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatPrice(selectedVariant.price)}
                  </div>
                </div>

                {/* Specifications Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-600 text-xs font-medium mb-1">DUNG LƯỢNG PIN</div>
                    <div className="font-semibold text-gray-900">{selectedVariant.batteryCapacity} kWh</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-600 text-xs font-medium mb-1">TẦM HOẠT ĐỘNG</div>
                    <div className="font-semibold text-gray-900">{selectedVariant.rangeKm} km</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-600 text-xs font-medium mb-1">CÔNG SUẤT</div>
                    <div className="font-semibold text-gray-900">{selectedVariant.motorPower} kW</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-600 text-xs font-medium mb-1">THỜI GIAN SẠC</div>
                    <div className="font-semibold text-gray-900">{selectedVariant.chargingTime} giờ</div>
                  </div>
                </div>

                {/* SKU Code */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">Mã SKU</div>
                  <div className="font-mono text-sm text-gray-700">{selectedVariant.skuCode}</div>
                </div>
              </div>
            </div>
          )}

          {/* Form Status Card */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Trạng Thái Đơn Hàng</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Khách hàng</span>
                  <span className={`text-sm font-medium ${formData.customerId ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {formData.customerId ? '✓ Đã chọn' : '⏳ Chờ chọn'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dòng xe</span>
                  <span className={`text-sm font-medium ${formData.modelId ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {formData.modelId ? '✓ Đã chọn' : '⏳ Chờ chọn'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Phiên bản</span>
                  <span className={`text-sm font-medium ${formData.variantId ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {formData.variantId ? '✓ Đã chọn' : '⏳ Chờ chọn'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Giá cơ sở</span>
                  <span className={`text-sm font-medium ${formData.basePrice ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {formData.basePrice ? '✓ Đã nhập' : '⏳ Chờ nhập'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={onSubmit}
                  disabled={!isFormValid()}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Tiếp Tục Tạo Báo Giá
                </button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Bước 1/4 - Thông tin cơ bản
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1BasicInfo;