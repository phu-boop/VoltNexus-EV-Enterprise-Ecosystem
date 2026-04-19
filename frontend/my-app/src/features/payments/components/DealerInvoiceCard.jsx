// Dealer Invoice Card Component
import React from 'react';
import {
  FiFileText,
  FiCalendar,
  FiDollarSign,
  FiEye,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiTrendingUp
} from 'react-icons/fi';

const DealerInvoiceCard = ({ invoice, onView, onPay }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const configs = {
      'UNPAID': { color: 'red', label: 'Chưa thanh toán', icon: FiAlertCircle },
      'PARTIALLY_PAID': { color: 'amber', label: 'Thanh toán một phần', icon: FiClock },
      'PAID': { color: 'emerald', label: 'Đã tất toán', icon: FiCheckCircle },
      'OVERDUE': { color: 'rose', label: 'Quá hạn', icon: FiAlertCircle }
    };

    const config = configs[status] || { color: 'slate', label: status, icon: FiInfo };
    const { color, label, icon: Icon } = config;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-${color}-50 text-${color}-700 border border-${color}-100 shadow-sm uppercase tracking-widest`}>
        <Icon size={12} className={`text-${color}-500`} />
        {label}
      </span>
    );
  };

  const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status !== 'PAID';
  const progress = (invoice.amountPaid / invoice.totalAmount) * 100 || 0;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform`} />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
              <FiFileText size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Hóa đơn #{invoice.dealerInvoiceId?.substring(0, 8)}</h3>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <FiCalendar size={10} /> {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
                </p>
                {invoice.dueDate && (
                  <p className={`text-[10px] font-black flex items-center gap-1 uppercase tracking-tight ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                    <FiClock size={10} /> Hạn: {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>
            </div>
          </div>
          {getStatusBadge(invoice.status)}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng định mức</p>
            <p className="text-base font-black text-slate-900">{formatCurrency(invoice.totalAmount)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">Đã quyết toán</p>
            <p className="text-base font-black text-emerald-600">{formatCurrency(invoice.amountPaid)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-widest">Nghĩa vụ còn lại</p>
            <p className="text-base font-black text-rose-600">{formatCurrency(invoice.remainingAmount || (invoice.totalAmount - invoice.amountPaid))}</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <FiTrendingUp size={10} /> Tiến trình hoàn tất
            </p>
            <p className="text-[10px] font-black text-blue-600">{progress.toFixed(1)}%</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(37,99,235,0.4)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
          <button
            onClick={onView}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm"
          >
            <FiEye size={14} />
            Hồ sơ chi tiết
          </button>
          {invoice.status !== 'PAID' && (invoice.remainingAmount > 0 || (invoice.totalAmount - invoice.amountPaid) > 0) && (
            <button
              onClick={() => onPay && onPay(invoice.dealerInvoiceId)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100"
            >
              <FiDollarSign size={14} />
              Quyết toán nhanh
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealerInvoiceCard;


