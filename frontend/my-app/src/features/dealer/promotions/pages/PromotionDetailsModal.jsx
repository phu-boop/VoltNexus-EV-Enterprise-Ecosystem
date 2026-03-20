// features/customer/promotions/pages/PromotionDetailsModal.js
import React from 'react';
import { 
  XMarkIcon, 
  CalendarIcon, 
  ClockIcon,
  SparklesIcon,
  BuildingStorefrontIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { format, parseISO, differenceInDays, differenceInHours } from 'date-fns';
import { vi } from 'date-fns/locale';

export const PromotionDetailsModal = ({ promotion, isOpen, onClose, getDealersByIds, getModelsByIds }) => {
  if (!isOpen || !promotion) return null;

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

  const getTimeInfo = () => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    if (promotion.status === 'ACTIVE') {
      const daysLeft = differenceInDays(endDate, now);
      const hoursLeft = differenceInHours(endDate, now) % 24;
      
      if (daysLeft < 0) return null;
      
      return {
        type: 'active',
        daysLeft,
        hoursLeft,
      };
    } else if (promotion.status === 'NEAR') {
      const daysUntil = differenceInDays(startDate, now);
      const hoursUntil = differenceInHours(startDate, now) % 24;
      
      if (daysUntil < 0) return null;
      
      return {
        type: 'near',
        daysUntil,
        hoursUntil
      };
    }
    
    return null;
  };

  const timeInfo = getTimeInfo();
  const isActive = promotion.status === 'ACTIVE';
  const isNear = promotion.status === 'NEAR';
  
  // Lấy thông tin dealers và models
  const applicableDealers = getDealersByIds ? getDealersByIds(promotion.dealerIdJson) : [];
  const applicableModels = getModelsByIds ? getModelsByIds(promotion.applicableModelsJson) : [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`p-6 text-white ${isActive ? 'bg-green-600' : 'bg-blue-600'}`}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">
                {promotion.promotionName}
              </h2>
              <div className="flex items-center space-x-2">
                {isActive ? (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    <span className="text-sm">Đang diễn ra</span>
                  </>
                ) : (
                  <>
                    <ClockIcon className="w-4 h-4" />
                    <span className="text-sm">Sắp diễn ra</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded flex items-center justify-center transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Discount */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-2 border">
              <span className="text-2xl font-bold text-gray-800">
                {formatDiscountRate(promotion.discountRate)}
              </span>
            </div>
            <p className="text-sm text-gray-600">Giảm giá</p>
          </div>

          {/* Description */}
          {promotion.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Mô tả</h3>
              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded border">
                {promotion.description}
              </p>
            </div>
          )}

          {/* Áp dụng cho Đại lý */}
          {applicableDealers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <BuildingStorefrontIcon className="w-4 h-4 mr-1" />
                Áp dụng tại đại lý
              </h3>
              <div className="space-y-2">
                {applicableDealers.map(dealer => (
                  <div key={dealer.dealerId} className="bg-blue-50 p-3 rounded border border-blue-100">
                    <div className="font-medium text-sm">{dealer.dealerName}</div>
                    <div className="text-xs text-gray-600 mt-1">{dealer.address}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Áp dụng cho Dòng xe */}
          {applicableModels.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <TruckIcon className="w-4 h-4 mr-1" />
                Dòng xe áp dụng
              </h3>
              <div className="grid gap-2">
                {applicableModels.map(model => (
                  <div key={model.modelId} className="bg-gray-50 p-3 rounded border">
                    <div className="font-medium text-sm">{model.modelName}</div>
                    <div className="text-xs text-gray-600">Hãng: {model.brand}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Thời gian áp dụng</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded border">
                <CalendarIcon className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="text-xs text-gray-600">Bắt đầu</div>
                  <div className="text-sm font-medium">
                    {formatDate(promotion.startDate)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded border">
                <CalendarIcon className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="text-xs text-gray-600">Kết thúc</div>
                  <div className="text-sm font-medium">
                    {formatDate(promotion.endDate)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          {timeInfo && (
            <div className={`p-4 rounded border ${isActive ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-sm font-medium mb-3">
                  <ClockIcon className="w-4 h-4" />
                  <span>
                    {timeInfo.type === 'active' ? 'Kết thúc sau' : 'Bắt đầu sau'}
                  </span>
                </div>
                
                <div className="flex justify-center space-x-4 text-xl font-bold">
                  <div className="text-center">
                    <div className="bg-white px-3 py-2 rounded border min-w-[50px]">
                      {timeInfo.type === 'active' ? timeInfo.daysLeft : timeInfo.daysUntil}
                    </div>
                    <div className="text-xs mt-1">ngày</div>
                  </div>
                  <div className="self-center">:</div>
                  <div className="text-center">
                    <div className="bg-white px-3 py-2 rounded border min-w-[50px]">
                      {timeInfo.type === 'active' ? timeInfo.hoursLeft : timeInfo.hoursUntil}
                    </div>
                    <div className="text-xs mt-1">giờ</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center pt-2">
            <button
              onClick={onClose}
              className="w-full bg-gray-800 text-white py-3 rounded font-medium hover:bg-gray-900 transition-colors"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionDetailsModal;