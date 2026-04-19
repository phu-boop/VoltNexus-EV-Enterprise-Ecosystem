import React from "react";

const Loading = ({ message = "Đang tải..." }) => {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3"></div>
      <span className="text-gray-600">{message}</span>
    </div>
  );
};

export default Loading;
