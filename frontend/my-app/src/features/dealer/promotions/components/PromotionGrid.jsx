// features/customer/promotions/components/PromotionGrid.js
import React from 'react';
import PromotionCard from './PromotionCard';

export const PromotionGrid = ({ promotions, onViewDetails, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="flex justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="h-5 bg-gray-200 rounded w-4/5 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/5 mb-4"></div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-white rounded-lg border p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎁</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Không có khuyến mãi</h3>
          <p className="text-gray-600 text-sm">
            Hiện tại không có chương trình khuyến mãi nào phù hợp.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {promotions.map((promotion) => (
        <PromotionCard
          key={promotion.promotionId}
          promotion={promotion}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default PromotionGrid;