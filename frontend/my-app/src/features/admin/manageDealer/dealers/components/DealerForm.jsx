import React, { useState, useEffect } from 'react';

const DealerForm = ({ dealer, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    dealerCode: '',
    dealerName: '',
    address: '',
    city: '',
    region: '',
    phone: '',
    email: '',
    taxNumber: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (dealer) {
      setFormData({
        dealerCode: dealer.dealerCode || '',
        dealerName: dealer.dealerName || '',
        address: dealer.address || '',
        city: dealer.city || '',
        region: dealer.region || '',
        phone: dealer.phone || '',
        email: dealer.email || '',
        taxNumber: dealer.taxNumber || '',
      });
    }
  }, [dealer]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.dealerCode.trim()) {
      newErrors.dealerCode = 'Mã đại lý là bắt buộc';
    }

    if (!formData.dealerName.trim()) {
      newErrors.dealerName = 'Tên đại lý là bắt buộc';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div className="fixed inset-0 z-[100] overflow-hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/40 "
          style={{ animation: 'fadeIn 0.3s ease-out forwards' }}
          onClick={onCancel}
        />

        {/* Drawer Position Container */}
        <div className="fixed inset-y-0 right-0 flex max-w-full sm:pl-16">
          {/* Drawer Panel */}
          <div
            className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col h-full ring-1 ring-slate-900/5 sm:rounded-l-3xl overflow-hidden"
            style={{ animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
          >
            {/* Header */}
            <div className="px-6 py-6 sm:px-8 border-b border-slate-100 bg-white z-10 sticky top-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {dealer ? 'Cập nhật đại lý' : 'Thêm đại lý mới'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {dealer ? 'Chỉnh sửa thông tin đại lý hiện tại.' : 'Nhập thông tin chi tiết cho đại lý mới.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-full p-2 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 bg-slate-50/30">
              <form id="dealer-form" onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mã đại lý */}
                  <div>
                    <label htmlFor="dealerCode" className="block text-sm font-semibold text-slate-700 mb-2">
                      Mã đại lý <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="dealerCode"
                      name="dealerCode"
                      value={formData.dealerCode}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${errors.dealerCode ? 'border-rose-300 ring-rose-500/20 text-rose-900 placeholder-rose-300' : 'border-slate-200 text-slate-900 hover:border-slate-300'
                        }`}
                      placeholder="VD: DLR-001"
                      disabled={!!dealer} // Thường mã đại lý không cho sửa
                    />
                    {errors.dealerCode && (
                      <p className="mt-2 text-sm text-rose-600 flex items-center font-medium">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {errors.dealerCode}
                      </p>
                    )}
                  </div>

                  {/* Tên đại lý */}
                  <div>
                    <label htmlFor="dealerName" className="block text-sm font-semibold text-slate-700 mb-2">
                      Tên đại lý <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="dealerName"
                      name="dealerName"
                      value={formData.dealerName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${errors.dealerName ? 'border-rose-300 ring-rose-500/20 text-rose-900 placeholder-rose-300' : 'border-slate-200 text-slate-900 hover:border-slate-300'
                        }`}
                      placeholder="Nhập tên đại lý"
                    />
                    {errors.dealerName && (
                      <p className="mt-2 text-sm text-rose-600 flex items-center font-medium">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {errors.dealerName}
                      </p>
                    )}
                  </div>

                  {/* Địa chỉ */}
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-2">
                      Địa chỉ chi tiết
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-slate-300"
                      placeholder="Số nhà, Tên đường, Phường/Xã..."
                    />
                  </div>

                  {/* Thành phố */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-slate-700 mb-2">
                      Thỉnh/Thành phố
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-slate-300"
                      placeholder="Hồ Chí Minh, Hà Nội..."
                    />
                  </div>

                  {/* Khu vực */}
                  <div>
                    <label htmlFor="region" className="block text-sm font-semibold text-slate-700 mb-2">
                      Khu vực (Vùng miền)
                    </label>
                    <input
                      type="text"
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-slate-300"
                      placeholder="Miền Nam, Miền Bắc..."
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                      Số điện thoại liên hệ
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-slate-300"
                      placeholder="0912 345 678"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                      Địa chỉ Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${errors.email ? 'border-rose-300 ring-rose-500/20 text-rose-900 placeholder-rose-300' : 'border-slate-200 text-slate-900 hover:border-slate-300'
                        }`}
                      placeholder="contact@dealer.com"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-rose-600 flex items-center font-medium">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Mã số thuế */}
                  <div className="md:col-span-2">
                    <label htmlFor="taxNumber" className="block text-sm font-semibold text-slate-700 mb-2">
                      Mã số thuế
                    </label>
                    <input
                      type="text"
                      id="taxNumber"
                      name="taxNumber"
                      value={formData.taxNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-slate-300 font-mono"
                      placeholder="123456789-001"
                    />
                  </div>

                </div>
              </form>
            </div>

            {/* Footer with Actions */}
            <div className="px-6 py-5 sm:px-8 border-t border-slate-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sticky bottom-0 z-10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all duration-200 shadow-sm disabled:opacity-50"
                disabled={loading}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                form="dealer-form"
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  dealer ? 'Lưu thay đổi' : 'Thêm đại lý mới'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DealerForm;