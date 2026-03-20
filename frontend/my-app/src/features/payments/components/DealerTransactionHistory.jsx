// Dealer Transaction History Component
import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const DealerTransactionHistory = ({ transactions }) => {
  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'SUCCESS': { 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircleIcon, 
        label: 'Thành công' 
      },
      'PENDING_CONFIRMATION': { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: ClockIcon, 
        label: 'Chờ duyệt' 
      },
      'PENDING_GATEWAY': {
        color: 'bg-blue-100 text-blue-800',
        icon: ClockIcon,
        label: 'Chờ VNPAY'
      },
      'FAILED': { 
        color: 'bg-red-100 text-red-800', 
        icon: XCircleIcon, 
        label: 'Thất bại' 
      }
    };

    const config = statusConfig[status] || { 
      color: 'bg-gray-100 text-gray-800', 
      icon: ClockIcon, 
      label: status 
    };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch Sử Thanh Toán</h2>
        <div className="text-center py-8">
          <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có lịch sử thanh toán</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch Sử Thanh Toán</h2>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div 
            key={transaction.dealerTransactionId} 
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(transaction.transactionDate), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </p>
                  {getStatusBadge(transaction.status)}
                </div>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>
            
            <div className="space-y-1 mt-3 pt-3 border-t border-gray-100">
              {transaction.paymentMethodName && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">Phương thức:</p>
                  <p className="text-sm font-medium text-gray-900">{transaction.paymentMethodName}</p>
                </div>
              )}

              {transaction.transactionCode && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">Mã giao dịch:</p>
                  <p className="text-sm font-mono text-gray-700">{transaction.transactionCode}</p>
                </div>
              )}

              {transaction.notes && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Ghi chú:</p>
                  <p className="text-sm text-gray-700 italic mt-1">{transaction.notes}</p>
                </div>
              )}

              {transaction.dealerTransactionId && (
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-gray-500">Mã giao dịch:</p>
                  <p className="text-xs font-mono text-gray-400">
                    #{transaction.dealerTransactionId.substring(0, 8)}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealerTransactionHistory;

