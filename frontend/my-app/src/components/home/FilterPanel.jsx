import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";

const FilterPanel = ({ onFilterChange }) => {
  // ... (Giữ nguyên logic state cũ) ...

  // Style cho Select Box tối giản
  const selectClass = "w-full bg-transparent border-none text-gray-700 font-medium focus:ring-0 cursor-pointer text-sm appearance-none py-3 pl-2";

  return (
    <div className="relative z-20 max-w-6xl mx-auto px-4 -mt-12 mb-12">
      <div className="bg-white rounded-2xl shadow-2xl shadow-blue-900/10 border border-gray-100 p-2 flex flex-col lg:flex-row items-center gap-2 backdrop-blur-xl bg-white/95">
        
        {/* Label Mobile */}
        <div className="lg:hidden w-full px-4 py-2 font-bold text-gray-700 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" /> Bộ lọc
        </div>

        {/* Các cột Filter - Ngăn cách bằng vạch kẻ dọc */}
        <div className="grid grid-cols-2 lg:grid-cols-4 w-full gap-2 lg:gap-0">
            {/* Price */}
            <div className="relative group px-4 lg:border-r border-gray-100 hover:bg-gray-50 rounded-xl transition-colors">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block pt-2">Mức giá</span>
                <select className={selectClass} onChange={(e) => handleFilterChange('priceRange', e.target.value)}>
                    <option value="">Tất cả mức giá</option>
                    <option value="0-500">Dưới 500 triệu</option>
                    <option value="500-1000">500 - 1 tỷ</option>
                    <option value="1000-2000">1 - 2 tỷ</option>
                    <option value="2000+">Trên 2 tỷ</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 mt-1 pointer-events-none" />
            </div>

            {/* Type */}
            <div className="relative group px-4 lg:border-r border-gray-100 hover:bg-gray-50 rounded-xl transition-colors">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block pt-2">Dòng xe</span>
                <select className={selectClass} onChange={(e) => handleFilterChange('vehicleType', e.target.value)}>
                    <option value="">Tất cả dòng xe</option>
                    <option value="suv">SUV Thể thao</option>
                    <option value="sedan">Sedan Sang trọng</option>
                    <option value="hatchback">Hatchback Đô thị</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 mt-1 pointer-events-none" />
            </div>

            {/* Range */}
            <div className="relative group px-4 lg:border-r border-gray-100 hover:bg-gray-50 rounded-xl transition-colors">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block pt-2">Phạm vi</span>
                <select className={selectClass} onChange={(e) => handleFilterChange('batteryRange', e.target.value)}>
                    <option value="">Mọi phạm vi</option>
                    <option value="0-300">Dưới 300km</option>
                    <option value="300-500">300 - 500km</option>
                    <option value="500+">Trên 500km</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 mt-1 pointer-events-none" />
            </div>
             
             {/* Sort Button Area */}
            <div className="relative group px-2 flex items-center">
                 <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 px-6 font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2">
                    <Search className="w-4 h-4" />
                    Tìm Kiếm
                 </button>
            </div>
        </div>
      </div>
    </div>
  );
};
export default FilterPanel;