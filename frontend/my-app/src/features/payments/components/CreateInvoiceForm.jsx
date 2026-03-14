// Create Invoice Form Component (EVM Staff)
import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';

const CreateInvoiceForm = ({ dealerId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    dealerId: dealerId,
    orderId: '',
    amount: '',
    dueDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.orderId) {
      newErrors.orderId = 'Vui lòng nhập Order ID';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Số tiền phải lớn hơn 0';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Vui lòng chọn hạn thanh toán';
    } else {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        newErrors.dueDate = 'Hạn thanh toán phải từ hôm nay trở đi';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        dealerId: formData.dealerId,
        orderId: formData.orderId,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
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

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Tạo Hóa Đơn Công Nợ</h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <Input
              label="Dealer ID *"
              type="text"
              name="dealerId"
              value={formData.dealerId}
              onChange={handleChange}
              error={errors.dealerId}
              required
              disabled
            />
          </div>

          <div>
            <Input
              label="Order ID (B2B) *"
              type="text"
              name="orderId"
              value={formData.orderId}
              onChange={handleChange}
              error={errors.orderId}
              placeholder="Nhập Order ID từ Sales Service"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Order phải là B2B và tồn tại trong Sales Service
            </p>
          </div>

          <div>
            <Input
              label="Số Tiền (VND) *"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              error={errors.amount}
              placeholder="Nhập số tiền"
              min="1"
              step="1000"
              required
            />
            {formData.amount && (
              <p className="mt-1 text-sm text-gray-600">
                {formatCurrency(parseFloat(formData.amount) || 0)}
              </p>
            )}
          </div>

          <div>
            <Input
              label="Hạn Thanh Toán *"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              error={errors.dueDate}
              min={today}
              required
            />
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

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Tạo Hóa Đơn
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoiceForm;


