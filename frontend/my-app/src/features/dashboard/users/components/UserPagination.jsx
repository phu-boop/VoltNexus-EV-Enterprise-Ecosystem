import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function UserPagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}) {
  const pageNumbers = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  if (totalPages === 0) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200 rounded-b-lg">
      <div className="text-sm text-gray-700">
        Hiển thị{" "}
        <span className="font-medium">
          {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
        </span>{" "}
        đến{" "}
        <span className="font-medium">
          {Math.min(currentPage * itemsPerPage, totalItems)}
        </span>{" "}
        của <span className="font-medium">{totalItems}</span> kết quả
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
          </>
        )}

        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-md border ${
              currentPage === page
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-gray-500">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}