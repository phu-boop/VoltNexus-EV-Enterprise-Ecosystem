import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FiX,
  FiPlus,
  FiEdit3,
  FiSave,
  FiHash,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiInfo,
  FiActivity
} from 'react-icons/fi';

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

  const formContent = (
    <div className="fixed inset-0 z-[9999] overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onCancel}
      />

      {/* Drawer Panel */}
      <div
        className="relative w-screen max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-500 ease-out sm:rounded-l-[3rem]"
      >
        {/* Header */}
        <div className="px-8 py-8 border-b border-slate-100 relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${dealer ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                {dealer ? <FiEdit3 size={24} /> : <FiPlus size={24} />}
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {dealer ? 'Cập nhật đại lý' : 'Thêm đại lý mới'}
                </h2>
                <p className="text-slate-500 font-medium text-sm mt-0.5 whitespace-nowrap">
                  {dealer ? 'Chỉnh sửa thông số vận hành' : 'Kiến tạo mắt xích mới trong mạng lưới'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-700 transition-all active:scale-95 shadow-sm"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-8 py-8 bg-slate-50/30">
          <form id="dealer-form" onSubmit={handleSubmit} className="space-y-8 pb-12">

            {/* Essential Info Section */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <FiInfo className="text-blue-500" />
                Thông số định danh
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2 ml-1 uppercase tracking-wider">
                    Mã đại lý <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      name="dealerCode"
                      value={formData.dealerCode}
                      onChange={handleChange}
                      disabled={!!dealer}
                      placeholder="VD: DLR-VN-001"
                      className={`w-full pl-11 pr-4 py-3.5 bg-white border rounded-2xl text-sm font-bold transition-all ${errors.dealerCode ? 'border-rose-200 bg-rose-50/30 text-rose-900' : 'border-slate-100 text-slate-900 focus:ring-2 focus:ring-blue-500/10'
                        } ${dealer ? 'opacity-60 grayscale' : ''}`}
                    />
                  </div>
                  {errors.dealerCode && <p className="mt-2 text-[10px] font-bold text-rose-500 ml-2 uppercase italic">{errors.dealerCode}</p>}
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2 ml-1 uppercase tracking-wider">
                    Tên đại lý <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      name="dealerName"
                      value={formData.dealerName}
                      onChange={handleChange}
                      placeholder="Tên pháp lý đại lý..."
                      className={`w-full pl-11 pr-4 py-3.5 bg-white border rounded-2xl text-sm font-bold transition-all ${errors.dealerName ? 'border-rose-200 bg-rose-50/30 text-rose-900' : 'border-slate-100 text-slate-900 focus:ring-2 focus:ring-blue-500/10'
                        }`}
                    />
                  </div>
                  {errors.dealerName && <p className="mt-2 text-[10px] font-bold text-rose-500 ml-2 uppercase italic">{errors.dealerName}</p>}
                </div>
              </div>
            </div>

            {/* Geography Section */}
            <div className="space-y-6 pt-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <FiMapPin className="text-emerald-500" />
                Vị trí địa lý
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-700 mb-2 ml-1 uppercase tracking-wider">Địa chỉ giao dịch</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Số nhà, Tên đường..."
                    className="w-full px-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2 ml-1 uppercase tracking-wider">Thành phố/Tỉnh</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="VD: TP. Hồ Chí Minh"
                    className="w-full px-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2 ml-1 uppercase tracking-wider">Khu vực quản lý</label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    placeholder="VD: Miền Nam"
                    className="w-full px-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Contact & Legal Section */}
            <div className="space-y-6 pt-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <FiActivity className="text-purple-500" />
                Thông tin pháp lý & Liên hệ
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2 ml-1 uppercase tracking-wider">Hotline</label>
                  <div className="relative group">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="028 ..."
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-purple-500/10 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2 ml-1 uppercase tracking-wider">Email định danh</label>
                  <div className="relative group">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="office@dealer.com"
                      className={`w-full pl-11 pr-4 py-3.5 bg-white border rounded-2xl text-sm font-bold transition-all ${errors.email ? 'border-rose-200 bg-rose-50/30 text-rose-900' : 'border-slate-100 text-slate-900 focus:ring-2 focus:ring-purple-500/10'
                        }`}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-700 mb-2 ml-1 uppercase tracking-wider">Mã số thuế</label>
                  <div className="relative group">
                    <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" />
                    <input
                      type="text"
                      name="taxNumber"
                      value={formData.taxNumber}
                      onChange={handleChange}
                      placeholder="Nhập MST doanh nghiệp..."
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-purple-500/10 transition-all font-mono tracking-tight"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer with Actions */}
        <div className="px-8 py-6 border-t border-slate-100 bg-white">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-3.5 text-xs font-black text-slate-500 hover:text-slate-700 uppercase tracking-widest transition-all"
              disabled={loading}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              form="dealer-form"
              className="px-10 py-3.5 bg-slate-900 text-white font-black text-xs rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 uppercase tracking-[0.2em]"
              disabled={loading}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSave size={16} />
              )}
              {loading ? 'Đang xử lý...' : dealer ? 'Lưu thay đổi' : 'Thêm mới'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(formContent, document.body);
};

export default DealerForm;