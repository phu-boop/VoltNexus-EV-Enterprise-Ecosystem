import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import {
  createVariant,
  updateVariant,
} from "../services/vehicleCatalogService";

const STATUS_OPTIONS = {
  IN_PRODUCTION: "Đang sản xuất",
  COMING_SOON: "Sắp ra mắt",
  DISCONTINUED: "Ngừng sản xuất",
};

const VariantForm = ({ isOpen, onClose, onSuccess, modelId, variant }) => {
  const isEditMode = !!variant;

  const initialFormState = {
    versionName: "",
    color: "",
    price: "",
    skuCode: "",
    imageUrl: "",
    status: "IN_PRODUCTION",
    wholesalePrice: "",
    batteryCapacity: "",
    chargingTime: "",
    rangeKm: "",
    motorPower: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode && variant) {
      setFormData({
        versionName: variant.versionName || "",
        color: variant.color || "",
        price: variant.price || "",
        skuCode: variant.skuCode || "",
        imageUrl: variant.imageUrl || "",
        status: variant.status || "IN_PRODUCTION",
        wholesalePrice: variant.wholesalePrice || "",
        batteryCapacity: variant.batteryCapacity || "",
        chargingTime: variant.chargingTime || "",
        rangeKm: variant.rangeKm || "",
        motorPower: variant.motorPower || "",
      });
    } else {
      setFormData(initialFormState);
    }
  }, [isEditMode, variant, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload = {
      ...formData,
      price: Number(formData.price) || 0,
      wholesalePrice: Number(formData.wholesalePrice) || null,
      batteryCapacity: Number(formData.batteryCapacity) || null,
      chargingTime: Number(formData.chargingTime) || null,
      rangeKm: Number(formData.rangeKm) || null,
      motorPower: Number(formData.motorPower) || null,
    };

    try {
      if (isEditMode) {
        await updateVariant(variant.variantId, payload);
      } else {
        await createVariant(modelId, payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "Chỉnh Sửa Phiên Bản" : "Thêm Phiên Bản Mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* --- Phần thông tin cơ bản --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="versionName"
              value={formData.versionName}
              onChange={handleChange}
              placeholder="Tên phiên bản*"
              required
              className="p-2 border rounded-lg w-full"
            />
            <input
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="Màu sắc*"
              required
              className="p-2 border rounded-lg w-full"
            />
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Giá bán lẻ*"
              required
              className="p-2 border rounded-lg w-full"
            />
            <input
              type="number"
              name="wholesalePrice"
              value={formData.wholesalePrice}
              onChange={handleChange}
              placeholder="Giá bán sỉ"
              className="p-2 border rounded-lg w-full"
            />
          </div>
          <input
            name="skuCode"
            value={formData.skuCode}
            onChange={handleChange}
            placeholder="Mã SKU*"
            required
            className="p-2 border rounded-lg w-full"
          />
          <input
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="URL Hình ảnh"
            className="p-2 border rounded-lg w-full"
          />

          <fieldset className="border p-4 rounded-lg">
            <legend className="px-2 font-semibold text-sm text-gray-600">
              Thông số kỹ thuật của phiên bản
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <input
                type="number"
                name="rangeKm"
                value={formData.rangeKm}
                onChange={handleChange}
                placeholder="Quãng đường (km)"
                className="p-2 border rounded-lg w-full"
              />
              <input
                type="number"
                name="motorPower"
                value={formData.motorPower}
                onChange={handleChange}
                placeholder="Công suất (kW)"
                className="p-2 border rounded-lg w-full"
              />
              <input
                type="number"
                name="batteryCapacity"
                value={formData.batteryCapacity}
                onChange={handleChange}
                placeholder="Dung lượng pin (kWh)"
                className="p-2 border rounded-lg w-full"
              />
              <input
                type="number"
                name="chargingTime"
                value={formData.chargingTime}
                onChange={handleChange}
                placeholder="Thời gian sạc (giờ)"
                className="p-2 border rounded-lg w-full"
              />
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Trạng thái
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="p-2 border rounded-lg w-full"
            >
              {Object.entries(STATUS_OPTIONS).map(
                ([enumValue, displayText]) => (
                  <option key={enumValue} value={enumValue}>
                    {displayText}
                  </option>
                )
              )}
            </select>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>

        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isLoading ? "Đang lưu..." : "Lưu Thay Đổi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariantForm;
