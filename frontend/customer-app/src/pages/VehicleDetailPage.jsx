import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getVehicleDetail, getModelDetail } from "../services/vehicleService";
import { addToCart } from "../services/cartService";
import { useAuth } from "../auth/AuthProvider";
import { toast } from "react-toastify";
import ReviewList from "../components/ReviewList";
import ReviewForm from "../components/ReviewForm";
import { useComparison } from "../utils/useComparison";

export default function VehicleDetailPage() {
  const { variantId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const { isInComparison, toggleComparison } = useComparison();

  // Fetch vehicle variant detail
  const { data: variantData, isLoading: variantLoading } = useQuery({
    queryKey: ['vehicle-detail', variantId],
    queryFn: async () => {
      try {
        const response = await getVehicleDetail(variantId);
        return response.data;
      } catch (error) {
        console.error("Error fetching vehicle detail:", error);
        toast.error("Không thể tải thông tin xe");
        throw error;
      }
    },
  });

  // Fetch model detail if we have modelId
  const { data: modelData } = useQuery({
    queryKey: ['model-detail', variantData?.modelId],
    queryFn: async () => {
      if (!variantData?.modelId) return null;
      try {
        const response = await getModelDetail(variantData.modelId);
        return response.data;
      } catch (error) {
        console.error("Error fetching model detail:", error);
        return null;
      }
    },
    enabled: !!variantData?.modelId,
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (cartData) => addToCart(user?.memberId, cartData),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart', user?.memberId]);
      toast.success("Đã thêm vào giỏ hàng");
      setTimeout(() => {
        navigate('/cart');
      }, 1000);
    },
    onError: (error) => {
      console.error("Error adding to cart:", error);
      toast.error("Không thể thêm vào giỏ hàng");
    },
  });

  const handleAddToCart = () => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để thêm vào giỏ hàng");
      navigate('/login');
      return;
    }

    const cartData = {
      variantId: parseInt(variantId),
      quantity: 1,
      vehicleName: `${variantData?.modelName || ''} - ${variantData?.variantName || ''}`.trim(),
      vehicleColor: variantData?.color,
      vehicleImageUrl: variantData?.imageUrl,
      unitPrice: variantData?.price,
    };

    addToCartMutation.mutate(cartData);
  };

  const handleTestDrive = () => {
    navigate(`/test-drive/book?vehicleId=${variantId}`);
  };

  if (variantLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!variantData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Không tìm thấy thông tin xe</p>
          <button
            onClick={() => navigate('/vehicles')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const images = variantData.imageUrl ? [variantData.imageUrl] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <button onClick={() => navigate('/')} className="hover:text-blue-600">Trang chủ</button>
            <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <button onClick={() => navigate('/vehicles')} className="hover:text-blue-600">Xe điện</button>
            <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-900 font-medium">{variantData.versionName}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]}
                    alt={variantData.versionName}
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                    <svg className="w-32 h-32 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-w-16 aspect-h-9 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt={`View ${index + 1}`} className="w-full h-24 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Info */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {variantData.versionName}
              </h1>
              
              {/* Model Name */}
              {modelData && (
                <p className="text-lg text-gray-600 mb-4">
                  {modelData.modelName} - {modelData.brand}
                </p>
              )}

              {/* Status */}
              <div className="mb-4">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  variantData.status === 'AVAILABLE'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {variantData.status === 'AVAILABLE' ? 'Còn hàng' : 'Hết hàng'}
                </span>
              </div>

              {/* Color */}
              {variantData.color && (
                <div className="mb-4">
                  <span className="text-gray-600">Màu sắc:</span>
                  <span className="ml-2 font-semibold text-gray-900">{variantData.color}</span>
                </div>
              )}

              {/* SKU */}
              {variantData.skuCode && (
                <div className="mb-4">
                  <span className="text-sm text-gray-500">Mã sản phẩm: {variantData.skuCode}</span>
                </div>
              )}

              {/* Price */}
              <div className="border-t border-b py-4 my-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-blue-600">
                    {formatPrice(variantData.price)}
                  </span>
                  {variantData.wholesalePrice && variantData.wholesalePrice < variantData.price && (
                    <span className="ml-4 text-xl text-gray-500 line-through">
                      {formatPrice(variantData.wholesalePrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {variantData.rangeKm && (
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Phạm vi</p>
                      <p className="text-lg font-semibold text-gray-900">{variantData.rangeKm} km</p>
                    </div>
                  </div>
                )}

                {variantData.motorPower && (
                  <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                    <svg className="w-8 h-8 mr-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Công suất</p>
                      <p className="text-lg font-semibold text-gray-900">{variantData.motorPower} HP</p>
                    </div>
                  </div>
                )}

                {variantData.batteryCapacity && (
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <svg className="w-8 h-8 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Dung lượng pin</p>
                      <p className="text-lg font-semibold text-gray-900">{variantData.batteryCapacity} kWh</p>
                    </div>
                  </div>
                )}

                {variantData.chargingTime && (
                  <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                    <svg className="w-8 h-8 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Thời gian sạc</p>
                      <p className="text-lg font-semibold text-gray-900">{variantData.chargingTime} giờ</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={variantData.status !== 'AVAILABLE'}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg"
                >
                  Thêm vào giỏ hàng
                </button>
                
                <button
                  onClick={handleTestDrive}
                  className="w-full px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                >
                  Đặt lịch lái thử
                </button>

                <button
                  onClick={() => {
                    toggleComparison(parseInt(variantId));
                    if (!isInComparison(parseInt(variantId))) {
                      // Show option to go to comparison page
                      setTimeout(() => {
                        if (window.confirm("Đã thêm vào so sánh. Bạn có muốn xem trang so sánh không?")) {
                          navigate('/compare');
                        }
                      }, 500);
                    }
                  }}
                  className={`w-full px-6 py-3 border-2 rounded-lg transition-colors font-semibold ${
                    isInComparison(parseInt(variantId))
                      ? 'bg-green-600 border-green-600 text-white hover:bg-green-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isInComparison(parseInt(variantId)) ? 'Đã thêm vào so sánh ✓' : 'So sánh xe'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        {variantData && (
          <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông Số Kỹ Thuật Chi Tiết</h2>
            
            {/* Battery & Charging */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                Pin & Phạm vi hoạt động
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Dung lượng pin</p>
                  <p className="text-xl font-bold">{variantData.batteryCapacity || 'N/A'} kWh</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phạm vi hoạt động</p>
                  <p className="text-xl font-bold">{variantData.rangeKm || 'N/A'} km</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Thời gian sạc</p>
                  <p className="text-xl font-bold">{variantData.chargingTime || 'N/A'} giờ</p>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Hiệu suất
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Công suất động cơ</p>
                  <p className="text-xl font-bold">{variantData.motorPower || 'N/A'} kW</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mô-men xoắn</p>
                  <p className="text-xl font-bold">{variantData.torque || 'N/A'} Nm</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tăng tốc 0-100km/h</p>
                  <p className="text-xl font-bold">{variantData.acceleration || 'N/A'} giây</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tốc độ tối đa</p>
                  <p className="text-xl font-bold">{variantData.topSpeed || 'N/A'} km/h</p>
                </div>
              </div>
            </div>

            {/* Dimensions & Weight */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Kích thước & Khối lượng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Kích thước (DxRxC)</p>
                  <p className="text-xl font-bold">{variantData.dimensions || 'N/A'} mm</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trọng lượng</p>
                  <p className="text-xl font-bold">{variantData.weight || 'N/A'} kg</p>
                </div>
              </div>
            </div>

            {/* Warranty & Description */}
            {(variantData.warrantyYears || variantData.description) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Thông tin bổ sung</h3>
                <div className="space-y-4">
                  {variantData.warrantyYears && (
                    <div>
                      <p className="text-sm text-gray-600">Bảo hành</p>
                      <p className="font-medium text-lg">{variantData.warrantyYears} năm</p>
                    </div>
                  )}
                  {variantData.description && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Mô tả</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{variantData.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Extended Specs */}
        {modelData?.extendedSpecs && Object.keys(modelData.extendedSpecs).length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông số bổ sung</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(modelData.extendedSpecs).map(([key, value]) => (
                <div key={key} className="border-b pb-2">
                  <span className="text-gray-600">{key}:</span>
                  <span className="ml-2 font-semibold text-gray-900">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Section - TODO */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tính năng nổi bật</h2>
          <p className="text-gray-600">Thông tin tính năng sẽ được cập nhật sớm...</p>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Đánh giá từ khách hàng</h2>
          
          {/* Review Form - Only show if user is logged in */}
          {user && modelData && (
            <div className="mb-8">
              <ReviewForm
                modelId={modelData.modelId}
                variantId={variantData.variantId}
                vehicleModelName={modelData.modelName}
                vehicleVariantName={variantData.versionName}
                customerId={user.customerId}
                onSuccess={() => {
                  // Reload reviews after successful submission
                  window.location.reload();
                }}
              />
            </div>
          )}

          {/* Review List */}
          {modelData && <ReviewList modelId={modelData.modelId} />}
        </div>
      </div>
    </div>
  );
}
