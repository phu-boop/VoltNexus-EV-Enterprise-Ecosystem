import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useComparison } from "../../utils/useComparison";

export default function VehicleCard({ vehicle, onViewDetail }) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const { isInComparison, toggleComparison } = useComparison();

  const handleClick = () => {
    if (onViewDetail) {
      onViewDetail(vehicle);
    } else {
      navigate(`/vehicles/${vehicle.variantId}`);
    }
  };

  // Format price to Vietnamese currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Get primary image from colorImages or fallback to imageUrl (same as admin page)
  const getPrimaryImage = () => {
    try {
      if (vehicle.colorImages) {
        const colorImagesData = JSON.parse(vehicle.colorImages);
        if (colorImagesData.length > 0) {
          const primaryColor = colorImagesData.find(c => c.isPrimary) || colorImagesData[0];
          if (primaryColor.imageUrl) {
            return primaryColor.imageUrl;
          }
        }
      }
    } catch (e) {
      console.error("Error parsing colorImages:", e);
    }
    return vehicle.imageUrl || null;
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {!imageError && getPrimaryImage() ? (
          <img
            src={getPrimaryImage()}
            alt={vehicle.versionName || 'Vehicle'}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
            <svg className="w-20 h-20 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
          </div>
        )}
        
        {/* Status Badge */}
        {vehicle.status && (
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              vehicle.status === 'AVAILABLE' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-500 text-white'
            }`}>
              {vehicle.status === 'AVAILABLE' ? 'Còn hàng' : 'Hết hàng'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {vehicle.versionName || 'Xe điện'}
        </h3>

        {/* Color */}
        {vehicle.color && (
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-medium">Màu:</span> {vehicle.color}
          </p>
        )}

        {/* Specs */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {vehicle.rangeKm && (
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-gray-700">{vehicle.rangeKm} km</span>
            </div>
          )}
          {vehicle.motorPower && (
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 mr-1 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-gray-700">{vehicle.motorPower} HP</span>
            </div>
          )}
          {vehicle.batteryCapacity && (
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <span className="text-gray-700">{vehicle.batteryCapacity} kWh</span>
            </div>
          )}
          {vehicle.chargingTime && (
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700">{vehicle.chargingTime}h</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="border-t pt-4">
          {/* Price and Comparison */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {formatPrice(vehicle.price)}
              </p>
              {vehicle.wholesalePrice && vehicle.wholesalePrice < vehicle.price && (
                <p className="text-xs text-gray-500 line-through">
                  {formatPrice(vehicle.wholesalePrice)}
                </p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleComparison(vehicle.variantId);
              }}
              className={`p-2 rounded-lg transition-colors ${
                isInComparison(vehicle.variantId)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              title={isInComparison(vehicle.variantId) ? "Xóa khỏi so sánh" : "Thêm vào so sánh"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </button>
          </div>
          
          {/* View Detail Button */}
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
