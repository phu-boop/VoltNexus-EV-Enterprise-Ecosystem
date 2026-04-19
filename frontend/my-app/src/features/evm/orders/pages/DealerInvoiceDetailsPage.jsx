import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import paymentService from '../../../payments/services/paymentService';
import { toast } from 'react-toastify';
import {
  FiArrowLeft,
  FiClock,
  FiCheckCircle,
  FiFileText,
  FiCalendar,
  FiUser,
  FiDollarSign,
  FiHash,
  FiActivity,
  FiAlertCircle,
  FiInfo,
  FiCreditCard
} from 'react-icons/fi';

const DealerInvoiceDetailsPage = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInvoiceDetails();
  }, [invoiceId]);

  const loadInvoiceDetails = async () => {
    setLoading(true);
    try {
      const response = await paymentService.getDealerInvoiceByIdAlternative(invoiceId);
      const data = response.data?.data || response.data;
      setInvoice(data);
    } catch (error) {
      console.error('Error loading invoice details:', error);
      toast.error('Không thể tải chi tiết hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatDate = (dateString, showTime = true) => {
    if (!dateString) return '-';
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...(showTime && { hour: '2-digit', minute: '2-digit' })
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const getStatusBadge = (status) => {
    const configs = {
      UNPAID: { color: "red", text: "Chưa thanh toán", icon: FiAlertCircle },
      PARTIALLY_PAID: { color: "amber", text: "Thanh toán một phần", icon: FiClock },
      PAID: { color: "emerald", text: "Đã tất toán", icon: FiCheckCircle },
      OVERDUE: { color: "rose", text: "Quá hạn", icon: FiAlertCircle }
    };

    const config = configs[status] || { color: "slate", text: status, icon: FiFileText };
    const { color, text, icon: Icon } = config;

    return (
      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-black bg-${color}-50 text-${color}-700 border border-${color}-100 shadow-sm uppercase tracking-widest`}>
        <Icon size={12} className={`text-${color}-500`} />
        {text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 -m-6 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">Đang nạp chứng từ...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50/50 -m-6 p-6 flex items-center justify-center">
        <div className="text-center animate-in zoom-in-95 duration-500">
          <div className="text-slate-200 text-8xl mb-6 flex justify-center">🔍</div>
          <h3 className="text-xl font-black text-slate-900">Không tìm thấy hóa đơn</h3>
          <p className="text-slate-400 font-medium mt-1">Dữ liệu yêu cầu không tồn tại hoặc đã bị gỡ bỏ.</p>
          <button onClick={() => navigate(-1)} className="mt-8 px-8 py-3 bg-blue-600 text-white font-black text-xs rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const remainingAmount = parseFloat(invoice.totalAmount || 0) - parseFloat(invoice.amountPaid || 0);

  return (
    <div className="min-h-screen bg-slate-50/50 -m-6 p-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="mb-8 max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center text-slate-500 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-all mb-6"
        >
          <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all mr-3">
            <FiArrowLeft size={16} />
          </div>
          Trở về hồ sơ hóa đơn
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
              <FiFileText size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Chi Tiết Hóa Đơn</h1>
              <p className="text-slate-500 font-medium mt-0.5">Số hiệu chứng từ: <span className="text-blue-600 font-black">#{invoice.dealerInvoiceId?.substring(0, 8)}</span></p>
            </div>
          </div>
          <div className="flex items-center">
            {getStatusBadge(invoice.status)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">

        {/* Left Column: Bill Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 relative">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
              <FiCreditCard size={160} />
            </div>

            <div className="flex items-center gap-2 mb-8">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <FiInfo className="text-blue-600" size={16} />
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Thông tin đối soát</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 shadow-inner">Đại lý thụ hưởng</p>
                  <p className="text-base font-black text-slate-800 flex items-center gap-2">
                    <FiUser className="text-blue-600" />
                    Đại lý #{invoice.dealerId?.substring(0, 8) || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thời gian phát hành</p>
                  <p className="text-base font-bold text-slate-700 flex items-center gap-2">
                    <FiCalendar size={14} className="text-slate-400" />
                    {formatDate(invoice.createdAt)}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mã tham chiếu đơn hàng</p>
                  <p className="text-base font-mono font-black text-blue-600 flex items-center gap-2">
                    <FiHash />
                    #{invoice.orderId?.substring(0, 8) || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hạn chót thanh toán</p>
                  <p className="text-base font-bold text-rose-600 flex items-center gap-2">
                    <FiClock size={14} />
                    {formatDate(invoice.dueDate, false)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-10 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng định mức</p>
                  <p className="text-2xl font-black text-slate-900">{formatCurrency(invoice.totalAmount)}</p>
                </div>
                <div className="p-3 bg-white text-blue-600 rounded-2xl shadow-sm">
                  <FiDollarSign size={20} />
                </div>
              </div>

              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Đã quyết toán</p>
                  <p className="text-2xl font-black text-emerald-700">{formatCurrency(invoice.amountPaid)}</p>
                </div>
                <div className="p-3 bg-white text-emerald-600 rounded-2xl shadow-sm">
                  <FiCheckCircle size={20} />
                </div>
              </div>
            </div>

            {invoice.notes && (
              <div className="mt-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 border-dashed">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <FiActivity />
                  Chỉ dẫn nghiệp vụ
                </p>
                <p className="text-sm font-medium text-slate-700 leading-relaxed italic">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Payment Timeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 flex flex-col h-full bg-slate-900 text-white">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <FiActivity className="text-blue-500" />
              Tiến trình thanh toán
            </h3>

            {invoice.transactions && invoice.transactions.length > 0 ? (
              <div className="relative space-y-8 flex-1">
                {/* Timeline Line */}
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-800" />

                {invoice.transactions.map((transaction, idx) => (
                  <div key={transaction.dealerTransactionId} className="relative pl-12">
                    {/* Timeline Node */}
                    <div className={`absolute left-[0.35rem] top-1.5 w-3 h-3 rounded-full border-2 border-slate-900 z-10 ${transaction.status === 'CONFIRMED' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`} />

                    <div>
                      <p className="text-xs font-black text-slate-400 mb-1">{formatDate(transaction.createdAt)}</p>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-black group-hover:text-blue-400 transition-colors">
                          {formatCurrency(transaction.amount)}
                        </p>
                        {transaction.status === 'CONFIRMED' ? (
                          <FiCheckCircle className="text-emerald-500" size={14} />
                        ) : (
                          <FiClock className="text-amber-500 animate-pulse" size={14} />
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">#{transaction.dealerTransactionId?.substring(0, 8)}</p>
                      {transaction.notes && (
                        <p className="mt-2 text-[11px] text-slate-400 font-medium leading-relaxed italic border-l-2 border-slate-800 pl-3">"{transaction.notes}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 opacity-40">
                <FiClock size={60} className="text-slate-700 mb-4" />
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest text-center italic">Chưa phát sinh giao dịch nào</p>
              </div>
            )}

            {/* Total Balance Summary at Bottom of Sidebar */}
            <div className="mt-12 pt-8 border-t border-slate-800">
              <div className="flex flex-col items-center gap-1 mb-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nghĩa vụ còn lại</p>
                <p className={`text-3xl font-black tracking-tighter ${remainingAmount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {formatCurrency(remainingAmount)}
                </p>
                {remainingAmount <= 0 && (
                  <span className="mt-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-lg border border-emerald-500/20 uppercase tracking-widest">
                    Đã thanh lý
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerInvoiceDetailsPage;
