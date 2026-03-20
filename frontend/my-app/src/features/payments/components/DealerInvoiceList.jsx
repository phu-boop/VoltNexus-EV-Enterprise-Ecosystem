// Dealer Invoice List Component
import React from 'react';
import DealerInvoiceCard from './DealerInvoiceCard';

const DealerInvoiceList = ({ invoices, loading, filters, pagination, onFilterChange, onViewInvoice, onPayInvoice, onRefresh }) => {
  if (loading && invoices.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Chưa có hóa đơn nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <DealerInvoiceCard
          key={invoice.dealerInvoiceId}
          invoice={invoice}
          onView={() => onViewInvoice(invoice.dealerInvoiceId)}
          onPay={onPayInvoice}
        />
      ))}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => onFilterChange(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.currentPage === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>
          <span className="text-gray-600">
            Trang {pagination.currentPage + 1} / {pagination.totalPages}
          </span>
          <button
            onClick={() => onFilterChange(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.currentPage >= pagination.totalPages - 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default DealerInvoiceList;


