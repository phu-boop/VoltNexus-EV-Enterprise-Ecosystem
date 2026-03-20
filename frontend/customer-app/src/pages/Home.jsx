import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HeroBanner from "../components/home/HeroBanner";
import AdvancedFilterPanel from "../components/home/AdvancedFilterPanel";
import VehicleGrid from "../components/home/VehicleGrid";
import VehicleDetailModal from "../components/home/VehicleDetailModal";
import PromotionSection from "../components/home/PromotionSection";
import RecommendedSection from "../components/home/RecommendedSection";
import TestDriveSection from "../components/home/TestDriveSection";
import CustomerFeedback from "../components/home/CustomerFeedback";
import { searchVehicles, getVehicles } from "../services/vehicleService";
import { getActivePromotions } from "../services/promotionService";
import { toast } from "react-toastify";

const Home = () => {
  const navigate = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    priceMin: "",
    priceMax: "",
    vehicleType: "",
    rangeMin: "",
    rangeMax: "",
    sortBy: "name",
  });
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;

  // Convert filters to API parameters
  const searchParams = useMemo(() => {
    const params = {
      page: currentPage,
      size: pageSize,
      sortBy:
        filters.sortBy === "name"
          ? "modelName"
          : filters.sortBy === "price-low"
          ? "basePrice"
          : filters.sortBy === "price-high"
          ? "basePrice"
          : "baseRangeKm",
      direction: filters.sortBy === "price-high" ? "DESC" : "ASC",
    };

    if (filters.search) params.keyword = filters.search;
    if (filters.priceMin)
      params.minPrice = parseFloat(filters.priceMin) * 1000000; // Convert triệu VNĐ to VNĐ
    if (filters.priceMax)
      params.maxPrice = parseFloat(filters.priceMax) * 1000000;
    if (filters.rangeMin) params.minRange = parseInt(filters.rangeMin);
    if (filters.rangeMax) params.maxRange = parseInt(filters.rangeMax);

    return params;
  }, [filters, currentPage, pageSize]);

  // Check if we have active filters (except sort)
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.search ||
      filters.priceMin ||
      filters.priceMax ||
      filters.rangeMin ||
      filters.rangeMax ||
      filters.vehicleType
    );
  }, [filters]);

  // Fetch vehicles from API with search/filters
  const {
    data: vehiclesResponse,
    isLoading: vehiclesLoading,
    error: vehiclesError,
  } = useQuery({
    queryKey: ["vehicles", searchParams],
    queryFn: async () => {
      try {
        if (hasActiveFilters) {
          const response = await searchVehicles(searchParams);
          return response.data || { content: [] }; // Page object from API
        } else {
          const response = await getVehicles(currentPage, pageSize);
          return response.data || { content: [] }; // Page object from API
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        toast.error("Không thể tải danh sách xe");
        return null;
      }
    },
  });

  // Fetch promotions from API
  const { data: promotionsData } = useQuery({
    queryKey: ["promotions"],
    queryFn: async () => {
      try {
        const response = await getActivePromotions();
        return response.data || [];
      } catch (error) {
        console.error("Error fetching promotions:", error);
        return [];
      }
    },
  });

  // Extract vehicles and pagination info from Page object
  const vehicles = vehiclesResponse?.content || [];
  const totalPages = vehiclesResponse?.totalPages || 0;
  const totalElements = vehiclesResponse?.totalElements || 0;
  const isFirstPage = vehiclesResponse?.first ?? true;
  const isLastPage = vehiclesResponse?.last ?? false;

  // Get first few vehicles for recommended section (without filters)
  const { data: recommendedResponse } = useQuery({
    queryKey: ["vehicles-recommended"],
    queryFn: async () => {
      try {
        const response = await getVehicles(0, 6);
        // API returns ApiRespond<Page<ModelSummaryDto>>
        // response is ApiRespond, response.data is Page, response.data.content is array
        const pageData = response.data || response;
        return pageData.content || pageData || [];
      } catch (error) {
        console.error("Error fetching recommended vehicles:", error);
        return [];
      }
    },
  });
  const recommendedVehicles = Array.isArray(recommendedResponse)
    ? recommendedResponse
    : [];

  const handleVehicleSelect = (vehicle) => {
    if (vehicle.modelId) {
      navigate(`/product/${vehicle.modelId}`);
    } else {
      setSelectedVehicle(vehicle);
      setShowVehicleModal(true);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(0); // Reset to first page when filters change
  };

  const handleTestDrive = () => {
    setShowVehicleModal(false);
    document
      .getElementById("test-drive-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (vehiclesLoading && currentPage === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-grow">
        <HeroBanner />

        <div className="max-w-7xl mx-auto px-6 py-8">
          <AdvancedFilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {vehiclesLoading && currentPage > 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải...</p>
            </div>
          ) : vehicles.length > 0 ? (
            <>
              {hasActiveFilters && (
                <div className="mb-4 text-sm text-gray-600">
                  Tìm thấy{" "}
                  <span className="font-semibold">{totalElements}</span> xe phù
                  hợp
                </div>
              )}
              <VehicleGrid
                vehicles={vehicles}
                onVehicleSelect={handleVehicleSelect}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 mb-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={isFirstPage}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      isFirstPage
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-500"
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (currentPage < 3) {
                        pageNum = i;
                      } else if (currentPage > totalPages - 4) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-lg border transition-all ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-500"
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={isLastPage}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      isLastPage
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-500"
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                Không tìm thấy xe nào phù hợp
              </p>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setFilters({
                      search: "",
                      priceMin: "",
                      priceMax: "",
                      vehicleType: "",
                      rangeMin: "",
                      rangeMax: "",
                      sortBy: "name",
                    });
                    setCurrentPage(0);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <PromotionSection promotions={promotionsData || []} />
        </div>

        <div id="test-drive-section">
          <TestDriveSection />
        </div>

        {recommendedVehicles.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <RecommendedSection
              vehicles={recommendedVehicles}
              onVehicleSelect={handleVehicleSelect}
            />
          </div>
        )}

        <CustomerFeedback />
      </main>

      {/* Modals */}
      <VehicleDetailModal
        vehicle={selectedVehicle}
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        onTestDrive={handleTestDrive}
      />
    </div>
  );
};

export default Home;
