// B2C Cash Payments Management Page - Dealer Manager duyệt thanh toán tiền mặt B2C
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';
import { salesOrderB2CApi } from '../../dealer/sales/salesOrder/services/salesOrderService';
import { toast } from 'react-toastify';
import { 
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useAuthContext } from '../../../features/auth/AuthProvider';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const B2CCashPaymentsManagementPage = () => {
  const navigate = useNavigate();
  const { id_user } = useAuthContext();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    page: 0,
    size: 10
  });
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmNotes, setConfirmNotes] = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [filters.page]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        size: filters.size
      };

      const response = await paymentService.getPendingCashPaymentsB2C(params);
      const data = response.data?.data || response.data;
      
      if (data) {
        setTransactions(data.content || []);
        setPagination({
          totalElements: data.totalElements || 0,
          totalPages: data.totalPages || 0,
          currentPage: data.number || 0
        });
      }
    } catch (error) {
      console.error('Error loading B2C cash payments:', error);
      toast.error('Không thể tải danh sách thanh toán tiền mặt B2C');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleViewOrder = (orderId) => {
    navigate(`/dealer/manager/payments/b2c-orders/${orderId}`);
  };

  const handleConfirm = (transaction) => {
    setSelectedTransaction(transaction);
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedTransaction || !id_user) {
      toast.error('Thiếu thông tin để duyệt thanh toán');
      console.error('Missing information:', { selectedTransaction, id_user });
      return;
    }

    setConfirming(true);
    try {
      const payload = {
        notes: confirmNotes || undefined
      };
      const response = await paymentService.confirmManualPayment(selectedTransaction.transactionId, payload);
      

      if (response && response.data) {
        toast.success('Đã duyệt thanh toán thành công! Công nợ và lịch sử thanh toán đã được cập nhật.');
        setShowConfirmModal(false);
        setSelectedTransaction(null);
        setConfirmNotes('');
        // Reload danh sách sau 1 giây để đảm bảo backend đã cập nhật payment status
        setTimeout(() => {
          loadTransactions();
        }, 1000);
      } else {
        throw new Error('Response không hợp lệ');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Không thể duyệt thanh toán';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setConfirming(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'Chờ duyệt' },
      'SUCCESS': { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Đã duyệt' },
      'FAILED': { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'Thất bại' }
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
          <h1 className="text-3xl font-bold text-gray-900">Yêu Cầu Thanh Toán (B2C)</h1>
          <p className="text-gray-600 mt-1">Duyệt các yêu cầu thanh toán tiền mặt từ Dealer Staff cho đơn hàng B2C</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center">
            <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không có yêu cầu thanh toán tiền mặt nào</p>
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
                    Ngày yêu cầu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phương thức
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ghi chú
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.transactionId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{transaction.orderId?.substring(0, 8) || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(transaction.transactionDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transaction.paymentMethodName || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {transaction.notes || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {transaction.orderId && transaction.orderId !== 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' ? (
                          <button
                            onClick={() => handleViewOrder(transaction.orderId)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Xem đơn hàng"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs" title="Order ID không hợp lệ">
                            N/A
                          </span>
                        )}
                        {transaction.status === 'PENDING' && (
                          <button
                            onClick={() => handleConfirm(transaction)}
                            className="text-green-600 hover:text-green-900"
                            title="Duyệt thanh toán"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {transactions.length} / {pagination.totalElements} yêu cầu
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Trang {pagination.currentPage + 1} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages - 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && selectedTransaction && (
        <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 transform transition-all flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="p-6 flex-shrink-0 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Xác Nhận Duyệt Thanh Toán</h3>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Mã đơn hàng</p>
                  <p className="text-sm font-semibold text-gray-900">#{selectedTransaction.orderId?.substring(0, 8) || '-'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Số tiền</p>
                  <p className="text-sm font-semibold text-green-600">{formatCurrency(selectedTransaction.amount)}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Phương thức thanh toán</p>
                <p className="text-sm font-medium text-gray-900">{selectedTransaction.paymentMethodName || 'Tiền mặt'}</p>
              </div>
              {selectedTransaction.notes && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-xs text-blue-600 mb-1 font-medium">Ghi chú từ người yêu cầu</p>
                  <p className="text-sm text-gray-900">{selectedTransaction.notes}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú duyệt (tùy chọn)
                </label>
                <textarea
                  value={confirmNotes}
                  onChange={(e) => setConfirmNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Nhập ghi chú duyệt thanh toán (nếu có)"
                />
              </div>
            </div>
            <div className="p-6 flex-shrink-0 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end rounded-b-xl">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedTransaction(null);
                  setConfirmNotes('');
                }}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-colors font-medium"
                disabled={confirming}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmPayment}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
                disabled={confirming}
              >
                <CheckCircleIcon className="h-5 w-5" />
                {confirming ? 'Đang xử lý...' : 'Duyệt Thanh Toán'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default B2CCashPaymentsManagementPage;

