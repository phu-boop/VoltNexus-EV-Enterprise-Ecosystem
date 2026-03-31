import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import paymentService from '../../../payments/services/paymentService';
import { toast } from 'react-toastify';
import {
  FiArrowLeft,
  FiEye,
  FiFileText,
  FiDollarSign,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiHash,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

const DealerInvoicesListPage = () => {
  const { dealerId } = useParams();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    page: 0,
    size: 10
  });
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0
  });

  // Stats calculation for the dealer's invoices
  const stats = useMemo(() => {
    const totalCount = invoices.length;
    const unpaidCount = invoices.filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE').length;
    const totalRemaining = invoices.reduce((acc, i) => acc + (parseFloat(i.totalAmount || 0) - parseFloat(i.amountPaid || 0)), 0);
    return { totalCount, unpaidCount, totalRemaining };
  }, [invoices]);

  useEffect(() => {
    loadInvoices();
  }, [dealerId, filters.status, filters.page]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        size: filters.size
      };
      if (filters.status) {
        params.status = filters.status;
      }

      const response = await paymentService.getDealerInvoices(dealerId, params);
      const data = response.data?.data || response.data;

      if (data) {
        setInvoices(data.content || []);
        setPagination({
          totalElements: data.totalElements || 0,
          totalPages: data.totalPages || 0,
          currentPage: data.number || 0
        });
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (e) => {
    setFilters(prev => ({ ...prev, status: e.target.value, page: 0 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleViewInvoice = (invoiceId) => {
    navigate(`/evm/staff/debt/invoices/${invoiceId}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const configs = {
      UNPAID: { color: "red", text: "Chưa thanh toán", icon: FiAlertCircle },
      PARTIALLY_PAID: { color: "amber", text: "Thanh toán một phần", icon: FiClock },
      PAID: { color: "emerald", text: "Đã thanh toán", icon: FiCheckCircle },
      OVERDUE: { color: "rose", text: "Quá hạn", icon: FiAlertCircle }
    };

    const config = configs[status] || { color: "slate", text: status, icon: FiFileText };
    const { color, text, icon: Icon } = config;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-${color}-50 text-${color}-700 border border-${color}-100 shadow-sm whitespace-nowrap`}>
        <Icon size={12} className={`text-${color}-500`} />
        {text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 -m-6 p-6 animate-in fade-in duration-500">

      {/* Header Section */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center text-slate-500 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-all mb-6"
        >
          <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all mr-3">
            <FiArrowLeft size={16} />
          </div>
          Quay lại danh sách công nợ
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200">
              <FiFileText size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hồ Sơ Hóa Đơn</h1>
              <p className="text-slate-500 font-medium mt-0.5">Lịch sử tài chính - Đại lý <span className="text-blue-600 font-black">#{dealerId?.substring(0, 8)}</span></p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <FiDollarSign size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng dư nợ</p>
                <p className="text-sm font-black text-rose-600">{formatCurrency(stats.totalRemaining)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex items-center">
        <div className="relative w-full md:w-72">
          <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={filters.status}
            onChange={handleStatusChange}
            className="w-full pl-11 pr-10 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="UNPAID">Chưa thanh toán</option>
            <option value="PARTIALLY_PAID">Thanh toán một phần</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="OVERDUE">Quá hạn</option>
          </select>
        </div>
      </div>

      {/* Main Content Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">Đang truy xuất hóa đơn...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-20 text-center animate-in zoom-in-95 duration-500">
            <div className="text-slate-200 text-8xl mb-6 flex justify-center">📦</div>
            <h3 className="text-xl font-black text-slate-900">Không có hóa đơn</h3>
            <p className="text-slate-400 font-medium mt-1">Đại lý hiện chưa có bất kỳ phát sinh tài chính nào.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đặc danh chứng từ</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời hạn</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Giá trị hóa đơn</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dư nợ còn lại</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.map((invoice) => {
                    const remaining = parseFloat(invoice.totalAmount || 0) - parseFloat(invoice.amountPaid || 0);
                    return (
                      <tr key={invoice.dealerInvoiceId} className="group hover:bg-slate-50/80 transition-all duration-300">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                              <FiFileText size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">#{invoice.dealerInvoiceId?.substring(0, 8)}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Ngày tạo: {formatDate(invoice.createdAt)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <FiCalendar className="text-slate-400" size={14} />
                            <p className="text-sm font-bold text-slate-700">{formatDate(invoice.dueDate)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <p className="text-sm font-black text-slate-900">{formatCurrency(invoice.totalAmount)}</p>
                          <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Đã trả: {formatCurrency(invoice.amountPaid)}</p>
                        </td>
                        <td className="px-6 py-6">
                          <p className={`text-sm font-black ${remaining > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {formatCurrency(remaining)}
                          </p>
                        </td>
                        <td className="px-6 py-6 text-center">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="px-6 py-6 text-right">
                          <button
                            onClick={() => handleViewInvoice(invoice.dealerInvoiceId)}
                            className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                            title="Xem chi tiết"
                          >
                            <FiEye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Đang hiển thị <span className="text-blue-600 font-black">{invoices.length}</span> / {pagination.totalElements} hóa đơn
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 0}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all shadow-sm active:scale-90"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index)}
                      className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${pagination.currentPage === index
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                          : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300'
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages - 1}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all shadow-sm active:scale-90"
                  >
                    <FiChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DealerInvoicesListPage;
