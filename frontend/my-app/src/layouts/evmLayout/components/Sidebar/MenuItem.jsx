import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

export const MenuItem = ({ 
  item, 
  activePath, 
  isSubmenuOpen, 
  onToggle, 
  onNavigate,
  isSidebarOpen 
}) => {
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const isActive = activePath === item.path || 
    (hasSubmenu && item.submenu.some((sub) => sub.path === activePath));

  const handleItemClick = () => {
    if (hasSubmenu) {
      if (isSidebarOpen) {
        onToggle();
      }
    } else {
      onNavigate(item.path);
    }
  };

  // Tooltip content khi sidebar thu gọn
  const getTooltipContent = () => {
    if (!isSidebarOpen) {
      return item.label;
    }
    return '';
  };

  return (
    <li className="relative">
      <button
        onClick={handleItemClick}
        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98] ${
          isActive
            ? "bg-white text-blue-700 shadow-lg shadow-blue-200/50"
            : "text-blue-100 hover:bg-blue-700 hover:text-white hover:shadow-md"
        }`}
        title={getTooltipContent()}
      >
        <div className="flex items-center">
          <item.icon
            className={`w-5 h-5 transition-transform duration-300 ${
              isSidebarOpen ? "mr-3" : "mx-auto"
            } ${
              isActive
                ? "text-blue-700 scale-110"
                : "group-hover:text-white group-hover:scale-110"
            }`}
          />
          {isSidebarOpen && (
            <span className="font-medium transition-all duration-300">
              {item.label}
            </span>
          )}
        </div>
        {hasSubmenu && isSidebarOpen && (
          <FiChevronDown
            className={`w-4 h-4 transition-all duration-300 ${
              isSubmenuOpen ? "rotate-180 transform" : ""
            } ${isActive ? "text-blue-700" : "group-hover:text-white"}`}
          />
        )}
      </button>

      {/* Tooltip khi sidebar thu gọn */}
      {!isSidebarOpen && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 z-50 whitespace-nowrap">
          {item.label}
          {hasSubmenu && item.submenu && (
            <div className="mt-1">
              {item.submenu.map((subItem, index) => (
                <div key={index} className="text-xs py-1 border-t border-gray-700">
                  {subItem.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submenu với CSS transition - chỉ hiển thị khi sidebar mở */}
      {hasSubmenu && isSubmenuOpen && isSidebarOpen && (
        <div
          className="overflow-hidden transition-all duration-500 ease-in-out"
          style={{
            maxHeight: isSubmenuOpen ? '500px' : '0',
            opacity: isSubmenuOpen ? 1 : 0
          }}
        >
          <ul className="ml-4 mt-1 space-y-1 pb-2">
            {item.submenu.map((subItem, subIndex) => (
              <li key={subIndex}>
                <button
                  onClick={() => onNavigate(subItem.path)}
                  className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-all duration-300 group hover:translate-x-1 ${
                    activePath === subItem.path
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm"
                      : "text-blue-200 hover:bg-blue-600 hover:text-white hover:shadow-sm"
                  }`}
                >
                  <subItem.icon
                    className={`w-4 h-4 mr-3 transition-transform duration-300 ${
                      activePath === subItem.path
                        ? "text-blue-700 scale-110"
                        : "group-hover:text-white group-hover:scale-110"
                    }`}
                  />
                  <span className="text-sm font-medium transition-all duration-300">
                    {subItem.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};