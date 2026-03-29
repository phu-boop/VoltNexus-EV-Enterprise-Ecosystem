// pages/PromotionListPage.js (Final version with proper data mapping)
import PromotionSkeleton from "./../components/PromotionSkeleton";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { promotionService } from "../services/promotionService";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CalendarIcon,
  ChartBarIcon,
  XMarkIcon,
  TagIcon,
  BuildingStorefrontIcon,
  ClockIcon,
  PlayIcon,
  StopIcon,
  CheckCircleIcon,
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  XCircleIcon,
  ArchiveBoxIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { format, parseISO, isBefore, isAfter } from "date-fns";
import { vi } from "date-fns/locale";
import Swal from "sweetalert2";

// Services
import fetchDealer from "../services/fetchDealer";
import fetchModelVehicle from "../services/fetchModelVehicle";

export default function PromotionListPage({ onCreate }) {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    expired: 0,
    inactive: 0,
  });
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [allDealers, setAllDealers] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);
  const [loadingDealers, setLoadingDealers] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadPromotions();
    loadAllDealers();
    loadAllModels();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [promotions]);

  const loadPromotions = useCallback(() => {
    setLoading(true);
    setError(null);
    promotionService
      .getAll()
      .then((res) => {
        const rawData = res.data;
        const list = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.data)
            ? rawData.data
            : [];
        const promotionsWithAutoStatus = list.map((promo) => ({
          ...promo,
          autoStatus: calculateAutoStatus(promo),
        }));
        setPromotions(promotionsWithAutoStatus);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading promotions:", err);
        setError("Không thể tải danh sách khuyến mãi");
        setLoading(false);
      });
  }, []);

  const loadAllDealers = useCallback(async () => {
    setLoadingDealers(true);
    try {
      const response = (await fetchDealer.getAllDealer()).data;
      if (response.success) {
        const data = response.data;
        const dealers = Array.isArray(data) ? data : (data?.content ?? []);
        setAllDealers(dealers);
      }
    } catch (error) {
      console.error("Error loading dealers:", error);
    } finally {
      setLoadingDealers(false);
    }
  }, []);

  const loadAllModels = useCallback(async () => {
    setLoadingModels(true);
    try {
      const response = (await fetchModelVehicle.getAllModelVehicle()).data;
      if (response.code === "1000") {
        const data = response.data;
        const models = Array.isArray(data) ? data : (data?.content ?? []);
        setAllModels(models);
      }
    } catch (error) {
      console.error("Error loading models:", error);
    } finally {
      setLoadingModels(false);
    }
  }, []);

  const calculateAutoStatus = useCallback((promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (isBefore(now, startDate)) return "DRAFT";
    if (isAfter(now, endDate)) return "EXPIRED";
    if (isAfter(now, startDate) && isBefore(now, endDate)) return "ACTIVE";
    return "INACTIVE";
  }, []);

  const calculateStats = useCallback(() => {
    const newStats = {
      total: promotions.length,
      pending: promotions.filter(
        (p) => p.status === "DRAFT" || p.autoStatus === "DRAFT"
      ).length,
      active: promotions.filter(
        (p) => p.status === "ACTIVE" || p.autoStatus === "ACTIVE"
      ).length,
      expired: promotions.filter(
        (p) => p.status === "EXPIRED" || p.autoStatus === "EXPIRED"
      ).length,
      inactive: promotions.filter((p) => p.status === "INACTIVE").length,
    };
    setStats(newStats);
  }, [promotions]);

  const handleStatusFilter = useCallback(
    (status) => {
      setFilterStatus(status);
      if (status === "ALL") {
        loadPromotions();
      } else {
        promotionService
          .getByStatus(status)
          .then((res) => {
            const rawData = res.data;
            const list = Array.isArray(rawData)
              ? rawData
              : Array.isArray(rawData?.data)
                ? rawData.data
                : [];
            const promotionsWithAutoStatus = list.map((promo) => ({
              ...promo,
              autoStatus: calculateAutoStatus(promo),
            }));
            setPromotions(promotionsWithAutoStatus);
          })
          .catch((err) => {
            console.error(err);
            setError("Lỗi khi lọc khuyến mãi!");
          });
      }
    },
    [loadPromotions, calculateAutoStatus]
  );

  const handleViewDetails = useCallback(async (promotion) => {
    setLoadingDetails(true);
    setSelectedPromotion(promotion);
    setShowDetailModal(true);
    setLoadingDetails(false);
  }, []);

  const closeDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedPromotion(null);
  }, []);

  const handleAuthenticate = useCallback(async (promotionId) => {
    try {
      await promotionService.authenticPromotion(promotionId);
      loadPromotions();
      closeDetailModal();
    } catch (err) {
      console.error("Error authenticating promotion:", err);
    }
  }, [loadPromotions, closeDetailModal]);

  const handleDelete = useCallback(async (promotionId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chương trình khuyến mãi này không?")) return;
    try {
      await promotionService.delete(promotionId);
      loadPromotions();
      closeDetailModal();
    } catch (err) {
      console.error("Error deleting promotion:", err);
    }
  }, [loadPromotions, closeDetailModal]);

  // Hàm lấy thông tin đầy đủ của models từ ID - ĐÃ SỬA
  const getApplicableModelsDetails = useCallback(
    (promotion) => {
      try {
        const modelIds = promotion.applicableModels || [];

        if (Array.isArray(modelIds)) {
          return modelIds.map((modelId) => {
            const modelsArray = Array.isArray(allModels) ? allModels : [];
            const fullModelInfo = modelsArray.find((m) => m.modelId === modelId);

            return (
              fullModelInfo || {
                modelId,
                modelName: `Model ${modelId}`,
                brand: "Unknown",
                status: "UNKNOWN",
              }
            );
          });
        }
        return [];
      } catch (error) {
        console.error("Error parsing models:", error);
        return [];
      }
    },
    [allModels]
  );

  // Hàm lấy thông tin đầy đủ của dealers từ ID - ĐÃ SỬA
  const getApplicableDealersDetails = useCallback(
    (promotion) => {
      try {
        const dealerIds = promotion.applicableDealers || [];

        if (Array.isArray(dealerIds)) {
          return dealerIds.map((dealerId) => {
            const dealersArray = Array.isArray(allDealers) ? allDealers : [];
            const fullDealerInfo = dealersArray.find(
              (d) => d.dealerId === dealerId
            );

            return (
              fullDealerInfo || {
                dealerId,
                dealerName: `Đại lý ${dealerId}`,
                dealerCode: `DLR${dealerId}`,
                address: "Unknown",
                city: "Unknown",
                region: "Unknown",
                status: "UNKNOWN",
              }
            );
          });
        }
        return [];
      } catch (error) {
        console.error("Error parsing dealers:", error);
        return [];
      }
    },
    [allDealers]
  );

  const filteredPromotions = useMemo(() => {
    return promotions.filter(
      (promotion) =>
        promotion.promotionName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        promotion.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [promotions, searchTerm]);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPromotions = filteredPromotions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);

  const handleSelectAll = useCallback(() => {
    const currentIds = currentPromotions.map((p) => p.promotionId);
    const allSelectedOnPage = currentIds.every((id) => selectedRowKeys.includes(id));

    if (allSelectedOnPage && currentIds.length > 0) {
      setSelectedRowKeys((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedRowKeys((prev) => {
        const newSelected = [...prev];
        currentIds.forEach((id) => {
          if (!newSelected.includes(id)) newSelected.push(id);
        });
        return newSelected;
      });
    }
  }, [selectedRowKeys, currentPromotions]);

  const handleSelectRow = useCallback((promotionId) => {
    setSelectedRowKeys((prev) =>
      prev.includes(promotionId)
        ? prev.filter((id) => id !== promotionId)
        : [...prev, promotionId]
    );
  }, []);

  const handleBulkSoftDelete = useCallback(async () => {
    const result = await Swal.fire({
      title: "Xác nhận vô hiệu hóa?",
      text: `Bạn có chắc muốn Vô hiệu hóa (Xóa mềm) ${selectedRowKeys.length} khuyến mãi đã chọn?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#eab308",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    });
    if (!result.isConfirmed) return;
    setIsProcessingBulk(true);
    try {
      const promises = selectedRowKeys.map((id) => {
        const promo = promotions.find((p) => p.promotionId === id);
        if (promo) {
          const { autoStatus, ...promoDataToSend } = promo;
          return promotionService.update(id, { ...promoDataToSend, status: "INACTIVE" });
        }
        return Promise.resolve();
      });
      await Promise.all(promises);
      setSelectedRowKeys([]);
      loadPromotions();
    } catch (err) {
      console.error("Bulk soft delete error:", err);
      setError("Có lỗi xảy ra khi vô hiệu hóa hàng loạt!");
    } finally {
      setIsProcessingBulk(false);
    }
  }, [selectedRowKeys, promotions, loadPromotions]);

  const handleBulkHardDelete = useCallback(async () => {
    const result = await Swal.fire({
      title: "Cảnh báo xóa vĩnh viễn?",
      text: `Bạn có chắc chắn muốn Xóa vĩnh viễn ${selectedRowKeys.length} khuyến mãi? Hành động này không thể hoàn tác.`,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xóa vĩnh viễn",
      cancelButtonText: "Hủy",
    });
    if (!result.isConfirmed) return;
    setIsProcessingBulk(true);
    try {
      const promises = selectedRowKeys.map((id) => promotionService.delete(id));
      await Promise.all(promises);
      setSelectedRowKeys([]);
      loadPromotions();
    } catch (err) {
      console.error("Bulk hard delete error:", err);
      setError("Có lỗi xảy ra khi xóa hàng loạt!");
    } finally {
      setIsProcessingBulk(false);
    }
  }, [selectedRowKeys, loadPromotions]);

  const getStatusConfig = useCallback((status) => {
    const configs = {
      DRAFT: {
        label: "Đang chờ xác thực",
        description: "Chương trình đang chờ được xác thực và kích hoạt",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        icon: ClockIcon,
      },
      ACTIVE: {
        label: "Đang hoạt động",
        description: "Chương trình đang được áp dụng",
        color: "text-sky-600",
        bgColor: "bg-sky-50",
        borderColor: "border-sky-200",
        icon: PlayIcon,
      },
      EXPIRED: {
        label: "Đã hết hạn",
        description: "Chương trình đã kết thúc",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: StopIcon,
      },
      INACTIVE: {
        label: "Không hoạt động",
        description: "Chương trình đã bị vô hiệu hóa",
        color: "text-slate-600",
        bgColor: "bg-gray-50",
        borderColor: "border-slate-200",
        icon: StopIcon,
      },
    };

    return configs[status] || configs.DRAFT;
  }, []);

  const getStatusBadge = useCallback((promotion) => {
    const displayStatus =
      promotion.status === "DRAFT" ? "DRAFT" : promotion.autoStatus;

    const statusConfig = {
      DRAFT: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        text: "Đang chờ xác thực",
        icon: "⚪",
      },
      ACTIVE: {
        color: "bg-sky-100 text-sky-800 border-sky-200",
        text: "Đang hoạt động",
        icon: "🟢",
      },
      EXPIRED: {
        color: "bg-red-100 text-red-800 border-red-200",
        text: "Đã hết hạn",
        icon: "❌",
      },
      INACTIVE: {
        color: "bg-gray-100 text-gray-800 border-slate-200",
        text: "Không hoạt động",
        icon: "⏸️",
      },
    };

    const config = statusConfig[displayStatus] || {
      color: "bg-gray-100 text-gray-800 border-slate-200",
      text: displayStatus,
      icon: "❓",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    );
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "-";
    try {
      const date =
        typeof dateString === "string"
          ? parseISO(dateString)
          : new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  }, []);

  const formatDateLong = useCallback((dateString) => {
    if (!dateString) return "-";
    try {
      const date =
        typeof dateString === "string"
          ? parseISO(dateString)
          : new Date(dateString);
      return format(date, "EEEE, dd/MM/yyyy 'lúc' HH:mm", { locale: vi });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  }, []);

  const formatDiscountRate = useCallback((rate) => {
    return `${(rate * 100).toFixed(1)}%`;
  }, []);

  const getDateStatus = useCallback((startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return { color: "text-blue-600", text: "Sắp bắt đầu" };
    if (now > end) return { color: "text-red-600", text: "Đã kết thúc" };
    return { color: "text-sky-600", text: "Đang diễn ra" };
  }, []);

  const calculateDuration = useCallback((startDate, endDate) => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end - start;

    if (diffMs <= 0) return null;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  }, []);

  // Render Detail Modal với dữ liệu đã được map chính xác
  const renderDetailModal = () => {
    if (!selectedPromotion) return null;

    const statusConfig = getStatusConfig(selectedPromotion.autoStatus);
    const StatusIcon = statusConfig.icon;
    const duration = calculateDuration(
      selectedPromotion.startDate,
      selectedPromotion.endDate
    );
    const dateStatus = getDateStatus(
      selectedPromotion.startDate,
      selectedPromotion.endDate
    );

    // Lấy thông tin đầy đủ của models và dealers - ĐÃ SỬA
    const applicableModels = getApplicableModelsDetails(selectedPromotion);
    const applicableDealers = getApplicableDealersDetails(selectedPromotion);

    return (
      <div className="fixed inset-0 bg-gray-600/10 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-4 sm:top-10 mx-auto p-4 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg rounded-lg bg-white">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                <TagIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedPromotion.promotionName}
                </h2>
                <p className="text-sm text-slate-500">
                  ID: {selectedPromotion.promotionId}
                </p>
              </div>
            </div>
            <button
              onClick={closeDetailModal}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {loadingDetails ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <>
                {/* Status and Discount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    className={`p-4 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor}`}
                  >
                    <div className="flex items-center">
                      <StatusIcon
                        className={`h-5 w-5 mr-2 ${statusConfig.color}`}
                      />
                      <div>
                        <h3 className={`font-medium ${statusConfig.color}`}>
                          {statusConfig.label}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {statusConfig.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Trạng thái hệ thống: {dateStatus.text}
                    </div>
                  </div>

                  <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-sky-600">
                          {formatDiscountRate(selectedPromotion.discountRate)}
                        </h3>
                        <p className="text-sm text-sky-800">Tỷ lệ giảm giá</p>
                      </div>
                      <CheckCircleIcon className="h-8 w-8 text-sky-500" />
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedPromotion.description && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-900 mb-2">
                      Mô tả chi tiết
                    </h3>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">
                      {selectedPromotion.description}
                    </p>
                  </div>
                )}

                {/* Time Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-900">
                      Thời gian áp dụng
                    </h3>
                    <div className="space-y-3 bg-white border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Bắt đầu:</span>
                        <span className="text-sm font-medium text-blue-600">
                          {formatDateLong(selectedPromotion.startDate)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Kết thúc:</span>
                        <span className="text-sm font-medium text-red-600">
                          {formatDateLong(selectedPromotion.endDate)}
                        </span>
                      </div>
                      {duration && (
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                          <span className="text-sm text-slate-600">
                            Thời lượng:
                          </span>
                          <span className="text-sm font-medium text-sky-600">
                            {duration.days} ngày {duration.hours} giờ{" "}
                            {duration.minutes} phút
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-900">
                      Thống kê
                    </h3>
                    <div className="space-y-3 bg-white border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">
                          Model xe áp dụng:
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          {applicableModels.length} model
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">
                          Đại lý áp dụng:
                        </span>
                        <span className="text-sm font-medium text-purple-600">
                          {applicableDealers.length} đại lý
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-sm text-slate-600">Ngày tạo:</span>
                        <span className="text-sm font-medium">
                          {formatDate(selectedPromotion.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Applicable Models */}
                {applicableModels.length > 0 && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-medium text-slate-900 flex items-center">
                        <TruckIcon className="h-4 w-4 mr-2 text-blue-600" />
                        Model xe áp dụng ({applicableModels.length} model)
                      </h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                        {applicableModels.map((model, index) => (
                          <div
                            key={model.modelId || `model-${index}`}
                            className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
                          >
                            <div className="font-medium text-blue-900 text-sm mb-1">
                              {model.modelName}
                            </div>
                            <div className="text-xs text-blue-700 mb-2">
                              {model.brand}
                            </div>
                            <div
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${model.status === "COMING_SOON"
                                ? "bg-yellow-100 text-yellow-800"
                                : model.status === "DISCONTINUED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                                }`}
                            >
                              {model.status === "COMING_SOON"
                                ? "🟡 Sắp ra mắt"
                                : model.status === "DISCONTINUED"
                                  ? "🔴 Ngừng sản xuất"
                                  : "⚪ Không xác định"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Applicable Dealers */}
                {applicableDealers.length > 0 && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-medium text-slate-900 flex items-center">
                        <BuildingStorefrontIcon className="h-4 w-4 mr-2 text-purple-600" />
                        Đại lý áp dụng ({applicableDealers.length} đại lý)
                      </h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      <div className="space-y-3 p-4">
                        {applicableDealers.map((dealer, index) => (
                          <div
                            key={dealer.dealerId || `dealer-${index}`}
                            className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="font-medium text-purple-900 text-sm mb-1">
                                  {dealer.dealerName}
                                </div>
                                <div className="text-xs text-purple-700 mb-1">
                                  Mã: {dealer.dealerCode}
                                </div>
                              </div>
                              <div
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${dealer.status === "ACTIVE"
                                  ? "bg-sky-100 text-sky-800"
                                  : "bg-gray-100 text-gray-800"
                                  }`}
                              >
                                {dealer.status === "ACTIVE"
                                  ? "🟢 Đang hoạt động"
                                  : "⚪ Không hoạt động"}
                              </div>
                            </div>

                            <div className="space-y-1 text-xs text-slate-600">
                              <div className="flex items-center">
                                <MapPinIcon className="h-3 w-3 mr-1" />
                                <span>
                                  {dealer.address}, {dealer.city}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2">
                                  Khu vực: {dealer.region}
                                </span>
                              </div>
                              {dealer.phone && (
                                <div className="flex items-center">
                                  <PhoneIcon className="h-3 w-3 mr-1" />
                                  <span>{dealer.phone}</span>
                                </div>
                              )}
                              {dealer.email && (
                                <div className="flex items-center">
                                  <EnvelopeIcon className="h-3 w-3 mr-1" />
                                  <span>{dealer.email}</span>
                                </div>
                              )}
                              {dealer.taxNumber && (
                                <div className="text-xs text-slate-500 mt-1">
                                  MST: {dealer.taxNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between p-6 border-t border-slate-200 sticky bottom-0 bg-white">
            <div className="flex gap-2">
              {selectedPromotion.autoStatus === "DRAFT" && (
                <button
                  onClick={() => handleAuthenticate(selectedPromotion.promotionId)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all font-black text-xs active:scale-95 italic uppercase tracking-widest"
                >
                  Xác thực
                </button>
              )}
              <button
                onClick={() => handleDelete(selectedPromotion.promotionId)}
                className="px-6 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
              >
                <img src="/icon/delete.png" alt="delete" className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={closeDetailModal}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                <div className="flex items-center">
                  <img src="/icon/promotion.png" alt="promotion" className="w-9 h-9 mr-2" />
                  Danh sách <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-700 ml-2 "> Khuyến mãi</span>
                </div>
              </h1>
              <p className="mt-4 text-sm text-slate-600">
                Xem tất cả các chương trình khuyến mãi hiện có
              </p>
            </div>
            <button
              onClick={onCreate}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all font-black text-xs active:scale-95 italic uppercase tracking-widest"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Tạo khuyến mãi mới
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Lỗi</h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-3">
                  <button
                    onClick={loadPromotions}
                    className="text-sm font-medium text-red-800 hover:text-red-900"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-slate-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Tổng số</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full flex items-center justify-center">
                  <span className="text-sm"><img src="/icon/password.png" alt="pending" className="w-8 h-8" /></span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Chờ xác thực
                </p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-sky-100 rounded-full flex items-center justify-center">
                  <span className="text-sky-600 text-sm"><img src="/icon/original.png" alt="original" className="w-8 h-8" /></span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Đang hoạt động
                </p>
                <p className="text-2xl font-semibold text-sky-600">
                  {stats.active}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">❌</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Đã hết hạn</p>
                <p className="text-2xl font-semibold text-red-600">
                  {stats.expired}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-slate-600 text-sm"><img src="/icon/signboard.png" alt="inactive" className="w-8 h-8" /></span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Không hoạt động
                </p>
                <p className="text-2xl font-semibold text-slate-600">
                  {stats.inactive}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
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

            <div className="flex flex-wrap gap-2">
              {[
                { value: "ALL", label: "Tất cả", activeClass: "bg-gray-100 text-gray-800 border border-slate-200" },
                { value: "DRAFT", label: "Chờ xác thực", activeClass: "bg-yellow-100 text-yellow-800 border border-yellow-200" },
                { value: "ACTIVE", label: "Đang hoạt động", activeClass: "bg-sky-100 text-sky-800 border border-sky-200" },
                { value: "EXPIRED", label: "Đã hết hạn", activeClass: "bg-red-100 text-red-800 border border-red-200" },
                { value: "INACTIVE", label: "Không hoạt động", activeClass: "bg-gray-100 text-slate-600 border border-slate-200" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleStatusFilter(filter.value)}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${filterStatus === filter.value
                    ? filter.activeClass
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        {selectedRowKeys.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-center justify-between shadow-sm animate-[fadeIn_0.3s_ease-in-out]">
            <div className="flex items-center text-indigo-800 font-medium mb-4 sm:mb-0">
              <span className="flex items-center justify-center w-7 h-7 bg-indigo-200 text-indigo-900 rounded-full mr-3 text-sm font-bold">
                {selectedRowKeys.length}
              </span>
              khuyến mãi đang chọn
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBulkSoftDelete}
                disabled={isProcessingBulk}
                className="flex items-center px-4 py-2 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 text-yellow-800 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isProcessingBulk ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-800 mr-2"></div>
                ) : (
                  <ArchiveBoxIcon className="h-4 w-4 mr-2" />
                )}
                Vô hiệu hóa (Xóa mềm)
              </button>
              <button
                onClick={handleBulkHardDelete}
                disabled={isProcessingBulk}
                className="flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 border border-red-300 text-red-800 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isProcessingBulk ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-800 mr-2"></div>
                ) : (
                  <TrashIcon className="h-4 w-4 mr-2" />
                )}
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        )}

        {/* Promotions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left w-12">
                      <input type="checkbox" disabled className="h-4 w-4 text-gray-300 border-gray-300 rounded" />
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Thông tin khuyến mãi
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Giảm giá
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Thời gian
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Trạng thái
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Xem chi tiết
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  <PromotionSkeleton />
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left w-12">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                          checked={currentPromotions.length > 0 && currentPromotions.every((p) => selectedRowKeys.includes(p.promotionId))}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Thông tin khuyến mãi
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Giảm giá
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Thời gian
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Trạng thái
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Xem chi tiết
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {currentPromotions.length > 0 ? (
                      currentPromotions.map((promotion) => {
                        const dateStatus = getDateStatus(
                          promotion.startDate,
                          promotion.endDate
                        );
                        return (
                          <tr
                            key={promotion.promotionId}
                            className={`transition-colors ${selectedRowKeys.includes(promotion.promotionId) ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-gray-50'}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap w-12 text-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                checked={selectedRowKeys.includes(promotion.promotionId)}
                                onChange={() => handleSelectRow(promotion.promotionId)}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                  <CalendarIcon className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <p className="text-sm font-medium text-slate-900 truncate">
                                      {promotion.promotionName}
                                    </p>
                                    <span
                                      className={`text-xs font-medium ${dateStatus.color}`}
                                    >
                                      • {dateStatus.text}
                                    </span>
                                  </div>
                                  {promotion.description && (
                                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                      {promotion.description}
                                    </p>
                                  )}
                                  <div className="mt-1 flex items-center space-x-4 text-xs text-slate-500">
                                    <span>
                                      ID:{" "}
                                      {promotion.promotionId.substring(0, 8)}...
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap bg-sky-50 border-l border-sky-100">
                              <div className="text-lg font-bold text-sky-600">
                                {formatDiscountRate(promotion.discountRate)}
                              </div>
                              <div className="text-xs text-slate-500">
                                Tỷ lệ giảm
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-slate-900 space-y-1">
                                <div className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 text-slate-400 mr-2" />
                                  <span>{formatDate(promotion.startDate)}</span>
                                </div>
                                <div className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 text-slate-400 mr-2" />
                                  <span>{formatDate(promotion.endDate)}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(promotion)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleViewDetails(promotion)}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                              >
                                <EyeIcon className="h-4 w-4 mr-1" />
                                Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <CalendarIcon className="h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-1">
                              Không tìm thấy khuyến mãi nào
                            </h3>
                            <p className="text-slate-500 mb-4">
                              {searchTerm || filterStatus !== "ALL"
                                ? "Thử thay đổi điều kiện tìm kiếm hoặc bộ lọc"
                                : "Bắt đầu bằng cách tạo khuyến mãi đầu tiên của bạn"}
                            </p>
                            {!searchTerm && filterStatus === "ALL" && (
                              <button
                                onClick={onCreate}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all font-black text-xs active:scale-95 italic uppercase tracking-widest"
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

              {/* Pagination */}
              {filteredPromotions.length > 0 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700 text-center sm:text-left">
                    Hiển thị {" "}
                    <span className="font-medium">{indexOfFirstItem + 1}</span>
                    {" "} đến {" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredPromotions.length)}
                    </span>
                    {" "} trong số {" "}
                    <span className="font-medium">{filteredPromotions.length}</span>
                    {" "} khuyến mãi
                  </div>

                  {totalPages > 1 && (
                    <div className="flex space-x-1 sm:space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-2 sm:px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Trước
                      </button>

                      <div className="flex items-center space-x-1 overflow-x-auto max-w-[200px] sm:max-w-none">
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-2 sm:px-3 py-1 border rounded-md text-xs sm:text-sm font-medium transition-colors min-w-[32px] ${currentPage === i + 1 ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-2 sm:px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && renderDetailModal()}
    </div>
  );
}
