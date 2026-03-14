import React from 'react';
import { FiChevronRight, FiHome } from 'react-icons/fi';

export const Breadcrumb = ({ menuItems, activePath }) => {
  const activeItem = menuItems.find((item) => item.path === activePath) || 
    menuItems.flatMap(item => item.submenu || []).find(sub => sub.path === activePath);

  return (
    <div className="flex items-center space-x-2 text-sm">
      <span className="text-gray-500 font-medium flex items-center">
        <FiHome className="w-4 h-4 mr-2" />
        Trang chủ
      </span>
      <FiChevronRight className="w-4 h-4 text-gray-400" />
      <span className="text-blue-600 font-semibold bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
        {activeItem?.label || "Bảng Điều Khiển"}
      </span>
    </div>
  );
};