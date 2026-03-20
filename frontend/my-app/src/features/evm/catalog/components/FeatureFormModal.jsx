import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import {
  createFeature,
  updateFeature,
} from "../services/vehicleCatalogService"; // Import các hàm API mới

const FeatureFormModal = ({ isOpen, onClose, onSuccess, feature }) => {
  const isEditMode = !!feature;

  const initialFormState = {
    featureName: "",
    description: "",
    category: "Chung", // Đặt giá trị mặc định
    featureType: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && feature) {
        setFormData({
          featureName: feature.featureName || "",
          description: feature.description || "",
          category: feature.category || "Chung",
          featureType: feature.featureType || "",
        });
      } else {
        setFormData(initialFormState);
      }
      setError(null); // Reset lỗi mỗi khi mở modal
    }
  }, [isEditMode, feature, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isEditMode) {
        await updateFeature(feature.featureId, formData);
      } else {
        await createFeature(formData);
      }
      onSuccess(); // Gọi onSuccess để tải lại dữ liệu trên trang chính
      onClose(); // Đóng modal
    } catch (err) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditMode ? "Chỉnh Sửa Tính Năng" : "Tạo Tính Năng Mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Tên tính năng */}
          <div>
            <label
              htmlFor="featureName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tên tính năng*
            </label>
            <input
              id="featureName"
              name="featureName"
              value={formData.featureName}
              onChange={handleChange}
              placeholder="VD: Cửa sổ trời toàn cảnh"
              required
              className="p-2 border rounded-lg w-full"
            />
          </div>

          {/* Danh mục */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Danh mục*
            </label>
            <input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="VD: Nội thất, Ngoại thất, An toàn"
              required
              className="p-2 border rounded-lg w-full"
            />
          </div>

          {/* Loại tính năng */}
          <div>
            <label
              htmlFor="featureType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Loại tính năng
            </label>
            <input
              id="featureType"
              name="featureType"
              value={formData.featureType}
              onChange={handleChange}
              placeholder="VD: STANDARD, OPTION (tùy chọn)"
              className="p-2 border rounded-lg w-full"
            />
          </div>

          {/* Mô tả */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Mô tả chi tiết về tính năng..."
              className="p-2 border rounded-lg w-full"
            />
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

export default FeatureFormModal;
