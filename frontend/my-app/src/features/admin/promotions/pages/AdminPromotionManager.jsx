// features/admin/promotions/AdminPromotionManager.js
import React, { useState } from 'react';
import PromotionListPage from './PromotionListPage';
import PromotionCreatePage from './PromotionCreatePage';
import PromotionEditPage from './PromotionEditPage';

const AdminPromotionManager = () => {
  const [currentPage, setCurrentPage] = useState('list');
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  const handleCreatePromotion = () => {
    setCurrentPage('create');
  };

  const handleEditPromotion = (promotion) => {
    setSelectedPromotion(promotion);
    setCurrentPage('edit');
  };

  const handleBackToList = () => {
    setCurrentPage('list');
    setSelectedPromotion(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'create':
        return <PromotionCreatePage onBack={handleBackToList} />;
      case 'edit':
        return <PromotionEditPage promotion={selectedPromotion} onBack={handleBackToList} />;
      default:
        return <PromotionListPage onCreate={handleCreatePromotion} onEdit={handleEditPromotion} />;
    }
  };

  return (
    <div className="min-h-screen">

      {/* Main Content */}
      <main>
        {renderPage()}
      </main>
    </div>
  );
};

export default AdminPromotionManager;