// src/components/Pagination.js
import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Không hiển thị gì nếu chỉ có 1 trang
  if (totalPages <= 1) {
    return null;
  }

  const handlePrev = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-b-lg shadow">
      {/* Nút Previous */}
      <button
        onClick={handlePrev}
        disabled={currentPage === 0}
        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FiChevronLeft className="mr-2" />
        Trang trước
      </button>

      {/* Thông tin trang */}
      <div className="text-sm text-gray-700">
        Trang <span className="font-medium">{currentPage + 1}</span> /{" "}
        <span className="font-medium">{totalPages}</span>
      </div>

      {/* Nút Next */}
      <button
        onClick={handleNext}
        disabled={currentPage >= totalPages - 1}
        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Trang sau
        <FiChevronRight className="ml-2" />
      </button>
    </div>
  );
};

export default Pagination;
