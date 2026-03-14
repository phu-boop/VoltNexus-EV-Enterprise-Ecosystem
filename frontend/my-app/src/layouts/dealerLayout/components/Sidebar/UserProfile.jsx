import React from 'react';

export const UserProfile = ({ isSidebarOpen, user, avatarUrl: avatarUrlProp }) => {
  const { email, name, fullName, roles } = user;
  const avatarUrl = avatarUrlProp || sessionStorage.getItem('avatarUrl');
  const hasValidAvatar = avatarUrl && avatarUrl !== 'null';

  return (
    <div
      className={`px-6 py-6 transition-all mt-10 duration-500 ${
        isSidebarOpen 
          ? "opacity-100 bg-blue-800/20 backdrop-blur-lg border-y border-blue-600/30" 
          : "opacity-0 lg:opacity-0"
      }`}
    >
      <div className="flex items-center">
        {/* Avatar với fallback */}
        <div className="relative group">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-semibold text-xl shadow-2xl border-2 border-white/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-blue-500/25 overflow-hidden">
            {hasValidAvatar ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : null}
            <span className={`${hasValidAvatar ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
              {name?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase()}
            </span>
          </div>

          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-500 -z-10"></div>
        </div>

        {/* User Info - chỉ hiện khi sidebar mở */}
        {isSidebarOpen && (
          <div className="flex-1 ml-4 min-w-0">
            {/* Tên người dùng */}
            <p className="font-bold text-white truncate text-lg leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              {fullName || name || email}
            </p>

            {/* Roles */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {roles?.map((role, index) => (
                <span
                  key={index}
                  style={{ 
                    animationDelay: `${index * 150}ms`,
                    background: `linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(139, 92, 246, 0.6))`
                  }}
                  className="text-xs text-white px-3 py-1.5 rounded-full border border-blue-400/40 backdrop-blur-sm animate-fadeIn shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 cursor-default"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status indicator khi sidebar mở */}
      {isSidebarOpen && (
        <div className="flex items-center mt-4 pt-3 border-t border-blue-600/20">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse shadow-lg shadow-emerald-400/50"></div>
            <span className="text-xs text-blue-200/80 font-medium">Đang hoạt động</span>
          </div>
        </div>
      )}
    </div>
  );
};