// Payment Methods Management Page (Admin)
import React, { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';
import PaymentMethodList from '../components/PaymentMethodList';
import PaymentMethodForm from '../components/PaymentMethodForm';
import { toast } from 'react-toastify';

const PaymentMethodsManagement = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getAllPaymentMethods();
      setPaymentMethods(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Không thể tải danh sách phương thức thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMethod(null);
    setShowForm(true);
  };

  const handleEdit = (method) => {
    setEditingMethod(method);
    setShowForm(true);
  };

  const handleSave = async (methodData) => {
    try {
      if (editingMethod) {
        await paymentService.updatePaymentMethod(editingMethod.methodId, methodData);
        toast.success('Cập nhật phương thức thanh toán thành công');
      } else {
        await paymentService.createPaymentMethod(methodData);
        toast.success('Tạo phương thức thanh toán thành công');
      }
      setShowForm(false);
      setEditingMethod(null);
      loadPaymentMethods();
    } catch (error) {
      console.error('Error saving payment method:', error);
      toast.error(error.response?.data?.message || 'Không thể lưu phương thức thanh toán');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMethod(null);
  };

  if (loading && paymentMethods.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản Lý Phương Thức Thanh Toán</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          + Tạo Phương Thức Thanh Toán
        </button>
      </div>

      {showForm && (
        <PaymentMethodForm
          method={editingMethod}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <PaymentMethodList
        methods={paymentMethods}
        onEdit={handleEdit}
        onRefresh={loadPaymentMethods}
      />
    </div>
  );
};

export default PaymentMethodsManagement;


