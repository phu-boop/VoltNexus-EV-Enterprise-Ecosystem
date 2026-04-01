import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import paymentService from '../../../payments/services/paymentService';
import { toast } from 'react-toastify';
import {
  FiArrowLeft,
  FiFileText,
  FiCalendar,
  FiDollarSign,
  FiHash,
  FiInfo,
  FiCreditCard,
  FiUser,
  FiCheckCircle,
  FiTruck,
  FiEdit3
} from 'react-icons/fi';

const CreateInvoiceFromOrderPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();
  const order = location.state?.order;

  const [formData, setFormData] = useState({
    orderId: orderId || order?.orderId || '',
    dealerId: order?.dealerId || '',
    amount: order?.totalAmount || '',
    dueDate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!order && orderId) {
      // TODO: Fetch order details if needed
    }
  }, [order, orderId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.orderId) newErrors.orderId = 'Mã đơn hàng là bắt buộc';
    if (!formData.dealerId) newErrors.dealerId = 'Mã đại lý là bắt buộc';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Số tiền phải lớn hơn 0';

    if (!formData.dueDate) {
      newErrors.dueDate = 'Hạn thanh toán là bắt buộc';
    } else {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        newErrors.dueDate = 'Hạn thanh toán phải là ngày hôm nay hoặc sau đó';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        orderId: formData.orderId,
        dealerId: formData.dealerId,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        notes: formData.notes || undefined
      };

      const response = await paymentService.createDealerInvoice(payload);
      toast.success('Hóa đơn đã được tạo thành công!');
      const prefix = location.pathname.includes('/admin/') ? '/evm/admin' : '/evm/staff';
      navigate(`${prefix}/orders`, {
        state: { message: 'Hóa đơn đã được tạo thành công' }
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency', currency: 'VND'
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 -m-6 p-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center text-slate-500 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-all mb-6"
        >
          <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all mr-3">
            <FiArrowLeft size={16} />
          </div>
          Quay lại trang trước
        </button>

        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-200">
            <FiCreditCard size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quyết Toán & Lập Hóa Đơn</h1>
            <p className="text-slate-500 font-medium mt-0.5">Khởi tạo chứng từ tài chính cho lệnh điều phối xe</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <FiEdit3 size={18} />
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Thông tin chứng từ</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Mã lệnh điều phối <span className="text-red-500 font-black">*</span>
                  </label>
                  <div className="relative">
                    <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.orderId}
                      disabled
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed uppercase hover:ring-2 hover:ring-slate-100 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Mã đại lý thụ hưởng <span className="text-red-500 font-black">*</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.dealerId}
                      disabled
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed uppercase hover:ring-2 hover:ring-slate-100 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Số tiền thanh toán <span className="text-red-500 font-black">*</span>
                  </label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      step="1000"
                      className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-blue-500 transition-all ${errors.amount ? 'ring-2 ring-red-500' : ''}`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.amount && <p className="mt-2 text-[11px] font-bold text-red-500 ml-1 italic capitalize">⚠ {errors.amount}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Hạn chót quyết toán <span className="text-red-500 font-black">*</span>
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-10 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-blue-500 transition-all ${errors.dueDate ? 'ring-2 ring-red-500' : ''}`}
                    />
                  </div>
                  {errors.dueDate && <p className="mt-2 text-[11px] font-bold text-red-500 ml-1 italic capitalize">⚠ {errors.dueDate}</p>}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Chỉ dẫn nghiệp vụ & Ghi chú
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-3xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all resize-none placeholder:text-slate-300"
                  placeholder="Nhập nội dung ghi chú đính kèm hóa đơn..."
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white font-black text-sm rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FiCheckCircle size={20} />
                  )}
                  {loading ? 'Đang khởi tạo...' : 'Xác nhận tạo hóa đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Order Preview */}
        <div className="space-y-6">
          {order ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-32 bg-blue-600 opacity-[0.03] pointer-events-none" />
              <div className="p-8 relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-1.5 bg-blue-50 rounded-lg">
                    <FiInfo className="text-blue-600" size={16} />
                  </div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Xem trước đơn hàng</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mã tham chiếu</p>
                      <p className="text-sm font-mono font-black text-blue-600">#{order.orderId?.substring(0, 8)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạng thái</p>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-100 whitespace-nowrap">
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                        <FiUser size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đại lý nhận hàng</p>
                        <p className="text-sm font-bold text-slate-700">Đại lý #{order.dealerId?.substring(0, 8)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                        <FiCalendar size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày lệnh phát hành</p>
                        <p className="text-sm font-bold text-slate-700">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 mt-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Nghĩa vụ tài chính tạm tính</p>
                    <p className="text-3xl font-black text-slate-900 text-center tracking-tighter">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-200 p-12 text-center">
              <div className="text-slate-100 text-6xl mb-4">🔍</div>
              <p className="text-slate-400 text-sm font-bold italic tracking-wide">Đang định danh thông tin đơn hàng...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateInvoiceFromOrderPage;
