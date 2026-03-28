import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { FiX } from "react-icons/fi";

const VariantDetailsModal = ({ isOpen, onClose, variant }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [isOpen, variant?.variantId]);

  if (!isOpen || !variant) return null;

  const portalContent = (
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative bg-white shadow-2xl w-full max-w-xl h-full flex flex-col border border-gray-100 overflow-hidden ring-1 ring-black/5 animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-slate-50/50 shrink-0">
          <h2 className="text-lg font-black text-gray-900 tracking-tight">
            Chi tiết: {variant.versionName} <span className="text-indigo-600 font-thin italic">({variant.color})</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-white scrollbar-thin scrollbar-thumb-slate-200"
        >
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

          <div className="pt-2">
            <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-widest italic">
              <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
              Trang bị & Tính năng
            </h3>
            {variant.features && variant.features.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {variant.features.map((feature) => (
                  <div key={feature.featureId} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-700 border border-gray-100 shadow-sm">
                    <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                    {feature.featureName}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-xs italic">
                Phiên bản này chưa có tính năng đặc biệt.
              </p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-50 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-gray-900 text-white text-xs font-black rounded-lg hover:bg-black transition-all uppercase tracking-widest italic"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(portalContent, document.body);
};

export default VariantDetailsModal;
