import React from 'react';
import { Lock, Eye, EyeOff, Key } from 'lucide-react';

const PasswordChangeForm = React.memo(({
  passwordData,
  errors,
  showPasswords,
  handleChange,
  togglePasswordVisibility,
  handleSubmit,
  loading,
  passwordStrength
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mật khẩu hiện tại */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mật khẩu hiện tại *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            name="currentPassword"
            type={showPasswords.current ? 'text' : 'password'}
            value={passwordData.currentPassword}
            onChange={handleChange}
            className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.currentPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nhập mật khẩu hiện tại"
          />
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={e => e.preventDefault()}
            onClick={() => togglePasswordVisibility('current')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
        )}
      </div>

      {/* Mật khẩu mới */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mật khẩu mới *
        </label>
        <div className="relative">
          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            name="newPassword"
            type={showPasswords.new ? 'text' : 'password'}
            value={passwordData.newPassword}
            onChange={handleChange}
            className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.newPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Tạo mật khẩu mới"
          />
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={e => e.preventDefault()}
            onClick={() => togglePasswordVisibility('new')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {passwordData.newPassword && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Độ mạnh mật khẩu: </span>
              <span className={`text-xs font-medium ${
                passwordStrength.score < 2 ? 'text-red-600' : 
                passwordStrength.score < 4 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {passwordStrength.strength}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${
                  passwordStrength.score < 2 ? 'bg-red-600' : 
                  passwordStrength.score < 4 ? 'bg-yellow-400' : 'bg-green-600'
                }`}
                style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
              ></div>
            </div>
            <p className="mt-1 text-xs text-gray-500">{passwordStrength.feedback}</p>
          </div>
        )}

        {errors.newPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
        )}
      </div>

      {/* Xác nhận mật khẩu mới */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Xác nhận mật khẩu mới *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            name="confirmPassword"
            type={showPasswords.confirm ? 'text' : 'password'}
            value={passwordData.confirmPassword}
            onChange={handleChange}
            className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Xác nhận mật khẩu mới"
          />
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={e => e.preventDefault()}
            onClick={() => togglePasswordVisibility('confirm')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang xử lý...
          </>
        ) : 'Đổi mật khẩu'}
      </button>
    </form>
  );
});

export default PasswordChangeForm;