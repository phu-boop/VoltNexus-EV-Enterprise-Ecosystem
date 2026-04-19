// Dealer Invoice List Component
import React from 'react';
import DealerInvoiceCard from './DealerInvoiceCard';
import { FiInbox, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const DealerInvoiceList = ({ invoices, loading, filters, pagination, onFilterChange, onViewInvoice, onPayInvoice, onRefresh }) => {
  if (loading && invoices.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse tracking-widest uppercase text-[10px]">Đang truy xuất hồ sơ...</p>
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-200 p-16 text-center animate-in zoom-in-95 duration-500">
        <div className="text-slate-100 text-6xl mb-6 flex justify-center"><FiInbox /></div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Hồ sơ trống</h3>
        <p className="text-slate-400 font-medium mt-1.5 max-w-xs mx-auto">Đại lý này hiện chưa có phát sinh giao dịch nào được ghi nhận.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {invoices.map((invoice) => (
          <DealerInvoiceCard
            key={invoice.dealerInvoiceId}
            invoice={invoice}
            onView={() => onViewInvoice(invoice.dealerInvoiceId)}
            onPay={onPayInvoice}
          />
        ))}
      </div>

      {/* Modern Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-8 py-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Trang <span className="text-blue-600 font-black">{pagination.currentPage + 1}</span> / {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onFilterChange(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.currentPage === 0}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all shadow-sm active:scale-90"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              onClick={() => onFilterChange(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.currentPage >= pagination.totalPages - 1}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all shadow-sm active:scale-90"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerInvoiceList;


