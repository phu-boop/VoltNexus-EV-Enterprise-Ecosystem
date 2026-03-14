import React from 'react';

export const MainContent = ({ children }) => {
  return (
    <main className="flex-1 overflow-y-auto p-4 bg-transparent animate-fadeIn">
      <div className="max-w-8xl mx-auto space-y-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-sm border border-gray-200/60 p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          {children}
        </div>
      </div>
    </main>
  );
};