// DealersPage.jsx
import React, { useState } from 'react';
import { useDealers } from './hooks/useDealers';
import DealerList from './components/DealerList';
import DealerForm from './components/DealerForm';
import Swal from 'sweetalert2';
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

  const [filters, setFilters] = useState({
    search: '',
    city: '',
    status: '',
  });

  const [showForm, setShowForm] = useState(false);
  const [editingDealer, setEditingDealer] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const showSuccessAlert = (message) => {
    Swal.fire({
      title: 'Thành công!',
      text: message,
      icon: 'success',
      confirmButtonColor: '#10B981',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        confirmButton: 'px-6 py-2 rounded-lg font-medium'
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
        popup: 'rounded-xl shadow-2xl',
        confirmButton: 'px-6 py-2 rounded-lg font-medium'
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
        popup: 'rounded-xl shadow-2xl',
        confirmButton: 'px-6 py-2 rounded-lg font-medium mr-2',
        cancelButton: 'px-6 py-2 rounded-lg font-medium'
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
      dealer.dealerName.toLowerCase().includes(filters.search.toLowerCase()) ||
      dealer.dealerCode.toLowerCase().includes(filters.search.toLowerCase()) ||
      dealer.email?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesCity = !filters.city || 
      dealer.city?.toLowerCase().includes(filters.city.toLowerCase());

    const matchesStatus = !filters.status || 
      dealer.status === filters.status;

    return matchesSearch && matchesCity && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Quản lý Đại lý
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Quản lý thông tin các đại lý trong hệ thống
              </p>
            </div>
            <button
              onClick={handleCreateDealer}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 focus:scale-105 shadow-lg hover:shadow-xl flex items-center font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm đại lý mới
            </button>
          </div>
        </div>

        {/* Main Content */}
        <DealerList
          dealers={filteredDealers}
          loading={loading}
          error={error}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onEdit={handleEditDealer}
          onDelete={handleDeleteDealer}
          onSuspend={handleSuspendDealer}
          onActivate={handleActivateDealer}
          onRefresh={handleRefresh}
        />

        {/* Dealer Form Modal */}
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