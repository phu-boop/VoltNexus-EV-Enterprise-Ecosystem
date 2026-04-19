import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDealers } from './hooks/useDealers';
import DealerList from './components/DealerList';
import DealerForm from './components/DealerForm';
import Swal from 'sweetalert2';
import {
  FiPlus,
  FiUsers,
  FiCheckCircle,
  FiSlash,
  FiMap,
  FiActivity,
  FiRefreshCw,
  FiGrid,
  FiList
} from 'react-icons/fi';
import 'react-loading-skeleton/dist/skeleton.css';

const DealersPage = () => {
  const {
    dealers,
    loading,
    error,
    fetchDealers,
    createDealer,
    updateDealer,
    deleteDealer,
    suspendDealer,
    activateDealer,
  } = useDealers();

  const [searchParams] = useSearchParams();
  const urlDealerId = searchParams.get("dealerId");

  const [viewType, setViewType] = useState('card'); // 'card' or 'list'
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    status: '',
  });

  useEffect(() => {
    if (urlDealerId && dealers.length > 0) {
      const dealer = dealers.find(d => String(d.dealerId) === String(urlDealerId));
      if (dealer) {
        handleEditDealer(dealer);
      }
    }
  }, [urlDealerId, dealers]);

  const [showForm, setShowForm] = useState(false);
  const [editingDealer, setEditingDealer] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Stats calculation
  const stats = useMemo(() => {
    const total = dealers.length;
    const active = dealers.filter(d => d.status === 'ACTIVE').length;
    const suspended = dealers.filter(d => d.status === 'SUSPENDED').length;
    const cities = new Set(dealers.map(d => d.city).filter(Boolean)).size;
    return { total, active, suspended, cities };
  }, [dealers]);

  const showSuccessAlert = (message) => {
    Swal.fire({
      title: 'Thành công!',
      text: message,
      icon: 'success',
      confirmButtonColor: '#10B981',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        confirmButton: 'px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest'
      }
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Lỗi!',
      text: message,
      icon: 'error',
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        confirmButton: 'px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest'
      }
    });
  };

  const showConfirmDialog = (title, text, confirmButtonText = 'Xác nhận') => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
      confirmButtonText,
      cancelButtonText: 'Hủy',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        confirmButton: 'px-6 py-2.5 rounded-xl font-bold mr-2',
        cancelButton: 'px-6 py-2.5 rounded-xl font-bold'
      }
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      city: '',
      status: '',
    });
  };

  const handleCreateDealer = () => {
    setEditingDealer(null);
    setShowForm(true);
  };

  const handleEditDealer = (dealer) => {
    setEditingDealer(dealer);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingDealer(null);
  };

  const handleSubmitForm = async (formData) => {
    setFormLoading(true);

    let result;
    if (editingDealer) {
      result = await updateDealer(editingDealer.dealerId, formData);
    } else {
      result = await createDealer(formData);
    }

    setFormLoading(false);

    if (result.success) {
      setShowForm(false);
      setEditingDealer(null);
      showSuccessAlert(editingDealer ? 'Cập nhật đại lý thành công!' : 'Thêm đại lý mới thành công!');
    } else {
      showErrorAlert(result.message || 'Có lỗi xảy ra!');
    }
  };

  const handleDeleteDealer = async (dealerId, dealerName) => {
    const result = await showConfirmDialog(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa đại lý "${dealerName}"? Hành động này không thể hoàn tác.`,
      'Xóa đại lý'
    );

    if (result.isConfirmed) {
      const deleteResult = await deleteDealer(dealerId);
      if (deleteResult.success) {
        showSuccessAlert('Xóa đại lý thành công!');
      } else {
        showErrorAlert(deleteResult.message || 'Có lỗi xảy ra khi xóa đại lý!');
      }
    }
  };

  const handleSuspendDealer = async (dealerId) => {
    const result = await showConfirmDialog(
      'Xác nhận tạm ngừng',
      'Bạn có chắc chắn muốn tạm ngừng đại lý này?',
      'Tạm ngừng'
    );

    if (result.isConfirmed) {
      const suspendResult = await suspendDealer(dealerId);
      if (suspendResult.success) {
        showSuccessAlert('Tạm ngừng đại lý thành công!');
      } else {
        showErrorAlert(suspendResult.message || 'Có lỗi xảy ra khi tạm ngừng đại lý!');
      }
    }
  };

  const handleActivateDealer = async (dealerId) => {
    const result = await showConfirmDialog(
      'Xác nhận kích hoạt',
      'Bạn có chắc chắn muốn kích hoạt đại lý này?',
      'Kích hoạt'
    );

    if (result.isConfirmed) {
      const activateResult = await activateDealer(dealerId);
      if (activateResult.success) {
        showSuccessAlert('Kích hoạt đại lý thành công!');
      } else {
        showErrorAlert(activateResult.message || 'Có lỗi xảy ra khi kích hoạt đại lý!');
      }
    }
  };

  const handleRefresh = () => {
    fetchDealers(filters);
  };

  // Filter dealers based on current filters
  const filteredDealers = dealers.filter(dealer => {
    const matchesSearch = !filters.search ||
      dealer.dealerName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      dealer.dealerCode?.toLowerCase().includes(filters.search.toLowerCase()) ||
      dealer.email?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesCity = !filters.city ||
      dealer.city?.toLowerCase().includes(filters.city.toLowerCase());

    const matchesStatus = !filters.status ||
      dealer.status === filters.status;

    return matchesSearch && matchesCity && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 -m-6 p-6 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200">
              <FiUsers size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hệ Thống Đại Lý</h1>
              <p className="text-slate-500 font-medium mt-0.5">Quản trị mạng lưới đối tác và khu vực kinh doanh</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm mr-2">
              <button
                onClick={() => setViewType('card')}
                className={`p-2 rounded-xl transition-all ${viewType === 'card' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
                title="Dạng thẻ"
              >
                <FiGrid size={18} />
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`p-2 rounded-xl transition-all ${viewType === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
                title="Dạng danh sách"
              >
                <FiList size={18} />
              </button>
            </div>

            <button
              onClick={handleRefresh}
              className="p-3.5 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm active:scale-95"
              title="Làm mới dữ liệu"
            >
              <FiRefreshCw size={20} />
            </button>
            <button
              onClick={handleCreateDealer}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center gap-2"
            >
              <FiPlus size={20} />
              THÊM ĐẠI LÝ MỚI
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Tổng số đại lý', value: stats.total, icon: FiUsers, color: 'blue', sub: 'Toàn hệ thống' },
            { label: 'Đang hoạt động', value: stats.active, icon: FiCheckCircle, color: 'emerald', sub: 'Sẵn sàng vận hành' },
            { label: 'Tạm ngừng/Khóa', value: stats.suspended, icon: FiSlash, color: 'rose', sub: 'Cần kiểm tra' },
            { label: 'Khu vực bao phủ', value: stats.cities, icon: FiMap, color: 'amber', sub: 'Thành phố/Tỉnh' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-50 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform`} />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl`}>
                    <stat.icon size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5 italic">{stat.sub}</p>
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Component */}
        <DealerList
          dealers={filteredDealers}
          loading={loading}
          error={error}
          viewType={viewType}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onEdit={handleEditDealer}
          onDelete={handleDeleteDealer}
          onSuspend={handleSuspendDealer}
          onActivate={handleActivateDealer}
          onRefresh={handleRefresh}
        />

        {/* Dealer Form Side-Drawer/Modal */}
        {showForm && (
          <DealerForm
            dealer={editingDealer}
            onSubmit={handleSubmitForm}
            onCancel={handleCancelForm}
            loading={formLoading}
          />
        )}
      </div>
    </div>
  );
};

export default DealersPage;