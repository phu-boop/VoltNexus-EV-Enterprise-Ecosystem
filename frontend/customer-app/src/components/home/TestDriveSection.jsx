import { useState } from "react";
import { Calendar, MapPin, Clock, Car } from "lucide-react";
import Button from "../ui/Button";
import { useAuth } from "../../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const TestDriveSection = () => {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', date: '', time: '', location: '', vehicle: ''
  });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      toast.info("Vui lòng đăng nhập để đặt lịch lái thử");
      navigate("/login");
      return;
    }
    toast.success("Đã gửi yêu cầu đặt lịch lái thử!");
    setFormData({ name: '', phone: '', email: '', date: '', time: '', location: '', vehicle: '' });
  };

  const inputClass = "w-full pl-3 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all";
  const labelClass = "block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5";

  return (
    <section className="my-20">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-5">
          <div className="lg:col-span-2 bg-blue-900 p-10 text-white relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Đăng Ký Lái Thử</h2>
              <p className="text-blue-200 leading-relaxed mb-6">
                Trải nghiệm cảm giác lái phấn khích và công nghệ đỉnh cao trên các dòng xe điện thế hệ mới nhất.
              </p>
              <ul className="space-y-4 text-sm text-blue-100">
                <li className="flex items-center"><div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>Tư vấn 1:1 chuyên sâu</li>
                <li className="flex items-center"><div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>Trải nghiệm full tính năng</li>
                <li className="flex items-center"><div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>Quà tặng khi tham gia</li>
              </ul>
            </div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-800 rounded-full opacity-50"></div>
            <div className="absolute top-10 right-10 opacity-10">
              <Car className="w-40 h-40" />
            </div>
          </div>

          <div className="lg:col-span-3 p-10 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Họ và tên *</label>
                  <input type="text" className={inputClass} placeholder="Nguyễn Văn A" required
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Số điện thoại *</label>
                  <input type="tel" className={inputClass} placeholder="0901234567" required
                    value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <input type="email" className={inputClass} placeholder="email@example.com" required
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Ngày *</label>
                  <input type="date" className={inputClass} required
                    value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Giờ *</label>
                  <input type="time" className={inputClass} required
                    value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} />
                </div>
                <div>
                  <label className={labelClass}>Địa điểm *</label>
                  <input type="text" className={inputClass} placeholder="Showroom Hà Nội" required
                    value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Mẫu xe quan tâm</label>
                <input type="text" className={inputClass} placeholder="EVM X5, EVM S3..."
                  value={formData.vehicle} onChange={(e) => setFormData({...formData, vehicle: e.target.value})} />
              </div>
              <Button type="submit" className="w-full">Gửi Yêu Cầu</Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestDriveSection;

