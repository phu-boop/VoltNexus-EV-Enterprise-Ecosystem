import React from "react";
import { FiCheckSquare, FiSquare, FiPlus, FiMaximize2, FiChevronRight, FiCheck } from "react-icons/fi";

const AvailableVehicleCard = ({
  vehicle,
  onViewDetails,
  onCreateQuote,
  onCompareToggle,
  isCompared,
}) => {
  const imageUrl = vehicle.imageUrl
    ? vehicle.imageUrl
    : `https://placehold.co/800x600/f8fafc/cbd5e0?text=${vehicle.modelName}`;

  // Xử lý sự kiện nhấn nút so sánh
  const handleCompareClick = (e) => {
    e.stopPropagation();
    // Gửi đi một đối tượng đơn giản mà CompareTray cần
    onCompareToggle({
      variantId: vehicle.variantId,
      versionName: vehicle.versionName,
      imageUrl: imageUrl,
    });
  };
  return (
    <div className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 overflow-hidden flex flex-col relative">
      {/* Compare Badge */}
      <div 
        onClick={handleCompareClick}
        className={`absolute top-4 right-4 z-10 p-2.5 rounded-2xl cursor-pointer transition-all duration-300 ${
          isCompared 
            ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110" 
            : "bg-white/90 backdrop-blur-md text-slate-400 hover:text-blue-500 shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
        }`}
      >
        {isCompared ? <FiCheck size={18} /> : <FiPlus size={18} />}
      </div>

      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        <img
          src={imageUrl}
          alt={`${vehicle.modelName} ${vehicle.versionName}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            e.target.src = `https://placehold.co/800x600/f8fafc/cbd5e0?text=${vehicle.modelName}`;
          }}
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button 
            onClick={() => onViewDetails(vehicle.variantId)}
            className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-slate-800 shadow-lg translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:bg-white"
          >
            <FiMaximize2 size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col grow">
        <div className="mb-2">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-lg">
            {vehicle.brand || "E-Series"}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
          {vehicle.modelName}
        </h3>
        <p className="text-sm font-medium text-slate-500 mb-4">{vehicle.versionName}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#1A202C" }}></div>
            <span className="text-xs text-slate-600 font-semibold">{vehicle.color}</span>
          </div>
          <div className="flex items-center px-3 py-1 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-400">
            {vehicle.skuCode}
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-tighter">Sẵn sàng bán</span>
            </div>
            <p className="text-3xl font-black text-slate-800 tracking-tighter">
              {vehicle.availableQuantity}
              <span className="text-sm font-medium text-slate-400 ml-1">xe</span>
            </p>
          </div>

          <button
            onClick={() => onCreateQuote(vehicle.variantId)}
            className="relative px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 group/btn overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Tạo báo giá
              <FiChevronRight className="transition-transform group-hover/btn:translate-x-1" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailableVehicleCard;
