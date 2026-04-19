import { useState, useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

// CSS Animation (Bạn có thể để trong file CSS riêng hoặc dùng style tag)
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

const RecommendedSection = ({ vehicles, onVehicleSelect }) => {
  const [activeTab, setActiveTab] = useState('similar');
  
  // Nhân đôi danh sách xe để tạo hiệu ứng chạy vô tận không bị ngắt quãng
  // Nếu list xe ít quá, nhân 3 hoặc 4 lần
  const displayVehicles = [...vehicles, ...vehicles, ...vehicles, ...vehicles]; 

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price * 1000000);
  const handleImageError = (e) => { e.target.src = "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000"; };

  return (
    <section className="py-20 bg-gray-50 overflow-hidden relative border-t border-gray-200">
      <style>{marqueeStyle}</style>
      
      {/* Header Container (Vẫn giữ căn giữa cho gọn) */}
      <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row justify-between items-end">
        <div>
           <div className="flex items-center gap-2 mb-2 text-blue-600">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-widest">AI Recommendation</span>
           </div>
           <h2 className="text-4xl font-black text-gray-900">Gợi ý dành riêng cho bạn</h2>
        </div>
        
        {/* Tabs */}
        <div className="bg-white p-1 rounded-full shadow-sm border border-gray-200 inline-flex">
          {['similar', 'price'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === tab ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab === 'similar' ? 'Cùng phân khúc' : 'Tầm giá tương đương'}
            </button>
          ))}
        </div>
      </div>

      {/* Full Width Slider */}
      <div className="w-full relative">
        {/* Fade Effect ở 2 bên mép để nhìn mượt hơn */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>

        <div className="flex w-max animate-marquee gap-6 px-6">
          {displayVehicles.map((vehicle, index) => (
            <div 
              key={`${vehicle.id}-${index}`} 
              onClick={() => onVehicleSelect(vehicle)} 
              className="w-[350px] flex-shrink-0 bg-white rounded-2xl p-3 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 cursor-pointer group"
            >
              <div className="relative h-48 rounded-xl overflow-hidden mb-3">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  onError={handleImageError}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">
                  TOP MATCH
                </div>
              </div>
              
              <div className="px-2">
                <h3 className="font-bold text-gray-900 text-lg truncate">{vehicle.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{vehicle.version}</p>
                <div className="flex items-center justify-between text-blue-600 border-t border-gray-50 pt-2">
                  <span className="font-extrabold">{formatPrice(vehicle.price)}</span>
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