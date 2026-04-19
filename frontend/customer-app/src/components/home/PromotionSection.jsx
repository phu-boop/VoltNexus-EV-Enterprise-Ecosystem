import { Clock, ArrowUpRight } from "lucide-react";

const PromotionSection = ({ promotions = [] }) => {
  // Default promotions if API returns empty
  const defaultPromotions = [
    { 
      id: 1, 
      title: "Ưu Đãi Mùa Lễ Hội", 
      description: "Giảm trực tiếp 50 Triệu & Gói phụ kiện.", 
      expiry: "31/12/2024", 
      badge: "HOT DEAL", 
      color: "from-orange-500 to-red-600" 
    },
    { 
      id: 2, 
      title: "Lãi Suất 0% / 24 Tháng", 
      description: "Sở hữu xe ngay chỉ với 20% trả trước.", 
      expiry: "30/11/2024", 
      badge: "TÀI CHÍNH", 
      color: "from-blue-500 to-indigo-600" 
    },
    { 
      id: 3, 
      title: "Đặc Quyền Chủ Xe", 
      description: "Tặng trạm sạc tại nhà & 1 năm sạc free.", 
      expiry: "15/12/2024", 
      badge: "QUÀ TẶNG", 
      color: "from-emerald-500 to-teal-600" 
    }
  ];

  const displayPromotions = promotions.length > 0 ? promotions : defaultPromotions;

  return (
    <section className="w-screen relative left-[calc(-50vw+50%)] py-24 bg-gray-900 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 tracking-tight">
            Ưu Đãi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Độc Quyền</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Cơ hội vàng sở hữu những mẫu xe điện hàng đầu với chính sách giá và quà tặng tốt nhất trong năm 2024.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayPromotions.map((promo) => (
            <div key={promo.id} className="group relative bg-gray-800/40 backdrop-blur-md rounded-3xl border border-gray-700 hover:border-gray-500 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/20">
              <div className="h-full p-8 flex flex-col relative overflow-hidden rounded-3xl">
                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${promo.color || 'from-blue-500 to-indigo-600'} opacity-0 blur-[60px] group-hover:opacity-30 transition-opacity duration-500`}></div>

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r ${promo.color || 'from-blue-500 to-indigo-600'} text-white shadow-lg`}>
                    {promo.badge || "KHUYẾN MÃI"}
                  </span>
                  <div className="flex items-center text-xs font-medium text-gray-400 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-700">
                    <Clock className="w-3 h-3 mr-2" /> {promo.expiry || "Không giới hạn"}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3 leading-tight group-hover:text-blue-200 transition-colors">
                  {promo.title || promo.name || "Ưu đãi đặc biệt"}
                </h3>
                <p className="text-gray-400 mb-8 leading-relaxed text-sm">
                  {promo.description || promo.details || ""}
                </p>
                
                <div className="mt-auto relative z-10">
                  <button className="w-full bg-white text-gray-900 hover:bg-blue-500 hover:text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center group/btn shadow-lg">
                    Nhận Ưu Đãi 
                    <ArrowUpRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromotionSection;

