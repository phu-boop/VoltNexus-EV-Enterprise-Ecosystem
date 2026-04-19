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
  const applicableDealers = getDealersByIds ? getDealersByIds(promotion.applicableDealers) : [];
  const applicableModels = getModelsByIds ? getModelsByIds(promotion.applicableModels) : [];

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-500">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-white/20 flex flex-col">
        {/* Header Section */}
        <div className={`relative p-8 pb-12 overflow-hidden ${isActive ? 'bg-emerald-600' : 'bg-blue-600'}`}>
          {/* Abstract Background Decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>

          <div className="relative flex justify-between items-start">
            <div className="flex-1 pr-8">
              <div className="flex items-center space-x-2 mb-3">
                <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-widest text-white border border-white/20">
                  {isActive ? 'Đang hoạt động' : 'Sắp diễn ra'}
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
                {promotion.promotionName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center transition-all duration-300 group"
            >
              <XMarkIcon className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative -mt-6 bg-white rounded-t-[2.5rem] p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
          {/* Discount Highlight */}
          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100">
                <SparklesIcon className={`w-7 h-7 ${isActive ? 'text-emerald-500' : 'text-blue-500'}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mức ưu đãi cực lớn</span>
                <span className="text-lg font-black text-gray-900">Giảm giá trực tiếp</span>
              </div>
            </div>
            <div className="text-4xl font-black text-blue-600">
              {formatDiscountRate(promotion.discountRate)}
            </div>
          </div>

          {/* Description */}
          {promotion.description && (
            <div className="space-y-3">
              <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                <div className="w-1 h-4 bg-blue-500 rounded-full mr-2"></div>
                Thông tin chương trình
              </div>
              <div className="text-gray-600 text-sm leading-relaxed bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50 italic">
                "{promotion.description}"
              </div>
            </div>
          )}

          {/* Applicable Dealers */}
          {applicableDealers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                <BuildingStorefrontIcon className="w-4 h-4 mr-2 text-blue-500" />
                Địa điểm áp dụng ({applicableDealers.length})
              </div>
              <div className="grid gap-3">
                {applicableDealers.map(dealer => (
                  <div key={dealer.dealerId} className="group bg-white p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
                    <div className="font-bold text-gray-800 text-sm mb-1">{dealer.dealerName}</div>
                    <div className="text-xs text-gray-400 font-medium leading-normal">{dealer.address}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Applicable Models */}
          {applicableModels.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                <TruckIcon className="w-4 h-4 mr-2 text-emerald-500" />
                Dòng xe được ưu đãi
              </div>
              <div className="grid grid-cols-2 gap-3">
                {applicableModels.map(model => (
                  <div key={model.modelId} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="font-bold text-gray-800 text-sm">{model.modelName}</div>
                    <div className="text-[10px] font-bold text-blue-500 uppercase mt-1 tracking-tighter">{model.brand}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline & Countdown */}
          <div className="space-y-4">
            <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
              <CalendarIcon className="w-4 h-4 mr-2 text-rose-500" />
              Lịch trình sự kiện
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-gray-100">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Ngày bắt đầu</span>
                <span className="text-sm font-bold text-gray-800">{formatDate(promotion.startDate)}</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-100">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Ngày kết thúc</span>
                <span className="text-sm font-bold text-gray-800">{formatDate(promotion.endDate)}</span>
              </div>
            </div>

            {timeInfo && (
              <div className={`p-6 rounded-3xl border ${isActive ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`}>
                <div className="flex flex-col items-center">
                  <div className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${isActive ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {timeInfo.type === 'active' ? 'Chương trình sẽ kết thúc trong' : 'Chương trình sẽ bắt đầu sau'}
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex flex-col items-center">
                      <div className="text-3xl font-black text-gray-900">{timeInfo.type === 'active' ? timeInfo.daysLeft : timeInfo.daysUntil}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Ngày</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-300 mt-[-10px]">:</div>
                    <div className="flex flex-col items-center">
                      <div className="text-3xl font-black text-gray-900">{timeInfo.type === 'active' ? timeInfo.hoursLeft : timeInfo.hoursUntil}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Giờ</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 sticky bottom-0 bg-white/80 backdrop-blur-md pb-2">
            <button
              onClick={onClose}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-gray-200"
            >
              Tôi đã hiểu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionDetailsModal;