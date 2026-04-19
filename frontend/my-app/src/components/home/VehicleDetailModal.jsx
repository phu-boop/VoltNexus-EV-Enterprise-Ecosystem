import { X, Star, Battery, Zap, Clock, Users } from "lucide-react";
import Button from "../ui/Button";

const VehicleDetailModal = ({ vehicle, isOpen, onClose, onQuote, onTestDrive }) => {
  if (!isOpen || !vehicle) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price * 1000000);
  };

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{vehicle.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hình ảnh */}
            <div>
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="w-full h-64 lg:h-80 object-cover rounded-lg mb-4"
              />
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((index) => (
                  <img
                    key={index}
                    src={vehicle.image}
                    alt={`${vehicle.name} ${index}`}
                    className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-75"
                  />
                ))}
              </div>
            </div>

            {/* Thông tin chi tiết */}
            <div>
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= vehicle.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">({vehicle.reviews} đánh giá)</span>
              </div>

              <h3 className="text-3xl font-bold text-blue-600 mb-4">{formatPrice(vehicle.price)}</h3>

              {/* Thông số kỹ thuật */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Battery className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-sm text-gray-600">Pin</div>
                    <div className="font-semibold">{vehicle.battery}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <div>
                    <div className="text-sm text-gray-600">Quãng đường</div>
                    <div className="font-semibold">{vehicle.range} km</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-600">Sạc nhanh</div>
                    <div className="font-semibold">{vehicle.fastCharge}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-sm text-gray-600">Chỗ ngồi</div>
                    <div className="font-semibold">{vehicle.seats}</div>
                  </div>
                </div>
              </div>

              {/* Màu sắc */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Màu sắc</h4>
                <div className="flex space-x-2">
                  {vehicle.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer hover:border-blue-500"
                      style={{ backgroundColor: color.code }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Phiên bản */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Phiên bản</h4>
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {vehicle.versions.map((version, index) => (
                    <option key={index} value={version.name}>
                      {version.name} - {formatPrice(version.price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nút thao tác */}
              <div className="flex space-x-3">
                <Button onClick={onQuote} className="flex-1">
                  Tạo Báo Giá
                </Button>
                <Button variant="outline" onClick={onTestDrive} className="flex-1">
                  Đặt Lái Thử
                </Button>
              </div>
            </div>
          </div>

          {/* Mô tả chi tiết */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Mô Tả Chi Tiết</h3>
            <p className="text-gray-700 leading-relaxed">{vehicle.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailModal;