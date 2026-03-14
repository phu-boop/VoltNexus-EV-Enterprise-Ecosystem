import React from "react";
import { FiCheckSquare, FiSquare } from "react-icons/fi";

const AvailableVehicleCard = ({
  vehicle,
  onViewDetails,
  onCreateQuote,
  onCompareToggle, // Prop mới
  isCompared, // Prop mới
}) => {
  const imageUrl = vehicle.imageUrl
    ? vehicle.imageUrl
    : `https://placehold.co/600x400/e2e8f0/cbd5e0?text=${vehicle.modelName}`;

  // Xử lý sự kiện nhấn nút so sánh
  const handleCompareClick = (e) => {
    e.stopPropagation();
    // Gửi đi một đối tượng đơn giản mà CompareTray cần
    onCompareToggle({
      variantId: vehicle.variantId,
      versionName: vehicle.versionName,
      imageUrl: imageUrl,
    });
  };
  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md flex flex-col">
      <img
        src={imageUrl}
        alt={`${vehicle.modelName} ${vehicle.versionName}`}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.target.src = `https://placehold.co/600x400/e2e8f0/cbd5e0?text=${vehicle.modelName}`;
        }}
      />

      <div className="p-4 flex flex-col grow">
        <h3 className="text-lg font-semibold text-gray-900">
          {vehicle.modelName} {vehicle.versionName}
        </h3>
        <p className="text-sm text-gray-600">{vehicle.color}</p>
        <p className="text-xs text-gray-500 mt-1">SKU: {vehicle.skuCode}</p>

        <div className="mt-4 grow flex items-end justify-between">
          {/* Số lượng có sẵn */}
          <div>
            <span className="text-xs text-green-600 font-medium">
              Sẵn sàng bán
            </span>
            <p className="text-2xl font-bold text-green-700">
              {vehicle.availableQuantity}
            </p>
          </div>

          {/* Nút hành động */}
          <div className="flex items-center gap-2">
            {/* NÚT SO SÁNH (MỚI) */}
            <button
              onClick={handleCompareClick}
              title={isCompared ? "Bỏ chọn so sánh" : "Thêm vào so sánh"}
              className={`p-2 rounded-full ${
                isCompared
                  ? "text-blue-600 bg-blue-100 hover:bg-blue-200"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              {isCompared ? (
                <FiCheckSquare size={20} />
              ) : (
                <FiSquare size={20} />
              )}
            </button>

            {/* Nút xem chi tiết */}
            <button
              onClick={() => onViewDetails(vehicle.variantId)}
              className="p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 rounded-full"
              title="Xem thông số kỹ thuật"
            >
              {/* SVG nội tuyến cho FiEye */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button
              onClick={() => onCreateQuote(vehicle.variantId)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Tạo báo giá cho xe này"
            >
              {/* SVG nội tuyến cho FiFileText */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4" // Kích thước icon trong nút
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 8 9 8 9"></polyline>
              </svg>
              Tạo Báo Giá
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailableVehicleCard;
