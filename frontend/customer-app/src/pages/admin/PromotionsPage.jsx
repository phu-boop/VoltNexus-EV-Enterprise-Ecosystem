import { useState, useEffect } from 'react';
import { 
  Plus, Search, Eye, Edit, Trash2, CheckCircle, X, 
  TrendingUp, Clock, AlertCircle, Tag, Calendar,
  Gift, Percent, XCircle 
} from 'lucide-react';
import { 
  getAllPromotions, 
  getPromotionById, 
  createPromotion, 
  updatePromotion, 
  approvePromotion, 
  deletePromotion 
} from '../../services/promotionService';
import toast from 'react-hot-toast';

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [promotionToDelete, setPromotionToDelete] = useState(null);
  const [promotionToApprove, setPromotionToApprove] = useState(null);
  const [formData, setFormData] = useState({
    promotionName: '',
    description: '',
    discountRate: '',
    startDate: '',
    endDate: '',
    applicableModelsJson: '[]',
    dealerIdJson: '[]',
    status: 'ACTIVE'
  });

  // Status configuration
  const statusConfig = {
    ALL: { label: 'Tất cả', color: 'gray', icon: Tag },
    DRAFT: { label: 'Chờ duyệt', color: 'yellow', icon: Clock },
    NEAR: { label: 'Đã duyệt', color: 'blue', icon: CheckCircle },
    ACTIVE: { label: 'Đang áp dụng', color: 'green', icon: TrendingUp },
    INACTIVE: { label: 'Tạm ngưng', color: 'gray', icon: AlertCircle },
    EXPIRED: { label: 'Hết hạn', color: 'red', icon: XCircle },
    DELETED: { label: 'Đã xóa', color: 'red', icon: Trash2 }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, promotions]);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const data = await getAllPromotions();
      if (data && data.length > 0) {
      }
      setPromotions(data);
    } catch (error) {
      toast.error('Không thể tải danh sách khuyến mãi');
      console.error('Error loading promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...promotions];
    
    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.promotionName?.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      );
    }
    
    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(p => p.status === statusFilter);
    }
    
    // Sort by start date (newest first)
    result.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    
    setFilteredPromotions(result);
  };

  const getStatistics = () => {
    return {
      total: promotions.length,
      active: promotions.filter(p => p.status === 'ACTIVE').length,
      draft: promotions.filter(p => p.status === 'DRAFT').length,
      expired: promotions.filter(p => p.status === 'EXPIRED').length
    };
  };

  const handleViewDetail = async (promotion) => {
    try {
      const data = await getPromotionById(promotion.promotionId);
      setSelectedPromotion(data);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Không thể tải chi tiết khuyến mãi');
      console.error('Error loading promotion detail:', error);
    }
  };

  const handleAddNew = () => {
    setEditingPromotion(null);
    setFormData({
      promotionName: '',
      description: '',
      discountRate: '',
      startDate: '',
      endDate: '',
      applicableModelsJson: '[]',
      dealerIdJson: '[]',
      status: 'ACTIVE'
    });
    setShowFormModal(true);
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      promotionName: promotion.promotionName || '',
      description: promotion.description || '',
      discountRate: promotion.discountRate || '',
      startDate: promotion.startDate ? formatDateTimeForInput(promotion.startDate) : '',
      endDate: promotion.endDate ? formatDateTimeForInput(promotion.endDate) : '',
      applicableModelsJson: promotion.applicableModelsJson || '[]',
      dealerIdJson: promotion.dealerIdJson || '[]',
      status: promotion.status || 'ACTIVE'
    });
    setShowFormModal(true);
  };

  const handleDeleteClick = (promotion) => {
    setPromotionToDelete(promotion);
    setShowDeleteConfirm(true);
  };

  const handleApproveClick = (promotion) => {
    setPromotionToApprove(promotion);
    setShowApproveConfirm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.promotionName.trim()) {
      toast.error('Vui lòng nhập tên khuyến mãi');
      return;
    }
    if (!formData.discountRate || formData.discountRate <= 0 || formData.discountRate > 100) {
      toast.error('Mức giảm giá phải từ 0-100%');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error('Vui lòng chọn thời gian bắt đầu và kết thúc');
      return;
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    try {
      const payload = {
        ...formData,
        discountRate: parseFloat(formData.discountRate)
      };

      if (editingPromotion) {
        await updatePromotion(editingPromotion.promotionId, payload);
        toast.success('Cập nhật khuyến mãi thành công!');
      } else {
        await createPromotion(payload);
        toast.success('Thêm khuyến mãi mới thành công!');
      }
      
      setShowFormModal(false);
      await loadPromotions();
    } catch (error) {
      toast.error(editingPromotion ? 'Lỗi khi cập nhật khuyến mãi!' : 'Lỗi khi thêm khuyến mãi!');
      console.error('Error saving promotion:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!promotionToDelete) return;
    
    try {
      await deletePromotion(promotionToDelete.promotionId);
      toast.success('Xóa khuyến mãi thành công!');
      setShowDeleteConfirm(false);
      setPromotionToDelete(null);
      await loadPromotions();
    } catch (error) {
      toast.error('Lỗi khi xóa khuyến mãi!');
      console.error('Error deleting promotion:', error);
    }
  };

  const handleConfirmApprove = async () => {
    if (!promotionToApprove) return;
    
    try {
      await approvePromotion(promotionToApprove.promotionId);
      toast.success('Duyệt khuyến mãi thành công!');
      setShowApproveConfirm(false);
      setPromotionToApprove(null);
      await loadPromotions();
    } catch (error) {
      toast.error('Lỗi khi duyệt khuyến mãi!');
      console.error('Error approving promotion:', error);
    }
  };

  const getStatusBadge = (status) => {
    // Map trạng thái từ backend
    const config = statusConfig[status];
    
    // Nếu không tìm thấy config, hiển thị status gốc với màu mặc định
    if (!config) {
      return (
        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
          {status}
        </span>
      );
    }
    
    const colorClasses = {
      gray: 'bg-gray-100 text-gray-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[config.color]}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const statistics = getStatistics();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Khuyến mãi</h1>
        <p className="text-gray-600">Quản lý các chương trình khuyến mãi cho khách hàng</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng số khuyến mãi</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{statistics.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Gift className="text-blue-600" size={32} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đang áp dụng</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{statistics.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="text-green-600" size={32} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chờ duyệt</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{statistics.draft}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="text-yellow-600" size={32} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đã hết hạn</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{statistics.expired}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="text-red-600" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {Object.entries(statusConfig)
            .filter(([key]) => ['ALL', 'ACTIVE', 'INACTIVE', 'EXPIRED'].includes(key))
            .map(([key, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
                    statusFilter === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={18} />
                  {config.label}
                </button>
              );
            })}
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên khuyến mãi hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Thêm khuyến mãi
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Hiển thị {filteredPromotions.length} / {promotions.length} khuyến mãi
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredPromotions.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Không tìm thấy khuyến mãi phù hợp' 
                : 'Chưa có khuyến mãi nào'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên chương trình
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mức giảm giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian áp dụng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPromotions.map((promotion) => (
                  <tr key={promotion.promotionId} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-full mr-3">
                          <Tag className="text-purple-600" size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {promotion.promotionName}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {promotion.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Percent className="text-green-600" size={16} />
                        <span className="text-lg font-bold text-green-600">
                          {promotion.discountRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(promotion.startDate)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(promotion.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(promotion.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(promotion)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {promotion.status !== 'DELETED' && (
                          <>
                            <button
                              onClick={() => handleEdit(promotion)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Chỉnh sửa"
                            >
                              <Edit size={18} />
                            </button>
                            
                            {promotion.status === 'DRAFT' && (
                              <button
                                onClick={() => handleApproveClick(promotion)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                title="Duyệt khuyến mãi"
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDeleteClick(promotion)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Xóa"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPromotion && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-800 rounded-lg">
                    <Gift size={32} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedPromotion.promotionName}</h2>
                    <p className="text-purple-100">Chi tiết khuyến mãi</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition text-white"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-gray-600 font-medium">Tên chương trình</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {selectedPromotion.promotionName}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-600 font-medium">Mô tả</label>
                  <p className="text-gray-900 mt-1">
                    {selectedPromotion.description || 'Không có mô tả'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 font-medium flex items-center gap-1">
                      <Percent size={14} /> Mức giảm giá
                    </label>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {selectedPromotion.discountRate}%
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Trạng thái</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedPromotion.status)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 font-medium flex items-center gap-1">
                      <Calendar size={14} /> Ngày bắt đầu
                    </label>
                    <p className="text-gray-900 mt-1 font-medium">
                      {formatDateTime(selectedPromotion.startDate)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-600 font-medium flex items-center gap-1">
                      <Calendar size={14} /> Ngày kết thúc
                    </label>
                    <p className="text-gray-900 mt-1 font-medium">
                      {formatDateTime(selectedPromotion.endDate)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-600 font-medium">Model áp dụng (JSON)</label>
                  <pre className="text-sm text-gray-900 mt-1 bg-gray-50 p-3 rounded border overflow-x-auto">
                    {selectedPromotion.applicableModelsJson || '[]'}
                  </pre>
                </div>
                
                <div>
                  <label className="text-sm text-gray-600 font-medium">Đại lý áp dụng (JSON)</label>
                  <pre className="text-sm text-gray-900 mt-1 bg-gray-50 p-3 rounded border overflow-x-auto">
                    {selectedPromotion.dealerIdJson || '[]'}
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal (Add/Edit) */}
      {showFormModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Plus size={28} />
                  <h2 className="text-2xl font-bold">
                    {editingPromotion ? 'Chỉnh sửa Khuyến mãi' : 'Thêm Khuyến mãi Mới'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khuyến mãi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="promotionName"
                    value={formData.promotionName}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: Giảm giá mùa hè 2026"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mô tả chi tiết về chương trình khuyến mãi..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mức giảm giá (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="discountRate"
                    value={formData.discountRate}
                    onChange={handleFormChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: 15"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="ACTIVE">Đang áp dụng</option>
                    <option value="INACTIVE">Tạm ngưng</option>
                    <option value="EXPIRED">Hết hạn</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Chọn trạng thái hiển thị cho khuyến mãi
                  </p>
                </div>
              </div>
            </form>
            
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingPromotion ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && promotionToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 className="text-red-600" size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Xác nhận xóa</h3>
                  <p className="text-sm text-gray-600">Hành động này không thể hoàn tác</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Bạn có chắc chắn muốn xóa khuyến mãi <strong>"{promotionToDelete.promotionName}"</strong>?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setPromotionToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveConfirm && promotionToApprove && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="text-green-600" size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Duyệt khuyến mãi</h3>
                  <p className="text-sm text-gray-600">Xác nhận duyệt chương trình</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Bạn có chắc chắn muốn duyệt khuyến mãi <strong>"{promotionToApprove.promotionName}"</strong>?
                <br />
                <span className="text-sm text-gray-500">
                  Sau khi duyệt, khuyến mãi sẽ tự động chuyển sang trạng thái NEAR và chờ đến thời gian áp dụng.
                </span>
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApproveConfirm(false);
                    setPromotionToApprove(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmApprove}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Duyệt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
