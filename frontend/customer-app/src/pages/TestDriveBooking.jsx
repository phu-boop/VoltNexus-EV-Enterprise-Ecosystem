import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../auth/AuthProvider";
import Button from "../components/ui/Button";
import apiPublic from "../services/apiPublic";

const TestDriveBooking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { memberId, isAuthenticated } = useAuth();
  const modelId = searchParams.get('modelId');
  const variantId = searchParams.get('variantId');
  const [activeTab, setActiveTab] = useState('car'); // 'car' or 'electric-bike'

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      customerName: '',
      phoneNumber: '',
      email: '',
      city: '',
      detailedAddress: '',
      appointmentDate: '',
      appointmentTime: '',
      durationMinutes: 60,
      notes: '',
      acceptMarketing: false,
      acceptTerms: false,
    }
  });

  const [dealers, setDealers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(modelId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle global wheel event to prioritize form scrolling
  useEffect(() => {
    const handleWheel = (e) => {
      const formElement = document.getElementById('booking-form');
      if (!formElement) return;
      
      const { scrollTop, scrollHeight, clientHeight } = formElement;
      const isAtTop = scrollTop <= 1;
      const isAtBottom = scrollHeight - scrollTop - clientHeight <= 1;
      
      // Scroll form first if it's not at the limit
      if ((e.deltaY > 0 && !isAtBottom) || (e.deltaY < 0 && !isAtTop)) {
        e.preventDefault();
        formElement.scrollTop += e.deltaY;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Mock dealers data (fallback when API fails or requires auth)
  // Using UUID format for dealerId (required by backend BINARY(16) storage)
  const mockDealers = [
    { dealerId: '3ec76f92-7d44-49f4-ada1-b47d4f55b418', id: '3ec76f92-7d44-49f4-ada1-b47d4f55b418', dealerName: 'VinFast Hà Nội', address: '123 Đường ABC, Quận XYZ, Hà Nội', city: 'Hà Nội' },
    { dealerId: '4fc87fa3-8e55-5af5-beb2-c58e5f66c529', id: '4fc87fa3-8e55-5af5-beb2-c58e5f66c529', dealerName: 'VinFast TP.HCM', address: '456 Đường DEF, Quận 1, TP.HCM', city: 'TP.HCM' },
    { dealerId: '5gd98gb4-9f66-6bg6-cfg3-d69f6g77d63a', id: '5gd98gb4-9f66-6bg6-cfg3-d69f6g77d63a', dealerName: 'VinFast Đà Nẵng', address: '789 Đường GHI, Quận Hải Châu, Đà Nẵng', city: 'Đà Nẵng' },
  ];

  // Fetch dealers
  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const response = await apiPublic.get('/dealers/api/dealers');
        // Handle different response structures
        let dealersList = [];
        if (response.data) {
          if (response.data.data && Array.isArray(response.data.data)) {
            dealersList = response.data.data;
          } else if (Array.isArray(response.data)) {
            dealersList = response.data;
          } else if (response.data.success && response.data.data) {
            dealersList = response.data.data;
          }
        }
        
        // Normalize dealer data to have both id and dealerId
        const normalizedDealers = dealersList.map(dealer => ({
          ...dealer,
          id: dealer.id || dealer.dealerId || dealer.dealerId?.toString(),
          dealerId: dealer.dealerId || dealer.id || dealer.id?.toString(),
          dealerName: dealer.dealerName || dealer.name || 'Đại lý',
          address: dealer.address || dealer.location || dealer.city || 'Chưa cập nhật',
        }));
        
        if (normalizedDealers.length > 0) {
          setDealers(normalizedDealers);
        } else {
          setDealers(mockDealers);
        }
      } catch (error) {
        console.error("Error fetching dealers:", error);
        // Use mock data as fallback
        setDealers(mockDealers);
        // Only show error if not 401 (unauthorized is expected for public endpoint)
        if (error.response?.status !== 401) {
          toast.warning("Không thể tải danh sách đại lý từ server. Đang sử dụng danh sách mặc định.");
        }
      }
    };
    fetchDealers();
  }, []);

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await apiPublic.get('/vehicles/vehicle-catalog/models');
        const vehiclesList = response.data?.data?.content || response.data?.content || [];
        setVehicles(vehiclesList);
        
        // Set selected vehicle based on modelId from URL or default
        if (vehiclesList.length > 0) {
          if (modelId) {
            // If modelId is provided in URL, use it
            setSelectedModelId(modelId);
          } else {
            // Otherwise, default to VF3 or first vehicle
            const vf3 = vehiclesList.find(v => v.modelName?.includes('VF 3'));
            const defaultVehicle = vf3 || vehiclesList[0];
            setSelectedModelId(defaultVehicle.modelId.toString());
          }
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        toast.error("Đã xảy ra lỗi khi tải danh sách xe");
      }
    };
    fetchVehicles();
  }, [modelId]);

  const onSubmit = async (data) => {
    if (!selectedModelId) {
      toast.error('Vui lòng chọn mẫu xe');
      return;
    }

    // Validate date and time
    if (!data.appointmentDate) {
      toast.error('Vui lòng chọn ngày');
      return;
    }
    if (!data.appointmentTime) {
      toast.error('Vui lòng chọn giờ');
      return;
    }

    setIsSubmitting(true);
    try {
      // Extract start time from time slot (e.g., "09:00 - 11:00" -> "09:00")
      const startTime = data.appointmentTime.split(' - ')[0];
      
      // Combine date and time - ensure proper format
      const dateTimeString = `${data.appointmentDate}T${startTime}:00`;
      const appointmentDateTime = new Date(dateTimeString);
      
      // Validate the date object
      if (isNaN(appointmentDateTime.getTime())) {
        toast.error('Ngày hoặc giờ không hợp lệ');
        setIsSubmitting(false);
        return;
      }
      
      // Find a dealer in the selected city (use first dealer from that city)
      const dealerInCity = dealers.find(d => d.city === data.city) || dealers[0];
      
      // Find selected vehicle info
      const selectedVehicle = vehicles.find(v => v.modelId === parseInt(selectedModelId));
      
      // Validate dealerId format (must be UUID)
      const dealerIdValue = dealerInCity ? (dealerInCity.dealerId || dealerInCity.id) : mockDealers[0].dealerId;
      
      // Get profileId if user is logged in
      const payload = {
        profileId: isAuthenticated() && memberId ? memberId : null,
        dealerId: dealerIdValue, // Keep as UUID string, don't parse to int
        modelId: parseInt(selectedModelId),
        variantId: variantId ? parseInt(variantId) : null,
        vehicleModelName: selectedVehicle?.modelName || 'Xe điện',
        vehicleVariantName: selectedVehicle?.variantName || null,
        appointmentDate: appointmentDateTime.toISOString(),
        appointmentTime: data.appointmentTime, // Slot string: "09:00 - 11:00"
        durationMinutes: parseInt(data.durationMinutes),
        testDriveLocation: `${data.city} - ${data.detailedAddress}`,
        customerNotes: data.notes || '',
        customerName: data.customerName,
        customerPhone: data.phoneNumber,
        customerEmail: data.email || '',
      };


      // Call customer service to create test drive
      const response = await apiPublic.post('/customers/api/test-drives/public', payload);
      
      toast.success("Đặt lịch lái thử thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.");
      navigate('/');
    } catch (error) {
      console.error("Error booking test drive:", error);
      console.error("Error response:", error.response?.data);
      console.error("Validation errors:", JSON.stringify(error.response?.data?.data, null, 2));
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available time slots - 4 time ranges
  const getTimeSlots = () => {
    return [
      '09:00 - 11:00',
      '11:00 - 13:00',
      '13:00 - 15:00',
      '15:00 - 17:00'
    ];
  };

  const selectedDate = watch('appointmentDate');
  const minDate = new Date().toISOString().split('T')[0];

  // Watch all form fields for validation
  const watchedFields = watch();
  const isFormValid = 
    watchedFields.customerName && 
    watchedFields.phoneNumber && 
    watchedFields.city && 
    watchedFields.detailedAddress && 
    watchedFields.appointmentDate && 
    watchedFields.appointmentTime && 
    selectedModelId && 
    watchedFields.acceptTerms;

  // Vietnamese cities
  const cities = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 
    'An Giang', 'Bà Rịa-Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
    'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
    'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
    'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
    'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
    'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
    'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
    'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
    'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
    'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
    'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
    'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
  ];

  return (
    <div 
      className="min-h-screen" 
      style={{ backgroundColor: '#F8F9FA' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-700 mb-6 flex items-center gap-2 transition-colors"
        >
          ← Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Side - Vehicle Image */}
          <div className="hidden lg:flex items-center justify-center rounded-2xl p-8 min-h-[500px] pt-40">
            <div className="w-full max-w-5xl flex items-center justify-center">
              {selectedModelId && vehicles.length > 0 ? (
                <img 
                  src={vehicles.find(v => v.modelId === parseInt(selectedModelId))?.thumbnailUrl || 'https://via.placeholder.com/500x350'}
                  alt={vehicles.find(v => v.modelId === parseInt(selectedModelId))?.modelName || 'Vehicle'}
                  className="w-full h-auto object-contain max-h-[700px]"
                />
              ) : (
                <img 
                  src="https://via.placeholder.com/500x350"
                  alt="VinFast Vehicle"
                  className="w-full h-auto object-contain max-h-[700px]"
                />
              )}
            </div>
          </div>

          {/* Right Side - Form */}
          <div 
            id="booking-form"
            className="bg-white shadow-xl p-8 max-h-[calc(100vh-100px)] overflow-y-auto"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">ĐĂNG KÝ LÁI THỬ</h1>
              <p className="text-sm text-gray-600">
                Để đăng ký lái thử, Quý khách cần cung cấp giấy phép lái xe cho VinFast
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('car')}
                className={`flex-1 py-3 text-center font-medium transition-colors ${
                  activeTab === 'car'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Xe ôtô
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* THÔNG TIN KHÁCH HÀNG */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Thông tin khách hàng</h3>
                
                <div className="space-y-4">
                  <div>
                    <input
                      {...register('customerName', { 
                        required: 'Vui lòng nhập họ và tên',
                        minLength: { value: 2, message: 'Tên phải có ít nhất 2 ký tự' }
                      })}
                      type="text"
                      placeholder="Họ và tên Quý khách *"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    {errors.customerName && (
                      <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        {...register('phoneNumber', {
                          required: 'Vui lòng nhập số điện thoại',
                          pattern: {
                            value: /^[0-9]{10,11}$/,
                            message: 'Số điện thoại không hợp lệ'
                          }
                        })}
                        type="tel"
                        placeholder="Số điện thoại *"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      {errors.phoneNumber && (
                        <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>
                      )}
                    </div>

                    <div>
                      <input
                        {...register('email', {
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email không hợp lệ'
                          }
                        })}
                        type="email"
                        placeholder="Email *"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* LỰA CHỌN MẪU XE */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Lựa chọn mẫu xe</h3>
                <div>
                  <select
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  >
                    <option value="">Mẫu xe *</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.modelId} value={vehicle.modelId}>
                        {vehicle.modelName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* LỰA CHỌN THỜI GIAN */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Lựa chọn thời gian</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      {...register('appointmentDate', {
                        required: 'Vui lòng chọn ngày',
                        validate: (value) => {
                          const selected = new Date(value);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return selected >= today || 'Ngày hẹn phải là hôm nay hoặc sau đó';
                        }
                      })}
                      type="date"
                      min={minDate}
                      placeholder="Ngày *"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    {errors.appointmentDate && (
                      <p className="text-red-500 text-xs mt-1">{errors.appointmentDate.message}</p>
                    )}
                  </div>

                  <div>
                    <select
                      {...register('appointmentTime', { required: 'Vui lòng chọn giờ' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">Giờ *</option>
                      {getTimeSlots().map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    {errors.appointmentTime && (
                      <p className="text-red-500 text-xs mt-1">{errors.appointmentTime.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* LỰA CHỌN ĐỊA ĐIỂM */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Lựa chọn địa điểm</h3>
                <div className="space-y-4">
                  <div>
                    <select
                      {...register('city', { required: 'Vui lòng chọn tỉnh thành' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">Tỉnh thành *</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <textarea
                        {...register('detailedAddress', { 
                          required: 'Vui lòng nhập địa chỉ chi tiết',
                          maxLength: { value: 200, message: 'Địa chỉ không quá 200 ký tự' }
                        })}
                        placeholder="Địa chỉ chi tiết *"
                        rows="3"
                        maxLength={200}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                      />
                      <span className="absolute bottom-2 right-3 text-xs text-gray-400">
                        {watch('detailedAddress')?.length || 0}/200
                      </span>
                    </div>
                    {errors.detailedAddress && (
                      <p className="text-red-500 text-xs mt-1">{errors.detailedAddress.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* YÊU CẦU KHÁC */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Yêu cầu khác</h3>
                <div className="relative">
                  <textarea
                    {...register('notes', { 
                      maxLength: { value: 50, message: 'Ghi chú không quá 50 ký tự' }
                    })}
                    placeholder="Ghi yêu cầu của Quý khách tại đây"
                    rows="3"
                    maxLength={50}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  />
                  <span className="absolute bottom-2 right-3 text-xs text-gray-400">
                    {watch('notes')?.length || 0}/50
                  </span>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    {...register('acceptMarketing')}
                    type="checkbox"
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-600">
                    Đăng ký nhận thông tin chương trình khuyến mãi, dịch vụ từ VinFast.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    {...register('acceptTerms', { required: 'Vui lòng đồng ý điều khoản' })}
                    type="checkbox"
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-600">
                    Tôi đồng ý cho phép Công ty TNHH Kinh doanh Thương mại và Dịch vụ VinFast xử lý dữ liệu cá nhân của tôi với các mục đích theo nội dung tại lời văn các điều khoản của Hợp đồng mua bán xe và điều khoản cung cấp các công cụ, dịch vụ và theo phương thức đã nêu tại{' '}
                    <a href="#" className="text-blue-600 hover:underline">Chính sách Bảo mật Dữ liệu cá nhân</a>.
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="text-red-500 text-xs mt-1">{errors.acceptTerms.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className={`w-full font-semibold py-3 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isFormValid && !isSubmitting
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'ĐANG GỬI...' : 'ĐĂNG KÝ LÁI THỬ'}
              </button>

              {/* Hotline Footer */}
              <div className="text-center pt-4 border-t">
                <p className="text-xs text-gray-600">
                  Mọi thắc mắc xin liên hệ - <span className="font-semibold">HOTLINE</span> -{' '}
                  <a href="tel:1900232389" className="text-blue-600 font-semibold hover:underline">
                    1900 23 23 89
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDriveBooking;