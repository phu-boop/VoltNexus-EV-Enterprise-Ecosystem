// Create Invoice Form Component (EVM Staff)
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiFileText, FiDollarSign, FiCalendar, FiAlignLeft, FiCheckCircle, FiUser } from 'react-icons/fi';

const CreateInvoiceForm = ({ dealerId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    dealerId: dealerId,
    orderId: '',
    amount: '',
    dueDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [fadeType, setFadeType] = useState('in');

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

  const handleClose = () => {
    setFadeType('out');
    setTimeout(() => {
      onCancel();
    }, 300);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.orderId || formData.orderId.trim() === '') {
      newErrors.orderId = 'Chuỗi hệ thống Order ID là bắt buộc nhập.';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Giá trị biểu kiến phải lớn hơn 0.';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Vui lòng xác định hạn mức thời gian.';
    } else {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        newErrors.dueDate = 'Giới hạn thời gian không được phép truy hồi về quá khứ.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setFadeType('out');
      setTimeout(() => {
        onSave({
          dealerId: formData.dealerId,
          orderId: formData.orderId,
          amount: parseFloat(formData.amount),
          dueDate: formData.dueDate,
          notes: formData.notes || null
        });
      }, 300);
    }
  };

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const today = new Date().toISOString().split('T')[0];

  const modalContent = (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${fadeType === 'in' ? 'bg-slate-900/40 backdrop-blur-sm opacity-100' : 'bg-transparent backdrop-blur-none opacity-0'}`}
      onMouseDown={handleClose}
    >
      <div
        className={`w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-300 flex flex-col max-h-[90vh] ${fadeType === 'in' ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200">
              <FiFileText size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Khai Báo Cổng Doanh Thu</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Chuẩn hóa dữ liệu dòng tiền Order lưới Đại lý B2B</p>
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

        {/* Form Logic Block */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col scrollbar-hide">

          {/* Dealer Indicator (Disabled) */}
          <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/50 flex items-center gap-4 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <FiUser size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Định Danh Đối Tác</p>
              <p className="text-sm font-bold text-slate-700 font-mono mt-0.5">{formData.dealerId}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">

              {/* Reference Order ID */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Mã Căn Cước Biên Nhận (Order ID) <span className="text-red-500 font-black">*</span>
                </label>
                <div className="relative">
                  <FiFileText className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.orderId ? 'text-red-400' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner ${errors.orderId ? 'ring-2 ring-red-400 bg-red-50' : ''}`}
                    placeholder="VD: 550e8400-e29b-41d4-a716-446655440000"
                  />
                </div>
                {errors.orderId ? (
                  <p className="mt-2 text-xs font-bold text-red-500 ml-1">{errors.orderId}</p>
                ) : (
                  <p className="mt-2 text-[10px] font-bold text-amber-500 grid-cols-1 gap-1 ml-1">
                    Giao dịch gốc (B2B) bắt buộc phải tồn tại bên trong Sales Service.
                  </p>
                )}
              </div>

              {/* Amount Payload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Định Mức Lệ Phí <span className="text-red-500 font-black">*</span>
                  </label>
                  <div className="relative">
                    <FiDollarSign className={`absolute left-4 top-[25px] -translate-y-1/2 ${errors.amount ? 'text-red-400' : 'text-slate-400'}`} />
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      min="1"
                      step="1000"
                      className={`w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner ${errors.amount ? 'ring-2 ring-red-400 bg-red-50' : ''}`}
                      placeholder="100,000"
                    />
                    <div className="mt-2 ml-1 text-sm font-black text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-lg border border-emerald-100">
                      {formatCurrency(parseFloat(formData.amount) || 0)}
                    </div>
                  </div>
                  {errors.amount && <p className="mt-2 text-xs font-bold text-red-500 ml-1">{errors.amount}</p>}
                </div>

                {/* Due Date Matrix */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Đáo Hạn Giao Kết <span className="text-red-500 font-black">*</span>
                  </label>
                  <div className="relative">
                    <FiCalendar className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.dueDate ? 'text-red-400' : 'text-slate-400'}`} />
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      min={today}
                      className={`w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all shadow-inner uppercase ${errors.dueDate ? 'ring-2 ring-red-400 bg-red-50' : ''}`}
                    />
                  </div>
                  {errors.dueDate && <p className="mt-2 text-xs font-bold text-red-500 ml-1">{errors.dueDate}</p>}
                </div>
              </div>

              {/* Internal Notes Array */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Chỉ Thị Vận Hành <span className="text-slate-300 lowercase">(Tùy Chọn)</span>
                </label>
                <div className="relative">
                  <FiAlignLeft className="absolute left-4 top-5 text-slate-400" />
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all shadow-inner resize-none placeholder-slate-300"
                    placeholder="Ghi chú điều khoản bổ sung, lịch trình chuyển đổi dòng tiền..."
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="flex justify-end gap-3 pt-8 border-t border-slate-100 mt-auto">
            <button
              type="button"
              onClick={handleClose}
              className="px-8 py-3.5 bg-slate-100 text-slate-500 font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all shadow-sm active:scale-95"
            >
              Hủy Thao Tác
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-300 active:scale-95"
            >
              <FiCheckCircle size={18} />
              Khởi Tạo Hóa Đơn
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreateInvoiceForm;
