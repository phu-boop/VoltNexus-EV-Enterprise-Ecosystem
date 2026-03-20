import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Palette, Settings, Car, CheckCircle, ArrowLeft } from "lucide-react";
import { getVehicleById, getVariants } from "../services/vehicleService";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";

const CarConfigurator = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const modelId = searchParams.get("modelId");
  const variantId = searchParams.get("variantId");

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedWheels, setSelectedWheels] = useState(null);
  const [selectedInterior, setSelectedInterior] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch vehicle model
  const { data: vehicleData } = useQuery({
    queryKey: ["vehicle", modelId],
    queryFn: async () => {
      const response = await getVehicleById(modelId);
      return response.data;
    },
    enabled: !!modelId,
  });

  // Fetch variants
  const { data: variantsData } = useQuery({
    queryKey: ["variants", modelId],
    queryFn: async () => {
      const response = await getVariants(modelId);
      return response.data || [];
    },
    enabled: !!modelId,
  });

  // Get available colors from variant's colorImages
  const getAvailableColors = () => {
    const variant = variantId
      ? variantsData?.find((v) => v.variantId === parseInt(variantId))
      : variantsData?.[0];

    if (!variant) return [];

    // Parse colorImages from backend
    let colorImagesData = [];
    try {
      if (variant.colorImages) {
        colorImagesData = JSON.parse(variant.colorImages);
      }
    } catch (e) {
      console.error("Error parsing colorImages:", e);
    }

    // Use colorImages data as the source of truth for available colors
    const allColors = [];
    
    if (colorImagesData.length > 0) {
      // Use colors from colorImages (already includes all color options)
      const colors = colorImagesData.map((c) => ({ ...c, isMainVariant: false }));
      // Sort to put primary color first
      colors.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
      allColors.push(...colors);
    } else if (variant.color && variant.imageUrl) {
      // Fallback to main variant color if no colorImages data
      allColors.push({
        color: variant.color,
        colorCode: '#FFFFFF',
        imageUrl: variant.imageUrl,
        isPrimary: true,
        isMainVariant: true,
      });
    }

    return allColors;
  };

  const availableColors = getAvailableColors();

  // Available wheel options
  const wheelOptions = [
    { id: 1, name: "Mâm 18 inch tiêu chuẩn", price: 0, image: "wheel-18" },
    { id: 2, name: "Mâm 19 inch thể thao", price: 5000000, image: "wheel-19" },
    { id: 3, name: "Mâm 20 inch cao cấp", price: 10000000, image: "wheel-20" },
    { id: 4, name: "Mâm 21 inch luxury", price: 15000000, image: "wheel-21" },
  ];

  // Available interior colors
  const interiorOptions = [
    { id: 1, name: "Nội thất đen", color: "#1a1a1a", price: 0 },
    { id: 2, name: "Nội thất be", color: "#f5f5dc", price: 3000000 },
    { id: 3, name: "Nội thất nâu", color: "#8b4513", price: 5000000 },
    { id: 4, name: "Nội thất đỏ", color: "#8b0000", price: 7000000 },
  ];

  useEffect(() => {
    if (variantsData && variantsData.length > 0) {
      const variant = variantId
        ? variantsData.find((v) => v.variantId === parseInt(variantId))
        : variantsData[0];

      if (variant) {
        // Set default color from colorImages
        const colors = getAvailableColors();
        // Select the primary color or first color
        const defaultColor = colors.find(c => c.isPrimary) || colors[0];
        
        if (defaultColor) {
          setSelectedColor(defaultColor);
          setPreviewImage(defaultColor.imageUrl);
        }
        
        setSelectedWheels(wheelOptions[0]);
        setSelectedInterior(interiorOptions[0]);
      }
    }
  }, [variantsData, variantId]);

  const updatePreviewImage = (variant, color, wheels, interior) => {
    // Use imageUrl from selected color
    if (color?.imageUrl) {
      setPreviewImage(color.imageUrl);
    } else {
      // Fallback to variant or vehicle image
      const baseImage = variant?.imageUrl || vehicleData?.thumbnailUrl || "";
      setPreviewImage(baseImage);
    }
  };

  useEffect(() => {
    if (selectedColor && selectedWheels && selectedInterior && variantsData) {
      const variant = variantId
        ? variantsData.find((v) => v.variantId === parseInt(variantId))
        : variantsData[0];
      if (variant) {
        updatePreviewImage(
          variant,
          selectedColor,
          selectedWheels,
          selectedInterior
        );
      }
    }
  }, [
    selectedColor,
    selectedWheels,
    selectedInterior,
    variantId,
    variantsData,
  ]);

  const calculateTotalPrice = () => {
    const basePrice =
      variantsData?.find((v) =>
        variantId ? v.variantId === parseInt(variantId) : true
      )?.price ||
      vehicleData?.basePrice ||
      0;

    const wheelsPrice = selectedWheels?.price || 0;
    const interiorPrice = selectedInterior?.price || 0;

    return basePrice + wheelsPrice + interiorPrice;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleSaveConfiguration = () => {
    const config = {
      modelId,
      variantId,
      color: selectedColor,
      wheels: selectedWheels,
      interior: selectedInterior,
      totalPrice: calculateTotalPrice(),
    };

    // Save to localStorage or send to backend
    localStorage.setItem("carConfiguration", JSON.stringify(config));
    toast.success("Đã lưu cấu hình xe!");
  };

  if (!vehicleData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Đang tải thông tin xe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-700 mb-6 flex items-center gap-2 transition-colors"
        >
          ← Quay lại danh sách
        </button>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Cấu Hình Xe - {vehicleData.modelName}
          </h1>
          <p className="text-gray-600">
            Tùy chỉnh màu sắc, mâm xe và nội thất theo sở thích của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Car className="w-6 h-6 text-blue-600" />
                Xem Trước
              </h2>

              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4 relative">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={vehicleData.modelName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-gray-400">Đang tải hình ảnh...</div>
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Giá cơ bản:</span>
                  <span className="font-semibold">
                    {formatPrice(
                      variantsData?.find((v) =>
                        variantId ? v.variantId === parseInt(variantId) : true
                      )?.price ||
                        vehicleData?.basePrice ||
                        0
                    )}
                  </span>
                </div>
                {selectedWheels && selectedWheels.price > 0 && (
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-gray-600">Mâm xe:</span>
                    <span className="font-semibold text-green-600">
                      +{formatPrice(selectedWheels.price)}
                    </span>
                  </div>
                )}
                {selectedInterior && selectedInterior.price > 0 && (
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-gray-600">Nội thất:</span>
                    <span className="font-semibold text-green-600">
                      +{formatPrice(selectedInterior.price)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(calculateTotalPrice())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Options */}
          <div className="space-y-6">
            {/* Color Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                Màu Sơn
              </h2>
              {availableColors.length > 0 ? (
                <div className="grid grid-cols-4 gap-4">
                  {availableColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        selectedColor?.color === color.color
                          ? "border-blue-600 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className="w-full h-16 rounded-lg mb-2"
                        style={{ backgroundColor: color.colorCode || "#000000" }}
                      />
                      <div className="text-xs font-medium text-center">
                        {color.color}
                      </div>
                      {selectedColor?.color === color.color && (
                        <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Không có màu sơn nào được cấu hình
                </p>
              )}
            </div>

            {/* Wheel Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Mâm Xe
              </h2>
              <div className="space-y-3">
                {wheelOptions.map((wheel) => (
                  <button
                    key={wheel.id}
                    onClick={() => setSelectedWheels(wheel)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedWheels?.id === wheel.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{wheel.name}</div>
                        {wheel.price > 0 && (
                          <div className="text-sm text-gray-600">
                            +{formatPrice(wheel.price)}
                          </div>
                        )}
                      </div>
                      {selectedWheels?.id === wheel.id && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Interior Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                Màu Nội Thất
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {interiorOptions.map((interior) => (
                  <button
                    key={interior.id}
                    onClick={() => setSelectedInterior(interior)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      selectedInterior?.id === interior.id
                        ? "border-blue-600 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-12 h-12 rounded-lg"
                        style={{ backgroundColor: interior.color }}
                      />
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-sm">
                          {interior.name}
                        </div>
                        {interior.price > 0 && (
                          <div className="text-xs text-gray-600">
                            +{formatPrice(interior.price)}
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedInterior?.id === interior.id && (
                      <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleSaveConfiguration}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold"
              >
                Lưu Cấu Hình
              </Button>
              <Button
                onClick={() =>
                  navigate(
                    `/test-drive?modelId=${modelId}&variantId=${variantId}`
                  )
                }
                variant="outline"
                className="flex-1 py-4 text-lg font-semibold"
              >
                Đặt Lái Thử
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarConfigurator;
