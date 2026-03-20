// Payment Method Card Component
import React from 'react';
import { PencilIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const PaymentMethodCard = ({ method, onEdit, onRefresh }) => {
  const getScopeBadgeColor = (scope) => {
    switch (scope) {
      case 'ALL':
        return 'bg-purple-100 text-purple-800';
      case 'B2C':
        return 'bg-blue-100 text-blue-800';
      case 'B2B':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'GATEWAY':
        return 'bg-indigo-100 text-indigo-800';
      case 'MANUAL':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{method.methodName}</h3>
          <div className="flex gap-2 mt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScopeBadgeColor(method.scope)}`}>
              {method.scope}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(method.methodType)}`}>
              {method.methodType}
            </span>
          </div>
        </div>
        <button
          onClick={() => onEdit(method)}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Chỉnh sửa"
        >
          <PencilIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          {method.isActive ? (
            <>
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span className="text-green-600 font-medium">Đang hoạt động</span>
            </>
          ) : (
            <>
              <XCircleIcon className="h-5 w-5 text-red-500" />
              <span className="text-red-600 font-medium">Đã tắt</span>
            </>
          )}
        </div>
      </div>

      {method.configJson && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 font-medium mb-1">Cấu hình:</p>
          <p className="text-xs text-gray-500 break-all">
            {typeof method.configJson === 'string' 
              ? method.configJson.substring(0, 50) + '...' 
              : JSON.stringify(method.configJson).substring(0, 50) + '...'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodCard;


