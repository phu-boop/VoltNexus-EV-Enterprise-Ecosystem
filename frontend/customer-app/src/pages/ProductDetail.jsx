import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Battery, Zap, Clock, Users, ArrowLeft, Calendar, 
  Settings, Palette, Car, CheckCircle, Star, ChevronLeft, ChevronRight 
} from "lucide-react";
import { getVehicleById, getVariants } from "../services/vehicleService";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentExteriorIndex, setCurrentExteriorIndex] = useState(0);
  const [currentInteriorIndex, setCurrentInteriorIndex] = useState(0);
  const [exteriorImages, setExteriorImages] = useState([]);
  const [interiorImages, setInteriorImages] = useState([]);
  const exteriorRef = useRef(null);
  const interiorRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Auto-play for exterior images
  useEffect(() => {
    if (exteriorImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentExteriorIndex((prev) => (prev + 1) % exteriorImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [exteriorImages]);

  // Auto-play for interior images
  useEffect(() => {
    if (interiorImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentInteriorIndex((prev) => (prev + 1) % interiorImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [interiorImages]);

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

  useEffect(() => {
    if (variantsData && variantsData.length > 0) {
      const firstVariant = variantsData[0];
      setSelectedVariant(firstVariant);
      
      // Load exterior and interior images from variant data
      try {
        if (firstVariant.exteriorImages) {
          const parsedExterior = JSON.parse(firstVariant.exteriorImages);
          setExteriorImages(Array.isArray(parsedExterior) ? parsedExterior : []);
        } else {
          setExteriorImages([]);
        }
      } catch (e) {
        console.error("Error parsing exteriorImages:", e);
        setExteriorImages([]);
      }

      try {
        if (firstVariant.interiorImages) {
          const parsedInterior = JSON.parse(firstVariant.interiorImages);
          setInteriorImages(Array.isArray(parsedInterior) ? parsedInterior : []);
        } else {
          setInteriorImages([]);
        }
      } catch (e) {
        console.error("Error parsing interiorImages:", e);
        setInteriorImages([]);
      }
      
      // Set main image from variant first
      if (firstVariant.imageUrl) {
        setSelectedImages([firstVariant.imageUrl]);
      } else if (vehicleData?.thumbnailUrl) {
        setSelectedImages([vehicleData.thumbnailUrl]);
      }
      
      // Set initial selected color from colorImages if available
      try {
        if (firstVariant.colorImages) {
          const colorImagesData = JSON.parse(firstVariant.colorImages);
          if (colorImagesData.length > 0) {
            const primaryColor = colorImagesData.find(c => c.isPrimary) || colorImagesData[0];
            setSelectedColor(primaryColor.color);
            // Also update the image to match the primary color
            if (primaryColor.imageUrl) {
              setSelectedImages([primaryColor.imageUrl]);
            }
          } else {
            setSelectedColor(firstVariant.color);
          }
        } else {
          setSelectedColor(firstVariant.color);
        }
      } catch (e) {
        setSelectedColor(firstVariant.color);
      }
    }
  }, [variantsData, vehicleData]);

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    
    // Load exterior and interior images from variant data
    try {
      if (variant.exteriorImages) {
        const parsedExterior = JSON.parse(variant.exteriorImages);
        setExteriorImages(Array.isArray(parsedExterior) ? parsedExterior : []);
      } else {
        setExteriorImages([]);
      }
    } catch (e) {
      console.error("Error parsing exteriorImages:", e);
      setExteriorImages([]);
    }

    try {
      if (variant.interiorImages) {
        const parsedInterior = JSON.parse(variant.interiorImages);
        setInteriorImages(Array.isArray(parsedInterior) ? parsedInterior : []);
      } else {
        setInteriorImages([]);
      }
    } catch (e) {
      console.error("Error parsing interiorImages:", e);
      setInteriorImages([]);
    }
    
    // Reset gallery indices
    setCurrentExteriorIndex(0);
    setCurrentInteriorIndex(0);
    
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
      setSelectedColor(primaryColor.color);
      // Set image from primary color
      if (primaryColor.imageUrl) {
        setSelectedImages([primaryColor.imageUrl]);
      }
    } else {
      setSelectedColor(variant.color);
      // Fallback to variant image if no colorImages
      if (variant.imageUrl) {
        setSelectedImages([variant.imageUrl]);
      }
    }
  };

  const handleColorSelect = (colorItem) => {
    setSelectedColor(colorItem.color);
    if (colorItem.imageUrl) {
      setSelectedImages([colorItem.imageUrl]);
    }
  };

  const handleTestDrive = () => {
    navigate(`/test-drive?modelId=${id}&variantId=${selectedVariant?.variantId || ''}`);
  };

  const handleConfigure = () => {
    navigate(`/configure?modelId=${id}&variantId=${selectedVariant?.variantId || ''}`);
  };

  const handleBooking = () => {
    navigate(`/booking/${id}?variantId=${selectedVariant?.variantId || ''}`);
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

  const variant = selectedVariant || variantsData?.[0];

  // Parse colorImages for the selected variant
  let colorImagesData = [];
  try {
    if (variant?.colorImages) {
      colorImagesData = JSON.parse(variant.colorImages);
    }
  } catch (e) {
    console.error("Error parsing colorImages:", e);
  }

  // Use colorImages data as the source of truth for available colors
  const allColors = [];
  
  if (colorImagesData.length > 0) {
    // Use colors from colorImages (already includes all color options)
    const colors = colorImagesData.map(c => ({ ...c, isMainVariant: false }));
    // Sort to put primary color first
    colors.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
    allColors.push(...colors);
  } else if (variant?.color && variant?.imageUrl) {
    // Fallback to main variant color if no colorImages data
    allColors.push({
      color: variant.color,
      colorCode: '#FFFFFF',
      imageUrl: variant.imageUrl,
      isPrimary: true,
      isMainVariant: true
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button - Moved outside grid */}
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-700 mb-6 flex items-center gap-2 transition-colors"
        >
          ← Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4 relative">
            
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={selectedImages[0] || variant?.imageUrl || vehicleData.thumbnailUrl || "https://via.placeholder.com/800"}
                alt={vehicleData.modelName}
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Color Selection Dots */}
            {allColors.length > 0 && (
              <div className="flex items-center justify-center gap-3 py-2">
                {allColors.map((colorItem, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorSelect(colorItem)}
                    className={`relative w-12 h-12 rounded-full border-2 transition-all hover:scale-110 ${
                      selectedColor === colorItem.color
                        ? 'border-blue-600 shadow-lg scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: colorItem.colorCode }}
                    title={colorItem.color}
                  >
                    {selectedColor === colorItem.color && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
            
            {/* Selected Color Name */}
            {selectedColor && allColors.length > 0 && (
              <div className="text-center">
                <p className="text-sm text-gray-600 inline-flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <span className="font-medium">{selectedColor}</span>
                </p>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {vehicleData.modelName}
              </h1>
              {variant && (
                <p className="text-xl text-gray-600">{variant.versionName}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Giá khởi điểm</div>
              <div className="text-4xl font-bold text-blue-600">
                {formatPrice(variant?.price || vehicleData.basePrice)}
              </div>
            </div>

            {/* Key Specs */}
            <div className="grid grid-cols-2 gap-4 p-6 bg-white rounded-xl border border-gray-200">
              <div className="flex items-start gap-3">
                <Battery className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <div className="text-sm text-gray-500">Dung lượng pin</div>
                  <div className="text-lg font-semibold">
                    {variant?.batteryCapacity || vehicleData.baseBatteryCapacity || "N/A"} kWh
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <div className="text-sm text-gray-500">Quãng đường (WLTP)</div>
                  <div className="text-lg font-semibold">
                    {variant?.rangeKm || vehicleData.baseRangeKm || "N/A"} km
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <div className="text-sm text-gray-500">Sạc nhanh (80%)</div>
                  <div className="text-lg font-semibold">
                    {variant?.chargingTime ? `${variant.chargingTime} phút` : "N/A"}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Settings className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <div className="text-sm text-gray-500">Công suất</div>
                  <div className="text-lg font-semibold">
                    {variant?.motorPower || vehicleData.baseMotorPower || "N/A"} kW
                  </div>
                </div>
              </div>
            </div>

            {/* Variant Selection */}
            {variantsData && variantsData.length > 1 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Chọn phiên bản</h3>
                <div className="space-y-2">
                  {variantsData.map((v) => (
                    <button
                      key={v.variantId}
                      onClick={() => handleVariantSelect(v)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        selectedVariant?.variantId === v.variantId
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{v.versionName}</div>
                          <div className="text-sm text-gray-600">{v.color}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">
                            {formatPrice(v.price)}
                          </div>
                          {selectedVariant?.variantId === v.variantId && (
                            <CheckCircle className="w-5 h-5 text-blue-600 mt-1 ml-auto" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 pt-4">
              <Button
                onClick={handleBooking}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold"
              >
                <CheckCircle className="w-5 h-5 inline mr-2" />
                Đặt Cọc Xe
              </Button>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleTestDrive}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold"
                >
                  <Calendar className="w-5 h-5 inline mr-2" />
                  Đặt Lái Thử
                </Button>
                <Button
                  onClick={handleConfigure}
                  variant="outline"
                  className="flex-1 py-4 text-lg font-semibold"
                >
                  <Settings className="w-5 h-5 inline mr-2" />
                  Cấu Hình Xe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Ngoại thất Section */}
        {exteriorImages.length > 0 && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Ngoại thất
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Thiết kế bên ngoài của xe
              </p>
            </div>
            
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg group">
              {/* Main Image */}
              <div 
                ref={exteriorRef}
                className="aspect-[16/9] w-full cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => {
                  setIsDragging(true);
                  setStartX(e.pageX);
                }}
                onMouseMove={(e) => {
                  if (!isDragging) return;
                  const x = e.pageX;
                  const walk = startX - x;
                  if (Math.abs(walk) > 50) {
                    if (walk > 0) {
                      setCurrentExteriorIndex((prev) => (prev + 1) % exteriorImages.length);
                    } else {
                      setCurrentExteriorIndex((prev) => (prev - 1 + exteriorImages.length) % exteriorImages.length);
                    }
                    setIsDragging(false);
                  }
                }}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
              >
                <img
                  src={exteriorImages[currentExteriorIndex]}
                  alt={`Ngoại thất ${currentExteriorIndex + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-500"
                  draggable="false"
                />
              </div>
              
              {/* Previous Button */}
              {exteriorImages.length > 1 && (
                <button
                  onClick={() => setCurrentExteriorIndex((prev) => (prev - 1 + exteriorImages.length) % exteriorImages.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              
              {/* Next Button */}
              {exteriorImages.length > 1 && (
                <button
                  onClick={() => setCurrentExteriorIndex((prev) => (prev + 1) % exteriorImages.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Ảnh tiếp theo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
              
              {/* Image Counter */}
              {exteriorImages.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                  {currentExteriorIndex + 1} / {exteriorImages.length}
                </div>
              )}
              
              {/* Dots Navigation */}
              {exteriorImages.length > 1 && (
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3">
                  {exteriorImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentExteriorIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        currentExteriorIndex === index
                          ? 'bg-white w-8'
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Xem hình ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nội thất Section */}
        {interiorImages.length > 0 && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Nội thất
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Thiết kế bên trong của xe
              </p>
            </div>
            
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg group">
              {/* Main Image */}
              <div 
                ref={interiorRef}
                className="aspect-[16/9] w-full cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => {
                  setIsDragging(true);
                  setStartX(e.pageX);
                }}
                onMouseMove={(e) => {
                  if (!isDragging) return;
                  const x = e.pageX;
                  const walk = startX - x;
                  if (Math.abs(walk) > 50) {
                    if (walk > 0) {
                      setCurrentInteriorIndex((prev) => (prev + 1) % interiorImages.length);
                    } else {
                      setCurrentInteriorIndex((prev) => (prev - 1 + interiorImages.length) % interiorImages.length);
                    }
                    setIsDragging(false);
                  }
                }}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
              >
                <img
                  src={interiorImages[currentInteriorIndex]}
                  alt={`Nội thất ${currentInteriorIndex + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-500"
                  draggable="false"
                />
              </div>
              
              {/* Previous Button */}
              {interiorImages.length > 1 && (
                <button
                  onClick={() => setCurrentInteriorIndex((prev) => (prev - 1 + interiorImages.length) % interiorImages.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              
              {/* Next Button */}
              {interiorImages.length > 1 && (
                <button
                  onClick={() => setCurrentInteriorIndex((prev) => (prev + 1) % interiorImages.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Ảnh tiếp theo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
              
              {/* Image Counter */}
              {interiorImages.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                  {currentInteriorIndex + 1} / {interiorImages.length}
                </div>
              )}
              
              {/* Dots Navigation */}
              {interiorImages.length > 1 && (
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3">
                  {interiorImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentInteriorIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        currentInteriorIndex === index
                          ? 'bg-white w-8'
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Xem hình ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
          

         {/* Detailed Specifications */}
        <div className="bg-white rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Thông Số Kỹ Thuật Chi Tiết</h2>
          <div className="space-y-6">
            {/* Battery & Range */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Battery className="w-5 h-5" />
                Pin & Phạm vi hoạt động
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-gray-600">Dung lượng pin</span>
                  <p className="text-lg font-semibold">
                    {variant?.batteryCapacity || vehicleData.baseBatteryCapacity || "N/A"} kWh
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-gray-600">Phạm vi hoạt động</span>
                  <p className="text-lg font-semibold">
                    {variant?.rangeKm || vehicleData.baseRangeKm || "N/A"} km
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-gray-600">Thời gian sạc</span>
                  <p className="text-lg font-semibold">
                    {variant?.chargingTime || "N/A"} giờ
                  </p>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Hiệu suất
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-gray-600">Công suất động cơ</span>
                  <p className="text-lg font-semibold">
                    {variant?.motorPower || vehicleData.baseMotorPower || "N/A"} kW
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-gray-600">Mô-men xoắn</span>
                  <p className="text-lg font-semibold">
                    {variant?.torque || "N/A"} Nm
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-gray-600">Tăng tốc 0-100km/h</span>
                  <p className="text-lg font-semibold">
                    {variant?.acceleration || "N/A"} giây
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-gray-600">Tốc độ tối đa</span>
                  <p className="text-lg font-semibold">
                    {variant?.topSpeed || "N/A"} km/h
                  </p>
                </div>
              </div>
            </div>

            {/* Dimensions & Weight */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Kích thước & Khối lượng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-gray-600">Kích thước (DxRxC)</span>
                  <p className="text-lg font-semibold">
                    {variant?.dimensions || "N/A"} mm
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-gray-600">Trọng lượng</span>
                  <p className="text-lg font-semibold">
                    {variant?.weight || "N/A"} kg
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate('/compare')}
            className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-600 transition-all text-left"
          >
            <Car className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-semibold mb-1">So Sánh Xe</h3>
            <p className="text-sm text-gray-600">So sánh với các mẫu khác</p>
          </button>
          <button
            onClick={() => navigate('/financing')}
            className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-600 transition-all text-left"
          >
            <Settings className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-semibold mb-1">Tính Trả Góp</h3>
            <p className="text-sm text-gray-600">Ước tính số tiền trả hàng tháng</p>
          </button>
          <button
            onClick={() => navigate('/tco-calculator')}
            className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-600 transition-all text-left"
          >
            <Star className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-semibold mb-1">Tính Chi Phí</h3>
            <p className="text-sm text-gray-600">So sánh chi phí Gas vs EV</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
