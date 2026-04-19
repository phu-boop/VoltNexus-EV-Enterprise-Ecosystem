import { X, Star, Battery, Zap, Clock, Users } from "lucide-react";
import Button from "../ui/Button";

const VehicleDetailModal = ({ vehicle, isOpen, onClose, onTestDrive }) => {
  if (!isOpen || !vehicle) return null;

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price * 1000000);
  };

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">{vehicle.modelName || vehicle.name || "Xe điện"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <img
                src={vehicle.imageUrl || vehicle.image || "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1000"}
                alt={vehicle.modelName || vehicle.name}
                className="w-full h-64 lg:h-80 object-cover rounded-lg mb-4"
              />
            </div>

            <div>
              <h3 className="text-3xl font-bold text-blue-600 mb-4">
                {formatPrice(vehicle.basePrice || vehicle.price)}
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Battery className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-sm text-gray-600">Pin</div>
                    <div className="font-semibold">{vehicle.battery || "N/A"}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <div>
                    <div className="text-sm text-gray-600">Quãng đường</div>
                    <div className="font-semibold">{vehicle.range || "N/A"} km</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-600">Sạc nhanh</div>
                    <div className="font-semibold">{vehicle.chargingTime || "N/A"}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-sm text-gray-600">Chỗ ngồi</div>
                    <div className="font-semibold">{vehicle.seats || "N/A"}</div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={onTestDrive} className="flex-1">
                  Đặt Lái Thử
                </Button>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Đóng
                </Button>
              </div>
            </div>
          </div>

          {vehicle.description && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Mô Tả Chi Tiết</h3>
              <p className="text-gray-700 leading-relaxed">{vehicle.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailModal;

