// Dealer Invoice Management Page (B2B Payment Flow - EVM Staff)
import React, { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';
import DealerInvoiceList from '../components/DealerInvoiceList';
import CreateInvoiceForm from '../components/CreateInvoiceForm';
import { toast } from 'react-toastify';

const DealerInvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedDealerId, setSelectedDealerId] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    page: 0,
    size: 10
  });

  useEffect(() => {
    if (selectedDealerId) {
      loadInvoices();
    }
  }, [selectedDealerId, filters]);

  const loadInvoices = async () => {
    if (!selectedDealerId) return;
    
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      params.page = filters.page;
      params.size = filters.size;

      const response = await paymentService.getDealerInvoices(selectedDealerId, params);
      const data = response.data.data || response.data;
      setInvoices(data.content || data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = (dealerId) => {
    setSelectedDealerId(dealerId);
    setShowForm(true);
  };

  const handleSaveInvoice = async (invoiceData) => {
    try {
      await paymentService.createDealerInvoice(invoiceData);
      toast.success('Tạo hóa đơn thành công');
      setShowForm(false);
      loadInvoices();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo hóa đơn');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản Lý Hóa Đơn Đại Lý</h1>
        {selectedDealerId && (
          <button
            onClick={() => handleCreateInvoice(selectedDealerId)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            + Tạo Hóa Đơn
          </button>
        )}
      </div>

      {showForm && selectedDealerId && (
        <CreateInvoiceForm
          dealerId={selectedDealerId}
          onSave={handleSaveInvoice}
          onCancel={handleCancelForm}
        />
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Nhập Dealer ID (UUID)"
          value={selectedDealerId || ''}
          onChange={(e) => setSelectedDealerId(e.target.value || null)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {selectedDealerId && (
        <DealerInvoiceList
          invoices={invoices}
          loading={loading}
          filters={filters}
          onFilterChange={setFilters}
          onRefresh={loadInvoices}
        />
      )}
    </div>
  );
};

export default DealerInvoiceManagement;


