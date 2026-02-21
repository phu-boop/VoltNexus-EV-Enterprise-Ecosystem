import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, CheckCircle, ChevronUp, ChevronDown } from "lucide-react";
import { getVehicleById, getVariants, getVehicles } from "../services/vehicleService";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";
import { initiateVNPayBooking } from "../services/paymentService";
import api from "../services/api";
import { createCustomer } from "../services/customerService";

const BookingPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'service'
  const [currentStep, setCurrentStep] = useState(1); // 1: Lựa chọn xe, 2: Nhập thông tin, 3: Đặt cọc xe
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedInterior, setSelectedInterior] = useState(null);
  const [rotation, setRotation] = useState(0);
  const vehicleListRef = useRef(null);
  const sidebarRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerId, setCustomerId] = useState(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch or create customer record if user is logged in
    const fetchOrCreateCustomer = async () => {
      const memberId = sessionStorage.getItem('memberId');
      if (!memberId) return;

      try {
        // Try to fetch existing customer by profileId
        const response = await api.get(`/customers/profile/${memberId}`);
        if (response.data?.data?.customerId) {
          setCustomerId(response.data.data.customerId);
          return;
        }
      } catch (error) {
        // Customer not found (404) or database error (500)
        if (error.response?.status === 404 || error.response?.status === 500) {
          // Customer not found or error, create new one
          try {
            // Get user info from sessionStorage
            const userEmail = sessionStorage.getItem('email');
            const userName = sessionStorage.getItem('name') || sessionStorage.getItem('fullName') || 'Customer';
            const userPhone = sessionStorage.getItem('phone') || '';
            
            // Validate required fields
            if (!userEmail) {
              console.warn('Cannot create customer: email is required');
              return;
            }
            
            // Parse name into firstName and lastName
            const nameParts = userName.trim().split(' ');
            let firstName, lastName;
            
            if (nameParts.length === 1) {
              firstName = nameParts[0];
              lastName = nameParts[0]; // Use same as first name if no last name
            } else {
              lastName = nameParts[nameParts.length - 1];
              firstName = nameParts.slice(0, -1).join(' ');
            }

            // Create customer with profileId
            const newCustomerData = {
              firstName: firstName || 'Customer',
              lastName: lastName || 'User',
              email: userEmail,
              phone: userPhone || '',
              customerType: 'INDIVIDUAL',
              status: 'NEW',
              profileId: memberId
            };

            const createResponse = await api.post('/customers', newCustomerData);
            
            if (createResponse.data?.data?.customerId) {
              setCustomerId(createResponse.data.data.customerId);
              toast.success('Đã tạo hồ sơ khách hàng thành công!');
            }
          } catch (createError) {
            console.error('Error creating customer:', createError);
            console.error('Error details:', createError.response?.data);
            toast.warning('Không thể tạo hồ sơ khách hàng. Bạn vẫn có thể đặt cọc như khách vãng lai.');
          }
        } else {
          console.error('Error fetching customerId:', error);
        }
      }
    };

    fetchOrCreateCustomer();
  }, []);

  // Form data for step 2
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    idCard: '',
    promoCode: '',
    showroomCity: '',
    showroom: '',
    notes: ''
  });

  // Showroom states
  const [showroomData, setShowroomData] = useState({});
  const [dealers, setDealers] = useState([]);

  // Fetch dealers on mount
  useEffect(() => {
    const fetchDealers = async () => {
      try {
        // Dynamic import to avoid circular dependencies if any
        const { getAllDealers } = await import("../services/dealerService");
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
        // Fallback to static data if API fails
        setShowroomData({
          'Hà Nội': [
            { id: 'static-1', name: 'VinFast Hà Nội - Phạm Hùng' },
            { id: 'static-2', name: 'VinFast Hà Nội - Lê Văn Lương' },
          ],
          'TP HCM': [
            { id: 'static-3', name: 'VinFast TP.HCM - Nguyễn Văn Linh' },
          ]
        });
      }
    };

    fetchDealers();
  }, []);

  // Handle manual scrolling to avoid passive event listener errors
  useEffect(() => {
    const handleVehicleListWheel = (e) => {
      if (vehicleListRef.current) {
        e.preventDefault();
        vehicleListRef.current.scrollBy({ top: e.deltaY, behavior: 'auto' });
      }
    };

    const handleSidebarWheel = (e) => {
      if (sidebarRef.current) {
        e.preventDefault();
        sidebarRef.current.scrollBy({ top: e.deltaY, behavior: 'auto' });
      }
    };

    const vehicleListEl = vehicleListRef.current;
    const sidebarEl = sidebarRef.current;

    if (vehicleListEl) {
      vehicleListEl.addEventListener('wheel', handleVehicleListWheel, { passive: false });
    }

    if (sidebarEl) {
      sidebarEl.addEventListener('wheel', handleSidebarWheel, { passive: false });
    }

    return () => {
      if (vehicleListEl) {
        vehicleListEl.removeEventListener('wheel', handleVehicleListWheel);
      }
      if (sidebarEl) {
        sidebarEl.removeEventListener('wheel', handleSidebarWheel);
      }
    };
  }, []);

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

  // Fetch vehicle model details
  const { data: vehicleData, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      try {
        const response = await getVehicleById(id);
        return response.data;
      } catch (error) {
        console.error("Error fetching vehicle:", error);
        toast.error("Không thể tải thông tin xe");
        return null;
      }
    },
  });

  // Fetch variants
  const { data: variantsData } = useQuery({
    queryKey: ['variants', id],
    queryFn: async () => {
      try {
        const response = await getVariants(id);
        return response.data || [];
      } catch (error) {
        console.error("Error fetching variants:", error);
        return [];
      }
    },
    enabled: !!id,
  });

  // Fetch all vehicles for sidebar list
  const { data: allVehiclesData } = useQuery({
    queryKey: ['allVehicles'],
    queryFn: async () => {
      try {
        const response = await getVehicles(0, 10);
        return response.data?.content || [];
      } catch (error) {
        console.error("Error fetching all vehicles:", error);
        return [];
      }
    },
  });

  useEffect(() => {
    if (variantsData && variantsData.length > 0) {
      const variantId = searchParams.get('variantId');
      const variant = variantId
        ? variantsData.find(v => v.variantId === parseInt(variantId))
        : variantsData[0];

      setSelectedVariant(variant || variantsData[0]);

      // Set initial color
      try {
        if (variant?.colorImages) {
          const colorImagesData = JSON.parse(variant.colorImages);
          if (colorImagesData.length > 0) {
            const primaryColor = colorImagesData.find(c => c.isPrimary) || colorImagesData[0];
            setSelectedColor(primaryColor);
          }
        }
      } catch (e) {
        console.error("Error parsing colorImages:", e);
      }

      // Set default interior
      setSelectedInterior({ name: 'Da đen', color: '#000000' });
    }
  }, [variantsData, searchParams]);

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Parse color images
  let colorOptions = [];
  try {
    if (selectedVariant?.colorImages) {
      colorOptions = JSON.parse(selectedVariant.colorImages);
    }
  } catch (e) {
    console.error("Error parsing colorImages:", e);
  }

  // Exterior colors
  const exteriorColors = colorOptions.length > 0 ? colorOptions : [
    { color: 'Infinity Blanc', colorCode: '#FFFFFF', imageUrl: selectedVariant?.imageUrl, isPrimary: true },
    { color: 'Storm Grey', colorCode: '#6B7280', imageUrl: selectedVariant?.imageUrl },
    { color: 'Passion Red', colorCode: '#DC2626', imageUrl: selectedVariant?.imageUrl },
    { color: 'Forest Green', colorCode: '#065F46', imageUrl: selectedVariant?.imageUrl },
    { color: 'Sunrise Yellow', colorCode: '#F59E0B', imageUrl: selectedVariant?.imageUrl },
    { color: 'Ocean Blue', colorCode: '#1E40AF', imageUrl: selectedVariant?.imageUrl },
    { color: 'Rose Pink', colorCode: '#DB2777', imageUrl: selectedVariant?.imageUrl },
  ];

  // Phân loại màu dựa vào thuộc tính isPrimary
  const basicColors = exteriorColors.filter(color => color.isPrimary === true);
  const advancedColors = exteriorColors.filter(color => color.isPrimary !== true);

  // Interior colors
  const interiorColors = [
    { name: 'Da đen', color: '#000000' },
  ];

  const handleRotateLeft = () => {
    setRotation(prev => prev - 45);
  };

  const handleRotateRight = () => {
    setRotation(prev => prev + 45);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);

    // Try to get colorImages data
    let colorImagesData = [];
    try {
      if (variant.colorImages) {
        colorImagesData = JSON.parse(variant.colorImages);
      }
    } catch (e) {
      console.error("Error parsing colorImages:", e);
    }

    // Set selected color and image based on primary color
    if (colorImagesData.length > 0) {
      const primaryColor = colorImagesData.find(c => c.isPrimary) || colorImagesData[0];
      setSelectedColor(primaryColor);
    } else {
      // Fallback to default if no colorImages
      setSelectedColor({ color: 'Infinity Blanc', colorCode: '#FFFFFF', imageUrl: variant.imageUrl, isPrimary: true });
    }
  };

  const handleNextStep = async () => {
    // Validation for step 1
    if (currentStep === 1) {
      if (!selectedVariant) {
        toast.error('Vui lòng chọn phiên bản xe');
        return;
      }
      if (!selectedColor) {
        toast.error('Vui lòng chọn màu xe');
        return;
      }
      if (!selectedInterior) {
        toast.error('Vui lòng chọn nội thất');
        return;
      }
    }

    // Validation for step 2
    if (currentStep === 2) {
      if (!formData.fullName.trim()) {
        toast.error('Vui lòng nhập họ tên');
        return;
      }
      if (!formData.phone.trim()) {
        toast.error('Vui lòng nhập số điện thoại');
        return;
      }
      // Validate phone number format (Vietnamese phone numbers)
      const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        toast.error('Số điện thoại không hợp lệ');
        return;
      }
      if (!formData.email.trim()) {
        toast.error('Vui lòng nhập email');
        return;
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        toast.error('Email không hợp lệ');
        return;
      }
      if (!formData.idCard.trim()) {
        toast.error('Vui lòng nhập số CCCD');
        return;
      }
      // Validate ID card (12 digits for new CCCD)
      if (formData.idCard.trim().length !== 12 || !/^\d+$/.test(formData.idCard.trim())) {
        toast.error('Số CCCD phải gồm 12 chữ số');
        return;
      }
      if (!formData.showroomCity) {
        toast.error('Vui lòng chọn thành phố/tỉnh');
        return;
      }
      if (!formData.showroom) {
        toast.error('Vui lòng chọn showroom');
        return;
      }
    }

    // Handle payment for step 3
    if (currentStep === 3) {
      await handlePayment();
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePayment = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      const depositAmount = 30000000; // 30 triệu VNĐ
      const bookingData = {
        modelId: id,
        modelName: vehicleData.modelName,
        variantId: selectedVariant?.variantId,
        variantName: selectedVariant?.versionName,
        customerId: customerId || null, // Send customerId (Long) if user is logged in
        customerName: formData.fullName,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        customerIdCard: formData.idCard,
        exteriorColor: selectedColor?.color,
        interiorColor: selectedInterior?.name,
        imageUrl: selectedColor?.imageUrl || selectedVariant?.imageUrl || vehicleData.thumbnailUrl,
        showroom: formData.showroom,
        dealerId: formData.dealerId, // Send UUID
        showroomCity: formData.showroomCity,
        notes: formData.notes,
        promoCode: formData.promoCode,
        totalAmount: totalPrice,
        depositAmount: depositAmount,
        returnUrl: `${window.location.origin}/payment/result`,
        orderInfo: `Dat coc xe ${vehicleData.modelName} - ${formData.fullName}`
      };


      // Call API to initiate VNPay payment
      const response = await initiateVNPayBooking(bookingData);

      if (response && response.url) {
        // Redirect to VNPay payment page
        window.location.href = response.url;
      } else {
        toast.error('Không thể khởi tạo thanh toán. Vui lòng thử lại.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      console.error('Error response:', error.response); // Debug log
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thanh toán. Vui lòng thử lại.');
      setIsProcessing(false);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin xe...</p>
        </div>
      </div>
    );
  }

  if (!vehicleData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Không tìm thấy thông tin xe</p>
          <Button onClick={() => navigate('/')}>Về trang chủ</Button>
        </div>
      </div>
    );
  }

  const priceAddition = selectedColor?.isPrimary === false ? 8000000 : 0;
  const totalPrice = (selectedVariant?.price || 0) + priceAddition;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-full mx-auto px-2 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-700 mb-6 ml-2 flex items-center gap-2 transition-colors"
        >
          ← Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
          {/* Left Sidebar - Vehicle List */}
          <div className="lg:col-span-2 relative">
            {/* Scroll Up Button */}
            <button
              onClick={() => {
                if (vehicleListRef.current) {
                  vehicleListRef.current.scrollBy({ top: -150, behavior: 'smooth' });
                }
              }}
              className="w-full flex items-center justify-center py-2 mb-3 hover:opacity-70 transition-opacity"
            >
              <ChevronUp className="w-10 h-10 text-gray-700" strokeWidth={3} />
            </button>

            <div
              ref={vehicleListRef}
              className="space-y-3 overflow-y-hidden pr-2"
              style={{
                overflowY: 'scroll',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                height: '480px'
              }}
            >
              {allVehiclesData && allVehiclesData.map((vehicle) => (
                <button
                  key={vehicle.modelId}
                  onClick={() => navigate(`/booking/${vehicle.modelId}`)}
                  className={`w-full transition-all ${parseInt(id) === vehicle.modelId
                    ? 'bg-gray-50 opacity-100'
                    : 'bg-gray-50 hover:bg-gray-100 opacity-40 hover:opacity-60'
                    } rounded-lg overflow-hidden py-3`}
                >
                  <div className="flex items-center justify-center px-3 mb-2">
                    <img
                      src={vehicle.thumbnailUrl || 'https://via.placeholder.com/200x150'}
                      alt={vehicle.modelName}
                      className="w-full h-auto object-contain max-h-[100px]"
                      style={{ mixBlendMode: 'multiply' }}
                    />
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-sm text-gray-900">
                      {vehicle.modelName}
                    </h4>
                  </div>
                </button>
              ))}
            </div>

            {/* Scroll Down Button */}
            <button
              onClick={() => {
                if (vehicleListRef.current) {
                  vehicleListRef.current.scrollBy({ top: 150, behavior: 'smooth' });
                }
              }}
              className="w-full flex items-center justify-center py-2 mt-3 hover:opacity-70 transition-opacity"
            >
              <ChevronDown className="w-10 h-10 text-gray-700" strokeWidth={3} />
            </button>
          </div>

          {/* Center - Vehicle Display */}
          <div className="lg:col-span-7 space-y-4">
            {/* Vehicle Display */}
            <div className="rounded-lg shadow-sm">
              {/* Vehicle 3D View */}
              <div className="p-4">
                <div className="relative rounded-2xl p-4">
                  {/* Rotation Controls */}
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
                    <button
                      onClick={handleRotateLeft}
                      className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
                    <button
                      onClick={handleRotateRight}
                      className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>

                  {/* Vehicle Image */}
                  <div className="aspect-[16/9] flex items-center justify-center">
                    <img
                      src={selectedColor?.imageUrl || selectedVariant?.imageUrl || vehicleData.thumbnailUrl}
                      alt={vehicleData.modelName}
                      className="max-w-[70%] max-h-[70%] object-contain transition-transform duration-500"
                      style={{ transform: `rotate(${rotation}deg)`, mixBlendMode: 'multiply' }}
                    />
                  </div>

                  {/* Vehicle Badge */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-sm">{vehicleData.modelName}</span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Specs */}
                <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Công suất tối đa</div>
                    <div className="text-xl font-bold text-gray-900">
                      {selectedVariant?.motorPower || vehicleData.baseMotorPower || 30} kW
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Dung lượng pin khả dụng</div>
                    <div className="text-xl font-bold text-gray-900">
                      {selectedVariant?.batteryCapacity || vehicleData.baseBatteryCapacity || 18.64} kWh
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Quãng đường di chuyển</div>
                    <div className="text-xl font-bold text-gray-900">
                      {selectedVariant?.rangeKm || vehicleData.baseRangeKm || 215} km
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 text-center mt-3 px-2">
                  Quãng đường di chuyển được tính toán dựa trên kết quả kiểm định theo quy chuẩn toàn cầu của WNEDC.
                  Quãng đường di chuyển thực tế có thể ảnh hưởng bởi điều kiện, thói quen sử dụng của người lái, chế
                  độ lái xe đã được cài đặt, số lượng hành khách và các điều kiện giao thông khác.
                </p>

                <p className="text-sm text-gray-500 text-center mt-4">
                  Các thông tin sản phẩm có thể thay đổi mà không cần báo trước
                </p>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Configuration */}
          <div
            ref={sidebarRef}
            className="lg:col-span-3 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e0 #f7fafc' }}
          >
            {/* Progress Steps */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between gap-2">
                <div className={`flex items-center gap-2 ${currentStep === 1 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                  </div>
                  <span className="text-xs">Lựa chọn xe</span>
                </div>
                <div className="h-px flex-1 bg-gray-300"></div>
                <div className={`flex items-center gap-2 ${currentStep === 2 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 2 ? 'bg-blue-600 text-white' : currentStep > 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    {currentStep > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
                  </div>
                  <span className="text-xs">Nhập thông tin</span>
                </div>
                <div className="h-px flex-1 bg-gray-300"></div>
                <div className={`flex items-center gap-2 ${currentStep === 3 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    3
                  </div>
                  <span className="text-xs">Đặt cọc xe</span>
                </div>
              </div>
            </div>

            {/* Conditional Content Based on Step */}
            {currentStep === 1 ? (
              <>
                {/* Step 1 Description */}
                <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    Xin mời Quý khách vui lòng chọn phiên bản, nội thất và ngoại thất xe.
                  </p>
                </div>

                {/* All Configuration in One Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                  {/* Vehicle Version Selection */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Phiên bản xe</h3>
                    <div className="space-y-2">
                      {variantsData && variantsData.map((variant) => (
                        <button
                          key={variant.variantId}
                          onClick={() => handleVariantSelect(variant)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${selectedVariant?.variantId === variant.variantId
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedVariant?.variantId === variant.variantId
                            ? 'border-blue-600'
                            : 'border-gray-300'
                            }`}>
                            {selectedVariant?.variantId === variant.variantId && (
                              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900">{variant.versionName}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Exterior Color Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Ngoại thất</h3>
                      <span className="text-sm text-gray-600">{selectedColor?.color || 'Infinity Blanc'}</span>
                    </div>
                    <div className="mb-3">
                      <span className="text-sm text-gray-500">Màu cơ bản - Theo xe</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {basicColors.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => handleColorSelect(color)}
                          className={`aspect-square rounded-lg border-2 transition-all hover:scale-105 ${selectedColor?.color === color.color
                            ? 'border-blue-600 shadow-lg scale-105'
                            : 'border-gray-300'
                            }`}
                          style={{ backgroundColor: color.colorCode }}
                          title={color.color}
                        >
                          {selectedColor?.color === color.color && (
                            <CheckCircle className="w-6 h-6 text-blue-600 mx-auto drop-shadow-lg" />
                          )}
                        </button>
                      ))}
                    </div>
                    {advancedColors.length > 0 && (
                      <>
                        <div className="mb-3">
                          <span className="text-sm text-gray-500">Màu nâng cao </span>
                          <span className="text-sm font-semibold text-red-600">+ {formatPrice(8000000)}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          {advancedColors.map((color, index) => (
                            <button
                              key={index}
                              onClick={() => handleColorSelect(color)}
                              className={`aspect-square rounded-lg border-2 transition-all hover:scale-105 ${selectedColor?.color === color.color
                                ? 'border-blue-600 shadow-lg scale-105'
                                : 'border-gray-300'
                                }`}
                              style={{ backgroundColor: color.colorCode }}
                              title={color.color}
                            >
                              {selectedColor?.color === color.color && (
                                <CheckCircle className="w-6 h-6 text-white mx-auto drop-shadow-lg" />
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Interior Color Selection */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Nội thất</h3>
                    <div className="grid grid-cols-4 gap-3">
                      {interiorColors.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedInterior(color)}
                          className={`aspect-square rounded-lg border-2 transition-all hover:scale-105 ${selectedInterior?.name === color.name
                            ? 'border-blue-600 shadow-lg scale-105'
                            : 'border-gray-300'
                            }`}
                          style={{ backgroundColor: color.color }}
                          title={color.name}
                        >
                          {selectedInterior?.name === color.name && (
                            <CheckCircle className="w-6 h-6 text-white mx-auto drop-shadow-lg" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Installment Plan */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Dự toán Trả góp & Giá lăn bánh</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Chi tiết
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Price Summary */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Giá xe</span>
                      <span className="font-medium">{formatPrice(selectedVariant?.price || 0)}</span>
                    </div>
                    {priceAddition > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Màu nâng cao</span>
                        <span className="font-medium text-red-600">+ {formatPrice(priceAddition)}</span>
                      </div>
                    )}
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-semibold text-gray-900">Tổng cộng</span>
                      <span className="font-bold text-blue-600 text-xl">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : currentStep === 2 ? (
              <>
                {/* Step 2 Description */}
                <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    Tiếp theo, Quý khách hãy cung cấp thông tin chủ xe và lựa chọn Showroom nhận xe
                  </p>
                </div>

                {/* Customer Information Form */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Thông tin khách hàng</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số CCCD <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="idCard"
                        value={formData.idCard}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập số CCCD"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mã ưu đãi
                      </label>
                      <input
                        type="text"
                        name="promoCode"
                        value={formData.promoCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập mã ưu đãi (nếu có)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Showroom nhận xe <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-3">
                        <select
                          name="showroomCity"
                          value={formData.showroomCity}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Chọn tỉnh thành</option>
                          {Object.keys(showroomData).sort().map(city => (
                            <option key={city} value={city}>
                              {city === 'Ho Chi Minh City' ? 'TP. Hồ Chí Minh' :
                                city === 'Hanoi' ? 'Hà Nội' :
                                  city === 'Da Nang' ? 'Đà Nẵng' : city}
                            </option>
                          ))}
                        </select>
                        <select
                          name="showroom"
                          value={formData.showroom}
                          onChange={handleInputChange}
                          disabled={!formData.showroomCity}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">Chọn showroom</option>
                          {formData.showroomCity && showroomData[formData.showroomCity]?.map(showroom => (
                            <option key={showroom.id} value={showroom.name}>
                              {showroom.name} - {showroom.address}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ghi chú
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ghi chú thêm (nếu có)"
                      />
                    </div>
                  </div>
                </div>

                {/* Selected Vehicle Summary */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Thông tin xe đã chọn</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mẫu xe</span>
                      <span className="font-medium">{vehicleData.modelName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phiên bản</span>
                      <span className="font-medium">{selectedVariant?.versionName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Màu ngoại thất</span>
                      <span className="font-medium">{selectedColor?.color}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Màu nội thất</span>
                      <span className="font-medium">{selectedInterior?.name}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-semibold text-gray-900">Tổng cộng</span>
                      <span className="font-bold text-blue-600 text-xl">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Step 3 Description */}
                <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    Quý khách kiểm tra lại thông tin đơn hàng và thực hiện thanh toán khoản đặt cọc cho xe
                  </p>
                </div>

                {/* Order Information */}
                <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                  <h3 className="font-semibold text-gray-900 text-lg">Thông tin đơn hàng</h3>

                  {/* Vehicle Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Thông tin xe</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{vehicleData.modelName} {selectedVariant?.versionName}</span>
                        <span className="font-semibold text-gray-900">{formatPrice(selectedVariant?.price || 0)}</span>
                      </div>
                      <p className="text-xs text-gray-500">Giá xe đã bao gồm VAT.</p>
                      <p className="text-xs text-blue-600">Kèm pin</p>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-sm text-gray-600">Ngoại thất</p>
                          <p className="font-medium text-gray-900">{selectedColor?.color || 'Infinity Blanc'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Nội thất</p>
                          <p className="font-medium text-gray-900">{selectedInterior?.name || 'Da đen'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* Customer Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Thông tin chủ xe</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Chủ xe</p>
                        <p className="font-medium text-gray-900">{formData.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{formData.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Số điện thoại</p>
                        <p className="font-medium text-gray-900">{formData.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Số CCCD</p>
                        <p className="font-medium text-gray-900">{formData.idCard}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Showroom nhận xe</p>
                        <p className="font-medium text-gray-900">{formData.showroom}</p>
                        <p className="text-xs text-gray-500">{formData.showroomCity}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* Payment Method */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Hình thức thanh toán</h4>
                    <p className="text-sm text-gray-600 mb-3">Thanh toán trực tuyến qua cổng VNPay</p>

                    <div className="space-y-3">
                      <label className="flex items-center p-4 border-2 border-blue-600 bg-blue-50 rounded-lg">
                        <input type="radio" name="paymentMethod" value="vnpay" className="w-4 h-4 text-blue-600" defaultChecked />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="bg-white px-3 py-1 rounded">
                              <span className="font-bold text-blue-600 text-lg">VNPAY</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Cổng thanh toán VNPay</p>
                              <p className="text-xs text-gray-600 mt-0.5">Hỗ trợ thẻ ATM, Visa, MasterCard, JCB, QR Code</p>
                            </div>
                          </div>
                        </div>
                      </label>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 font-medium mb-1">Thanh toán an toàn và bảo mật</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                              <li>• Sau khi nhấn "Thanh toán đặt cọc", bạn sẽ được chuyển đến trang VNPay</li>
                              <li>• Chọn phương thức thanh toán phù hợp (Thẻ ATM, Visa/Master, QR Code...)</li>
                              <li>• Hoàn tất thanh toán và quay lại trang xác nhận</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* Deposit Amount */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Số tiền đặt cọc</span>
                      <span className="text-2xl font-bold text-blue-600">30.000.000 VNĐ</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  onClick={handlePrevStep}
                  variant="outline"
                  className="flex-1 py-3"
                >
                  Quay lại
                </Button>
              )}
              <Button
                onClick={handleNextStep}
                disabled={isProcessing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Đang xử lý...' : (currentStep === 3 ? 'Thanh toán đặt cọc' : 'Tiếp tục')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;

