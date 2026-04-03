import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import paymentService from '../services/paymentService';
import dealerService from '../../admin/manageDealer/dealers/services/dealerService';
import DealerInvoiceList from '../components/DealerInvoiceList';
import CreateInvoiceForm from '../components/CreateInvoiceForm';
import { toast } from 'react-toastify';
import { FiFileText, FiRefreshCw, FiPlus, FiChevronDown, FiUser } from 'react-icons/fi';

const DealerInvoiceManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dealers, setDealers] = useState([]);
  const [loadingDealers, setLoadingDealers] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [selectedDealerId, setSelectedDealerId] = useState('');

  const [filters, setFilters] = useState({
    status: '',
    page: 0,
    size: 10
  });

  // Fetch Dealers on Component Mount
  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    try {
      setLoadingDealers(true);
      const res = await dealerService.getBasicList();
      const dealerList = res.data?.data || res.data || [];
      setDealers(dealerList);

      // Auto-select the first dealer if the list is populated and nothing is currently selected
      if (dealerList.length > 0 && !selectedDealerId) {
        setSelectedDealerId(dealerList[0].id || dealerList[0].dealerId);
      }
    } catch (error) {
      console.error('Error fetching dealers:', error);
      toast.error('Không thể tải danh sách mạng lưới đại lý');
    } finally {
      setLoadingDealers(false);
    }
  };

  // Fetch Invoices whenever Selected Dealer changes
  useEffect(() => {
    if (selectedDealerId) {
      loadInvoices();
    } else {
      setInvoices([]);
    }
    // Reset page to 0 when changing dealer
    setFilters(prev => ({ ...prev, page: 0 }));
  }, [selectedDealerId]);

  // Handle Pagination/Status filter changes
  useEffect(() => {
    if (selectedDealerId) {
      loadInvoices();
    }
  }, [filters.page, filters.size, filters.status]);

  const loadInvoices = async () => {
    if (!selectedDealerId) return;

    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      params.page = filters.page;
      params.size = filters.size;

      const response = await paymentService.getDealerInvoices(selectedDealerId, params);
      const data = response.data?.data || response.data;
      setInvoices(data.content || data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Không thể tải danh sách hóa đơn theo đại lý này');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = (dealerId) => {
    setSelectedDealerId(dealerId);
    setShowForm(true);
  };

  const handleViewInvoice = (invoiceId) => {
    const prefix = location.pathname.includes('/admin/') ? '/evm/admin' : '/evm/staff';
    navigate(`${prefix}/debt/invoices/${invoiceId}`);
  };

  const handleSaveInvoice = async (invoiceData) => {
    try {
      await paymentService.createDealerInvoice(invoiceData);
      toast.success('Khởi tạo hóa đơn thành công!');
      setShowForm(false);
      loadInvoices(); // Refresh the list
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(error.response?.data?.message || 'Gặp sự cố khi khởi tạo hóa đơn');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 -m-6 p-6 animate-in fade-in duration-500">

      {/* Premium UI Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200">
            <FiFileText size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cổng Quản Lý Hóa Đơn</h1>
            <p className="text-slate-500 font-medium mt-0.5">Xử lý quyết toán tài chính nội bộ với hệ thống Đại lý</p>
          </div>
        </div>

        {selectedDealerId && (
          <button
            onClick={() => handleCreateInvoice(selectedDealerId)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg shadow-slate-200 transition-all active:scale-95"
          >
            <FiPlus size={20} />
            Lập Hóa Đơn Mới
          </button>
        )}
      </div>

      {/* Dynamic Dealer Dropdown Selector */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center relative z-20">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FiUser size={20} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block">Đối Tác</p>
        </div>

        <div className="relative flex-1 w-full max-w-2xl">
          {loadingDealers ? (
            <div className="w-full h-12 bg-slate-100 animate-pulse rounded-2xl" />
          ) : (
            <>
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={selectedDealerId || ''}
                onChange={(e) => setSelectedDealerId(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
              >
                <option value="" disabled>-- Vui lòng chọn Đại lý cần tra cứu dữ liệu --</option>
                {dealers.map((dealer, index) => {
                  const id = dealer.id || dealer.dealerId || dealer.profileId;
                  const name = dealer.name || dealer.dealerName || dealer.firstName || `ID: ${id?.substring(0, 8)}`;
                  const region = dealer.city || dealer.province || 'Toàn quốc';
                  return (
                    <option key={index} value={id}>
                      Đại lý: {name} ({region})
                    </option>
                  );
                })}
              </select>
            </>
          )}
        </div>

        <button
          onClick={fetchDealers}
          disabled={loadingDealers}
          className="p-3.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-sm active:scale-95"
          title="Đồng bộ danh sách đại lý"
        >
          <FiRefreshCw size={20} className={loadingDealers ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Legacy Create Invoice Portal (If component handles it natively inside) */}
      {showForm && selectedDealerId && (
        <CreateInvoiceForm
          dealerId={selectedDealerId}
          onSave={handleSaveInvoice}
          onCancel={handleCancelForm}
        />
      )}

      {/* Integrated List View */}
      {selectedDealerId ? (
        <div className="animate-in slide-in-from-bottom-4 duration-500 relative z-10">
          <DealerInvoiceList
            invoices={invoices}
            loading={loading}
            filters={filters}
            onFilterChange={setFilters}
            onViewInvoice={handleViewInvoice}
            onRefresh={loadInvoices}
          />
        </div>
      ) : (
        !loadingDealers && (
          <div className="bg-white rounded-[2.5rem] border border-dashed border-slate-200 p-16 text-center animate-in zoom-in-95 duration-500">
            <div className="text-slate-100 text-6xl mb-6 flex justify-center">🏛️</div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Hệ thống chờ điều hướng</h3>
            <p className="text-slate-400 font-medium mt-1.5 max-w-sm mx-auto">Vui lòng chỉ định một đại lý từ thanh menu phía trên để hệ thống nạp các dữ liệu tài chính liên quan.</p>
          </div>
        )
      )}
    </div>
  );
};

export default DealerInvoiceManagement;
