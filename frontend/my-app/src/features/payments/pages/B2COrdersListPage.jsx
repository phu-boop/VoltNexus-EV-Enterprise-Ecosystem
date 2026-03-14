// B2C Orders List Page (Dealer Staff)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../features/auth/AuthProvider';
import { salesOrderB2CApi } from '../../dealer/sales/salesOrder/services/salesOrderService';
import paymentService from '../services/paymentService';
import { toast } from 'react-toastify';
import { 
  EyeIcon, 
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const B2COrdersListPage = () => {
  const navigate = useNavigate();
  const { dealerId } = useAuthContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    paymentStatus: ''
  });

  useEffect(() => {
    if (dealerId) {
      loadOrders();
    }
  }, [dealerId, filters.paymentStatus]);

  const loadOrders = async () => {
    if (!dealerId) {
      return;
    }

    try {
      setLoading(true);
      const response = await salesOrderB2CApi.getByDealer(dealerId);
      const data = response.data?.data || response.data || [];
      
      // Process orders: use backend paymentStatus if available, otherwise calculate from payment history
      let ordersWithPaymentStatus = Array.isArray(data) ? data : [];
      
      // Only load payment history for orders that don't have a valid paymentStatus from backend
      const ordersNeedingHistory = ordersWithPaymentStatus.filter(
        order => !order.paymentStatus || order.paymentStatus === 'NONE'
      );
      
      // Load payment history only for orders that need it
      const historyMap = new Map();
      if (ordersNeedingHistory.length > 0) {
        await Promise.all(
          ordersNeedingHistory.map(async (order) => {
            try {
              const historyResponse = await paymentService.getPaymentHistory(order.orderId);
              const history = historyResponse.data?.data || historyResponse.data || [];
              
              // Calculate payment status from history
              const totalPaid = history
                .filter(t => t.status === 'SUCCESS' || t.status === 'CONFIRMED')
                .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
              
              const totalAmount = parseFloat(order.totalAmount) || 0;
              let calculatedPaymentStatus = 'UNPAID';
              
              if (totalPaid >= totalAmount && totalAmount > 0) {
                calculatedPaymentStatus = 'PAID';
              } else if (totalPaid > 0) {
                calculatedPaymentStatus = 'PARTIALLY_PAID';
              }
              
              historyMap.set(order.orderId, calculatedPaymentStatus);
            } catch (error) {
              console.error(`Error loading payment history for order ${order.orderId}:`, error);
              historyMap.set(order.orderId, 'UNPAID');
            }
          })
        );
      }
      
      // Merge backend status with calculated status
      const ordersWithStatus = ordersWithPaymentStatus.map(order => {
        // Use backend status if available and not NONE, otherwise use calculated status
        const paymentStatus = order.paymentStatus && order.paymentStatus !== 'NONE'
          ? order.paymentStatus
          : (historyMap.get(order.orderId) || 'UNPAID');
        
        return {
          ...order,
          paymentStatus
        };
      });
      
      // Filter by payment status if needed
      let filteredOrders = ordersWithStatus;
      if (filters.paymentStatus) {
        filteredOrders = ordersWithStatus.filter(order => {
          const paymentStatus = order.paymentStatus || 'UNPAID';
          return paymentStatus === filters.paymentStatus;
        });
      }
      
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error loading B2C orders:', error);
      toast.error('Không thể tải danh sách đơn hàng B2C');
    } finally {
      setLoading(false);
    }
  };


  const handleViewOrder = (orderId) => {
    navigate(`/dealer/staff/payments/b2c-orders/${orderId}`);
  };

  const handlePayOrder = (orderId) => {
    navigate(`/dealer/staff/payments/b2c-orders/${orderId}/pay`);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      'UNPAID': { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'Chưa thanh toán' },
      'PARTIALLY_PAID': { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'Thanh toán một phần' },
      'PAID': { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Đã thanh toán' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: ClockIcon, label: status };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh Sách Đơn Hàng B2C</h1>
          <p className="text-gray-600 mt-1">Quản lý và thanh toán các đơn hàng B2C của đại lý</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <select
          value={filters.paymentStatus}
          onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tất cả trạng thái thanh toán</option>
          <option value="UNPAID">Chưa thanh toán</option>
          <option value="PARTIALLY_PAID">Thanh toán một phần</option>
          <option value="PAID">Đã thanh toán</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không có đơn hàng B2C nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đặt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái thanh toán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  // Use paymentStatus from backend (NONE, UNPAID, PARTIALLY_PAID, PAID)
                  // Map NONE to UNPAID for display
                  let paymentStatus = order.paymentStatus || 'NONE';
                  if (paymentStatus === 'NONE') {
                    paymentStatus = 'UNPAID';
                  }
                  
                  return (
                    <tr key={order.orderId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.orderId?.substring(0, 8) || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(order.orderDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {order.orderStatusB2C || order.orderStatus || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentStatusBadge(paymentStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => handleViewOrder(order.orderId)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Xem chi tiết"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          {(paymentStatus === 'UNPAID' || paymentStatus === 'PARTIALLY_PAID') && (
                            <button
                              onClick={() => handlePayOrder(order.orderId)}
                              className="text-green-600 hover:text-green-900"
                              title="Thanh toán"
                            >
                              <CurrencyDollarIcon className="h-5 w-5" />
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
        )}
      </div>
    </div>
  );
};

export default B2COrdersListPage;

