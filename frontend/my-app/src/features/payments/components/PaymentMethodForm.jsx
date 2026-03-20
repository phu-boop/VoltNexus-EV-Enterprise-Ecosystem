// Payment Method Form Component
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const PaymentMethodForm = ({ method, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    methodName: '',
    methodType: 'GATEWAY',
    scope: 'ALL',
    isActive: true,
    configJson: ''
  });

  useEffect(() => {
    if (method) {
      setFormData({
        methodName: method.methodName || '',
        methodType: method.methodType || 'GATEWAY',
        scope: method.scope || 'ALL',
        isActive: method.isActive !== undefined ? method.isActive : true,
        configJson: method.configJson 
          ? (typeof method.configJson === 'string' ? method.configJson : JSON.stringify(method.configJson, null, 2))
          : ''
      });
    }
  }, [method]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate configJson là JSON hợp lệ nếu có
    let configJson = formData.configJson;
    if (configJson && configJson.trim()) {
      try {
        configJson = JSON.parse(configJson);
      } catch (error) {
        alert('Config JSON không hợp lệ. Vui lòng nhập JSON hợp lệ.');
        return;
      }
    } else {
      configJson = null;
    }

    onSave({
      methodName: formData.methodName,
      methodType: formData.methodType,
      scope: formData.scope,
      isActive: formData.isActive,
      configJson: configJson
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {method ? 'Chỉnh Sửa Phương Thức Thanh Toán' : 'Tạo Phương Thức Thanh Toán'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên Phương Thức Thanh Toán <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="methodName"
              value={formData.methodName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ví dụ: VNPAY, Chuyển khoản, Tiền mặt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại Thanh Toán <span className="text-red-500">*</span>
            </label>
            <select
              name="methodType"
              value={formData.methodType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="GATEWAY">Gateway (VNPAY, PayPal, ...)</option>
              <option value="MANUAL">Thủ công (Tiền mặt, Chuyển khoản)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phạm Vi <span className="text-red-500">*</span>
            </label>
            <select
              name="scope"
              value={formData.scope}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">Tất cả (B2C và B2B)</option>
              <option value="B2C">Chỉ B2C</option>
              <option value="B2B">Chỉ B2B</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Đang hoạt động</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cấu hình JSON (Optional)
            </label>
            <textarea
              name="configJson"
              value={formData.configJson}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder='{"key": "value", "endpoint": "https://..."}'
            />
            <p className="mt-1 text-xs text-gray-500">
              Nhập JSON hợp lệ để lưu cấu hình (ví dụ: keys, endpoints, QR code info)
            </p>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {method ? 'Cập Nhật' : 'Tạo Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethodForm;


