import React, { useState, useEffect } from "react";
import {
  getModelIdBySalesOrderId,
  getVehicleVariantsByModelId,
  getActivePromotions,
  getCurrentDealerId,
} from "../../services/optionService";

/**
 * Form thêm/chỉnh sửa Order Item với đầy đủ trường từ backend
 */
const OrderItemForm = ({
  item,
  onSubmit,
  onCancel,
  loading = false,
  validationErrors = {},
  onChange,
  mode = "create", // 'create' | 'edit'
  orderId,
}) => {
  const [formData, setFormData] = useState({
    variantId: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    itemNotes: "",
    color: "",
    specifications: "",
  });

  const [variants, setVariants] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [error, setError] = useState(null);

  // Tính toán giá cuối cùng
  const calculateFinalPrice = () => {
    const subtotal = formData.unitPrice * formData.quantity;
    const discountAmount = subtotal * (formData.discount / 100);
    return Math.max(0, subtotal - discountAmount);
  };

  const finalPrice = calculateFinalPrice();

  // Khởi tạo form khi có item (chỉnh sửa)
  useEffect(() => {
    if (item) {
      setFormData({
        variantId: item.variantId || "",
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        discount: item.discount || 0,
        itemNotes: item.itemNotes || "",
        color: item.color || "",
        specifications: item.specifications || "",
      });
    }
  }, [item]);

  // Lấy modelId từ orderId và load variants, promotions
  useEffect(() => {
    const loadModelAndVariants = async () => {
      if (!orderId) {
        return;
      }

      setLoadingData(true);
      setError(null);
      try {
        // 1. Lấy modelId từ orderId
        const modelIdResponse = await getModelIdBySalesOrderId(orderId);

        // Xử lý response - có thể là số trực tiếp hoặc object
        let modelId;
        if (typeof modelIdResponse === "number") {
          modelId = modelIdResponse;
        } else if (modelIdResponse && typeof modelIdResponse === "object") {
          modelId = modelIdResponse.data || modelIdResponse.modelId;
        }

        if (!modelId) {
          const errorMsg = `❌ Không tìm thấy modelId cho order: ${orderId}`;
          console.error(errorMsg);
          setError(errorMsg);
          return;
        }

        // 2. Lấy dealerId từ session storage
        const dealerId = getCurrentDealerId();

        if (!dealerId) {
          const errorMsg = "❌ Không tìm thấy dealerId trong session storage";
          console.error(errorMsg);
          setError(errorMsg);
          return;
        }

        // 3. Load variants và promotions song song

        const [variantsResponse, promotionsResponse] = await Promise.all([
          (await getVehicleVariantsByModelId(modelId)).data,
          getActivePromotions(dealerId, modelId),
        ]);

        // Xử lý variants response
        if (
          variantsResponse &&
          variantsResponse.code === "1000" &&
          variantsResponse.data
        ) {
          setVariants(variantsResponse.data);
        } else {
          const errorMsg = "❌ Không thể load danh sách variants";
          console.error(errorMsg, variantsResponse);
          setError(errorMsg);
        }

        // Xử lý promotions response
        if (promotionsResponse && Array.isArray(promotionsResponse)) {
          setPromotions(promotionsResponse);
        } else {
        }
      } catch (error) {
        console.error("❌ Lỗi khi load dữ liệu:", error);
        setError(`Lỗi khi tải dữ liệu: ${error.message}`);
      } finally {
        setLoadingData(false);
      }
    };

    loadModelAndVariants();
  }, [orderId]);

  // Xử lý khi chọn variant
  const handleVariantChange = (variantId) => {
    const variantIdNum = parseInt(variantId);
    const variant = variants.find((v) => v.variantId === variantIdNum);

    if (variant) {
      setSelectedVariant(variant);

      const newFormData = {
        ...formData,
        variantId: variant.variantId,
        color: variant.color,
        unitPrice: variant.price,
        specifications: `Pin: ${variant.batteryCapacity}kWh, Tầm hoạt động: ${variant.rangeKm}km, Công suất: ${variant.motorPower}kW`,
      };

      setFormData(newFormData);

      // Thông báo cho component cha
      if (onChange) {
        Object.keys(newFormData).forEach((key) => {
          onChange(key, newFormData[key]);
        });
      }
    } else {
      setSelectedVariant(null);
    }
  };

  // Xử lý khi chọn promotion
  const handlePromotionChange = (promotionId) => {
    const promotion = promotions.find((p) => p.promotionId === promotionId);
    if (promotion) {
      const newDiscount = promotion.discountRate * 100; // Chuyển từ rate (0.2) sang phần trăm (20%)
      const newFormData = {
        ...formData,
        discount: newDiscount,
      };

      setFormData(newFormData);

      if (onChange) {
        onChange("discount", newDiscount);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      finalPrice: finalPrice,
    });
  };

  const handleChange = (field, value) => {
    const newFormData = {
      ...formData,
      [field]: value,
    };
    setFormData(newFormData);

    // Notify parent component if onChange prop is provided
    if (onChange) {
      onChange(field, value);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      IN_PRODUCTION: {
        color: "bg-green-100 text-green-800",
        text: "Đang sản xuất",
      },
      COMING_SOON: { color: "bg-blue-100 text-blue-800", text: "Sắp ra mắt" },
      DISCONTINUED: {
        color: "bg-red-100 text-red-800",
        text: "Ngừng sản xuất",
      },
    };

    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      text: status,
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Loading state */}
      {loadingData && (
        <div className="flex items-center justify-center p-6 bg-blue-50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-blue-700 font-medium">
            Đang tải thông tin xe và khuyến mãi...
          </span>
        </div>
      )}

      {/* Error state */}
      {error && !loadingData && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-500 mr-2">⚠️</div>
            <div>
              <h3 className="text-red-800 font-medium">Lỗi khi tải dữ liệu</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Thông tin xe - LUÔN HIỂN THỊ, ngay cả khi chưa có variants */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Chọn phiên bản xe
        </h3>

        {variants.length > 0 ? (
          <>
            {/* Dropdown chọn variant */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phiên bản xe *
              </label>
              <select
                required
                value={formData.variantId}
                onChange={(e) => handleVariantChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Chọn phiên bản xe</option>
                {variants.map((variant) => (
                  <option key={variant.variantId} value={variant.variantId}>
                    {variant.versionName} - {variant.color} -{" "}
                    {formatCurrency(variant.price)}
                  </option>
                ))}
              </select>
            </div>

            {/* Hiển thị thông tin variant được chọn */}
            {selectedVariant && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {selectedVariant.versionName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Màu: {selectedVariant.color}
                  </p>
                  <p className="text-sm text-gray-600">
                    SKU: {selectedVariant.skuCode}
                  </p>
                  <div className="mt-2">
                    {getStatusBadge(selectedVariant.status)}
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p>🔋 Pin: {selectedVariant.batteryCapacity} kWh</p>
                  <p>⚡ Sạc: {selectedVariant.chargingTime} giờ</p>
                  <p>🛣️ Tầm hoạt động: {selectedVariant.rangeKm} km</p>
                  <p>🚀 Công suất: {selectedVariant.motorPower} kW</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(selectedVariant.price)}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          !loadingData && (
            <div className="text-center py-4 text-gray-500">
              <p>Không có phiên bản xe nào khả dụng cho đơn hàng này.</p>
              <p className="text-sm mt-1">
                Vui lòng kiểm tra lại thông tin đơn hàng.
              </p>
            </div>
          )
        )}
      </div>

      {/* Khuyến mãi */}
      {promotions.length > 0 && (
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <h3 className="text-lg font-medium text-yellow-900 mb-4">
            Khuyến mãi hiện có
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-yellow-700 mb-2">
              Chọn khuyến mãi
            </label>
            <select
              value={formData.promotionId || ""}
              onChange={(e) => handlePromotionChange(e.target.value)}
              className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="">Không chọn khuyến mãi</option>
              {promotions.map((promotion) => (
                <option
                  key={promotion.promotionId}
                  value={promotion.promotionId}
                >
                  {promotion.promotionName} - Giảm{" "}
                  {promotion.discountRate * 100}%
                </option>
              ))}
            </select>
          </div>

          {/* Hiển thị chi tiết khuyến mãi */}
          {promotions.map((promotion) => (
            <div
              key={promotion.promotionId}
              className="p-3 bg-white rounded border border-yellow-100 mb-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-yellow-800">
                    {promotion.promotionName}
                  </h4>
                  <p className="text-sm text-yellow-600">
                    {promotion.description}
                  </p>
                  <p className="text-sm text-gray-600">
                    📅{" "}
                    {new Date(promotion.startDate).toLocaleDateString("vi-VN")}{" "}
                    - {new Date(promotion.endDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium">
                  -{promotion.discountRate * 100}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Thông tin cơ bản - CHỈ HIỂN THỊ KHI ĐÃ CÓ VARIANTS */}
      {variants.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Số lượng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  handleChange("quantity", parseInt(e.target.value) || 1)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.quantity
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
              />
              {validationErrors.quantity && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.quantity}
                </p>
              )}
            </div>

            {/* Đơn giá */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đơn giá (VND) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={formData.unitPrice}
                onChange={(e) =>
                  handleChange("unitPrice", parseFloat(e.target.value) || 0)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.unitPrice
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                readOnly={selectedVariant} // Không cho chỉnh sửa nếu đã chọn variant
              />
              {validationErrors.unitPrice && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.unitPrice}
                </p>
              )}
            </div>

            {/* Giảm giá */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giảm giá (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.discount}
                onChange={(e) =>
                  handleChange("discount", parseFloat(e.target.value) || 0)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.discount
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
              />
              {validationErrors.discount && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.discount}
                </p>
              )}
            </div>

            {/* Màu sắc */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Màu sắc
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleChange("color", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập màu sắc..."
                readOnly={selectedVariant} // Không cho chỉnh sửa nếu đã chọn variant
              />
            </div>
          </div>

          {/* Thông tin bổ sung */}
          <div className="grid grid-cols-1 gap-6">
            {/* Ghi chú */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú sản phẩm
              </label>
              <textarea
                value={formData.itemNotes}
                onChange={(e) => handleChange("itemNotes", e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập ghi chú về sản phẩm..."
              />
            </div>

            {/* Thông số kỹ thuật */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thông số kỹ thuật
              </label>
              <textarea
                value={formData.specifications}
                onChange={(e) => handleChange("specifications", e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập thông số kỹ thuật..."
                readOnly={selectedVariant} // Không cho chỉnh sửa nếu đã chọn variant
              />
            </div>
          </div>

          {/* Thông tin tổng */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-900">
                Thành tiền tạm tính:
              </span>
              <span className="text-xl font-bold text-blue-700">
                {formatCurrency(finalPrice)}
              </span>
            </div>
            {formData.discount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-800">Giá gốc:</span>
                <span className="text-blue-600 line-through">
                  {formatCurrency(formData.unitPrice * formData.quantity)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-blue-800">Tiết kiệm:</span>
              <span className="text-green-600">
                {formatCurrency(
                  formData.unitPrice *
                    formData.quantity *
                    (formData.discount / 100)
                )}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={
            loading ||
            !formData.variantId ||
            finalPrice < 0 ||
            variants.length === 0
          }
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
        >
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          {mode === "edit" ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
        </button>
      </div>
    </form>
  );
};

export default OrderItemForm;
