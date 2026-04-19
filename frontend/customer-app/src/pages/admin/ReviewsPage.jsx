import { useState, useEffect } from 'react';
import { 
  Star, Eye, CheckCircle, XCircle, EyeOff, Search, 
  MessageSquare, ThumbsUp, ShieldCheck, User, Car,
  Calendar, TrendingUp, Clock, AlertCircle, X 
} from 'lucide-react';
import reviewAdminService from '../../services/reviewAdminService';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showHideConfirm, setShowHideConfirm] = useState(false);
  const [actionReview, setActionReview] = useState(null);

  // Status configuration
  const statusConfig = {
    ALL: { label: 'Tất cả', color: 'gray', icon: MessageSquare },
    PENDING: { label: 'Chờ duyệt', color: 'yellow', icon: Clock },
    APPROVED: { label: 'Đã duyệt', color: 'green', icon: CheckCircle },
    REJECTED: { label: 'Từ chối', color: 'red', icon: XCircle },
    HIDDEN: { label: 'Đã ẩn', color: 'gray', icon: EyeOff }
  };

  useEffect(() => {
    loadReviews();
  }, [statusFilter]);

  useEffect(() => {
    applySearch();
  }, [searchTerm, reviews]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      let response;
      
      if (statusFilter === 'ALL') {
        response = await reviewAdminService.getAllReviews();
      } else {
        response = await reviewAdminService.getReviewsByStatus(statusFilter);
      }
      
      if (response.success || response.data) {
        setReviews(response.data || []);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách đánh giá');
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    if (!searchTerm.trim()) {
      setFilteredReviews(reviews);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = reviews.filter(review => 
      review.customerName?.toLowerCase().includes(search) ||
      review.vehicleModelName?.toLowerCase().includes(search) ||
      review.title?.toLowerCase().includes(search) ||
      review.reviewText?.toLowerCase().includes(search)
    );
    setFilteredReviews(filtered);
  };

  const handleViewDetail = (review) => {
    setSelectedReview(review);
    setShowDetailModal(true);
  };

  const handleApproveClick = (review) => {
    setActionReview(review);
    setShowApproveConfirm(true);
  };

  const handleRejectClick = (review) => {
    setActionReview(review);
    setShowRejectConfirm(true);
  };

  const handleHideClick = (review) => {
    setActionReview(review);
    setShowHideConfirm(true);
  };

  const handleConfirmApprove = async () => {
    try {
      const response = await reviewAdminService.approveReview(
        actionReview.reviewId, 
        'admin' // Replace with actual admin username
      );
      
      if (response.success || response.data) {
        toast.success('Đã duyệt đánh giá thành công');
        setShowApproveConfirm(false);
        setActionReview(null);
        loadReviews();
      }
    } catch (error) {
      toast.error('Không thể duyệt đánh giá');
      console.error('Error approving review:', error);
    }
  };

  const handleConfirmReject = async () => {
    try {
      const response = await reviewAdminService.rejectReview(
        actionReview.reviewId,
        'admin'
      );
      
      if (response.success || response.data) {
        toast.success('Đã từ chối đánh giá');
        setShowRejectConfirm(false);
        setActionReview(null);
        loadReviews();
      }
    } catch (error) {
      toast.error('Không thể từ chối đánh giá');
      console.error('Error rejecting review:', error);
    }
  };

  const handleConfirmHide = async () => {
    try {
      const response = await reviewAdminService.hideReview(
        actionReview.reviewId,
        'admin'
      );
      
      if (response.success || response.data) {
        toast.success('Đã ẩn đánh giá');
        setShowHideConfirm(false);
        setActionReview(null);
        loadReviews();
      }
    } catch (error) {
      toast.error('Không thể ẩn đánh giá');
      console.error('Error hiding review:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || { label: status, color: 'gray', icon: AlertCircle };
    const Icon = config.icon;
    
    const colorClasses = {
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${colorClasses[config.color]}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-700">{rating}</span>
      </div>
    );
  };

  const renderAspectRating = (label, rating) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <div className="flex items-center gap-2">
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full" 
              style={{ width: `${(rating / 5) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 w-8 text-right">
            {rating}/5
          </span>
        </div>
      </div>
    );
  };

  // Calculate statistics
  const statistics = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'PENDING').length,
    approved: reviews.filter(r => r.status === 'APPROVED').length,
    rejected: reviews.filter(r => r.status === 'REJECTED').length,
    hidden: reviews.filter(r => r.status === 'HIDDEN').length,
    avgRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Đánh giá</h1>
        <p className="text-gray-600">Duyệt và quản lý đánh giá của khách hàng về sản phẩm</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng đánh giá</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chờ duyệt</p>
              <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đã duyệt</p>
              <p className="text-2xl font-bold text-green-600">{statistics.approved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rating TB</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.avgRating} ⭐</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Filters and Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Status Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Object.entries(statusConfig).map(([key, config]) => {
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

            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm khách hàng, sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageSquare size={48} className="mb-4 text-gray-300" />
            <p className="text-lg font-medium">Không có đánh giá nào</p>
            <p className="text-sm">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đánh giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nội dung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReviews.map((review) => (
                  <tr key={review.reviewId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {review.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {review.customerId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Car className="text-gray-400" size={16} />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {review.vehicleModelName}
                          </div>
                          {review.vehicleVariantName && (
                            <div className="text-sm text-gray-500">
                              {review.vehicleVariantName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {renderStars(review.rating)}
                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600">
                            <ShieldCheck size={12} />
                            Đã mua
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {review.title && (
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {review.title}
                          </div>
                        )}
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {review.reviewText}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(review.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar size={14} />
                        {formatDate(review.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(review)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {review.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveClick(review)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Duyệt"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleRejectClick(review)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Từ chối"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        
                        {(review.status === 'APPROVED' || review.status === 'PENDING') && (
                          <button
                            onClick={() => handleHideClick(review)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                            title="Ẩn"
                          >
                            <EyeOff size={18} />
                          </button>
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
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-800 rounded-lg">
                    <MessageSquare size={32} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Chi tiết đánh giá</h2>
                    <p className="text-blue-100">ID: {selectedReview.reviewId}</p>
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

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Customer & Vehicle Info */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase">Thông tin khách hàng</h3>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{selectedReview.customerName}</div>
                      <div className="text-sm text-gray-500">ID: {selectedReview.customerId}</div>
                    </div>
                  </div>
                  {selectedReview.isVerifiedPurchase && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <ShieldCheck size={16} />
                      <span>Đã mua xe</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase">Thông tin sản phẩm</h3>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Car className="text-green-600" size={24} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{selectedReview.vehicleModelName}</div>
                      {selectedReview.vehicleVariantName && (
                        <div className="text-sm text-gray-500">{selectedReview.vehicleVariantName}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Rating */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 uppercase mb-3">Đánh giá tổng quan</h3>
                <div className="flex items-center gap-4">
                  {renderStars(selectedReview.rating)}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ThumbsUp size={16} />
                    <span>{selectedReview.helpfulCount || 0} người thấy hữu ích</span>
                  </div>
                </div>
              </div>

              {/* Aspect Ratings */}
              {(selectedReview.performanceRating || selectedReview.comfortRating || 
                selectedReview.designRating || selectedReview.valueRating) && (
                <div className="mb-6 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase">Chi tiết đánh giá</h3>
                  <div className="space-y-2">
                    {renderAspectRating('Hiệu suất', selectedReview.performanceRating)}
                    {renderAspectRating('Thoải mái', selectedReview.comfortRating)}
                    {renderAspectRating('Thiết kế', selectedReview.designRating)}
                    {renderAspectRating('Giá trị', selectedReview.valueRating)}
                  </div>
                </div>
              )}

              {/* Review Content */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase mb-3">Nội dung đánh giá</h3>
                {selectedReview.title && (
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{selectedReview.title}</h4>
                )}
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedReview.reviewText}
                </p>
              </div>

              {/* Status & Dates */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <span className="text-sm text-gray-600">Trạng thái:</span>
                  <div className="mt-1">{getStatusBadge(selectedReview.status)}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Ngày tạo:</span>
                  <div className="mt-1 text-sm font-medium text-gray-900">
                    {formatDate(selectedReview.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Đóng
              </button>
              
              {selectedReview.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleApproveClick(selectedReview);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <CheckCircle size={18} className="inline mr-2" />
                    Duyệt
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleRejectClick(selectedReview);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <XCircle size={18} className="inline mr-2" />
                    Từ chối
                  </button>
                </>
              )}
              
              {(selectedReview.status === 'APPROVED' || selectedReview.status === 'PENDING') && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleHideClick(selectedReview);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  <EyeOff size={18} className="inline mr-2" />
                  Ẩn
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveConfirm && actionReview && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="text-green-600" size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Xác nhận duyệt</h3>
                  <p className="text-sm text-gray-600">Đánh giá sẽ hiển thị công khai</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Bạn có chắc chắn muốn duyệt đánh giá của khách hàng <strong>{actionReview.customerName}</strong>?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApproveConfirm(false);
                    setActionReview(null);
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

      {/* Reject Confirmation Modal */}
      {showRejectConfirm && actionReview && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="text-red-600" size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Xác nhận từ chối</h3>
                  <p className="text-sm text-gray-600">Đánh giá sẽ không được hiển thị</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Bạn có chắc chắn muốn từ chối đánh giá của khách hàng <strong>{actionReview.customerName}</strong>?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectConfirm(false);
                    setActionReview(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmReject}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Từ chối
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hide Confirmation Modal */}
      {showHideConfirm && actionReview && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gray-100 rounded-full">
                  <EyeOff className="text-gray-600" size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Xác nhận ẩn</h3>
                  <p className="text-sm text-gray-600">Đánh giá sẽ bị ẩn khỏi công khai</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Bạn có chắc chắn muốn ẩn đánh giá của khách hàng <strong>{actionReview.customerName}</strong>?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowHideConfirm(false);
                    setActionReview(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmHide}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Ẩn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
