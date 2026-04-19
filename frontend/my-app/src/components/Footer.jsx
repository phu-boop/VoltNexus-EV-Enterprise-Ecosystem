import { Phone, Mail, MapPin, Facebook, Youtube, Instagram, Car } from "lucide-react";

const Footer = () => {
  return (
    // Sử dụng gradient nền từ đen xám sang đen tuyền để tạo chiều sâu thay vì viền
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Thông tin đại lý */}
          <div className="space-y-6 col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 text-white mb-4">
                <div className="bg-blue-900/30 p-2 rounded-lg">
                  <Car className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <span className="text-2xl font-extrabold tracking-tight block leading-none">EVDMS</span>
                  <span className="text-[10px] text-blue-300 uppercase tracking-widest font-semibold">Dealer System</span>
                </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed pr-4">
              Hệ thống quản lý đại lý xe điện hàng đầu Việt Nam. Tiên phong công nghệ xanh, hướng tới tương lai bền vững.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="#" className="p-2.5 bg-white/5 rounded-full hover:bg-blue-600 text-gray-400 hover:text-white transition-all duration-300"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="p-2.5 bg-white/5 rounded-full hover:bg-red-600 text-gray-400 hover:text-white transition-all duration-300"><Youtube className="w-5 h-5" /></a>
              <a href="#" className="p-2.5 bg-white/5 rounded-full hover:bg-pink-600 text-gray-400 hover:text-white transition-all duration-300"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Các cột liên kết */}
          <div className="grid grid-cols-2 md:grid-cols-3 col-span-1 md:col-span-3 gap-8">
              {/* Liên hệ */}
              <div>
                <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Liên hệ</h4>
                <div className="space-y-4 text-sm font-medium">
                  <a href="tel:19001234" className="flex items-center gap-3 hover:text-blue-400 transition-colors group">
                    <Phone className="w-4 h-4 text-blue-500 group-hover:text-blue-400" />
                    <span>1900 1234</span>
                  </a>
                  <a href="mailto:contact@evmotors.vn" className="flex items-center gap-3 hover:text-blue-400 transition-colors group">
                    <Mail className="w-4 h-4 text-blue-500 group-hover:text-blue-400" />
                    <span>contact@evmotors.vn</span>
                  </a>
                  <div className="flex items-start gap-3 group">
                    <MapPin className="w-4 h-4 text-blue-500 mt-1 group-hover:text-blue-400" />
                    <span className="text-gray-400 leading-relaxed">
                      123 Trần Duy Hưng, Hà Nội<br />
                      456 Nguyễn Văn Linh, TP.HCM
                    </span>
                  </div>
                </div>
              </div>

              {/* Đường dẫn nhanh */}
              <div>
                <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Đường dẫn nhanh</h4>
                <ul className="space-y-3 text-sm font-medium">
                  <li><a href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all duration-300 inline-block">Chính sách bảo mật</a></li>
                  <li><a href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all duration-300 inline-block">Điều khoản sử dụng</a></li>
                  <li><a href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all duration-300 inline-block">Chính sách bảo hành</a></li>
                  <li><a href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all duration-300 inline-block">Tuyển dụng</a></li>
                </ul>
              </div>

              {/* Hỗ trợ */}
              <div>
                <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Hỗ trợ khách hàng</h4>
                <ul className="space-y-3 text-sm font-medium">
                  <li><a href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all duration-300 inline-block">Hướng dẫn mua hàng</a></li>
                  <li><a href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all duration-300 inline-block">Câu hỏi thường gặp</a></li>
                  <li><a href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all duration-300 inline-block">Đăng ký lái thử</a></li>
                  <li><a href="#" className="hover:text-blue-400 hover:translate-x-1 transition-all duration-300 inline-block">Liên hệ hỗ trợ</a></li>
                </ul>
              </div>
          </div>
        </div>

        {/* Copyright Section - Đã bỏ viền, dùng padding để tách biệt */}
        <div className="pt-8 mt-8 text-center">
          <p className="text-gray-500 text-sm font-medium">
            © 2024 Electric Vehicle Dealer Management System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;