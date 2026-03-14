import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus, FiFilter, FiRefreshCw, FiBarChart2, FiSearch, FiMessageSquare } from 'react-icons/fi';

// Import components
import FeedbackCard from '../components/FeedbackCard';
import FeedbackFilter from '../components/FeedbackFilter';

// Import services
import {
  getComplaintsByDealer,
  filterComplaints,
  COMPLAINT_STATUSES,
  COMPLAINT_SEVERITIES
} from '../services/feedbackService';

const FeedbackManagement = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]); // For stats calculation
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Get role-based base path
  const getBasePath = () => {
    const rolesString = sessionStorage.getItem('roles');
    try {
      const roles = rolesString ? JSON.parse(rolesString) : [];
      if (roles.includes('DEALER_MANAGER')) {
        return '/dealer/manager';
      } else if (roles.includes('DEALER_STAFF')) {
        return '/dealer/staff';
      }
    } catch (error) {
      console.error('Error parsing roles:', error);
    }
    return '/dealer/staff';
  };

  const basePath = getBasePath();

  // TODO: Get from session/context
  const dealerId = 1;

  useEffect(() => {
    loadAllForStats();
    loadComplaints();
  }, []);

  // Load all complaints for stats calculation (without pagination)
  const loadAllForStats = async () => {
    try {
      const response = await getComplaintsByDealer(dealerId);
      const data = response.data || [];
      setAllComplaints(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadComplaints = async (page = 0) => {
    try {
      setLoading(true);
      // Use filter API with pagination for list display
      const response = await filterComplaints({
        dealerId,
        page: page,
        size: pageSize,
        sortBy: 'createdAt',
        sortDirection: 'DESC'
      });
      
      const data = response.data?.content || response.data || [];
      setComplaints(data);
      setTotalPages(response.data?.totalPages || 0);
      setTotalElements(response.data?.totalElements || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading complaints:', error);
      toast.error('Không thể tải danh sách phản hồi');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (filterData) => {
    try {
      setLoading(true);
      setCurrentPage(0); // Reset to first page when filtering
      const response = await filterComplaints({
        dealerId,
        ...filterData,
        page: 0,
        size: pageSize,
        sortBy: 'createdAt',
        sortDirection: 'DESC'
      });
      
      const data = response.data?.content || response.data || [];
      setComplaints(data);
      setTotalPages(response.data?.totalPages || 0);
      setTotalElements(response.data?.totalElements || 0);
      setShowFilter(false);
      toast.success('Đã lọc danh sách');
    } catch (error) {
      console.error('Error filtering complaints:', error);
      toast.error('Không thể lọc danh sách');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setShowFilter(false);
    setCurrentPage(0);
    loadComplaints(0);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadComplaints(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCreate = () => {
    navigate(`${basePath}/feedback/new`);
  };

  const handleViewDetail = (complaintId) => {
    navigate(`${basePath}/feedback/${complaintId}`);
  };

  const handleViewStatistics = () => {
    navigate(`${basePath}/feedback/statistics`);
  };

  // Filter by search query (apply to current page only for display)
  const filteredComplaints = complaints.filter(complaint => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      complaint.complaintCode?.toLowerCase().includes(query) ||
      complaint.customerName?.toLowerCase().includes(query) ||
      complaint.description?.toLowerCase().includes(query)
    );
  });

  // Stats summary - calculated from ALL complaints, not just current page
  const stats = {
    total: allComplaints.length,
    new: allComplaints.filter(c => c.status === 'NEW').length,
    inProgress: allComplaints.filter(c => c.status === 'IN_PROGRESS').length,
    resolved: allComplaints.filter(c => c.status === 'RESOLVED').length,
    critical: allComplaints.filter(c => c.severity === 'CRITICAL').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Quản lý Phản hồi & Khiếu nại
              </h1>
              <p className="text-gray-600 flex items-center">
                <FiMessageSquare className="w-4 h-4 mr-2" />
                Theo dõi và xử lý phản hồi từ khách hàng
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleViewStatistics}
                className="flex items-center px-5 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold"
              >
                <FiBarChart2 className="w-5 h-5 mr-2" />
                Thống kê
              </button>
              <button
                onClick={handleCreate}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
              >
                <FiPlus className="w-5 h-5 mr-2" />
                Ghi nhận phản hồi
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200/80 p-4">
            <p className="text-sm text-gray-600 mb-1">Tổng số</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200/80 p-4">
            <p className="text-sm text-gray-600 mb-1">Mới nhận</p>
            <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200/80 p-4">
            <p className="text-sm text-gray-600 mb-1">Đang xử lý</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200/80 p-4">
            <p className="text-sm text-gray-600 mb-1">Đã giải quyết</p>
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-red-200/80 p-4">
            <p className="text-sm text-red-600 mb-1">Khẩn cấp</p>
            <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
          </div>
        </div>
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-6">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm theo mã phản hồi, tên khách hàng, nội dung..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white text-base"
              />
            </div>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`px-5 py-3.5 border-2 rounded-xl flex items-center transition-all duration-300 font-medium ${
                showFilter 
                  ? 'bg-blue-50 border-blue-600 text-blue-600' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FiFilter className="w-5 h-5 mr-2" />
              Bộ lọc
            </button>
            <button
              onClick={handleRefresh}
              className="px-5 py-3.5 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 flex items-center transition-all duration-300 font-medium"
            >
              <FiRefreshCw className="w-5 h-5 mr-2" />
              Làm mới
            </button>
          </div>

          {/* Filter Panel */}
          {showFilter && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <FeedbackFilter
                onFilter={handleFilter}
                onCancel={() => setShowFilter(false)}
              />
            </div>
          )}
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredComplaints.length === 0 && (
            <div className="text-center py-20 px-6">
              <FiMessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có phản hồi nào'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                  : 'Bắt đầu ghi nhận phản hồi từ khách hàng để theo dõi và xử lý'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={handleCreate}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg font-semibold"
                >
                  Ghi nhận phản hồi đầu tiên
                </button>
              )}
            </div>
          )}

          {/* Complaints List */}
          {!loading && filteredComplaints.length > 0 && (
            <>
              <div className="p-6 space-y-4">
                {filteredComplaints.map(complaint => (
                  <FeedbackCard
                    key={complaint.complaintId}
                    complaint={complaint}
                    onViewDetail={handleViewDetail}
                    onRefresh={() => loadComplaints(currentPage)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Hiển thị <span className="font-semibold">{currentPage * pageSize + 1}</span> - <span className="font-semibold">{Math.min((currentPage + 1) * pageSize, totalElements)}</span> trong tổng số <span className="font-semibold">{totalElements}</span> phản hồi
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Trước
                      </button>
                      
                      {/* Page Numbers */}
                      <div className="flex space-x-1">
                        {[...Array(totalPages)].map((_, index) => {
                          // Show first page, last page, current page, and pages around current
                          if (
                            index === 0 || 
                            index === totalPages - 1 || 
                            (index >= currentPage - 1 && index <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={index}
                                onClick={() => handlePageChange(index)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  currentPage === index
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {index + 1}
                              </button>
                            );
                          } else if (
                            index === currentPage - 2 || 
                            index === currentPage + 2
                          ) {
                            return <span key={index} className="px-2 text-gray-500">...</span>;
                          }
                          return null;
                        })}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagement;
