import React from "react";
import { FiX, FiLoader } from "react-icons/fi"; // Thêm FiLoader

const CompareTray = ({ items, onSubmit, onRemove, isLoading }) => {
  if (items.length === 0) {
    return null; // Ẩn nếu không có gì
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg flex items-center justify-between z-50">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-lg hidden md:block">So sánh:</span>
        {items.map((item) => (
          <div key={item.variantId} className="relative">
            <img
              src={item.imageUrl || "https://placehold.co/100"}
              alt={item.versionName}
              className="w-14 h-14 object-cover rounded"
            />
            <button
              onClick={() => onRemove(item)}
              title={`Bỏ ${item.versionName}`}
              className="absolute -top-2 -right-2 bg-red-600 rounded-full p-0.5 text-white hover:bg-red-700 transition-all"
            >
              <FiX size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onSubmit}
        disabled={isLoading || items.length < 2}
        className={`bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2`}
      >
        {isLoading && <FiLoader className="animate-spin" />}
        {isLoading ? "Đang tải..." : `So sánh (${items.length})`}
      </button>
    </div>
  );
};

export default CompareTray;
