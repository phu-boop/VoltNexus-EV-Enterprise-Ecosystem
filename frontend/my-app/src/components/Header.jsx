import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../features/auth/AuthProvider.jsx";
import { logout as ApiLogout } from "../features/auth/services/authService.js";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { Car, User, LogOut, LogIn, Sparkles } from "lucide-react";

const Header = () => {
    const [token, setToken] = useState(sessionStorage.getItem("token"));
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuthContext();

    // Hiệu ứng đổi màu khi cuộn trang
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handelOnclickLogout = async () => {
        // ... (Giữ nguyên logic cũ của bạn) ...
        // Để ngắn gọn tôi ẩn phần logic Swal đi nhé, bạn cứ giữ nguyên code logic cũ
        const result = await Swal.fire({ title: 'Đăng xuất?', icon: 'warning', showCancelButton: true });
        if (result.isConfirmed) { await ApiLogout(); logout(); navigate("/login"); setToken(null); }
    };

    return (
        <header 
            className={`sticky top-0 z-50 transition-all duration-300 border-b ${
                scrolled 
                ? "bg-white/80 backdrop-blur-md border-gray-200 shadow-lg py-2" 
                : "bg-transparent border-transparent py-4"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                
                {/* Logo Area - Ấn tượng hơn */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                        scrolled ? "bg-blue-600 shadow-blue-500/30 shadow-lg" : "bg-white shadow-lg"
                    }`}>
                        <Car className={`w-6 h-6 ${scrolled ? "text-white" : "text-blue-600"}`} />
                    </div>
                    <div className="flex flex-col">
                        <span className={`font-black text-2xl leading-none tracking-tight ${
                            scrolled ? "text-gray-900" : "text-white" // Chữ trắng khi ở trên Hero, đen khi cuộn
                        }`}>
                            EVDMS
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                            scrolled ? "text-blue-600" : "text-blue-200"
                        }`}>
                            Dealer System
                        </span>
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-6">
                    {/* ... Menu Links ... */}
                    
                    {token ? (
                        <div className="flex items-center gap-4">
                            {/* User Logged in UI */}
                        </div>
                    ) : (
                        <Link 
                            to="/login" 
                            className="relative group flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-white transition-all overflow-hidden shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(37,99,235,0.8)]"
                        >
                            {/* Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_100%] animate-gradient group-hover:bg-[length:100%_100%] transition-all"></div>
                            <span className="relative flex items-center gap-2">
                                <LogIn className="w-4 h-4" /> Đăng nhập
                            </span>
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;