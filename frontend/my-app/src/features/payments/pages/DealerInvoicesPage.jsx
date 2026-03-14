// Dealer Invoices Page (B2B Payment Flow - Dealer Manager)
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../features/auth/AuthProvider';
import paymentService from '../services/paymentService';
import DealerInvoiceList from '../components/DealerInvoiceList';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const DealerInvoicesPage = () => {
  const navigate = useNavigate();
  const { dealerId } = useAuthContext(); // Lấy dealerId từ AuthContext
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    page: 0,
    size: 10
  });
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    currentPage: 0
  });

  useEffect(() => {
    if (dealerId) {
      loadInvoices();
    }
  }, [dealerId, filters]);

  const loadInvoices = async () => {
    if (!dealerId) {
      // dealerId chưa được load từ AuthContext
      return;
    }

    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      params.page = filters.page;
      params.size = filters.size;

      const response = await paymentService.getDealerInvoices(dealerId, params);
      const data = response.data.data || response.data;
      
      if (data.content) {
        // Pageable response
        setInvoices(data.content);
        setPagination({
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
          currentPage: data.number || 0
        });
      } else {
        // Array response
        setInvoices(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoiceId) => {
    navigate(`/dealer/manager/payments/invoices/${invoiceId}`);
  };

  const handlePayInvoice = (invoiceId) => {
    navigate(`/dealer/manager/payments/invoices/${invoiceId}/pay`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Hóa Đơn Của Tôi</h1>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 0 }))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="UNPAID">Chưa thanh toán</option>
          <option value="PARTIALLY_PAID">Thanh toán một phần</option>
          <option value="PAID">Đã thanh toán</option>
          <option value="OVERDUE">Quá hạn</option>
        </select>
      </div>

      <DealerInvoiceList
        invoices={invoices}
        loading={loading}
        filters={filters}
        pagination={pagination}
        onFilterChange={setFilters}
        onViewInvoice={handleViewInvoice}
        onPayInvoice={handlePayInvoice}
        onRefresh={loadInvoices}
      />
    </div>
  );
};

export default DealerInvoicesPage;

