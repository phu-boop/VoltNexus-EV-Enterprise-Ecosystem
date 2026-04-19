import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import paymentService from "../../../payments/services/paymentService";
import dealerService from "../../../admin/manageDealer/dealers/services/dealerService";
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
  FiMessageSquare,
  FiUser
} from "react-icons/fi";
import { useAuthContext } from "../../../auth/AuthProvider";

const CashPaymentsManagementPage = () => {
  const navigate = useNavigate();
  const { id_user } = useAuthContext();
  const [transactions, setTransactions] = useState([]);
  const [dealers, setDealers] = useState([]);
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

  // Auto-fetch Context Mapping Data
  useEffect(() => {
    const fetchContextSources = async () => {
      try {
        const dealerRes = await dealerService.getBasicList();
        setDealers(dealerRes.data?.data || dealerRes.data || []);
      } catch (err) {
        console.warn("Failed to load dealers dictionary", err);
      }
    };
    fetchContextSources();
  }, []);

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
      toast.error("Gặp sự cố khi tải danh sách thanh toán tiền mặt");
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
    // FIX: Strong link directly to the correct Admin/EVM ecosystem route
    navigate(`/evm/admin/debt/invoices/${invoiceId}`);
  };

  const handleConfirm = (transaction) => {
    setSelectedTransaction(transaction);
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedTransaction || !id_user) {
      toast.error("Lỗi xác thực: Thiếu thông tin chuỗi hành động");
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

      toast.success("✅ Phê duyệt thành công! Biên đồ công nợ đại lý đã được đồng bộ.");
      setShowConfirmModal(false);
      setSelectedTransaction(null);
      setConfirmNotes("");
      loadTransactions();
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast.error(error.response?.data?.message || "Lỗi giao tiếp máy chủ khi duyệt chi");
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

  const getDealerDetails = (transaction) => {
    // Handle fallback logic for matching UUID to literal strings
    const matchedDealer = dealers.find(d =>
      d.id === transaction.dealerId ||
      d.dealerId === transaction.dealerId ||
      d.id === transaction.profileId
    );

    if (matchedDealer) {
      return {
        name: matchedDealer.name || matchedDealer.dealerName,
        region: matchedDealer.city || matchedDealer.province || 'Toàn quốc'
      };
    }

    return {
      name: `Đại lý ID: ${transaction.dealerId?.substring(0, 8) || "Không xác định"}`,
      region: "Hệ thống"
    };
  };

  const getStatusBadge = (status) => {
    const configs = {
      PENDING_CONFIRMATION: { color: "amber", text: "Chờ Đối Soát", icon: FiClock },
      SUCCESS: { color: "emerald", text: "Đã Hạch Toán", icon: FiCheckCircle },
      FAILED: { color: "red", text: "Thất Bại", icon: FiXCircle },
    };

    const config = configs[status] || { color: "slate", text: status, icon: FiActivity };
    const { color, text, icon: Icon } = config;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] text-[10px] font-black uppercase tracking-widest bg-${color}-50 text-${color}-700 border border-${color}-100 shadow-sm whitespace-nowrap`}>
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
          onMouseDown={() => {
            if (!confirming) {
              setShowConfirmModal(false);
              setSelectedTransaction(null);
            }
          }}
        />
        <div
          className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="bg-indigo-600 px-8 py-6 text-white relative border-b border-indigo-700">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <FiDollarSign size={80} />
            </div>
            <h3 className="text-xl font-black tracking-tight">Ký Duyệt Thu Tiền Thuộc Lưới B2B</h3>
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">Nghiệp vụ đối soát tiền mặt nội bộ</p>
          </div>

          <div className="p-8 space-y-6 flex-1 overflow-y-auto max-h-[70vh] scrollbar-hide">

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mã tham chiếu GD</p>
                <p className="text-sm font-mono font-black text-slate-900">#{selectedTransaction.dealerTransactionId?.substring(0, 8)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hóa đơn công nợ gốc</p>
                <p className="text-sm font-mono font-black text-indigo-600">#{selectedTransaction.dealerInvoiceId?.substring(0, 8)}</p>
              </div>
            </div>

            <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-1">Dòng tiền ghi nhận</p>
                <p className="text-2xl font-black text-emerald-700">{formatCurrency(selectedTransaction.amount)}</p>
              </div>
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl shadow-inner">
                <FiDollarSign size={24} />
              </div>
            </div>

            {selectedTransaction.notes && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 shadow-sm">
                <FiMessageSquare className="text-amber-500 mt-1 flex-shrink-0" size={18} />
                <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Đối tác đính kèm tin nhắn</p>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{selectedTransaction.notes}"</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Chứng chỉ điện tử (Kế toán phê duyệt)
              </label>
              <textarea
                value={confirmNotes}
                onChange={(e) => setConfirmNotes(e.target.value)}
                rows={3}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all resize-none shadow-inner placeholder:text-slate-300"
                placeholder="Ví dụ: Đã nhận được chuyển khoản vào lúc 14:00..."
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
              className="flex-1 px-6 py-4 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 font-bold text-[11px] uppercase tracking-widest rounded-[1rem] hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
              disabled={confirming}
            >
              Hủy
            </button>
            <button
              onClick={handleConfirmPayment}
              disabled={confirming}
              className="flex-[2] px-6 py-4 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-[1rem] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {confirming ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <FiCheckCircle size={18} />
              )}
              {confirming ? "Đang xử lý Core..." : "Xét Duyệt Dữ Liệu Chéo"}
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
            <FiActivity size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kênh Xét Duyệt Thủ Công</h1>
            <p className="text-slate-500 font-medium mt-0.5 max-w-lg line-clamp-1">Trạm gác cuối luân chuyển dữ liệu chi trả tiền mặt và chuyển khoản ngoài hệ thống</p>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Hồ sơ chờ đối soát', value: pagination.totalElements, icon: FiClock, color: 'amber', sub: 'Cần Kế toán EVM duyệt' },
          { label: 'Cán cân giá trị chờ', value: formatCurrency(transactions.reduce((acc, t) => acc + (t.amount || 0), 0)), icon: FiDollarSign, color: 'indigo', sub: 'Dòng tiền vãng lai' },
          { label: 'Mức độ ưu tiên cao', value: transactions.length, icon: FiAlertCircle, color: 'rose', sub: 'Yêu cầu cần xử lý ngay' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group duration-300">
            <div className="flex items-center gap-4">
              <div className={`p-3.5 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl group-hover:bg-${stat.color}-600 group-hover:text-white transition-all duration-300 shadow-sm`}>
                <stat.icon size={26} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">{stat.value}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 italic">{stat.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-24 text-center">
            <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-indigo-600 font-black animate-pulse tracking-widest uppercase text-xs">Đang đồng bộ giao dịch từ Data Center...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-24 text-center animate-in zoom-in-95 duration-500">
            <div className="text-slate-100 text-8xl mb-8 flex justify-center drop-shadow-sm">✅</div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Hệ Thống Trở Về Cán Cân Số 0</h3>
            <p className="text-slate-400 font-medium mt-2 max-w-sm mx-auto leading-relaxed">Toàn bộ yêu cầu bù trừ tài chính đã được ban kiểm soát xét duyệt dứt điểm. Không còn tác vụ phát sinh.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tra Cứu Giao Dịch</th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đại Lý Sơ Cấp (B2B)</th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tín Hiệu Luồng Máy</th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Lưu Lượng Truyền Tải</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Bảng Điều Khiển</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.map((transaction) => {
                    const dealerInfo = getDealerDetails(transaction);
                    return (
                      <tr key={transaction.dealerTransactionId} className="group hover:bg-slate-50/80 transition-all duration-300">

                        {/* Transaction Core */}
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                              <FiFileText size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 tracking-tight uppercase">#{transaction.dealerTransactionId?.substring(0, 8)}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-1">
                                <FiClock /> {formatDate(transaction.transactionDate)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Dealer Context Mapping */}
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                              <FiUser size={14} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-700">{dealerInfo.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest italic flex gap-1">
                                Hóa Đơn Căn Cứ: <span className="text-slate-600">#{transaction.dealerInvoiceId?.substring(0, 8) || "N/A"}</span>
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Status Check */}
                        <td className="px-6 py-6 text-center">
                          {getStatusBadge(transaction.status)}
                        </td>

                        {/* Gross Amount Payload */}
                        <td className="px-6 py-6 text-right">
                          <p className="text-xs font-medium text-slate-400 mb-0.5">Yêu Cầu Giải Ngân</p>
                          <p className="text-base font-black text-indigo-600 tracking-tight">{formatCurrency(transaction.amount)}</p>
                        </td>

                        {/* Central Dashboard Matrix */}
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => handleViewInvoice(transaction.dealerInvoiceId)}
                              className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:border-indigo-600 hover:text-white transition-all shadow-sm active:scale-90 flex items-center gap-2"
                              title="Kiểm tra Hóa đơn Gốc"
                            >
                              <FiEye size={14} /> Hóa Đơn
                            </button>
                            {transaction.status === "PENDING_CONFIRMATION" && (
                              <button
                                onClick={() => handleConfirm(transaction)}
                                className="px-4 py-2 bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 active:scale-90 flex items-center gap-2"
                                title="Cho phép Dòng tiền nhập vào sổ cái"
                              >
                                <FiCheckCircle size={14} /> Duyệt Chi
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Smart Offset Pagination Ribbon */}
            {pagination.totalPages > 1 && (
              <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Gói Dữ Liệu <span className="text-indigo-600 font-black px-1 text-sm">{transactions.length}</span> Trị Trọng Trên Tổng <span className="text-slate-800 font-black px-1 text-sm">{pagination.totalElements}</span>
                </p>
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-[1rem] border border-slate-200 shadow-sm">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 0}
                    className="p-2.5 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all active:scale-90"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index)}
                      className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${pagination.currentPage === index
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages - 1}
                    className="p-2.5 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-all active:scale-90"
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
