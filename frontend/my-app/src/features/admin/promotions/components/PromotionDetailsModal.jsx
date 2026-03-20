import React, { useEffect, useState } from "react";
import {
  XMarkIcon,
  CalendarIcon,
  TagIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import adminFetchDealer from "../services/adminFetchDealer";
import adminFetchModelVehicle from "../services/adminFetchModelVehicle";

export const PromotionDetailsModal = ({
  promotion,
  isOpen,
  onClose,
  onApprove,
  onEdit,
  onDelete,
}) => {
  const [dealers, setDealers] = useState([]);
  const [models, setModels] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Gọi API lấy danh sách dealer & model
      const fetchData = async () => {
        try {
          const dealerRes = (await adminFetchDealer.getAllDealer()).data;
          const modelRes = (await adminFetchModelVehicle.getAllModelVehicle())
            .data;
          setDealers(dealerRes.data || []);
          setModels(modelRes.data || []);
        } catch (error) {
          console.error("Fetch data failed:", error);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen || !promotion) return null;

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("vi-VN");
  const formatDiscountRate = (rate) => `${(rate * 100).toFixed(1)}%`;

  const calculateTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end - now;
    if (diffMs <= 0) return { expired: true, text: "Đã hết hạn" };
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    return { expired: false, text: `${days} ngày ${hours} giờ` };
  };

  const getStatusBadge = (status) => {
    const map = {
      DRAFT: "bg-yellow-100 text-yellow-800",
      ACTIVE: "bg-green-100 text-green-800",
      EXPIRED: "bg-red-100 text-red-800",
      INACTIVE: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          map[status] || map.DRAFT
        }`}
      >
        {status}
      </span>
    );
  };

  // 🔍 Parse & lọc dữ liệu
  const dealerIds = JSON.parse(promotion.dealerIdJson || "[]");
  const modelIds = JSON.parse(promotion.applicableModelsJson || "[]");

  const appliedDealers = dealers.filter((d) => dealerIds.includes(d.dealerId));
  const appliedModels = models.filter((m) => modelIds.includes(m.modelId));

  const timeRemaining = calculateTimeRemaining(promotion.endDate);

  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TagIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Chi tiết Khuyến mãi
              </h2>
              <p className="text-sm text-gray-500">
                ID: {promotion.promotionId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tên chương trình
                </label>
                <p className="mt-1 text-sm font-medium">
                  {promotion.promotionName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Trạng thái
                </label>
                <div className="mt-1">{getStatusBadge(promotion.status)}</div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <p className="mt-1 text-sm">
                  {promotion.description || "Không có mô tả"}
                </p>
              </div>
            </div>
          </section>

          {/* Discount */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Thông tin Giảm giá
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <span className="text-3xl font-bold text-green-600">
                {formatDiscountRate(promotion.discountRate)}
              </span>
              <p className="text-sm text-gray-600 mt-1">Tỷ lệ giảm giá</p>
            </div>
          </section>

          {/* Time */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Thời gian áp dụng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Bắt đầu</p>
                  <p className="text-sm">{formatDate(promotion.startDate)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Kết thúc</p>
                  <p className="text-sm">{formatDate(promotion.endDate)}</p>
                </div>
              </div>
              <div className="md:col-span-2 flex items-center space-x-3 p-3 rounded-lg bg-green-50">
                <ClockIcon className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Thời gian còn lại</p>
                  <p className="text-sm font-semibold text-green-900">
                    {timeRemaining.text}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Dealers */}
          {appliedDealers.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BuildingStorefrontIcon className="h-5 w-5 text-indigo-500" />
                Đại lý áp dụng
              </h3>
              <div className="space-y-2">
                {appliedDealers.map((d) => (
                  <div
                    key={d.dealerId}
                    className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {d.dealerName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {d.city} — {d.region}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      #{d.dealerCode}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Models */}
          {appliedModels.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CubeIcon className="h-5 w-5 text-indigo-500" />
                Mẫu xe áp dụng
              </h3>
              <div className="space-y-2">
                {appliedModels.map((m) => (
                  <div
                    key={m.modelId}
                    className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{m.modelName}</p>
                      <p className="text-sm text-gray-500">{m.brand}</p>
                    </div>
                    <span className="text-xs text-gray-400">{m.status}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          {promotion.status === "DRAFT" && (
            <button
              onClick={() => onApprove(promotion.promotionId)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Phê duyệt
            </button>
          )}
          <button
            onClick={() => onEdit(promotion)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Chỉnh sửa
          </button>
          <button
            onClick={() =>
              onDelete(promotion.promotionId, promotion.promotionName)
            }
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Xóa
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionDetailsModal;
