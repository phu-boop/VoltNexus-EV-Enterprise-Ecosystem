// src/components/Loading.jsx
import React from "react";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-2"></div>
      <span className="text-gray-700">{message}</span>
    </div>
  );
};

export default Loading;
