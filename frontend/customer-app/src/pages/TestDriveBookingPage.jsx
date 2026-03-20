import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import testDriveService from '../services/testDriveService';
import { getVehicles } from '../services/vehicleService';
import { getAllDealers } from '../services/dealerService';

const TestDriveBookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleIdFromUrl = searchParams.get('vehicleId');

  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [showroomData, setShowroomData] = useState({});
  const [formData, setFormData] = useState({
    vehicleId: vehicleIdFromUrl || '',
    appointmentDate: '',
    appointmentTime: '',
    durationMinutes: 60,
    showroomCity: '',
    showroom: '',
    dealerId: '',
    customerNotes: ''
  });

  // Get customer info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const customerId = user.customerId;

  useEffect(() => {
    loadVehicles();
    loadDealers();
  }, []);

  const loadVehicles = async () => {
    try {
      const response = await getVehicles({ page: 0, size: 100 });
      if (response.code === 200) {
        setVehicles(response.result?.content || []);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const loadDealers = async () => {
    try {
      const response = await getAllDealers();
      if (response && response.data) {
        const allDealers = response.data;
        setDealers(allDealers);

        // Group by city
        const grouped = allDealers.reduce((acc, dealer) => {
          const city = dealer.city || 'Khác';
          if (!acc[city]) {
            acc[city] = [];
          }
          acc[city].push({
            id: dealer.dealerId, // UUID
            name: dealer.dealerName,
            address: dealer.address
          });
          return acc;
        }, {});

        setShowroomData(grouped);
      }
    } catch (error) {
      console.error("Error fetching dealers:", error);
      toast.error("Không thể tải danh sách đại lý");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };

      // Reset showroom when city changes
      if (name === 'showroomCity') {
        newData.showroom = '';
        newData.dealerId = '';
      }

      // Capture dealer UUID when showroom name is selected
      if (name === 'showroom') {
        const cityDealers = showroomData[prev.showroomCity] || [];
        const selectedDealer = cityDealers.find(d => d.name === value);
        if (selectedDealer) {
          newData.dealerId = selectedDealer.id;
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerId) {
      toast.error('Vui lòng đăng nhập để đặt lịch lái thử');
      navigate('/auth/login');
      return;
    }

    // Validate form
    if (!formData.vehicleId || !formData.appointmentDate || !formData.appointmentTime || !formData.dealerId) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc (bao gồm đại lý)');
      return;
    }

    setLoading(true);

    try {
      // Get selected vehicle info
      const selectedVehicle = vehicles.find(v => v.modelId.toString() === formData.vehicleId);
      if (!selectedVehicle) {
        toast.error('Không tìm thấy thông tin xe');
        return;
      }

      // Combine date and time
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);

      const appointmentData = {
        customerId,
        dealerId: formData.dealerId, // Use selected dealer UUID
        modelId: selectedVehicle.modelId,
        variantId: null,
        vehicleModelName: selectedVehicle.modelName,
        vehicleVariantName: null,
        appointmentDate: appointmentDateTime.toISOString(),
        durationMinutes: parseInt(formData.durationMinutes),
        testDriveLocation: formData.showroom, // Use showroom name for location display
        customerNotes: formData.customerNotes
      };

      const response = await testDriveService.createAppointment(appointmentData);
      
      if (response.code === 200) {
        toast.success('Đặt lịch lái thử thành công!');
        navigate('/my-test-drives');
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error booking test drive:', error);
      toast.error('Không thể đặt lịch. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:text-blue-700 mb-6 flex items-center gap-2 transition-colors"
      >
        ← Quay lại
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Đặt lịch lái thử</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn xe <span className="text-red-500">*</span>
            </label>
            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Chọn xe --</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.modelId} value={vehicle.modelId}>
                  {vehicle.modelName} - {vehicle.manufacturer}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleInputChange}
                min={today}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian lái thử
            </label>
            <select
              name="durationMinutes"
              value={formData.durationMinutes}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="30">30 phút</option>
              <option value="60">60 phút</option>
              <option value="90">90 phút</option>
              <option value="120">120 phút</option>
            </select>
          </div>

          {/* Dealer Selection (City & Showroom) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tỉnh/Thành phố <span className="text-red-500">*</span>
              </label>
              <select
                name="showroomCity"
                value={formData.showroomCity}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Chọn Tỉnh/Thành phố --</option>
                {Object.keys(showroomData).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Showroom <span className="text-red-500">*</span>
              </label>
              <select
                name="showroom"
                value={formData.showroom}
                onChange={handleInputChange}
                required
                disabled={!formData.showroomCity}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">-- Chọn Showroom --</option>
                {formData.showroomCity && showroomData[formData.showroomCity]?.map((dealer) => (
                  <option key={dealer.id} value={dealer.name}>
                    {dealer.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              name="customerNotes"
              value={formData.customerNotes}
              onChange={handleInputChange}
              rows="4"
              placeholder="Ghi chú thêm về yêu cầu của bạn..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Đặt lịch'}
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">📋 Lưu ý</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Vui lòng đến đúng giờ đã đặt</li>
          <li>• Mang theo CMND/CCCD và giấy phép lái xe</li>
          <li>• Chúng tôi sẽ liên hệ xác nhận lịch hẹn trong vòng 24h</li>
          <li>• Có thể hủy lịch trước 24h để tránh bị tính phí</li>
        </ul>
      </div>
    </div>
  );
};

export default TestDriveBookingPage;
