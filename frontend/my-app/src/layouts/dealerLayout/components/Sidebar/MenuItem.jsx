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
        className={`flex items-center justify-between w-full px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
          isActive
            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/25"
            : "text-slate-700 hover:bg-white/10 hover:text-white hover:shadow-lg border border-transparent hover:border-white/20"
        }`}
        title={getTooltipContent()}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-10 bg-white rounded-r-full shadow-lg"></div>
        )}

        <div className="flex items-center z-10">
          <item.icon
            className={`w-5 h-5 transition-transform duration-300 ${
              isSidebarOpen ? "mr-3.5" : "mx-auto"
            } ${
              isActive 
                ? "text-white scale-110" 
                : "text-slate-300 group-hover:text-white group-hover:scale-110"
            }`}
          />
          {isSidebarOpen && (
            <span className={`font-medium transition-all duration-300 ${
              isActive ? "text-white" : "text-slate-200 group-hover:text-white"
            }`}>
              {item.label}
            </span>
          )}
        </div>
        {hasSubmenu && isSidebarOpen && (
          <FiChevronDown
            className={`w-4 h-4 transition-all duration-300 z-10 ${
              isSubmenuOpen ? 'rotate-180 transform' : ''
            } ${
              isActive 
                ? 'text-white' 
                : 'text-slate-300 group-hover:text-white'
            }`}
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
          <ul className="ml-6 mt-2 space-y-1.5 pb-2 border-l border-blue-400/20">
            {item.submenu.map((subItem, subIndex) => (
              <li key={subIndex}>
                <button
                  onClick={() => onNavigate(subItem.path)}
                  className={`flex items-center w-full px-4 py-2.5 rounded-xl transition-all duration-300 group relative transform hover:translate-x-1 ${
                    activePath === subItem.path
                      ? "bg-white/15 text-white border-l-2 border-white shadow-md"
                      : "text-slate-300 hover:bg-white/10 hover:text-white hover:shadow-sm"
                  }`}
                >
                  {/* Submenu active indicator */}
                  {activePath === subItem.path && (
                    <div className="absolute left-0 w-0.5 h-6 bg-white rounded-full"></div>
                  )}
                  <subItem.icon
                    className={`w-4 h-4 mr-3 transition-all duration-300 ${
                      activePath === subItem.path 
                        ? "text-white scale-110" 
                        : "text-slate-400 group-hover:text-white group-hover:scale-110"
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