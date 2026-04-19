// const Home = () => {
//   return (
//       <main className="flex-grow">
//       </main>
//   );
// };

// export default Home;
import { useState, useEffect } from "react";
import HeroBanner from "../components/home/HeroBanner";
import FilterPanel from "../components/home/FilterPanel";
import VehicleGrid from "../components/home/VehicleGrid";
import VehicleDetailModal from "../components/home/VehicleDetailModal";
import QuickQuoteForm from "../components/home/QuickQuoteForm";
import TestDriveSection from "../components/home/TestDriveSection";
import PromotionSection from "../components/home/PromotionSection";
import RecommendedSection from "../components/home/RecommendedSection";
import CustomerFeedback from "../components/home/CustomerFeedback";

const Home = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [filters, setFilters] = useState({});

  // Mock data - Thay thế bằng API call thực tế
  useEffect(() => {
    const mockVehicles = [
      {
        id: 1,
        name: "EVM X5",
        version: "Premium Edition",
        price: 1200,
        image:
          "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400",
        status: "available",
        range: 450,
        chargingTime: "30 phút (80%)",
        power: "150kW",
        colors: [
          { name: "Đen bóng", code: "#1a1a1a" },
          { name: "Trắng ngọc", code: "#f8f8f8" },
          { name: "Xám titan", code: "#666666" },
        ],
        battery: "75 kWh",
        fastCharge: "30 phút",
        seats: 5,
        rating: 4.5,
        reviews: 89,
        versions: [
          { name: "Standard", price: 1100 },
          { name: "Premium", price: 1200 },
          { name: "Luxury", price: 1400 },
        ],
        description:
          "EVM X5 là mẫu SUV điện cao cấp với thiết kế hiện đại, công nghệ tiên tiến và hiệu suất vượt trội. Xe trang bị hệ thống pin 75 kWh cho phép di chuyển lên đến 450km sau mỗi lần sạc.",
      },
      {
        id: 2,
        name: "EVM S3",
        version: "Standard Edition",
        price: 850,
        image:
          "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=400",
        status: "pre_order",
        range: 350,
        chargingTime: "25 phút (80%)",
        power: "120kW",
        colors: [
          { name: "Đỏ cam", code: "#ff6b35" },
          { name: "Xanh dương", code: "#0066cc" },
          { name: "Bạc", code: "#c0c0c0" },
        ],
        battery: "55 kWh",
        fastCharge: "25 phút",
        seats: 5,
        rating: 4.2,
        reviews: 67,
        versions: [
          { name: "Standard", price: 850 },
          { name: "Premium", price: 950 },
        ],
        description:
          "EVM S3 - Sedan điện thế hệ mới với thiết kế trẻ trung, tiết kiệm năng lượng và giá cả phải chăng. Phù hợp cho gia đình và sử dụng đô thị.",
      },
      {
        id: 3,
        name: "EVM T7",
        version: "Luxury Edition",
        price: 1800,
        image:
          "https://images.unsplash.com/photo-1593941707882-a5bba5331fe2?w=400",
        status: "available",
        range: 550,
        chargingTime: "35 phút (80%)",
        power: "200kW",
        colors: [
          { name: "Vàng đồng", code: "#b8860b" },
          { name: "Xanh đen", code: "#003366" },
        ],
        battery: "95 kWh",
        fastCharge: "35 phút",
        seats: 7,
        rating: 4.8,
        reviews: 45,
        versions: [
          { name: "Premium", price: 1600 },
          { name: "Luxury", price: 1800 },
        ],
        description:
          "EVM T7 - Flagship SUV 7 chỗ với không gian rộng rãi, công nghệ hàng đầu và hiệu suất đỉnh cao. Lựa chọn hoàn hảo cho gia đình đa thế hệ.",
      },
    ];
    setVehicles(mockVehicles);
  }, []);

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleModal(true);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Xử lý lọc dữ liệu ở đây
  };

  const handleCreateQuote = () => {
    setShowVehicleModal(false);
    setShowQuoteModal(true);
  };

  const handleTestDrive = () => {
    setShowVehicleModal(false);
    // Có thể chuyển hướng đến phần đặt lịch lái thử
    document
      .getElementById("test-drive-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSaveQuote = (quoteData) => {
    // Xử lý lưu báo giá
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-grow">
        <HeroBanner />

        <div className="max-w-7xl mx-auto px-6 py-8">
          <FilterPanel onFilterChange={handleFilterChange} />
          <VehicleGrid
            vehicles={vehicles}
            onVehicleSelect={handleVehicleSelect}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <PromotionSection />
        </div>

        <div id="test-drive-section">
          <TestDriveSection />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <RecommendedSection
            vehicles={vehicles}
            onVehicleSelect={handleVehicleSelect}
          />
        </div>

        <CustomerFeedback />
      </main>

      {/* Modals */}
      <VehicleDetailModal
        vehicle={selectedVehicle}
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        onQuote={handleCreateQuote}
        onTestDrive={handleTestDrive}
      />

      <QuickQuoteForm
        vehicle={selectedVehicle}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        onSave={handleSaveQuote}
      />
    </div>
  );
};

export default Home;
