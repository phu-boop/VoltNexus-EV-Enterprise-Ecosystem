// features/admin/promotions/pages/PromotionListPage.js
import React, { useState, useMemo } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { usePromotions } from "../hooks/usePromotions";
import PromotionStats from "../components/PromotionStats";
import StatusFilter from "../components/StatusFilter";
import PromotionDetailsModal from "../components/PromotionDetailsModal";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import Alert from "../../../../components/ui/Alert";
import Swal from "sweetalert2";

export const PromotionListPage = ({ onCreate, onEdit }) => {
  const {
    promotions,
    loading,
    error,
    approvePromotion,
    deletePromotion,
    loadPromotions,
  } = usePromotions();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [sortConfig, setSortConfig] = useState({
    key: "status", // Mặc định sort theo trạng thái
    direction: "asc", // asc: DRAFT lên đầu, desc: ACTIVE/EXPIRED lên đầu
  });

  const sortedAndFilteredPromotions = useMemo(() => {
    let filtered = promotions;

    // Filter by status
    if (selectedStatus !== "ALL") {
      filtered = filtered.filter((p) => p.status === selectedStatus);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.promotionName.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
      );
    }

    // Sort promotions
    return filtered.sort((a, b) => {
      // Ưu tiên sort theo trạng thái: DRAFT lên đầu
      if (sortConfig.key === "status") {
        const statusPriority = {
          DRAFT: 1, // Cao nhất
          ACTIVE: 2,
          INACTIVE: 3,
          EXPIRED: 4, // Thấp nhất
        };

        const aPriority = statusPriority[a.status] || 5;
        const bPriority = statusPriority[b.status] || 5;

        if (aPriority !== bPriority) {
          return sortConfig.direction === "asc"
            ? aPriority - bPriority // DRAFT -> ACTIVE -> INACTIVE -> EXPIRED
            : bPriority - aPriority; // EXPIRED -> INACTIVE -> ACTIVE -> DRAFT
        }
      }

      // Nếu cùng trạng thái hoặc sort theo key khác, sort theo ngày tạo (mới nhất lên đầu)
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);

      if (sortConfig.direction === "asc") {
        return dateB - dateA; // Mới nhất lên đầu
      } else {
        return dateA - dateB; // Cũ nhất lên đầu
      }
    });
  }, [promotions, selectedStatus, searchTerm, sortConfig]);

  const showAlert = (type, message) => {
    setAlert({
      show: true,
      type,
      message,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseAlert = () => {
    setAlert({ show: false, type: "", message: "" });
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FunnelIcon className="h-4 w-4 opacity-50" />;
    }

    return sortConfig.direction === "asc" ? (
      <ArrowUpIcon className="h-4 w-4" />
    ) : (
      <ArrowDownIcon className="h-4 w-4" />
    );
  };

  const getSortLabel = () => {
    if (sortConfig.key === "status") {
      return sortConfig.direction === "asc"
        ? "Chưa duyệt trước"
        : "Đã duyệt trước";
    }
    return sortConfig.direction === "asc" ? "Mới nhất trước" : "Cũ nhất trước";
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    const result = await approvePromotion(id);
    setActionLoading(null);

    if (result.success) {
      showAlert("success", "Đã phê duyệt khuyến mãi thành công!");
      setIsDetailsModalOpen(false);
    } else {
      showAlert("error", result.error);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa",
      text: `Bạn có chắc muốn xóa khuyến mãi "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      buttonsStyling: true,
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary",
      },
    });

    if (result.isConfirmed) {
      setActionLoading(id);
      const deleteResult = await deletePromotion(id);
      setActionLoading(null);

      if (deleteResult.success) {
        await Swal.fire({
          title: "Thành công",
          text: "Đã xóa khuyến mãi thành công!",
          icon: "success",
          confirmButtonText: "OK",
        });
        setIsDetailsModalOpen(false);
      } else {
        await Swal.fire({
          title: "Lỗi",
          text: deleteResult.error,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const handleViewDetails = (promotion) => {
    setSelectedPromotion(promotion);
    setIsDetailsModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  const formatDiscountRate = (rate) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        text: "Chờ xác thực",
        icon: "⏳",
      },
      ACTIVE: {
        color: "bg-green-100 text-green-800 border-green-200",
        text: "Đang hoạt động",
        icon: "✅",
      },
      EXPIRED: {
        color: "bg-red-100 text-red-800 border-red-200",
        text: "Đã hết hạn",
        icon: "❌",
      },
      INACTIVE: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        text: "Không hoạt động",
        icon: "⏸️",
      },
    };

    const config = statusConfig[status] || statusConfig.DRAFT;
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Lỗi khi tải dữ liệu
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadPromotions}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý Khuyến mãi
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Quản lý và phê duyệt tất cả các chương trình khuyến mãi
              </p>
            </div>
            <button
              onClick={onCreate}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Tạo khuyến mãi mới
            </button>
          </div>
        </div>

        {/* Stats */}
        <PromotionStats promotions={promotions} />

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc mô tả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <StatusFilter
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                onClearFilters={() => setSelectedStatus("ALL")}
              />

              {/* Sort Button */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  Sắp xếp:
                </span>
                <button
                  onClick={() => handleSort("status")}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <span className="mr-2">{getSortLabel()}</span>
                  {getSortIcon("status")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Component */}
        {alert.show && (
          <div className="mb-6">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={handleCloseAlert}
            />
          </div>
        )}

        {/* Sort Info Banner */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
          <div className="flex items-center text-blue-800">
            <FunnelIcon className="h-4 w-4 mr-2" />
            <span className="text-sm">
              Đang hiển thị: {sortedAndFilteredPromotions.length} khuyến mãi •
              Sắp xếp: {getSortLabel()} •
              {sortConfig.key === "status" &&
                " Mới nhất lên đầu khi cùng trạng thái"}
            </span>
          </div>
        </div>

        {/* Promotions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Thông tin khuyến mãi
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Giảm giá
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Thời gian
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Trạng thái
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedAndFilteredPromotions.length > 0 ? (
                      sortedAndFilteredPromotions.map((promotion) => (
                        <tr
                          key={promotion.promotionId}
                          className={`hover:bg-gray-50 transition-colors ${
                            promotion.status === "DRAFT"
                              ? "bg-yellow-50 border-l-4 border-l-yellow-400"
                              : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                <CalendarIcon className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {promotion.promotionName}
                                  </p>
                                  {promotion.status === "DRAFT" && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Cần duyệt
                                    </span>
                                  )}
                                </div>
                                {promotion.description && (
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                    {promotion.description}
                                  </p>
                                )}
                                <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                                  <span>
                                    ID: {promotion.promotionId.substring(0, 8)}
                                    ...
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-lg font-bold text-green-600">
                              {formatDiscountRate(promotion.discountRate)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Tỷ lệ giảm
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 space-y-1">
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                                <span>{formatDate(promotion.startDate)}</span>
                              </div>
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                                <span>{formatDate(promotion.endDate)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(promotion.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleViewDetails(promotion)}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                              >
                                <EyeIcon className="h-4 w-4 mr-1" />
                                Xem
                              </button>

                              {promotion.status === "DRAFT" && (
                                <button
                                  onClick={() =>
                                    handleApprove(promotion.promotionId)
                                  }
                                  disabled={
                                    actionLoading === promotion.promotionId
                                  }
                                  className="inline-flex items-center px-3 py-1 border border-green-300 rounded-md text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                                >
                                  {actionLoading === promotion.promotionId ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                  ) : (
                                    <>
                                      <CheckIcon className="h-4 w-4 mr-1" />
                                      Duyệt
                                    </>
                                  )}
                                </button>
                              )}

                              <button
                                onClick={() => onEdit(promotion)}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                              >
                                <PencilIcon className="h-4 w-4 mr-1" />
                                Sửa
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    promotion.promotionId,
                                    promotion.promotionName
                                  )
                                }
                                disabled={
                                  actionLoading === promotion.promotionId
                                }
                                className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                              >
                                <TrashIcon className="h-4 w-4 mr-1" />
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              Không tìm thấy khuyến mãi nào
                            </h3>
                            <p className="text-gray-500 mb-4">
                              {searchTerm || selectedStatus !== "ALL"
                                ? "Thử thay đổi điều kiện tìm kiếm hoặc bộ lọc"
                                : "Bắt đầu bằng cách tạo khuyến mãi đầu tiên"}
                            </p>
                            {!searchTerm && selectedStatus === "ALL" && (
                              <button
                                onClick={onCreate}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Tạo khuyến mãi đầu tiên
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              {sortedAndFilteredPromotions.length > 0 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Hiển thị{" "}
                      <span className="font-medium">
                        {sortedAndFilteredPromotions.length}
                      </span>{" "}
                      khuyến mãi •
                      <span className="ml-2">
                        <span className="text-yellow-600 font-medium">
                          {
                            sortedAndFilteredPromotions.filter(
                              (p) => p.status === "DRAFT"
                            ).length
                          }{" "}
                          chờ duyệt
                        </span>
                        {sortedAndFilteredPromotions.filter(
                          (p) => p.status === "ACTIVE"
                        ).length > 0 && (
                          <span className="ml-2 text-green-600">
                            {
                              sortedAndFilteredPromotions.filter(
                                (p) => p.status === "ACTIVE"
                              ).length
                            }{" "}
                            đang hoạt động
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Details Modal */}
        <PromotionDetailsModal
          promotion={selectedPromotion}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          onApprove={handleApprove}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default PromotionListPage;
