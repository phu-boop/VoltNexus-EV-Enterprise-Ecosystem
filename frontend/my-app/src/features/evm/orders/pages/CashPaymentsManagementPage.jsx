import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import paymentService from "../../../payments/services/paymentService";
import { toast } from "react-toastify";
import {
  FiSearch,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiEye,
  FiDollarSign,
  FiActivity,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiInfo,
  FiMessageSquare
} from "react-icons/fi";
import { useAuthContext } from "../../../auth/AuthProvider";

const CashPaymentsManagementPage = () => {
  const navigate = useNavigate();
  const { id_user } = useAuthContext();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    page: 0,
    size: 10,
  });
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmNotes, setConfirmNotes] = useState("");
  const [confirming, setConfirming] = useState(false);

  // Stats calculation
  const stats = useMemo(() => {
    const pendingCount = transactions.filter(t => t.status === 'PENDING_CONFIRMATION').length;
    const totalCashAmount = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
    return { pendingCount, totalCashAmount };
  }, [transactions]);

  useEffect(() => {
    loadTransactions();
  }, [filters.page]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        size: filters.size,
      };

      const response = await paymentService.getPendingCashPayments(params);
      const data = response.data?.data || response.data;

      if (data) {
        setTransactions(data.content || []);
        setPagination({
          totalElements: data.totalElements || 0,
          totalPages: data.totalPages || 0,
          currentPage: data.number || 0,
        });
      }
    } catch (error) {
      console.error("Error loading cash payments:", error);
      toast.error("Không thể tải danh sách thanh toán tiền mặt");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleViewInvoice = (invoiceId) => {
    navigate(`/evm/staff/debt/invoices/${invoiceId}`);
  };

  const handleConfirm = (transaction) => {
    setSelectedTransaction(transaction);
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedTransaction || !id_user) {
      toast.error("Thiếu thông tin để duyệt thanh toán");
      return;
    }

    setConfirming(true);
    try {
      const payload = {
        notes: confirmNotes || undefined,
      };

      await paymentService.confirmDealerTransaction(
        selectedTransaction.dealerTransactionId,
        payload
      );

      toast.success("Đã duyệt thanh toán thành công! Công nợ và lịch sử thanh toán đã được cập nhật.");
      setShowConfirmModal(false);
      setSelectedTransaction(null);
      setConfirmNotes("");
      loadTransactions();
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast.error(error.response?.data?.message || "Không thể duyệt thanh toán");
    } finally {
      setConfirming(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const configs = {
      PENDING_CONFIRMATION: { color: "amber", text: "Chờ duyệt", icon: FiClock },
      SUCCESS: { color: "emerald", text: "Đã duyệt", icon: FiCheckCircle },
      FAILED: { color: "red", text: "Thất bại", icon: FiXCircle },
    };

    const config = configs[status] || { color: "slate", text: status, icon: FiActivity };
    const { color, text, icon: Icon } = config;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-${color}-50 text-${color}-700 border border-${color}-100 shadow-sm whitespace-nowrap`}>
        <Icon size={12} className={`text-${color}-500`} />
        {text}
      </span>
    );
  };

  // Confirmation Modal Component (Portal)
  const ConfirmModal = () => {
    if (!showConfirmModal || !selectedTransaction) return null;

    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 drop-shadow-2xl">
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => {
            if (!confirming) {
              setShowConfirmModal(false);
              setSelectedTransaction(null);
            }
          }}
        />
        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col">
          {/* Modal Header */}
          <div className="bg-blue-600 px-8 py-6 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <FiDollarSign size={80} />
            </div>
            <h3 className="text-xl font-black tracking-tight">Xác nhận thanh toán</h3>
            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">Nghiệp vụ hạch toán tiền mặt</p>
          </div>

          <div className="p-8 space-y-6 flex-1 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mã tham chiếu</p>
                <p className="text-sm font-mono font-black text-slate-900">#{selectedTransaction.dealerTransactionId?.substring(0, 8)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mã hóa đơn</p>
                <p className="text-sm font-mono font-black text-blue-600">#{selectedTransaction.dealerInvoiceId?.substring(0, 8)}</p>
              </div>
            </div>

            <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-1">Số tiền thực thu</p>
                <p className="text-2xl font-black text-emerald-700">{formatCurrency(selectedTransaction.amount)}</p>
              </div>
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                <FiDollarSign size={24} />
              </div>
            </div>

            {selectedTransaction.notes && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                <FiMessageSquare className="text-amber-500 mt-1 flex-shrink-0" size={18} />
                <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Ghi chú từ đại lý</p>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{selectedTransaction.notes}"</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Ghi chú quyết toán (Nội bộ)
              </label>
              <textarea
                value={confirmNotes}
                onChange={(e) => setConfirmNotes(e.target.value)}
                rows={3}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all resize-none placeholder:text-slate-300"
                placeholder="Nhập nội dung xác nhận giao dịch..."
              />
            </div>
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
            <button
              onClick={() => {
                setShowConfirmModal(false);
                setSelectedTransaction(null);
                setConfirmNotes("");
              }}
              className="flex-1 px-6 py-4 bg-white border border-slate-200 text-slate-600 font-black text-sm rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
              disabled={confirming}
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleConfirmPayment}
              disabled={confirming}
              className="flex-[1.5] px-6 py-4 bg-emerald-600 text-white font-black text-sm rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {confirming ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <FiCheckCircle size={20} />
              )}
              {confirming ? "Đang xử lý..." : "Duyệt quyết toán"}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 -m-6 p-6 animate-in fade-in duration-500">
      <ConfirmModal />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200">
            <FiDollarSign size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Thanh Toán Tiền Mặt</h1>
            <p className="text-slate-500 font-medium mt-0.5">Quản lý và phê chuẩn giao dịch trực tiếp từ đại lý</p>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Giao dịch chờ duyệt', value: pagination.totalElements, icon: FiClock, color: 'amber', sub: 'Số lượng hồ sơ' },
          { label: 'Tổng giá trị chờ hạch toán', value: formatCurrency(stats.totalCashAmount), icon: FiActivity, color: 'indigo', sub: 'Giá trị định mức' },
          { label: 'Yêu cầu ưu tiên', value: transactions.length, icon: FiAlertCircle, color: 'blue', sub: 'Cần xử lý ngay' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{stat.value}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5 italic">{stat.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">Đang truy vấn kho dữ liệu...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-20 text-center animate-in zoom-in-95 duration-500">
            <div className="text-slate-200 text-8xl mb-6 flex justify-center">📦</div>
            <h3 className="text-xl font-black text-slate-900">Sạch bóng giao dịch</h3>
            <p className="text-slate-400 font-medium mt-1">Tất cả yêu cầu thanh toán tiền mặt đã được xử lý hoàn tất.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đặc danh giao dịch</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đại lý thực hiện</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Giá trị thực thu</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Kiểm soát</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.map((transaction) => (
                    <tr key={transaction.dealerTransactionId} className="group hover:bg-slate-50/80 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                            <FiDollarSign size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">#{transaction.dealerTransactionId?.substring(0, 8)}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{formatDate(transaction.transactionDate)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <p className="text-sm font-bold text-slate-700">Đại lý #{transaction.dealerInvoiceId?.substring(0, 8) || "N/A"}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 italic">{transaction.paymentMethodName || "Tiền mặt"}</p>
                      </td>
                      <td className="px-6 py-6 text-center">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="px-6 py-6 text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight mb-0.5">Quyết toán</p>
                        <p className="text-sm font-black text-indigo-600">{formatCurrency(transaction.amount)}</p>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewInvoice(transaction.dealerInvoiceId)}
                            className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90"
                            title="Xem hóa đơn"
                          >
                            <FiEye size={16} />
                          </button>
                          {transaction.status === "PENDING_CONFIRMATION" && (
                            <button
                              onClick={() => handleConfirm(transaction)}
                              className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-90"
                              title="Duyệt ngay"
                            >
                              <FiCheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modern Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Hồ sơ hạch toán <span className="text-indigo-600 font-black">{transactions.length}</span> / {pagination.totalElements}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 0}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm active:scale-90"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index)}
                      className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${pagination.currentPage === index
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                          : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-300'
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages - 1}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm active:scale-90"
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

export default CashPaymentsManagementPage;
