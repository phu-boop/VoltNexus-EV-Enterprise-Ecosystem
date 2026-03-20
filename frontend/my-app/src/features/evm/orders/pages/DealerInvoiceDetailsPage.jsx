import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import paymentService from '../../../payments/services/paymentService';
import { toast } from 'react-toastify';
import { ArrowLeftIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

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
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      UNPAID: { color: 'bg-red-100 text-red-800', label: 'Chưa thanh toán' },
      PARTIALLY_PAID: { color: 'bg-yellow-100 text-yellow-800', label: 'Thanh toán một phần' },
      PAID: { color: 'bg-green-100 text-green-800', label: 'Đã thanh toán' },
      OVERDUE: { color: 'bg-orange-100 text-orange-800', label: 'Quá hạn' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải chi tiết hóa đơn...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy hóa đơn</p>
        </div>
      </div>
    );
  }

  const remainingAmount = parseFloat(invoice.totalAmount || 0) - parseFloat(invoice.amountPaid || 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Quay lại
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Chi Tiết Hóa Đơn</h1>
      </div>

      {/* Invoice Info */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Hóa đơn #{invoice.dealerInvoiceId?.substring(0, 8)}
            </h2>
            <p className="text-sm text-gray-600">
              Ngày tạo: {formatDate(invoice.createdAt)}
            </p>
          </div>
          <div>
            {getStatusBadge(invoice.status)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Mã đại lý</p>
            <p className="text-base font-medium text-gray-900">
              {invoice.dealerId ? `Đại lý ${invoice.dealerId.substring(0, 8)}` : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Hạn thanh toán</p>
            <p className="text-base font-medium text-gray-900">
              {formatDate(invoice.dueDate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(invoice.totalAmount)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Đã thanh toán</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(invoice.amountPaid)}
            </p>
          </div>
        </div>

        {invoice.notes && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-1">Ghi chú</p>
            <p className="text-base text-gray-900">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch Sử Thanh Toán</h3>
        
        {invoice.transactions && invoice.transactions.length > 0 ? (
          <div className="space-y-4">
            {invoice.transactions.map((transaction) => (
              <div
                key={transaction.dealerTransactionId}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Giao dịch #{transaction.dealerTransactionId?.substring(0, 8)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {transaction.status === 'CONFIRMED' ? (
                        <span className="inline-flex items-center text-green-600">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Đã xác nhận
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-yellow-600">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Chờ xác nhận
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {transaction.notes && (
                  <p className="text-sm text-gray-600 mt-2">{transaction.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Chưa có giao dịch thanh toán nào</p>
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex justify-between items-center">
            <span className="text-base font-medium text-gray-700">Còn lại:</span>
            <span className="text-xl font-bold text-red-600">
              {formatCurrency(remainingAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerInvoiceDetailsPage;

