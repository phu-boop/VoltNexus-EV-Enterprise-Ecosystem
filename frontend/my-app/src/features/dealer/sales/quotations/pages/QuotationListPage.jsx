import React, { useState, useEffect } from 'react';
import { useQuotations } from '../hooks/useQuotations.js';
import QuotationTable from '../components/QuotationTable';
import QuotationModal from '../components/QuotationModal';
import FilterPanel from '../components/FilterPanel';
import StatsOverview from '../components/StatsOverview';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const QuotationListPage = () => {
  const { 
    quotations, 
    loading, 
    error, 
    filters,
    refetch, 
    deleteQuotation,
    fetchQuotationDetail,
    updateFilters 
  } = useQuotations();
  
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const userRole = sessionStorage.getItem("roles");
  const canDelete = userRole?.includes("DEALER_MANAGER");

  // Xử lý tìm kiếm với debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters({ search: searchTerm });
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, updateFilters]);

  const handleView = async (quotation) => {
    setDetailLoading(true);
    setIsModalOpen(true);
    
    try {
      const detail = await fetchQuotationDetail(quotation.quotationId);
      setSelectedQuotation(detail);
    } catch (err) {
      console.error('Lỗi khi tải chi tiết:', err);
      setSelectedQuotation(quotation);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (quotationId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa báo giá này?')) {
      const success = await deleteQuotation(quotationId);

    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuotation(null);
  };

  const handleFilterApply = (newFilters) => {
    updateFilters(newFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    updateFilters({
      status: '',
      customer: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50/30 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
                Danh sách báo giá
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {userRole?.includes("DEALER_STAFF") ? 'Báo giá của bạn' : 'Tất cả báo giá của đại lý'}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex  items-center px-3 py-2 border text-sm font-medium rounded-lg transition-all duration-200 ${
                  showFilters 
                    ? 'border-blue-300 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FunnelIcon className="h-4 w-4 mr-1.5" />
                Lọc
              </button>
              
              <button
                onClick={refetch}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 max-w-full">
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                placeholder="Tìm kiếm theo mã báo giá..."
              />
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <FilterPanel 
            filters={filters}
            onApply={handleFilterApply}
            onClear={handleClearFilters}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Stats Overview */}
        <StatsOverview quotations={quotations} />

        {/* Quotation Table */}
        <div className="mt-6">
          <QuotationTable
            quotations={quotations}
            loading={loading}
            error={error}
            onView={handleView}
            onDelete={handleDelete}
            canDelete={canDelete}
          />
        </div>

        {/* Modal */}
        <QuotationModal
          quotation={selectedQuotation}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          loading={detailLoading}
        />
      </div>
    </div>
  );
};

export default QuotationListPage;