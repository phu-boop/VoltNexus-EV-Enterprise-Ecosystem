// Payment Method List Component
import React from 'react';
import PaymentMethodCard from './PaymentMethodCard';

const PaymentMethodList = ({ methods, onEdit, onRefresh }) => {
  if (!methods || methods.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Chưa có phương thức thanh toán nào</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {methods.map((method) => (
        <PaymentMethodCard
          key={method.methodId}
          method={method}
          onEdit={onEdit}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
};

export default PaymentMethodList;


