// Hiển thị thông tin chi tiết của xe, bao gồm cả các phiên bản (variants) và thông số kỹ thuật một cách rõ ràng.
import React from "react";
import { FiX, FiInfo, FiLayers, FiTag, FiPlus } from "react-icons/fi";

const ModelDetailsModal = ({ isOpen, onClose, model }) => {
  if (!isOpen || !model) return null;

  let specifications = {};
  try {
    // Parse chuỗi JSON để hiển thị
    if (model.specificationsJson) {
      specifications = JSON.parse(model.specificationsJson);
    }
  } catch (error) {
    console.error("Lỗi parse JSON:", error);
    specifications = { Error: "Dữ liệu thông số kỹ thuật bị lỗi." };
  }

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-60 z-50 flex justify-center items-center p-4 animate-in fade-in-0">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Chi tiết: {model.brand} {model.modelName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Thông tin chung */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <FiInfo className="mr-2 text-blue-500" />
              Thông tin chung
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <p>
                <strong className="text-gray-600">ID:</strong> {model.modelId}
              </p>
              <p>
                <strong className="text-gray-600">Hãng xe:</strong>{" "}
                {model.brand}
              </p>
              <p>
                <strong className="text-gray-600">Tên mẫu xe:</strong>{" "}
                {model.modelName}
              </p>
              <div className="flex items-center">
                <strong className="text-gray-600 mr-2">Trạng thái:</strong>
                <span
                  className={`px-2 py-1 text-xs font-bold rounded-full ${
                    model.status === "IN_PRODUCTION"
                      ? "bg-green-100 text-green-800"
                      : model.status === "COMING_SOON"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {model.status === "IN_PRODUCTION"
                    ? "Đang sản xuất"
                    : model.status === "COMING_SOON"
                    ? "Sắp ra mắt"
                    : "Ngừng sản xuất"}
                </span>
              </div>
              <div className="col-span-full">
                <p>
                  <strong className="text-gray-600">Ảnh đại diện:</strong>
                </p>
                <img
                  src={model.thumbnailUrl}
                  alt={`${model.brand} ${model.modelName}`}
                  className="mt-2 h-32 w-auto rounded-lg object-cover"
                />
              </div>
            </div>
          </div>

          {/* Thông số kỹ thuật */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <FiTag className="mr-2 text-green-500" />
              Thông số kỹ thuật chính
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <p>
                <strong className="text-gray-600">Quãng đường cơ bản:</strong>{" "}
                {model.baseRangeKm ? `${model.baseRangeKm} km` : "N/A"}
              </p>
              <p>
                <strong className="text-gray-600">Công suất cơ bản:</strong>{" "}
                {model.baseMotorPower ? `${model.baseMotorPower} kW` : "N/A"}
              </p>
              <p>
                <strong className="text-gray-600">
                  Dung lượng pin cơ bản:
                </strong>{" "}
                {model.baseBatteryCapacity
                  ? `${model.baseBatteryCapacity} kWh`
                  : "N/A"}
              </p>
              <p>
                <strong className="text-gray-600">Thời gian sạc cơ bản:</strong>{" "}
                {model.baseChargingTime
                  ? `${model.baseChargingTime} giờ`
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Các phiên bản */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <FiLayers className="mr-2 text-purple-500" />
              Các phiên bản
            </h3>
            <div className="space-y-4">
              {model.variants && model.variants.length > 0 ? (
                model.variants.map((variant) => (
                  <div
                    key={variant.variantId}
                    className="p-3 border-t first:border-t-0"
                  >
                    <p className="font-bold">
                      {variant.versionName} - {variant.color}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-sm">
                      <p>
                        <strong className="text-gray-600">Giá:</strong>{" "}
                        {Number(variant.price).toLocaleString("vi-VN")} VNĐ
                      </p>
                      <p>
                        <strong className="text-gray-600">SKU:</strong>{" "}
                        {variant.skuCode}
                      </p>
                      <p>
                        <strong className="text-gray-600">ID Phiên bản:</strong>{" "}
                        {variant.variantId}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  Chưa có phiên bản nào cho mẫu xe này.
                </p>
              )}
            </div>
          </div>
          {/* Thông số kỹ thuật MỞ RỘNG */}
          {model.extendedSpecs &&
            Object.keys(model.extendedSpecs).length > 0 && (
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg mb-4 flex items-center">
                  <FiPlus className="mr-2 text-indigo-500" />
                  Thông số mở rộng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  {Object.entries(model.extendedSpecs).map(([key, value]) => (
                    <p key={key}>
                      <strong className="text-gray-600">{key}:</strong>{" "}
                      {String(value)}
                    </p>
                  ))}
                </div>
              </div>
            )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelDetailsModal;
