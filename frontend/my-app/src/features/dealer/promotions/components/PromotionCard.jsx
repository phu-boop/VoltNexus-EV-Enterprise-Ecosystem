// features/customer/promotions/components/PromotionCard.js
import React from 'react';
import { CalendarIcon, ClockIcon, SparklesIcon, EyeIcon } from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

export const PromotionCard = ({ promotion, onViewDetails }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), "dd/MM/yyyy • HH:mm", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  const formatDiscountRate = (rate) => {
    return `${(rate * 100).toFixed(0)}%`;
  };

  const getStatusInfo = () => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (promotion.status === 'ACTIVE') {
      const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      return {
        type: 'active',
        label: 'Đang diễn ra',
        color: 'green',
        daysLeft
      };
    } else if (promotion.status === 'NEAR') {
      const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
      return {
        type: 'near',
        label: 'Sắp diễn ra',
        color: 'blue',
        daysUntil
      };
    }
    
    return {
      type: 'other',
      label: promotion.status,
      color: 'gray'
    };
  };

  const statusInfo = getStatusInfo();
  const isActive = promotion.status === 'ACTIVE';
  const isNear = promotion.status === 'NEAR';

  return (
    <div className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header với status và discount */}
        <div className="flex justify-between items-start mb-4">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusInfo.color === 'green' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {statusInfo.label}
          </div>
          
          <div className="text-2xl font-bold text-gray-800">
            {formatDiscountRate(promotion.discountRate)}
          </div>
        </div>

        {/* Promotion Name */}
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          {promotion.promotionName}
        </h3>

        {/* Description */}
        {promotion.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {promotion.description}
          </p>
        )}

        {/* Time Information */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Bắt đầu:</span>
            <span className="font-medium">{formatDate(promotion.startDate)}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Kết thúc:</span>
            <span className="font-medium">{formatDate(promotion.endDate)}</span>
          </div>
        </div>

        {/* Countdown */}
        {(statusInfo.type === 'active' && statusInfo.daysLeft > 0) && (
          <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-green-600" />
                <span className="text-green-800">Kết thúc sau:</span>
              </div>
              <span className="font-semibold text-green-800">
                {statusInfo.daysLeft} ngày
              </span>
            </div>
          </div>
        )}

        {statusInfo.type === 'near' && statusInfo.daysUntil > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800">Bắt đầu sau:</span>
              </div>
              <span className="font-semibold text-blue-800">
                {statusInfo.daysUntil} ngày
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onViewDetails(promotion)}
          className="w-full py-2 px-4 bg-gray-800 text-white rounded font-medium hover:bg-gray-900 transition-colors flex items-center justify-center space-x-2"
        >
          <EyeIcon className="w-4 h-4" />
          <span>Xem chi tiết</span>
        </button>
      </div>
    </div>
  );
};

export default PromotionCard;