// Payment History Component
import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const PaymentHistory = ({ history }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'SUCCESS': { color: 'bg-green-100 text-green-800', label: 'Thành công' },
      'CONFIRMED': { color: 'bg-green-100 text-green-800', label: 'Đã xác nhận' },
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', label: 'Đang chờ' },
      'PENDING_CONFIRMATION': { color: 'bg-yellow-100 text-yellow-800', label: 'Chờ xác nhận' },
      'PENDING_GATEWAY': { color: 'bg-blue-100 text-blue-800', label: 'Chờ cổng thanh toán' },
      'FAILED': { color: 'bg-red-100 text-red-800', label: 'Thất bại' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Chưa có lịch sử thanh toán</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((transaction) => (
        <div key={transaction.transactionId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm text-gray-600">
                {format(new Date(transaction.transactionDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
              </p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formatCurrency(transaction.amount)}
              </p>
            </div>
            {getStatusBadge(transaction.status)}
          </div>
          
          {transaction.paymentMethod && (
            <p className="text-sm text-gray-600 mt-2">
              Phương thức: {transaction.paymentMethod.methodName}
            </p>
          )}

          {transaction.notes && (
            <p className="text-sm text-gray-500 mt-2 italic">
              {transaction.notes}
            </p>
          )}

          {transaction.gatewayTransactionId && (
            <p className="text-xs text-gray-400 mt-2">
              Mã giao dịch: {transaction.gatewayTransactionId}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default PaymentHistory;


