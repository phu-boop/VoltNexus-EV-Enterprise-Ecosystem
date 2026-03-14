import React, { useRef } from 'react';
import { FiUser, FiSettings, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { useClickOutside } from '../../hooks/useClickOutside';

export const ProfileDropdown = ({
  user,
  role,
  isOpen,
  setIsOpen,
  handleLogout,
  navigate,
  avatarUrl: avatarUrlProp,
}) => {
  const dropdownRef = useRef(null);
  const { email, name, fullName, roles } = user;
  const avatarUrl = avatarUrlProp || sessionStorage.getItem('avatarUrl');
  const hasValidAvatar = avatarUrl && avatarUrl !== 'null';

  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-300 group border border-transparent hover:border-gray-200 hover:scale-105 active:scale-95 hover-lift"
      >
        <div className="w-11 h-11 avatar-glow rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:rotate-6">
          <span className="text-white font-semibold text-lg">
            <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg avatar-glow">
                    {hasValidAvatar ? (
                        <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : 
                      (name?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase())
                      }
                </div>
            </div>
          </span>
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-gray-800 truncate max-w-xs text-gradient-primary">
            {fullName || name || email}
          </p>
          <p className="text-xs text-gray-500 truncate max-w-xs text-gradient-secondary">
            {email}
          </p>
        </div>
        <FiChevronDown
          className={`w-4 h-4 text-gray-500 transition-all duration-300 ${
            isOpen ? "rotate-180 transform" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 py-4 z-50 overflow-hidden">
        {/* Header */}
        <div className="px-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center overflow-hidden">
              {hasValidAvatar ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.style.display = 'none')}
                />
              ) : (
                <span className="text-lg font-semibold text-blue-600">
                  {name?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">
                {fullName || name || email}
              </p>
              <p className="text-sm text-gray-500 truncate">{email}</p>
            </div>
          </div>
        </div>

        {/* Roles */}
        <div className="px-5 py-3">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Vai trò
          </p>
          <div className="flex flex-wrap gap-2">
            {roles?.map((role, i) => (
              <span
                key={i}
                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                navigate("/dealer/profile");
                setIsOpen(false);
              }}
              className="flex flex-col items-center p-3 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all duration-200"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-lg mb-2">
                <FiUser className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-gray-700">Hồ sơ</span>
            </button>

            <button
              onClick={() => {
                navigate("/dealer/settings");
                setIsOpen(false);
              }}
              className="flex flex-col items-center p-3 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all duration-200"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-lg mb-2">
                <FiSettings className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-gray-700">Bảo mật</span>
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="px-5 pt-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200"
          >
            <FiLogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </button>
        </div>
      </div>

      )}
    </div>
  );
};