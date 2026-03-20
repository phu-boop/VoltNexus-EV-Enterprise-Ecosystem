import React from "react";
import { FiAward } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

/**
 * Congratulations Card Component
 * Hiển thị lời chào mừng và avatar
 */
const CongratulationsCard = ({ 
  userName
}) => {
  const navigate = useNavigate();

  // Lấy tên đầy đủ hoặc tên đầu tiên
  const displayName = userName || "Bạn";

  // Lấy avatar từ sessionStorage
  const avatarUrl = sessionStorage.getItem("avatarUrl");
  const hasValidAvatar = avatarUrl && avatarUrl !== "null" && avatarUrl !== "";

  // Lấy chữ cái đầu để hiển thị nếu không có avatar
  const getInitials = () => {
    if (userName) {
      const names = userName.split(' ');
      if (names.length > 1) {
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
      }
      return userName.charAt(0).toUpperCase();
    }
    return "U";
  };

  const handleViewBadges = () => {
    // Navigate to profile or badges page
    navigate("/dealer/settings");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full -mr-32 -mt-32 opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -mr-24 -mb-24 opacity-30"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between">
        {/* Left content */}
        <div className="flex-1 mb-4 md:mb-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎉</span>
            <h2 className="text-2xl font-bold text-gray-900">
              Chào {displayName}, chào mừng bạn trở lại!
            </h2>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Kiểm tra huy hiệu mới của bạn trong hồ sơ.
          </p>
          
          <button
            onClick={handleViewBadges}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <FiAward className="w-4 h-4" />
            Xem Huy Hiệu
          </button>
        </div>

        {/* Right Avatar */}
        <div className="relative w-full md:w-64 h-48 md:h-48 flex items-center justify-center">
          <div className="relative">
            {/* Avatar với gradient background */}
            <div className="w-48 h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl shadow-xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300 overflow-hidden">
              {hasValidAvatar ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="text-center text-white">
                  <div className="text-6xl font-bold">{getInitials()}</div>
                </div>
              )}
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-400 rounded-full opacity-80 animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-pink-400 rounded-full opacity-60"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CongratulationsCard;

