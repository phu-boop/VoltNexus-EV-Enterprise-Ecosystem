// Payment Form Component (B2C Payment)
import React, { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const PaymentForm = ({ paymentMethods, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethodId: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (paymentMethods.length > 0 && !formData.paymentMethodId) {
      setFormData(prev => ({
        ...prev,
        paymentMethodId: paymentMethods[0].methodId
      }));
    }
  }, [paymentMethods]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Số tiền phải lớn hơn 0';
    }

    if (!formData.paymentMethodId) {
      newErrors.paymentMethodId = 'Vui lòng chọn phương thức thanh toán';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        amount: parseFloat(formData.amount),
        paymentMethodId: formData.paymentMethodId,
        notes: formData.notes || null
      });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          label="Số Tiền Thanh Toán (VND) *"
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          error={errors.amount}
          placeholder="Nhập số tiền thanh toán"
          min="1"
          step="0.01"
          required
        />
        {formData.amount && (
          <p className="mt-1 text-sm text-gray-600">
            {formatCurrency(parseFloat(formData.amount) || 0)}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phương Thức Thanh Toán *
        </label>
        <select
          name="paymentMethodId"
          value={formData.paymentMethodId}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.paymentMethodId ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        >
          <option value="">-- Chọn phương thức thanh toán --</option>
          {paymentMethods.map((method) => (
            <option key={method.methodId} value={method.methodId}>
              {method.methodName} ({method.methodType === 'GATEWAY' ? 'Cổng thanh toán' : 'Thủ công'})
            </option>
          ))}
        </select>
        {errors.paymentMethodId && (
          <p className="mt-1 text-sm text-red-500">{errors.paymentMethodId}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ghi Chú (Optional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Nhập ghi chú (nếu có)"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={loading}
      >
        {loading ? 'Đang xử lý...' : 'Thanh Toán'}
      </Button>
    </form>
  );
};

export default PaymentForm;


