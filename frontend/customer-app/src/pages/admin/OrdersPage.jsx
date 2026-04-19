import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, CheckCircle, XCircle, Clock, Package, Truck, FileText } from 'lucide-react';
import { getOrdersAdmin, updateOrderStatus, searchOrders } from '../../services/adminOrderService';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);

  const orderStatuses = [
    { value: 'ALL', label: 'Tất cả', color: 'gray' },
    { value: 'PENDING', label: 'Chờ xác nhận', color: 'yellow', icon: Clock },
    { value: 'APPROVED', label: 'Đã xác nhận', color: 'blue', icon: CheckCircle },
    { value: 'CONFIRMED', label: 'Khách đã xác nhận', color: 'green', icon: CheckCircle },
    { value: 'IN_PRODUCTION', label: 'Đang xử lý', color: 'indigo', icon: Package },
    { value: 'DELIVERED', label: 'Đã giao xe', color: 'green', icon: Package },
    { value: 'CANCELLED', label: 'Đã hủy', color: 'red', icon: XCircle }
  ];

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: pageSize,
        sort: 'orderDate,desc'
      };

      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      const response = await getOrdersAdmin(params);
      if (response.code === 200 || response.code === "1000") {
        const data = response.result || response.data;
        setOrders(data?.content || []);
        setTotalPages(data?.totalPages || 0);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng');
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      loadOrders();
      return;
    }

    try {
      setLoading(true);
      const response = await searchOrders(searchTerm);
      if (response.code === 200 || response.code === "1000") {
        const data = response.result || response.data;
        setOrders(Array.isArray(data) ? data : (data?.content || []));
        setTotalPages(data?.totalPages || 1);
      }
    } catch (error) {
      toast.error('Không thể tìm kiếm đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await updateOrderStatus(orderId, newStatus);
      if (response.code === 200 || response.code === "1000") {
        toast.success('Cập nhật trạng thái thành công');
        loadOrders();
      }
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
      console.error('Error updating status:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadge = (status) => {
    // Map backend statuses to the 6 simplified categories
    const statusMap = {
      'PENDING': 'PENDING',
      'EDITED': 'PENDING',
      'APPROVED': 'APPROVED',
      'CONFIRMED': 'CONFIRMED',
      'IN_PRODUCTION': 'IN_PRODUCTION',
      'DELIVERED': 'DELIVERED',
      'CANCELLED': 'CANCELLED',
      'REJECTED': 'CANCELLED'
    };

    const displayStatus = statusMap[status] || status;
    const statusInfo = orderStatuses.find(s => s.value === displayStatus);

    if (!statusInfo) {
      return (
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
          {status || 'N/A'}
        </span>
      );
    }

    const colorClasses = {
      gray: 'bg-gray-100 text-gray-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[statusInfo.color]}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getNextStatusOptions = (currentStatus) => {
    const statusFlow = {
      'PENDING': ['APPROVED', 'CANCELLED'],
      'EDITED': ['APPROVED', 'CANCELLED'],
      'CONFIRMED': ['APPROVED', 'IN_PRODUCTION', 'CANCELLED'],
      'APPROVED': ['IN_PRODUCTION', 'CANCELLED'],
      'IN_PRODUCTION': ['DELIVERED', 'CANCELLED'],
      'DELIVERED': [],
      'CANCELLED': []
    };
    return statusFlow[currentStatus] || [];
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý đơn hàng</h1>
        <p className="text-gray-600">Theo dõi và xử lý đơn hàng từ khách hàng</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        {/* Status Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {orderStatuses.map((status) => {
            const Icon = status.icon;
            return (
              <button
                key={status.value}
                onClick={() => {
                  setStatusFilter(status.value);
                  setCurrentPage(0);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${statusFilter === status.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {Icon && <Icon size={18} />}
                {status.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Tìm kiếm
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              loadOrders();
            }}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Reset
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <p>Không tìm thấy đơn hàng nào</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đặt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">#{order.orderId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      <div className="text-sm text-gray-500">{order.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {formatPrice(order.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/orders/${order.orderId}`}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </Link>

                        {getNextStatusOptions(order.status).length > 0 && (
                          <select
                            onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1 hover:border-blue-500 transition"
                            defaultValue=""
                          >
                            <option value="" disabled>Cập nhật trạng thái</option>
                            {getNextStatusOptions(order.status).map(status => {
                              const statusInfo = orderStatuses.find(s => s.value === status);
                              return (
                                <option key={status} value={status}>
                                  {statusInfo?.label}
                                </option>
                              );
                            })}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Trang <span className="font-medium">{currentPage + 1}</span> / <span className="font-medium">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
