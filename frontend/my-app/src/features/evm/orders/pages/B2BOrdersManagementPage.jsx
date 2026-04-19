import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getB2BOrders } from '../../inventory/services/evmSalesService';
import { toast } from 'react-toastify';
import {
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTrendingUp,
  FiSearch,
  FiFilter,
  FiEye,
  FiPlusCircle,
  FiActivity,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

const B2BOrdersManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
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

  // Calculate statistics from current data
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.orderStatus === 'PENDING').length;
    const delivered = orders.filter(o => o.orderStatus === 'DELIVERED').length;
    const totalValue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    return { total, pending, delivered, totalValue };
  }, [orders]);

  useEffect(() => {
    loadOrders();
    if (location.state?.message) {
      toast.success(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [filters.status, filters.page, location.state]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        size: filters.size
      };
      if (filters.status) {
        params.status = filters.status;
      }

      const response = await getB2BOrders(params);
      const data = response.data?.data || response.data;

      if (data) {
        setOrders(data.content || []);
        setPagination({
          totalElements: data.totalElements || 0,
          totalPages: data.totalPages || 0,
          currentPage: data.number || 0
        });
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
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

  const handleCreateInvoice = (order) => {
    const prefix = location.pathname.includes('/admin/') ? '/evm/admin' : '/evm/staff';
    navigate(`${prefix}/orders/${order.orderId}/create-invoice`, {
      state: { order }
    });
  };

  const handleViewOrder = (orderId) => {
    navigate(`/evm/b2b-orders/${orderId}`);
  };

  const getStatusBadge = (status) => {
    const configs = {
      PENDING: { color: "amber", text: "Chờ duyệt", icon: FiClock },
      CONFIRMED: { color: "blue", text: "Đã xác nhận", icon: FiCheckCircle },
      IN_TRANSIT: { color: "purple", text: "Đang vận chuyển", icon: FiTrendingUp },
      DELIVERED: { color: "emerald", text: "Đã giao", icon: FiCheckCircle },
      CANCELLED: { color: "red", text: "Đã hủy", icon: FiXCircle },
      DISPUTED: { color: "orange", text: "Khiếu nại", icon: FiActivity }
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 -m-6 p-6 animate-in fade-in duration-500">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200">
            <FiFileText size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quản Lý Đơn Hàng B2B</h1>
            <p className="text-slate-500 font-medium mt-0.5">Xử lý quyết toán và lập hóa đơn đại lý</p>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Tổng Đơn Hàng', value: pagination.totalElements, icon: FiFileText, color: 'blue' },
          { label: 'Chờ Phê Duyệt', value: stats.pending, icon: FiClock, color: 'amber' },
          { label: 'Đã Hoàn Tất', value: stats.delivered, icon: FiCheckCircle, color: 'emerald' },
          { label: 'Tổng Doanh Thu', value: formatCurrency(stats.totalValue), icon: FiTrendingUp, color: 'indigo' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm mã đơn hàng hoặc đại lý..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={filters.status}
              onChange={handleStatusChange}
              className="w-full pl-11 pr-10 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="IN_TRANSIT">Đang vận chuyển</option>
              <option value="DELIVERED">Đã giao</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="DISPUTED">Có khiếu nại</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-xs">Đang đồng bộ dữ liệu...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-20 text-center animate-in zoom-in-95 duration-500">
            <div className="text-slate-200 text-8xl mb-6 flex justify-center">📦</div>
            <h3 className="text-xl font-black text-slate-900">Hệ thống trống</h3>
            <p className="text-slate-400 font-medium mt-1">Không tìm thấy bất kỳ đơn hàng nào phù hợp.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đặc danh đơn hàng</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đại lý thực hiện</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tổng quyết toán</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map((order) => (
                    <tr key={order.orderId} className="group hover:bg-slate-50/80 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            <FiFileText size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">#{order.orderId?.substring(0, 8)}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{formatDate(order.orderDate)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-bold text-slate-700 text-sm">
                        {order.dealerId ? `Đại lý ${order.dealerId.substring(0, 8)}` : 'Hệ thống'}
                      </td>
                      <td className="px-6 py-6 text-center">
                        {getStatusBadge(order.orderStatus)}
                      </td>
                      <td className="px-6 py-6 text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight mb-0.5">Giá trị định mức</p>
                        <p className="text-sm font-black text-blue-600">{formatCurrency(order.totalAmount)}</p>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewOrder(order.orderId)}
                            className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                            title="Xem chi tiết"
                          >
                            <FiEye size={16} />
                          </button>
                          {order.orderStatus === 'DELIVERED' && (
                            <>
                              {order.paymentStatus && order.paymentStatus !== 'NONE' ? (
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-sm" title="Đã có hóa đơn">
                                  <FiCheckCircle size={16} />
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleCreateInvoice(order)}
                                  className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-90"
                                  title="Lập hóa đơn"
                                >
                                  <FiPlusCircle size={16} />
                                </button>
                              )}
                            </>
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
                  Hiển thị <span className="text-blue-600">{orders.length}</span> / {pagination.totalElements} hồ sơ
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

export default B2BOrdersManagementPage;

