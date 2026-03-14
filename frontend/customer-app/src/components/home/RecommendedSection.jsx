import { Sparkles, ArrowRight } from "lucide-react";

const marqueeStyle = `
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee {
    animation: marquee 30s linear infinite;
  }
  .animate-marquee:hover {
    animation-play-state: paused;
  }
`;

const RecommendedSection = ({ vehicles = [], onVehicleSelect }) => {
  if (!vehicles || vehicles.length === 0) return null;

  const displayVehicles = [...vehicles, ...vehicles, ...vehicles, ...vehicles];
  
  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    // API trả về giá theo VNĐ, không cần nhân 1000000
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  
  const handleImageError = (e) => { 
    e.target.src = "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000"; 
  };

  return (
    <section className="py-20 bg-gray-50 overflow-hidden relative border-t border-gray-200">
      <style>{marqueeStyle}</style>
      
      <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2 text-blue-600">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-widest">Gợi ý cho bạn</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900">Xe được đề xuất</h2>
        </div>
      </div>

      <div className="w-full relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>

        <div className="flex w-max animate-marquee gap-6 px-6">
          {displayVehicles.map((vehicle, index) => (
            <div 
              key={`${vehicle.id || vehicle.modelId}-${index}`} 
              onClick={() => onVehicleSelect(vehicle)} 
              className="w-[350px] flex-shrink-0 bg-white rounded-2xl p-3 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 cursor-pointer group"
            >
              <div className="relative h-48 rounded-xl overflow-hidden mb-3">
                <img
                  src={vehicle.thumbnailUrl || vehicle.imageUrl || vehicle.image || "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000"}
                  alt={vehicle.modelName || vehicle.name}
                  onError={handleImageError}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">
                  ĐỀ XUẤT
                </div>
              </div>
              
              <div className="px-2">
                <h3 className="font-bold text-gray-900 text-lg truncate">{vehicle.modelName || vehicle.name || "Xe điện"}</h3>
                {vehicle.brand && (
                  <p className="text-xs text-gray-500 mb-1">{vehicle.brand}</p>
                )}
                <div className="flex items-center justify-between text-blue-600 border-t border-gray-50 pt-2 mt-3">
                  <span className="font-extrabold">{formatPrice(vehicle.basePrice || vehicle.price)}</span>
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendedSection;

