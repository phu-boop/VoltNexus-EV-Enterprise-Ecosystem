// Dealer Invoice Card Component
import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { EyeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const DealerInvoiceCard = ({ invoice, onView, onPay }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'UNPAID': { color: 'bg-red-100 text-red-800', label: 'Chưa thanh toán' },
      'PARTIALLY_PAID': { color: 'bg-yellow-100 text-yellow-800', label: 'Thanh toán một phần' },
      'PAID': { color: 'bg-green-100 text-green-800', label: 'Đã thanh toán' },
      'OVERDUE': { color: 'bg-red-100 text-red-800', label: 'Quá hạn' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status !== 'PAID';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Hóa đơn #{invoice.dealerInvoiceId.substring(0, 8)}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Ngày tạo: {format(new Date(invoice.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
          </p>
          {invoice.dueDate && (
            <p className={`text-sm mt-1 ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
              Hạn thanh toán: {format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: vi })}
            </p>
          )}
        </div>
        {getStatusBadge(invoice.status)}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Tổng tiền</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(invoice.totalAmount)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Đã thanh toán</p>
          <p className="text-lg font-semibold text-green-600">{formatCurrency(invoice.amountPaid)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Còn lại</p>
          <p className="text-lg font-semibold text-orange-600">{formatCurrency(invoice.remainingAmount)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Tiến độ</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${(invoice.amountPaid / invoice.totalAmount) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {((invoice.amountPaid / invoice.totalAmount) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {invoice.notes && (
        <p className="text-sm text-gray-600 mb-4 italic">{invoice.notes}</p>
      )}

      <div className="flex justify-end gap-2">
        <button
          onClick={onView}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <EyeIcon className="h-5 w-5" />
          Xem Chi Tiết
        </button>
        {invoice.status !== 'PAID' && invoice.remainingAmount > 0 && (
          <button
            onClick={() => onPay && onPay(invoice.dealerInvoiceId)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CurrencyDollarIcon className="h-5 w-5" />
            Thanh Toán
          </button>
        )}
      </div>
    </div>
  );
};

export default DealerInvoiceCard;


