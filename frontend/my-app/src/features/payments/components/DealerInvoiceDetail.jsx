// Dealer Invoice Detail Component
import React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const DealerInvoiceDetail = ({ invoice }) => {
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
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chi Tiết Hóa Đơn</h2>
          <p className="text-sm text-gray-500 mt-1">
            Mã hóa đơn: {invoice.dealerInvoiceId}
          </p>
        </div>
        {getStatusBadge(invoice.status)}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Tổng tiền</p>
            <p className="text-xl font-semibold text-gray-900">{formatCurrency(invoice.totalAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Đã thanh toán</p>
            <p className="text-xl font-semibold text-green-600">{formatCurrency(invoice.amountPaid)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Còn lại</p>
            <p className="text-xl font-semibold text-orange-600">{formatCurrency(invoice.remainingAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Hạn thanh toán</p>
            <p className="text-lg font-medium text-gray-900">
              {format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: vi })}
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-2">Tiến độ thanh toán</p>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${(invoice.amountPaid / invoice.totalAmount) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {((invoice.amountPaid / invoice.totalAmount) * 100).toFixed(1)}% đã thanh toán
          </p>
        </div>

        {invoice.referenceType && (
          <div>
            <p className="text-sm text-gray-600">Loại tham chiếu</p>
            <p className="text-lg font-medium text-gray-900">{invoice.referenceType}</p>
          </div>
        )}

        {invoice.referenceId && (
          <div>
            <p className="text-sm text-gray-600">Mã tham chiếu</p>
            <p className="text-lg font-medium text-gray-900">{invoice.referenceId}</p>
          </div>
        )}

        {invoice.notes && (
          <div>
            <p className="text-sm text-gray-600">Ghi chú</p>
            <p className="text-lg text-gray-900">{invoice.notes}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-600">Ngày tạo</p>
          <p className="text-lg text-gray-900">
            {format(new Date(invoice.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DealerInvoiceDetail;


