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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Khuyến mãi</h1>
              <p className="text-sm text-gray-600 mt-1">Xem và tạo chương trình khuyến mãi</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentPage('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'list' 
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                📋 Danh sách
              </button>
              <button
                onClick={handleCreatePromotion}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'create'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                ➕ Tạo mới
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {renderPage()}
      </main>
    </div>
  );
}

export default MainPromotion;