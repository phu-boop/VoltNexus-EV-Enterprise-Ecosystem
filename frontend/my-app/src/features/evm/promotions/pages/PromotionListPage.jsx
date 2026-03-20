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
} from "@heroicons/react/24/outline";
import { format, parseISO, isBefore, isAfter } from "date-fns";
import { vi } from "date-fns/locale";

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
        const promotionsWithAutoStatus = res.data.map((promo) => ({
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
        setAllDealers(response.data || []);
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
        setAllModels(response.data || []);
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
            const promotionsWithAutoStatus = res.data.map((promo) => ({
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
    const mainEl = document.querySelector("main.flex-1");
    mainEl.scrollTop = 0;
    setLoadingDetails(true);
    setSelectedPromotion(promotion);
    setShowDetailModal(true);
    setLoadingDetails(false);
  }, []);

  const closeDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedPromotion(null);
  }, []);

  // Hàm lấy thông tin đầy đủ của models từ ID - ĐÃ SỬA
  const getApplicableModelsDetails = useCallback(
    (promotion) => {
      try {
        if (!promotion.applicableModelsJson) return [];

        const modelIds = JSON.parse(promotion.applicableModelsJson);

        if (Array.isArray(modelIds)) {
          return modelIds.map((modelId) => {
            const fullModelInfo = allModels.find((m) => m.modelId === modelId);

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
        console.error(
          "Error parsing models JSON:",
          error,
          promotion.applicableModelsJson
        );
        return [];
      }
    },
    [allModels]
  );

  // Hàm lấy thông tin đầy đủ của dealers từ ID - ĐÃ SỬA
  const getApplicableDealersDetails = useCallback(
    (promotion) => {
      try {
        if (!promotion.dealerIdJson) return [];

        const dealerIds = JSON.parse(promotion.dealerIdJson);

        if (Array.isArray(dealerIds)) {
          return dealerIds.map((dealerId) => {
            const fullDealerInfo = allDealers.find(
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
        console.error(
          "Error parsing dealers JSON:",
          error,
          promotion.dealerIdJson
        );
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
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
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
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
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

    const config = statusConfig[displayStatus] || {
      color: "bg-gray-100 text-gray-800 border-gray-200",
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
    return { color: "text-green-600", text: "Đang diễn ra" };
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
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                <TagIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedPromotion.promotionName}
                </h2>
                <p className="text-sm text-gray-500">
                  ID: {selectedPromotion.promotionId}
                </p>
              </div>
            </div>
            <button
              onClick={closeDetailModal}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
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
                        <p className="text-sm text-gray-600 mt-1">
                          {statusConfig.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Trạng thái hệ thống: {dateStatus.text}
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-green-600">
                          {formatDiscountRate(selectedPromotion.discountRate)}
                        </h3>
                        <p className="text-sm text-green-800">Tỷ lệ giảm giá</p>
                      </div>
                      <CheckCircleIcon className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedPromotion.description && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Mô tả chi tiết
                    </h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {selectedPromotion.description}
                    </p>
                  </div>
                )}

                {/* Time Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      Thời gian áp dụng
                    </h3>
                    <div className="space-y-3 bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Bắt đầu:</span>
                        <span className="text-sm font-medium text-blue-600">
                          {formatDateLong(selectedPromotion.startDate)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Kết thúc:</span>
                        <span className="text-sm font-medium text-red-600">
                          {formatDateLong(selectedPromotion.endDate)}
                        </span>
                      </div>
                      {duration && (
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                          <span className="text-sm text-gray-600">
                            Thời lượng:
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            {duration.days} ngày {duration.hours} giờ{" "}
                            {duration.minutes} phút
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      Thống kê
                    </h3>
                    <div className="space-y-3 bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Model xe áp dụng:
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          {applicableModels.length} model
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Đại lý áp dụng:
                        </span>
                        <span className="text-sm font-medium text-purple-600">
                          {applicableDealers.length} đại lý
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600">Ngày tạo:</span>
                        <span className="text-sm font-medium">
                          {formatDate(selectedPromotion.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Applicable Models */}
                {applicableModels.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900 flex items-center">
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
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                model.status === "COMING_SOON"
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
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900 flex items-center">
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
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                  dealer.status === "ACTIVE"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {dealer.status === "ACTIVE"
                                  ? "🟢 Đang hoạt động"
                                  : "⚪ Không hoạt động"}
                              </div>
                            </div>

                            <div className="space-y-1 text-xs text-gray-600">
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
                                <div className="text-xs text-gray-500 mt-1">
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
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
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
              <h1 className="text-3xl font-bold text-gray-900">
                Danh sách Khuyến mãi
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Xem tất cả các chương trình khuyến mãi hiện có
              </p>
            </div>
            <button
              onClick={onCreate}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng số</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-sm">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Chờ xác thực
                </p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Đang hoạt động
                </p>
                <p className="text-2xl font-semibold text-green-600">
                  {stats.active}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">❌</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã hết hạn</p>
                <p className="text-2xl font-semibold text-red-600">
                  {stats.expired}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm">⏸️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Không hoạt động
                </p>
                <p className="text-2xl font-semibold text-gray-600">
                  {stats.inactive}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
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

            <div className="flex flex-wrap gap-2">
              {[
                { value: "ALL", label: "Tất cả", color: "gray" },
                { value: "DRAFT", label: "Chờ xác thực", color: "yellow" },
                { value: "ACTIVE", label: "Đang hoạt động", color: "green" },
                { value: "EXPIRED", label: "Đã hết hạn", color: "red" },
                { value: "INACTIVE", label: "Không hoạt động", color: "gray" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleStatusFilter(filter.value)}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterStatus === filter.value
                      ? `bg-${filter.color}-100 text-${filter.color}-800 border border-${filter.color}-200`
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Promotions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
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
                      Xem chi tiết
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
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
                        Xem chi tiết
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPromotions.length > 0 ? (
                      filteredPromotions.map((promotion) => {
                        const dateStatus = getDateStatus(
                          promotion.startDate,
                          promotion.endDate
                        );
                        return (
                          <tr
                            key={promotion.promotionId}
                            className="hover:bg-gray-50 transition-colors"
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
                                    <span
                                      className={`text-xs font-medium ${dateStatus.color}`}
                                    >
                                      • {dateStatus.text}
                                    </span>
                                  </div>
                                  {promotion.description && (
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                      {promotion.description}
                                    </p>
                                  )}
                                  <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                                    <span>
                                      ID:{" "}
                                      {promotion.promotionId.substring(0, 8)}...
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
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <CalendarIcon className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              Không tìm thấy khuyến mãi nào
                            </h3>
                            <p className="text-gray-500 mb-4">
                              {searchTerm || filterStatus !== "ALL"
                                ? "Thử thay đổi điều kiện tìm kiếm hoặc bộ lọc"
                                : "Bắt đầu bằng cách tạo khuyến mãi đầu tiên của bạn"}
                            </p>
                            {!searchTerm && filterStatus === "ALL" && (
                              <button
                                onClick={onCreate}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Hiển thị{" "}
                      <span className="font-medium">
                        {filteredPromotions.length}
                      </span>{" "}
                      khuyến mãi
                    </div>
                  </div>
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
