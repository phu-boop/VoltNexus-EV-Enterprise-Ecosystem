import React from "react";
import { FiEye, FiCheckSquare, FiSquare } from "react-icons/fi";

const ProductCard = ({
  variant,
  onCompareToggle,
  isSelected,
  onViewDetails,
}) => {
  const handleCompareClick = (e) => {
    e.stopPropagation();
    onCompareToggle(variant);
  };

  const handleDetailClick = (e) => {
    e.stopPropagation();
    onViewDetails();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="border rounded-lg shadow-lg overflow-hidden bg-white flex flex-col justify-between">
      <div>
        <img
          src={variant.imageUrl || "https://placehold.co/400x300"}
          alt={`${variant.modelName} ${variant.versionName}`}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-bold">
            {variant.modelName} {variant.versionName}
          </h3>
          <p className="text-sm text-gray-600">{variant.color}</p>
          <p className="text-xl font-semibold text-blue-600 my-2">
            {formatPrice(variant.price)}
          </p>
        </div>
      </div>

      <div className="p-4 pt-0 flex items-center gap-2">
        <button
          onClick={handleDetailClick}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          <FiEye size={16} />
          Chi tiết
        </button>

        <button
          onClick={handleCompareClick}
          title="Thêm vào so sánh"
          className={`py-2 px-3 rounded ${
            isSelected
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          {isSelected ? <FiCheckSquare size={18} /> : <FiSquare size={18} />}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
