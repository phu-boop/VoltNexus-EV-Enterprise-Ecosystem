// B2C Debt Management Page (Dealer Manager)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../features/auth/AuthProvider';
import { salesOrderB2CApi } from '../../dealer/sales/salesOrder/services/salesOrderService';
import paymentService from '../services/paymentService';
import { toast } from 'react-toastify';
import { 
  EyeIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const B2CDebtManagementPage = () => {
  const navigate = useNavigate();
  const { dealerId } = useAuthContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalDebt: 0,
    totalPaid: 0,
    totalRemaining: 0,
    totalOrders: 0,
    paidOrders: 0,
    unpaidOrders: 0,
    partiallyPaidOrders: 0
  });
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
      
      // Load payment history for each order to calculate accurate debt
      const ordersWithDebt = await Promise.all(
        data.map(async (order) => {
          try {
            const historyResponse = await paymentService.getPaymentHistory(order.orderId);
            const history = historyResponse.data?.data || historyResponse.data || [];
            
            // Calculate payment status and debt
            const totalPaid = history
              .filter(t => t.status === 'SUCCESS' || t.status === 'CONFIRMED')
              .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
            
            const totalAmount = parseFloat(order.totalAmount) || 0;
            const remainingAmount = totalAmount - totalPaid;
            
            // Determine payment status
            let paymentStatus = 'UNPAID';
            if (totalPaid >= totalAmount && totalAmount > 0) {
              paymentStatus = 'PAID';
            } else if (totalPaid > 0) {
              paymentStatus = 'PARTIALLY_PAID';
            }
            
            return {
              ...order,
              paymentStatus,
              totalPaid,
              remainingAmount
            };
          } catch (error) {
            console.error(`Error loading payment history for order ${order.orderId}:`, error);
            return {
              ...order,
              paymentStatus: order.paymentStatus || 'UNPAID',
              totalPaid: 0,
              remainingAmount: parseFloat(order.totalAmount) || 0
            };
          }
        })
      );
      
      // Filter by payment status if needed
      let filteredOrders = ordersWithDebt;
      if (filters.paymentStatus) {
        filteredOrders = ordersWithDebt.filter(order => {
          return order.paymentStatus === filters.paymentStatus;
        });
      }
      
      setOrders(filteredOrders);
      
      // Calculate summary
      calculateSummary(ordersWithDebt);
    } catch (error) {
      console.error('Error loading B2C orders:', error);
      toast.error('Không thể tải danh sách công nợ B2C');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (ordersList) => {
    const summaryData = {
      totalDebt: 0,
      totalPaid: 0,
      totalRemaining: 0,
      totalOrders: ordersList.length,
      paidOrders: 0,
      unpaidOrders: 0,
      partiallyPaidOrders: 0
    };

    ordersList.forEach(order => {
      const totalAmount = parseFloat(order.totalAmount) || 0;
      const totalPaid = order.totalPaid || 0;
      const remaining = order.remainingAmount || 0;

      summaryData.totalDebt += totalAmount;
      summaryData.totalPaid += totalPaid;
      summaryData.totalRemaining += remaining;

      if (order.paymentStatus === 'PAID') {
        summaryData.paidOrders++;
      } else if (order.paymentStatus === 'PARTIALLY_PAID') {
        summaryData.partiallyPaidOrders++;
      } else {
        summaryData.unpaidOrders++;
      }
    });

    setSummary(summaryData);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/dealer/manager/payments/b2c-orders/${orderId}`);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản Lý Công Nợ B2C</h1>
        <p className="text-gray-600 mt-1">Tổng quan công nợ từ các đơn hàng B2C của đại lý</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng Công Nợ</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalDebt)}</p>
            </div>
            <ArrowTrendingDownIcon className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Đã Thanh Toán</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalPaid)}</p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Còn Nợ</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(summary.totalRemaining)}</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng Số Đơn</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalOrders}</p>
              <p className="text-xs text-gray-500 mt-1">
                Đã trả: {summary.paidOrders} | Một phần: {summary.partiallyPaidOrders} | Chưa trả: {summary.unpaidOrders}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-blue-500" />
          </div>
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
            <p className="mt-4 text-gray-600">Đang tải danh sách công nợ...</p>
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
                    Đã thanh toán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Còn nợ
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
                {orders.map((order) => (
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
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(order.totalPaid)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-orange-600">
                        {formatCurrency(order.remainingAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewOrder(order.orderId)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="h-5 w-5" />
                        <span>Xem chi tiết</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default B2CDebtManagementPage;

