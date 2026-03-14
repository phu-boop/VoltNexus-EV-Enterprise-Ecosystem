import { Zap } from "lucide-react";

const HeroBanner = () => {
  return (
    <section className="relative bg-gray-900 text-white overflow-hidden min-h-[600px]">
      {/* 1. Background Image với lớp phủ tối màu */}
      <div className="absolute inset-0 z-0">
        <img 
          // Bạn có thể thay link ảnh này bằng ảnh local của bạn
          src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop" 
          alt="Electric Vehicle Background" 
          className="w-full h-full object-cover opacity-50" // Giảm opacity xuống 50 để chữ dễ đọc hơn
        />
        {/* Gradient overlay để làm nổi bật chữ */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/80 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 h-full flex flex-col justify-center">
        <div className="max-w-3xl">
          {/* Badge nhỏ trên cùng */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-8 backdrop-blur-md">
            <Zap className="w-4 h-4 fill-current" />
            <span className="uppercase tracking-wider text-xs">Công nghệ tương lai 2025</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Khám Phá Thế Giới <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
              Xe Điện Đỉnh Cao
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-2xl font-light">
            Hệ thống quản lý đại lý toàn diện. Kết nối khách hàng với những dòng xe điện tiên tiến nhất, vận hành êm ái và kiến tạo tương lai xanh bền vững.
          </p>

          {/* Stats nhỏ bên dưới */}
          <div className="grid grid-cols-3 gap-8 border-t border-white/10 pt-8 max-w-lg">
            <div>
              <p className="text-4xl font-bold text-white mb-1">500+</p>
              <p className="text-sm text-gray-400 uppercase tracking-wider">Km / Lần sạc</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1">15p</p>
              <p className="text-sm text-gray-400 uppercase tracking-wider">Sạc nhanh 80%</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-1">0%</p>
              <p className="text-sm text-gray-400 uppercase tracking-wider">Khí thải CO2</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;