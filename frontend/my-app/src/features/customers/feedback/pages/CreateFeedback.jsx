import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiX, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { createComplaint, COMPLAINT_TYPES, COMPLAINT_SEVERITIES, COMPLAINT_CHANNELS } from '../services/feedbackService';
import { useCustomers } from '../../hooks/useCustomers';

const CreateFeedback = () => {
  const navigate = useNavigate();
  const { customers, loading: loadingCustomers } = useCustomers();

  // Get role-based base path
  const getBasePath = () => {
    const rolesString = sessionStorage.getItem('roles');
    try {
      const roles = rolesString ? JSON.parse(rolesString) : [];
      if (roles.includes('DEALER_MANAGER')) {
        return '/dealer/manager';
      } else if (roles.includes('DEALER_STAFF')) {
        return '/dealer/staff';
      }
    } catch (error) {
      console.error('Error parsing roles:', error);
    }
    return '/dealer/staff';
  };

  const basePath = getBasePath();

  const [formData, setFormData] = useState({
    customerId: '',
    dealerId: 1, // TODO: Get from session
    complaintType: '',
    severity: 'MEDIUM',
    channel: 'IN_STORE',
    description: '',
    orderId: '',
    vehicleVin: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCustomerSelect = (customerId) => {
    const customer = customers.find(c => c.customerId === parseInt(customerId));
    setSelectedCustomer(customer);
    handleChange('customerId', customerId);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.customerId) newErrors.customerId = 'Vui lòng chọn khách hàng';
    if (!formData.complaintType) newErrors.complaintType = 'Vui lòng chọn loại phản hồi';
    if (!formData.severity) newErrors.severity = 'Vui lòng chọn mức độ';
    if (!formData.channel) newErrors.channel = 'Vui lòng chọn kênh tiếp nhận';
    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Nội dung phản hồi phải có ít nhất 10 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        customerId: parseInt(formData.customerId),
        dealerId: parseInt(formData.dealerId),
        orderId: formData.orderId ? parseInt(formData.orderId) : null,
      };

      await createComplaint(payload);
      toast.success('Đã ghi nhận phản hồi thành công!');
      navigate(`${basePath}/feedback`);
    } catch (error) {
      console.error('Error creating complaint:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo phản hồi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`${basePath}/feedback`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Quay lại</span>
          </button>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Ghi nhận Phản hồi & Khiếu nại
            </h1>
            <p className="text-gray-600">
              Vui lòng điền đầy đủ thông tin phản hồi từ khách hàng
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Khách hàng <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors ${
                  errors.customerId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loadingCustomers}
              >
                <option value="">-- Chọn khách hàng --</option>
                {customers.map(customer => (
                  <option key={customer.customerId} value={customer.customerId}>
                    {customer.firstName} {customer.lastName} - {customer.phone}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
              )}

              {/* Selected Customer Info */}
              {selectedCustomer && (
                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center text-gray-700">
                      <FiUser className="w-4 h-4 mr-2 text-blue-600" />
                      <span>{selectedCustomer.firstName} {selectedCustomer.lastName}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FiPhone className="w-4 h-4 mr-2 text-blue-600" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FiMail className="w-4 h-4 mr-2 text-blue-600" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Type, Severity, Channel Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Complaint Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Loại phản hồi <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.complaintType}
                  onChange={(e) => handleChange('complaintType', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors ${
                    errors.complaintType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">-- Chọn loại --</option>
                  {Object.entries(COMPLAINT_TYPES).map(([key, type]) => (
                    <option key={key} value={key}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
                {errors.complaintType && (
                  <p className="mt-1 text-sm text-red-600">{errors.complaintType}</p>
                )}
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mức độ <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => handleChange('severity', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors ${
                    errors.severity ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {Object.entries(COMPLAINT_SEVERITIES).map(([key, severity]) => (
                    <option key={key} value={key}>
                      {severity.label}
                    </option>
                  ))}
                </select>
                {errors.severity && (
                  <p className="mt-1 text-sm text-red-600">{errors.severity}</p>
                )}
              </div>

              {/* Channel */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kênh tiếp nhận <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.channel}
                  onChange={(e) => handleChange('channel', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors ${
                    errors.channel ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {Object.entries(COMPLAINT_CHANNELS).map(([key, channel]) => (
                    <option key={key} value={key}>
                      {channel.icon} {channel.label}
                    </option>
                  ))}
                </select>
                {errors.channel && (
                  <p className="mt-1 text-sm text-red-600">{errors.channel}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nội dung phản hồi <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Mô tả chi tiết nội dung phản hồi hoặc khiếu nại của khách hàng..."
                rows={8}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Order ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mã đơn hàng (nếu có)
                </label>
                <input
                  type="text"
                  value={formData.orderId}
                  onChange={(e) => handleChange('orderId', e.target.value)}
                  placeholder="Nhập mã đơn hàng liên quan"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                />
              </div>

              {/* Vehicle VIN */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số khung xe (VIN) (nếu có)
                </label>
                <input
                  type="text"
                  value={formData.vehicleVin}
                  onChange={(e) => handleChange('vehicleVin', e.target.value)}
                  placeholder="Nhập số khung xe liên quan"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center font-semibold"
              >
                <FiX className="w-5 h-5 mr-2" />
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <FiSave className="w-5 h-5 mr-2" />
                    Ghi nhận phản hồi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFeedback;
