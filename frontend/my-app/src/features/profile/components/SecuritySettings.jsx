import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, User, Eye, EyeOff, AlertCircle, Check, Hand } from 'lucide-react';
import PasswordChangeForm from './PasswordChangeForm';
import profileService from '../services/profileService.js';
import { useAuthContext } from '../../../features/auth/AuthProvider.jsx';
import './SecuritySettings.css';

const SecuritySettings = () => {
  const { logout } = useAuthContext();
  const [activeTab, setActiveTab] = useState('password');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const checkPasswordStrength = (password) => {
    if (!password) return { score: 0, feedback: [] };
    let score = 0;
    let feedback = [];
    
    const checks = [
      { test: password.length >= 8, message: 'Ít nhất 8 ký tự' },
      { test: /[A-Z]/.test(password), message: 'Có chữ in hoa' },
      { test: /[a-z]/.test(password), message: 'Có chữ thường' },
      { test: /[0-9]/.test(password), message: 'Có chữ số' },
      { test: /[^A-Za-z0-9]/.test(password), message: 'Có ký tự đặc biệt' }
    ];

    checks.forEach((check, index) => {
      if (check.test) {
        score++;
      } else {
        feedback.push(check.message);
      }
    });

    const strengthLabels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh', 'Hoàn hảo'];
    return { 
      score, 
      strength: strengthLabels[score], 
      feedback,
      passedChecks: checks.filter(check => check.test).length,
      totalChecks: checks.length
    };
  };

  const passwordStrength = checkPasswordStrength(passwordData.newPassword);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = 'Mật khẩu hiện tại là bắt buộc';
    if (!passwordData.newPassword) newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
    else if (passwordData.newPassword.length < 8) newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
    if (passwordData.newPassword !== passwordData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true);
      await profileService.changePassword(sessionStorage.getItem("email"), passwordData.newPassword, passwordData.currentPassword);
      setMessage('Đổi mật khẩu thành công! Bạn sẽ được đăng xuất trong giây lát...');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setMessage('');
        logout();
      }, 3000);
    } catch (error) {
      setMessage('Lỗi khi đổi mật khẩu: ' + (error.response?.data?.message || 'Vui lòng thử lại'));
    } finally {
      setLoading(false);
    }
  };

  const handle2FA = () => {
    setMessage('Tính năng xác thực 2 lớp đang được phát triển. Vui lòng chờ cập nhật trong thời gian tới!');
  };
  
  const HandleSessions = () => {
    setMessage('Tính năng quản lý phiên đăng nhập đang được phát triển. Vui lòng chờ cập nhật trong thời gian tới!');
  };

  return (
    <div className="security-container">
      <div className="security-header">
        <div className="flex items-center space-x-3 p-8 pb-4 relative z-10">
          <div className="security-icon">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Bảo mật & Bảo vệ</h2>
            <p className="text-gray-500 mt-1">Quản lý bảo mật tài khoản và bảo vệ thông tin cá nhân</p>
          </div>
        </div>

        <div className="tab-container px-8 flex space-x-6 relative z-10">
          <button
            className={`tab-button ${activeTab === 'password' ? 'active border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('password')}
          >
            🔐 Đổi mật khẩu
          </button>
          <button
            className={`tab-button ${activeTab === '2fa' ? 'active border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('2fa')}
          >
            🛡️ Xác thực 2 lớp
          </button>
          <button
            className={`tab-button ${activeTab === 'sessions' ? 'active border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('sessions')}
          >
            💻 Phiên đăng nhập
          </button>
        </div>
      </div>

      <div className="p-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center animate-fade-in ${
            message.includes('thành công') ? 'message-success' : 'message-error'
          }`}>
            {message.includes('thành công') ? 
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" /> : 
              <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            }
            <span className="font-medium">{message}</span>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="space-y-6">
            <PasswordChangeForm
              passwordData={passwordData}
              errors={errors}
              showPasswords={showPasswords}
              handleChange={handleChange}
              togglePasswordVisibility={togglePasswordVisibility}
              handleSubmit={handleSubmit}
              loading={loading}
              passwordStrength={passwordStrength}
            />
            
            {/* Security Tips Section */}
            <div className="security-tips">
              <h3 className="text-lg font-semibold flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Mẹo bảo mật quan trọng
              </h3>
              <div className="space-y-2">
                <div className="tip-item">
                  <Check className="w-4 h-4 tip-icon" />
                  <span>Sử dụng mật khẩu dài ít nhất 12 ký tự</span>
                </div>
                <div className="tip-item">
                  <Check className="w-4 h-4 tip-icon" />
                  <span>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</span>
                </div>
                <div className="tip-item">
                  <Check className="w-4 h-4 tip-icon" />
                  <span>Không sử dụng lại mật khẩu cũ</span>
                </div>
                <div className="tip-item">
                  <Check className="w-4 h-4 tip-icon" />
                  <span>Đổi mật khẩu định kỳ 3-6 tháng một lần</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === '2fa' && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Xác thực 2 lớp</h3>
              <p className="text-gray-500 mb-6">
                Bảo vệ tài khoản của bạn bằng xác thực 2 lớp để tăng cường bảo mật
              </p>
              <button
              
              onClick={handle2FA}
              className="submit-button">
                Kích hoạt xác thực 2 lớp
              </button>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Quản lý phiên đăng nhập</h3>
              <p className="text-gray-500 mb-6">
                Xem và quản lý các thiết bị đang đăng nhập vào tài khoản của bạn
              </p>
              <button
              onClick={HandleSessions}
              className="submit-button">
                Xem phiên đăng nhập
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecuritySettings;