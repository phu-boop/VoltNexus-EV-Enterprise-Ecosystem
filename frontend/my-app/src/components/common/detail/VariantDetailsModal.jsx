// Components xem chi tiết phiên bản xe
import React from "react";
import { FiX } from "react-icons/fi";

const VariantDetailsModal = ({ isOpen, onClose, variant }) => {
  if (!isOpen || !variant) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-60 z-50 flex justify-center items-center p-4 animate-in fade-in-0">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Chi tiết phiên bản: {variant.versionName} - {variant.color}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p>
              <strong className="text-gray-600">ID:</strong> {variant.variantId}
            </p>
            <p>
              <strong className="text-gray-600">Mã SKU:</strong>{" "}
              {variant.skuCode}
            </p>
            <p>
              <strong className="text-gray-600">Giá bán lẻ:</strong>{" "}
              {Number(variant.price).toLocaleString("vi-VN")} VNĐ
            </p>
            <p>
              <strong className="text-gray-600">Giá sỉ:</strong>{" "}
              {variant.wholesalePrice
                ? `${Number(variant.wholesalePrice).toLocaleString(
                    "vi-VN"
                  )} VNĐ`
                : "N/A"}
            </p>
            <p>
              <strong className="text-gray-600">Dung lượng pin:</strong>{" "}
              {variant.batteryCapacity
                ? `${variant.batteryCapacity} kWh`
                : "N/A"}
            </p>
            <p>
              <strong className="text-gray-600">Công suất động cơ:</strong>{" "}
              {variant.motorPower ? `${variant.motorPower} kW` : "N/A"}
            </p>
            <p>
              <strong className="text-gray-600">Quãng đường:</strong>{" "}
              {variant.rangeKm ? `${variant.rangeKm} km` : "N/A"}
            </p>
            <p>
              <strong className="text-gray-600">Thời gian sạc:</strong>{" "}
              {variant.chargingTime ? `${variant.chargingTime} giờ` : "N/A"}
            </p>
          </div>

          <div className="col-span-full">
            <p className="font-semibold text-gray-700">Hình ảnh:</p>
            {variant.imageUrl ? (
              <img
                src={variant.imageUrl}
                alt={`${variant.versionName}`}
                className="mt-2 h-40 w-auto rounded-lg object-cover border"
              />
            ) : (
              <p className="text-gray-500 text-sm">Chưa có hình ảnh.</p>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-lg mt-4 mb-2">Các tính năng</h3>
            {variant.features && variant.features.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {variant.features.map((feature) => (
                  <li key={feature.featureId}>{feature.featureName}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">
                Phiên bản này chưa có tính năng đặc biệt nào.
              </p>
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariantDetailsModal;
