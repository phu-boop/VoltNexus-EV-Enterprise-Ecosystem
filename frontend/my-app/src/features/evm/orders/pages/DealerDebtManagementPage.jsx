import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import paymentService from '../../../payments/services/paymentService';
import dealerService from '../../../admin/manageDealer/dealers/services/dealerService';
import { toast } from 'react-toastify';
import {
  FiDollarSign,
  FiEye,
  FiFileText,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiSearch
} from 'react-icons/fi';

const DealerDebtManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [debtSummary, setDebtSummary] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    size: 10
  });

  useEffect(() => {
    const fetchDealersContext = async () => {
      try {
        const res = await dealerService.getBasicList();
        setDealers(res.data?.data || res.data || []);
      } catch (err) {
        console.warn("Could not load dealer directory", err);
      }
    };
    fetchDealersContext();
  }, []);

  useEffect(() => {
    loadDebtSummary();
  }, [pagination.currentPage]);

  const loadDebtSummary = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        size: pagination.size
      };

      const response = await paymentService.getDealerDebtSummary(params);
      const data = response.data?.data || response.data;

      if (data) {
        setDebtSummary(data.content || []);
        setPagination(prev => ({
          ...prev,
          totalElements: data.totalElements || 0,
          totalPages: data.totalPages || 0
        }));
      }
    } catch (error) {
      console.error('Error loading debt summary:', error);
      toast.error('Không thể tải danh sách công nợ');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleViewDetails = (dealerId) => {
    const prefix = location.pathname.includes('/admin/') ? '/evm/admin' : '/evm/staff';
    navigate(`${prefix}/debt/${dealerId}/invoices`);
  };

  const getDealerDetails = (dealerId) => {
    const dealer = dealers.find(d => d.id === dealerId || d.dealerId === dealerId);
    if (dealer) return { name: dealer.name || dealer.dealerName, displayId: dealerId?.substring(0, 8) };
    return { name: `Đại lý vãng lai`, displayId: dealerId?.substring(0, 8) };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const getStatusBadge = (currentBalance) => {
    if (currentBalance <= 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm whitespace-nowrap">
          <FiCheckCircle size={12} className="text-emerald-500" />
          Đã tất toán
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-100 shadow-sm whitespace-nowrap">
        <FiAlertCircle size={12} className="text-red-500" />
        Còn nợ
      </span>
    );
  };

  // Calculate totals for the visible data
  const totals = useMemo(() => {
    return debtSummary.reduce((acc, item) => {
      acc.totalOwed += parseFloat(item.totalOwed || 0);
      acc.totalPaid += parseFloat(item.totalPaid || 0);
      acc.currentBalance += parseFloat(item.currentBalance || 0);
      return acc;
    }, { totalOwed: 0, totalPaid: 0, currentBalance: 0 });
  }, [debtSummary]);

  return (
    <div className="min-h-screen bg-slate-50/50 -m-6 p-6 animate-in fade-in duration-500">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-rose-600 rounded-2xl shadow-xl shadow-rose-200">
            <FiUsers size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Công Nợ Đại Lý</h1>
            <p className="text-slate-500 font-medium mt-0.5">Giám sát dư nợ và lịch sử quyết toán toàn hệ thống</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Tổng nợ phát sinh', value: totals.totalOwed, icon: FiFileText, color: 'blue', sub: 'Tổng giá trị hóa đơn' },
          { label: 'Tổng đã thanh toán', value: totals.totalPaid, icon: FiTrendingUp, color: 'emerald', sub: 'Tiền mặt & Chuyển khoản' },
          { label: 'Dư nợ hiện hành', value: totals.currentBalance, icon: FiDollarSign, color: 'rose', sub: 'Nghĩa vụ chưa hoàn thành' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform`} />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5 italic">{stat.sub}</p>
                </div>
              </div>
              <p className={`text-2xl font-black text-slate-900`}>{formatCurrency(stat.value)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Actions */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đại lý hoặc tên..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* Debt Summary Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 border-4 border-rose-600/20 border-t-rose-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">Đang lập báo cáo công nợ...</p>
          </div>
        ) : debtSummary.length === 0 ? (
          <div className="p-20 text-center animate-in zoom-in-95 duration-500">
            <div className="text-slate-200 text-8xl mb-6 flex justify-center">📦</div>
            <h3 className="text-xl font-black text-slate-900">Chưa có dữ liệu</h3>
            <p className="text-slate-400 font-medium mt-1">Không tìm thấy thông tin công nợ của đại lý nào.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đại lý thụ hưởng</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng nợ</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đã quyết toán</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dư nợ hiện tại</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {debtSummary.map((item) => {
                    const ctx = getDealerDetails(item.dealerId);
                    return (
                      <tr key={item.dealerId} className="group hover:bg-slate-50/80 transition-all duration-300">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm font-black text-xs uppercase">
                              DL
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 line-clamp-1">{ctx.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">ID: #{ctx.displayId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 font-bold text-slate-700 text-sm">
                          {formatCurrency(item.totalOwed)}
                        </td>
                        <td className="px-6 py-6 font-bold text-emerald-600 text-sm">
                          {formatCurrency(item.totalPaid)}
                        </td>
                        <td className="px-6 py-6 font-black text-rose-600 text-sm">
                          {formatCurrency(item.currentBalance)}
                        </td>
                        <td className="px-6 py-6 text-center">
                          {getStatusBadge(item.currentBalance)}
                        </td>
                        <td className="px-6 py-6 text-right">
                          <button
                            onClick={() => handleViewDetails(item.dealerId)}
                            className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-2 ml-auto"
                          >
                            <FiEye size={14} />
                            Chi tiết
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
                  Danh sách <span className="text-rose-600 font-black">{debtSummary.length}</span> / {pagination.totalElements} đại lý
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 0}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-all shadow-sm active:scale-90"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index)}
                      className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${pagination.currentPage === index
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-200'
                        : 'bg-white border border-slate-200 text-slate-500 hover:border-rose-300'
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages - 1}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-all shadow-sm active:scale-90"
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

export default DealerDebtManagementPage;
