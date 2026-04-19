// MainPromotion.js
import React, { useState } from 'react';
import PromotionListPage from './PromotionListPage';
import PromotionCreatePage from './PromotionCreatePage';
import PromotionEditPage from './PromotionEditPage';

function MainPromotion() {
  const [currentPage, setCurrentPage] = useState('list');
  const [editingPromotion, setEditingPromotion] = useState(null);

  const handleCreatePromotion = () => {
    setCurrentPage('create');
  };

  const handleEditPromotion = (promotion) => {
    setEditingPromotion(promotion);
    setCurrentPage('edit');
  };

  const handleBackToList = () => {
    setEditingPromotion(null);
    setCurrentPage('list');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'create':
        return <PromotionCreatePage onBack={handleBackToList} />;
      case 'edit':
        return <PromotionEditPage promotion={editingPromotion} onBack={handleBackToList} />;
      default:
        return <PromotionListPage onCreate={handleCreatePromotion} onEdit={handleEditPromotion} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderPage()}
    </div>
  );
}

export default MainPromotion;