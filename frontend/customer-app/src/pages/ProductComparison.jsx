import { useState, useEffect } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { GitCompare, X, Plus, CheckCircle } from "lucide-react";
import { getVehicles, getVehicleById, getVariants } from "../services/vehicleService";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";

const formatPrice = (price) => {
  if (!price) return "Liên hệ";
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

const ProductComparison = () => {
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [showSelector, setShowSelector] = useState(false);

  // Fetch all vehicles
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles-comparison'],
    queryFn: async () => {
      try {
        const response = await getVehicles(0, 100); // Get up to 100 vehicles for comparison
        // API returns ApiRespond<Page<ModelSummaryDto>>
        // response is ApiRespond, response.data is Page, response.data.content is array
        const pageData = response.data || response;
        return pageData.content || pageData || [];
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        return [];
      }
    },
  });

  // Fetch details for selected vehicles using useQueries
  const vehicleQueries = useQueries({
    queries: selectedVehicles.map((vehicleId) => ({
      queryKey: ['vehicle', vehicleId],
      queryFn: async () => {
        try {
          const response = await getVehicleById(vehicleId);
          // API returns ApiRespond<ModelDetailDto>
          // response is ApiRespond, response.data is ModelDetailDto
          return response.data || response;
        } catch (error) {
          console.error(`Error fetching vehicle ${vehicleId}:`, error);
          toast.error(`Không thể tải thông tin xe ${vehicleId}`);
          return null;
        }
      },
      enabled: !!vehicleId,
    })),
  });

  const handleAddVehicle = (vehicleId) => {
    if (selectedVehicles.length >= 3) {
      toast.error("Chỉ có thể so sánh tối đa 3 mẫu xe");
      return;
    }
    if (selectedVehicles.includes(vehicleId)) {
      toast.error("Mẫu xe này đã được chọn");
      return;
    }
    setSelectedVehicles([...selectedVehicles, vehicleId]);
    setShowSelector(false);
  };

  const handleRemoveVehicle = (vehicleId) => {
    setSelectedVehicles(selectedVehicles.filter(id => id !== vehicleId));
  };

  const comparisonData = vehicleQueries
    .map(query => query.data)
    .filter(Boolean);

  if (comparisonData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
              <GitCompare className="w-10 h-10 text-blue-600" />
              So Sánh Xe Điện
            </h1>
            <p className="text-gray-600 text-lg">
              Chọn 2-3 mẫu xe để so sánh thông số kỹ thuật
            </p>
          </div>

          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <GitCompare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Chưa có xe nào được chọn</h2>
            <p className="text-gray-600 mb-6">Hãy chọn các mẫu xe bạn muốn so sánh</p>
            <Button
              onClick={() => setShowSelector(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Chọn Xe Để So Sánh
            </Button>
          </div>

          {showSelector && (
            <VehicleSelector
              vehicles={Array.isArray(vehiclesData) ? vehiclesData : []}
              selectedVehicles={selectedVehicles}
              onSelect={handleAddVehicle}
              onClose={() => setShowSelector(false)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <GitCompare className="w-10 h-10 text-blue-600" />
              So Sánh Xe Điện
            </h1>
            <p className="text-gray-600">
              Đang so sánh {comparisonData.length} mẫu xe
            </p>
          </div>
          <div className="flex gap-4">
            {selectedVehicles.length < 3 && (
              <Button
                onClick={() => setShowSelector(true)}
                variant="outline"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Thêm Xe
              </Button>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 min-w-[200px]">
                    Thông Số
                  </th>
                  {comparisonData.map((vehicle, index) => (
                    <th key={vehicle.modelId} className="px-6 py-4 text-center min-w-[250px] relative">
                      <button
                        onClick={() => handleRemoveVehicle(vehicle.modelId)}
                        className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-full"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                      <img
                        src={vehicle.thumbnailUrl || "https://via.placeholder.com/200"}
                        alt={vehicle.modelName}
                        className="w-32 h-24 object-cover rounded-lg mx-auto mb-2"
                      />
                      <div className="font-bold text-lg">{vehicle.modelName}</div>
                      <div className="text-sm text-gray-600">{vehicle.brand}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Price */}
                <tr className="bg-blue-50">
                  <td className="px-6 py-4 font-semibold sticky left-0 bg-blue-50 z-10">Giá Khởi Điểm</td>
                  {comparisonData.map((vehicle) => {
                    // Get price from first variant or use basePrice if available
                    const price = vehicle.variants && vehicle.variants.length > 0 
                      ? vehicle.variants[0].price 
                      : vehicle.basePrice;
                    return (
                      <td key={vehicle.modelId} className="px-6 py-4 text-center">
                        {formatPrice(price)}
                      </td>
                    );
                  })}
                </tr>

                {/* Battery */}
                <tr>
                  <td className="px-6 py-4 font-semibold sticky left-0 bg-white z-10">Dung Lượng Pin</td>
                  {comparisonData.map((vehicle) => (
                    <td key={vehicle.modelId} className="px-6 py-4 text-center">
                      {vehicle.baseBatteryCapacity || "N/A"} kWh
                    </td>
                  ))}
                </tr>

                {/* Range */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-semibold sticky left-0 bg-gray-50 z-10">Quãng Đường (WLTP)</td>
                  {comparisonData.map((vehicle) => (
                    <td key={vehicle.modelId} className="px-6 py-4 text-center">
                      {vehicle.baseRangeKm || "N/A"} km
                    </td>
                  ))}
                </tr>

                {/* Charging Time */}
                <tr>
                  <td className="px-6 py-4 font-semibold sticky left-0 bg-white z-10">Thời Gian Sạc Nhanh (80%)</td>
                  {comparisonData.map((vehicle) => (
                    <td key={vehicle.modelId} className="px-6 py-4 text-center">
                      {vehicle.baseChargingTime ? `${vehicle.baseChargingTime} phút` : "N/A"}
                    </td>
                  ))}
                </tr>

                {/* Motor Power */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-semibold sticky left-0 bg-gray-50 z-10">Công Suất Động Cơ</td>
                  {comparisonData.map((vehicle) => (
                    <td key={vehicle.modelId} className="px-6 py-4 text-center">
                      {vehicle.baseMotorPower || "N/A"} kW
                    </td>
                  ))}
                </tr>

                {/* Status */}
                <tr>
                  <td className="px-6 py-4 font-semibold sticky left-0 bg-white z-10">Trạng Thái</td>
                  {comparisonData.map((vehicle) => (
                    <td key={vehicle.modelId} className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        vehicle.status === 'AVAILABLE' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {vehicle.status === 'AVAILABLE' ? 'Có Sẵn' : 'Đặt Trước'}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          {comparisonData.map((vehicle) => (
            <Button
              key={vehicle.modelId}
              onClick={() => window.location.href = `/product/${vehicle.modelId}`}
              variant="outline"
            >
              Xem Chi Tiết {vehicle.modelName}
            </Button>
          ))}
        </div>

        {showSelector && (
          <VehicleSelector
            vehicles={Array.isArray(vehiclesData) ? vehiclesData : []}
            selectedVehicles={selectedVehicles}
            onSelect={handleAddVehicle}
            onClose={() => setShowSelector(false)}
          />
        )}
      </div>
    </div>
  );
};

// Vehicle Selector Modal Component
const VehicleSelector = ({ vehicles, selectedVehicles, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">Chọn Xe Để So Sánh</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Array.isArray(vehicles) ? vehicles : []).map((vehicle) => (
              <button
                key={vehicle.modelId}
                onClick={() => onSelect(vehicle.modelId)}
                disabled={selectedVehicles.includes(vehicle.modelId)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedVehicles.includes(vehicle.modelId)
                    ? 'border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-blue-500 hover:shadow-lg'
                }`}
              >
                <img
                  src={vehicle.thumbnailUrl || "https://via.placeholder.com/200"}
                  alt={vehicle.modelName}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <div className="font-semibold">{vehicle.modelName}</div>
                <div className="text-sm text-gray-600">{formatPrice(vehicle.basePrice)}</div>
                {selectedVehicles.includes(vehicle.modelId) && (
                  <div className="mt-2 text-blue-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">Đã chọn</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComparison;
