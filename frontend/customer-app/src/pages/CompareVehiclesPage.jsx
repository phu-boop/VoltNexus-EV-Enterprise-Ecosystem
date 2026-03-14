import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { compareVehicles } from "../services/comparisonService";
import toast from "react-hot-toast";

/**
 * CompareVehiclesPage - Vehicle comparison page
 * Allows users to compare 2-3 vehicles side-by-side
 */
function CompareVehiclesPage() {
  const navigate = useNavigate();
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComparison();
  }, []);

  const loadComparison = async () => {
    try {
      setLoading(true);
      // Get variant IDs from localStorage
      const compareList = JSON.parse(localStorage.getItem("compareList") || "[]");
      
      if (compareList.length === 0) {
        setComparisonData([]);
        setLoading(false);
        return;
      }

      // Fetch comparison data
      const response = await compareVehicles(compareList);
      if (response.success) {
        setComparisonData(response.data);
      }
    } catch (error) {
      console.error("Error loading comparison:", error);
      toast.error("Không thể tải dữ liệu so sánh");
    } finally {
      setLoading(false);
    }
  };

  const removeFromComparison = (variantId) => {
    const compareList = JSON.parse(localStorage.getItem("compareList") || "[]");
    const updated = compareList.filter((id) => id !== variantId);
    localStorage.setItem("compareList", JSON.stringify(updated));
    loadComparison();
    toast.success("Đã xóa khỏi danh sách so sánh");
  };

  const clearAll = () => {
    localStorage.removeItem("compareList");
    setComparisonData([]);
    toast.success("Đã xóa tất cả so sánh");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu so sánh...</p>
        </div>
      </div>
    );
  }

  if (comparisonData.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg
            className="mx-auto h-24 w-24 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Chưa có xe để so sánh</h2>
          <p className="mt-2 text-gray-600">
            Hãy thêm xe vào danh sách so sánh từ trang danh sách xe hoặc chi tiết xe
          </p>
          <button
            onClick={() => navigate("/vehicles")}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Xem danh sách xe
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">So sánh xe điện</h1>
          <p className="text-gray-600 mt-2">
            Đang so sánh {comparisonData.length} xe
          </p>
        </div>
        <button
          onClick={clearAll}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Xóa tất cả
        </button>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 z-10 bg-gray-50 px-6 py-4 text-left text-sm font-semibold text-gray-900 w-48">
                Thông tin
              </th>
              {comparisonData.map((item) => (
                <th key={item.details.variantId} className="px-6 py-4 text-left min-w-[280px]">
                  <div className="space-y-2">
                    <img
                      src={item.details.imageUrl || "/placeholder-car.jpg"}
                      alt={item.details.variantName}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <h3 className="font-bold text-gray-900">
                      {item.details.modelName}
                    </h3>
                    <p className="text-sm text-gray-600">{item.details.variantName}</p>
                    <button
                      onClick={() => removeFromComparison(item.details.variantId)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Price */}
            <tr className="hover:bg-gray-50">
              <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                Giá
              </td>
              {comparisonData.map((item) => (
                <td key={item.details.variantId} className="px-6 py-4">
                  <span className="text-xl font-bold text-blue-600">
                    {item.details.price?.toLocaleString("vi-VN")} VNĐ
                  </span>
                </td>
              ))}
            </tr>

            {/* Battery Capacity */}
            <tr className="hover:bg-gray-50">
              <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                Dung lượng pin
              </td>
              {comparisonData.map((item) => (
                <td key={item.details.variantId} className="px-6 py-4">
                  {item.details.batteryCapacity || "N/A"} kWh
                </td>
              ))}
            </tr>

            {/* Range */}
            <tr className="hover:bg-gray-50">
              <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                Quãng đường di chuyển
              </td>
              {comparisonData.map((item) => (
                <td key={item.details.variantId} className="px-6 py-4">
                  {item.details.range || "N/A"} km
                </td>
              ))}
            </tr>

            {/* Charging Time */}
            <tr className="hover:bg-gray-50">
              <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                Thời gian sạc nhanh
              </td>
              {comparisonData.map((item) => (
                <td key={item.details.variantId} className="px-6 py-4">
                  {item.details.chargingTime || "N/A"}
                </td>
              ))}
            </tr>

            {/* Motor Power */}
            <tr className="hover:bg-gray-50">
              <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                Công suất động cơ
              </td>
              {comparisonData.map((item) => (
                <td key={item.details.variantId} className="px-6 py-4">
                  {item.details.motorPower || "N/A"} kW
                </td>
              ))}
            </tr>

            {/* Top Speed */}
            <tr className="hover:bg-gray-50">
              <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                Tốc độ tối đa
              </td>
              {comparisonData.map((item) => (
                <td key={item.details.variantId} className="px-6 py-4">
                  {item.details.topSpeed || "N/A"} km/h
                </td>
              ))}
            </tr>

            {/* Acceleration */}
            <tr className="hover:bg-gray-50">
              <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                Tăng tốc 0-100 km/h
              </td>
              {comparisonData.map((item) => (
                <td key={item.details.variantId} className="px-6 py-4">
                  {item.details.acceleration || "N/A"}s
                </td>
              ))}
            </tr>

            {/* Seating Capacity */}
            <tr className="hover:bg-gray-50">
              <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                Số chỗ ngồi
              </td>
              {comparisonData.map((item) => (
                <td key={item.details.variantId} className="px-6 py-4">
                  {item.details.seatingCapacity || "N/A"} chỗ
                </td>
              ))}
            </tr>

            {/* Drive Type */}
            <tr className="hover:bg-gray-50">
              <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                Hệ dẫn động
              </td>
              {comparisonData.map((item) => (
                <td key={item.details.variantId} className="px-6 py-4">
                  {item.details.driveType || "N/A"}
                </td>
              ))}
            </tr>

            {/* Dimensions */}
            <tr className="hover:bg-gray-50">
              <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                Kích thước (DxRxC)
              </td>
              {comparisonData.map((item) => (
                <td key={item.details.variantId} className="px-6 py-4">
                  {item.details.length && item.details.width && item.details.height
                    ? `${item.details.length} x ${item.details.width} x ${item.details.height} mm`
                    : "N/A"}
                </td>
              ))}
            </tr>

            {/* Weight */}
            <tr className="hover:bg-gray-50">
              <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                Trọng lượng
              </td>
              {comparisonData.map((item) => (
                <td key={item.details.variantId} className="px-6 py-4">
                  {item.details.weight || "N/A"} kg
                </td>
              ))}
            </tr>

            {/* Color */}
            <tr className="hover:bg-gray-50">
              <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                Màu sắc
              </td>
              {comparisonData.map((item) => (
                <td key={item.details.variantId} className="px-6 py-4">
                  {item.details.color || "N/A"}
                </td>
              ))}
            </tr>

            {/* Action Buttons */}
            <tr className="hover:bg-gray-50">
              <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-900">
                Hành động
              </td>
              {comparisonData.map((item) => (
                <td key={item.details.variantId} className="px-6 py-4">
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate(`/vehicles/${item.details.variantId}`)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => {
                        // Add to cart logic here (you can implement this)
                        toast.success("Tính năng thêm vào giỏ hàng đang được phát triển");
                      }}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add more vehicles */}
      {comparisonData.length < 3 && (
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-4">
            Bạn có thể so sánh tối đa 3 xe. Thêm xe khác để so sánh?
          </p>
          <button
            onClick={() => navigate("/vehicles")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Thêm xe để so sánh
          </button>
        </div>
      )}
    </div>
  );
}

export default CompareVehiclesPage;
