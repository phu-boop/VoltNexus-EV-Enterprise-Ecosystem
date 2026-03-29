// MainPromotion.js
import React, { useState } from 'react';
import PromotionListPage from './PromotionListPage';
import PromotionCreatePage from './PromotionCreatePage';

function MainPromotion() {
  const [currentPage, setCurrentPage] = useState('list');

  const handleCreatePromotion = () => {
    setCurrentPage('create');
  };

  const handleBackToList = () => {
    setCurrentPage('list');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'create':
        return <PromotionCreatePage onBack={handleBackToList} />;
      default:
        return <PromotionListPage onCreate={handleCreatePromotion} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderPage()}
    </div>
  );
}

export default MainPromotion;