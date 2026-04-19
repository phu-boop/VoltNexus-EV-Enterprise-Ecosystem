// Payment Method Form Component
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiCreditCard, FiMonitor, FiGlobe, FiSettings, FiCheckCircle } from 'react-icons/fi';

const PaymentMethodForm = ({ method, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    methodName: '',
    methodType: 'GATEWAY',
    scope: 'ALL',
    isActive: true,
    configJson: ''
  });

  const [fadeType, setFadeType] = useState('in');

  useEffect(() => {
    if (method) {
      setFormData({
        methodName: method.methodName || '',
        methodType: method.methodType || 'GATEWAY',
        scope: method.scope || 'ALL',
        isActive: method.isActive !== undefined ? method.isActive : true,
        configJson: method.configJson
          ? (typeof method.configJson === 'string' ? method.configJson : JSON.stringify(method.configJson, null, 2))
          : ''
      });
    }
  }, [method]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleClose = () => {
    setFadeType('out');
    setTimeout(() => {
      onCancel();
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate configJson as valid JSON if provided
    let configJson = formData.configJson;
    if (configJson && configJson.trim()) {
      try {
        configJson = JSON.parse(configJson);
      } catch (error) {
        alert('Cấu hình JSON không hợp lệ. Vui lòng nhập định dạng chuẩn RFC 8259.');
        return;
      }
    } else {
      configJson = null;
    }

    setFadeType('out');
    setTimeout(() => {
      onSave({
        methodName: formData.methodName,
        methodType: formData.methodType,
        scope: formData.scope,
        isActive: formData.isActive,
        configJson: configJson
      });
    }, 300);
  };

  const modalContent = (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${fadeType === 'in' ? 'bg-slate-900/40 backdrop-blur-sm opacity-100' : 'bg-transparent backdrop-blur-none opacity-0'}`}
      onMouseDown={handleClose}
    >
      <div
        className={`w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-300 flex flex-col max-h-[90vh] ${fadeType === 'in' ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl shadow-sm ${method ? 'bg-amber-100 text-amber-600' : 'bg-blue-600 text-white shadow-blue-200 shadow-xl'}`}>
              <FiCreditCard size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {method ? 'Cập Nhật Tham Số Giao Dịch' : 'Tạo Phân Hệ Thanh Toán'}
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                {method ? 'Điều chỉnh thuộc tính Endpoint/Gateway hiện tại' : 'Khai báo chuẩn giao thức phân bổ tiền tuyến'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all rounded-xl active:scale-90"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col scrollbar-hide">

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">

              {/* Method Name */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Định Danh Phân Hệ <span className="text-red-500 font-black">*</span>
                </label>
                <div className="relative">
                  <FiCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="methodName"
                    value={formData.methodName}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                    placeholder="VD: Cổng thanh toán nội địa VNPAY..."
                  />
                </div>
              </div>

              {/* Transaction Type & Scope */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Chuẩn Giao Dịch <span className="text-red-500 font-black">*</span>
                  </label>
                  <div className="relative">
                    <FiMonitor className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      name="methodType"
                      value={formData.methodType}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-10 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                    >
                      <option value="GATEWAY">Điện Tử (VNPAY, Stripe, Momo)</option>
                      <option value="MANUAL">Thủ Công (Kế Toán Đối Soát)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Không Gian Truy Cập <span className="text-red-500 font-black">*</span>
                  </label>
                  <div className="relative">
                    <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      name="scope"
                      value={formData.scope}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-10 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                    >
                      <option value="ALL">Toàn Trục Hệ Thống (B2C & B2B)</option>
                      <option value="B2B">Kênh Phân Phối Đại Lý (B2B)</option>
                      <option value="B2C">Thương Mại Trực Tiếp (B2C)</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* Active Toggle Switch */}
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-slate-800">Trạng Thái Hệ Thống</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Kích hoạt luồng tiền tuyến vào quy trình</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-[24px] shadow-inner"></div>
              </label>
            </div>

            {/* JSON Config Core */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                <FiSettings size={14} /> Hồ Sơ Thuộc Tính (JSON Payload) <span className="text-slate-300 lowercase">(Tùy Chọn)</span>
              </label>
              <textarea
                name="configJson"
                value={formData.configJson}
                onChange={handleChange}
                rows={5}
                className="w-full p-4 bg-slate-900 border-none rounded-2xl text-xs font-mono text-emerald-400 focus:ring-2 focus:ring-slate-700 transition-all shadow-inner resize-none placeholder-slate-700 break-words"
                placeholder={'{\n  "vnp_TmnCode": "GATEWAY_KEY",\n  "api_endpoint": "https://..."\n}'}
              />
              <p className="mt-2 text-[10px] font-bold text-amber-500 flex items-center gap-1">
                Môi trường xử lý dữ liệu nhạy cảm. Mã JSON phải đảm bảo hợp chuẩn RFC 8259 của RESTful Core!
              </p>
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-8 border-t border-slate-100 mt-auto">
            <button
              type="button"
              onClick={handleClose}
              className="px-8 py-3.5 bg-slate-100 text-slate-500 font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all shadow-sm active:scale-95"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-300 active:scale-95"
            >
              <FiCheckCircle size={18} />
              {method ? 'Cập Nhật Core' : 'Nạp Module Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Directly bind rendering to document body to burst out of inner layouts
  return createPortal(modalContent, document.body);
};

export default PaymentMethodForm;
