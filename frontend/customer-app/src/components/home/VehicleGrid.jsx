import { Zap, Battery, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VehicleGrid = ({ vehicles, onVehicleSelect }) => {
  const navigate = useNavigate();

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    // API trả về giá theo VNĐ, không cần nhân 1000000
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleImageError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000";
    e.target.onerror = null;
  };

  // Get primary image from variants colorImages or fallback to thumbnailUrl (same logic as admin)
  const getPrimaryImage = (vehicle) => {
    try {
      // Try to get first variant with colorImages
      if (vehicle.variants && vehicle.variants.length > 0) {
        const firstVariant = vehicle.variants[0];
        if (firstVariant.colorImages) {
          const colorImagesData = JSON.parse(firstVariant.colorImages);
          if (colorImagesData.length > 0) {
            const primaryColor = colorImagesData.find(c => c.isPrimary) || colorImagesData[0];
            if (primaryColor.imageUrl) {
              return primaryColor.imageUrl;
            }
          }
        }
        // Fallback to variant imageUrl
        if (firstVariant.imageUrl) {
          return firstVariant.imageUrl;
        }
      }
    } catch (e) {
      console.error("Error parsing colorImages:", e);
    }
    return vehicle.thumbnailUrl || vehicle.imageUrl || "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000";
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Có sẵn';
      case 'COMING_SOON':
        return 'Sắp có';
      case 'OUT_OF_STOCK':
        return 'Hết hàng';
      default:
        return 'Liên hệ';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-500/90 text-white';
      case 'COMING_SOON':
        return 'bg-blue-500/90 text-white';
      case 'OUT_OF_STOCK':
        return 'bg-gray-500/90 text-white';
      default:
        return 'bg-white/90 text-gray-700';
    }
  };

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Chưa có xe nào trong danh mục</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 px-4">
      {vehicles.map((vehicle) => (
        <div 
          key={vehicle.modelId} 
          className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 border border-gray-100 flex flex-col cursor-pointer"
          onClick={() => {
            if (vehicle.modelId) {
              navigate(`/product/${vehicle.modelId}`);
            } else if (onVehicleSelect) {
              onVehicleSelect(vehicle);
            }
          }}
        >
          <div className="relative h-64 overflow-hidden bg-gray-100">
            <img
              src={getPrimaryImage(vehicle)}
              alt={vehicle.modelName || "Xe điện"}
              onError={handleImageError}
              className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className={`absolute top-4 left-4 ${getStatusColor(vehicle.status)} backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm`}>
              {getStatusLabel(vehicle.status)}
            </div>
            {vehicle.brand && (
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
                {vehicle.brand}
              </div>
            )}
          </div>
          
          <div className="p-6 flex-1 flex flex-col">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {vehicle.modelName || "Xe điện"}
              </h3>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
              {vehicle.baseRangeKm && (
                <>
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-500"/> 
                    {vehicle.baseRangeKm}km
                  </div>
                  {vehicle.baseChargingTime && <div className="w-px h-4 bg-gray-300"></div>}
                </>
              )}
              {vehicle.baseChargingTime && (
                <div className="flex items-center gap-1">
                  <Battery className="w-4 h-4 text-green-500"/> 
                  {Math.round(vehicle.baseChargingTime)} phút
                </div>
              )}
            </div>

            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <span className="text-xs text-gray-400 font-semibold uppercase block">Giá khởi điểm</span>
                <span className="text-xl font-black text-gray-900">
                  {formatPrice(vehicle.basePrice)}
                </span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (vehicle.modelId) {
                    navigate(`/product/${vehicle.modelId}`);
                  } else if (onVehicleSelect) {
                    onVehicleSelect(vehicle);
                  }
                }}
                className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center group-hover:bg-blue-600 transition-all shadow-lg group-hover:shadow-blue-500/30 hover:scale-110"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VehicleGrid;

