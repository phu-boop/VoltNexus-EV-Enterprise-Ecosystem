import React from "react";
import ReactDOM from "react-dom";
import { FiX, FiCheck, FiInfo, FiActivity, FiZap, FiBattery, FiClock, FiMaximize2 } from "react-icons/fi";

// Định dạng tiền tệ
const formatPrice = (price) => {
  if (price == null) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Định dạng trạng thái kho
const formatStockStatus = (inventory) => {
  if (!inventory) return <span className="text-slate-400 font-medium italic text-xs">N/A</span>;

  if (inventory.dealerStockAvailable > 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200 shadow-sm shadow-blue-500/10">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
        <span className="text-[10px] font-bold uppercase tracking-tight">Sẵn tại đại lý ({inventory.dealerStockAvailable})</span>
      </div>
    );
  }
  if (inventory.centralStockAvailable > 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-700 rounded-full border border-slate-200 shadow-sm">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
        <span className="text-[10px] font-bold uppercase tracking-tight">Tại kho hãng ({inventory.centralStockAvailable})</span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-400 rounded-full border border-slate-100 italic">
      <span className="text-[10px] font-bold uppercase tracking-tight">Hết hàng</span>
    </div>
  );
};

// Component Modal
const CompareModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || data.length === 0) return null;

  // Lấy danh sách các thuộc tính để so sánh
  const features = [
    { label: "Giá bán lẻ", key: "price", icon: <FiZap size={14} />, format: (val) => formatPrice(val) },
    {
      label: "Công suất",
      key: "motorPower",
      icon: <FiActivity size={14} />,
      format: (val) => (val != null ? `${val} W` : "N/A"),
    },
    {
      label: "Dung lượng pin",
      key: "batteryCapacity",
      icon: <FiBattery size={14} />,
      format: (val) => (val != null ? `${val} kWh` : "N/A"),
    },
    {
      label: "Quãng đường",
      key: "rangeKm",
      icon: <FiMaximize2 size={14} />,
      format: (val) => (val != null ? `${val} km` : "N/A"),
    },
    {
      label: "Thời gian sạc",
      key: "chargingTime",
      icon: <FiClock size={14} />,
      format: (val) => (val != null ? `${val} giờ` : "N/A"),
    },
  ];

  const portalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center animate-in fade-in duration-300">
      {/* Overlay backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden border border-white/20 animate-in slide-in-from-bottom-8 duration-500">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center p-5 bg-white border-b border-slate-100 shrink-0">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-1 block">Bảng so sánh</span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">Comparison <span className="font-thin text-slate-400 not-italic ml-2">Spec-Check</span></h2>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-blue-50 rounded-2xl text-slate-400 hover:text-blue-600 transition-all active:scale-90 shadow-sm"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Bảng so sánh content */}
        <div className="flex-1 overflow-auto custom-scrollbar bg-white">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-20 shadow-sm">
              <tr className="bg-white">
                <th className="p-5 text-left w-56 sticky left-0 z-30 bg-white">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Lựa chọn</p>
                    <p className="text-xl font-black text-slate-900 leading-tight">Cấu hình xe</p>
                  </div>
                </th>
                {data.map((item) => (
                  <th key={item.details.variantId} className="p-5 min-w-[240px]">
                    <div className="relative group w-full max-w-[200px] mx-auto">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-4 shadow-md shadow-slate-200 group-hover:shadow-lg transition-all duration-500">
                        <img
                          src={item.details.imageUrl || "https://placehold.co/800x600/f8fafc/cbd5e0?text=Vehicle"}
                          alt={item.details.versionName}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="text-center">
                        <span className="inline-block px-3 py-1 bg-blue-50 rounded-full text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3">
                          {item.details.brand || "E-Nexus"}
                        </span>
                        <p className="text-2xl font-black text-slate-900 leading-tight mb-1">
                          {item.details.modelName}
                        </p>
                        <p className="text-sm font-bold text-slate-400 italic">
                          {item.details.versionName}
                        </p>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {/* Warehouse row */}
              <tr className="bg-slate-50/50">
                <td className="p-5 font-bold text-xs uppercase tracking-widest text-slate-400 sticky left-0 z-10 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                    Phân phối
                  </div>
                </td>
                {data.map((item) => (
                  <td key={item.details.variantId} className="p-5 text-center bg-white/50 backdrop-blur-sm">
                    {formatStockStatus(item.inventory)}
                  </td>
                ))}
              </tr>

              {/* Data rows */}
              {features.map((feature) => (
                <tr key={feature.key} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5 font-bold text-slate-600 text-sm sticky left-0 z-10 bg-white group-hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-slate-300 group-hover:text-blue-500 transition-colors">{feature.icon}</div>
                      {feature.label}
                    </div>
                  </td>
                  {data.map((item) => (
                    <td
                      key={item.details.variantId}
                      className="p-5 text-center font-black text-xl text-slate-800 tracking-tighter"
                    >
                      {feature.format(item.details[feature.key])}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Features list row */}
              <tr className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-5 font-bold text-slate-600 text-sm align-top sticky left-0 z-10 bg-white group-hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="text-slate-300 group-hover:text-blue-500 transition-colors"><FiInfo size={14} /></div>
                    Trang bị & Tiện nghi
                  </div>
                </td>
                {data.map((item) => (
                  <td
                    key={item.details.variantId}
                    className="p-5 space-y-3 align-top bg-white group-hover:bg-slate-50/50 transition-colors"
                  >
                    {item.details.features?.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {item.details.features.map((f) => (
                          <div key={f.featureId} className="flex items-start gap-2 bg-slate-50/50 rounded-xl p-3 border border-slate-100 hover:bg-white hover:border-blue-100 transition-all shadow-sm shadow-slate-200/40">
                            <FiCheck className="mt-1 text-blue-500 shrink-0" size={14} />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-700 leading-tight">
                                {f.featureName}
                              </span>
                              {!f.standard && (
                                <span className="text-[10px] font-medium text-slate-400 italic">
                                  Tùy chọn (+{formatPrice(f.additionalCost)})
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center italic text-slate-300 text-xs font-medium">
                        Không có thông tin trang bị.
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Footer actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            Đóng bảng so sánh
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(portalContent, document.body);
};

export default CompareModal;
