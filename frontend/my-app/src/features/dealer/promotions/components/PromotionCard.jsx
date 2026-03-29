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
        color: 'sky',
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
    <div className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-1">
      <div className="p-7 relative">
        {/* Top Section: Status & Discount */}
        <div className="flex justify-between items-start mb-6">
          <div className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${statusInfo.color === 'sky'
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            : 'bg-amber-50 text-amber-600 border border-amber-100'
            }`}>
            {statusInfo.label}
          </div>

          <div className="flex flex-col items-end">
            <div className="text-3xl font-black text-gray-900 leading-none">
              {formatDiscountRate(promotion.discountRate)}
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Giảm giá</div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
            {promotion.promotionName}
          </h3>
          {promotion.description && (
            <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed italic">
              "{promotion.description}"
            </p>
          )}
        </div>

        {/* Metadata Section */}
        <div className="space-y-4 py-6 border-y border-gray-50 mb-6">
          <div className="flex items-center group/item">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-3 group-hover/item:bg-blue-50 transition-colors">
              <CalendarIcon className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bắt đầu</span>
              <span className="text-sm font-semibold text-gray-700">{formatDate(promotion.startDate)}</span>
            </div>
          </div>

          <div className="flex items-center group/item">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-3 group-hover/item:bg-rose-50 transition-colors">
              <CalendarIcon className="w-4 h-4 text-gray-400 group-hover/item:text-rose-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">KẾT THÚC</span>
              <span className="text-sm font-semibold text-gray-700">{formatDate(promotion.endDate)}</span>
            </div>
          </div>
        </div>

        {/* Footer Section with Button */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            {statusInfo.type === 'active' && statusInfo.daysLeft > 0 && (
              <div className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                <ClockIcon className="w-3.5 h-3.5 mr-1.5" />
                Còn {statusInfo.daysLeft} ngày
              </div>
            )}
            {statusInfo.type === 'near' && statusInfo.daysUntil > 0 && (
              <div className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                <ClockIcon className="w-3.5 h-3.5 mr-1.5" />
                Dự kiến {statusInfo.daysUntil} ngày nữa
              </div>
            )}
          </div>

          <button
            onClick={() => onViewDetails(promotion)}
            className="p-3 bg-gray-900 group-hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-gray-200 transition-all duration-300"
            title="Xem chi tiết"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionCard;