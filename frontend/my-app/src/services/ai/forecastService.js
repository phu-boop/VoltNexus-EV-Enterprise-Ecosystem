import axios from "axios";

const AI_SERVICE_URL = `${import.meta.env.VITE_API_BASE_URL}/ai`;

// Create axios instance with interceptors for authentication
const aiServiceClient = axios.create({
  baseURL: AI_SERVICE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Add Authorization header from sessionStorage
aiServiceClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401 errors
aiServiceClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = res.data.data.accessToken;
        sessionStorage.setItem("token", newToken);
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return aiServiceClient(error.config);
      } catch (refreshError) {
        sessionStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Service để gọi AI Service APIs
 */
class AIForecastService {
  /**
   * Generate forecast
   */
  async generateForecast(request) {
    try {
      const response = await aiServiceClient.post(
        `/forecast/generate`,
        request
      );
      return response.data;
    } catch (error) {
      console.error("Error generating forecast:", error);
      throw error;
    }
  }

  /**
   * Get forecast by region
   */
  async getForecastByRegion(region, startDate, endDate) {
    try {
      const response = await aiServiceClient.get(`/forecast/region/${region}`, {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting forecast by region:", error);
      throw error;
    }
  }

  /**
   * Get forecast by dealer
   */
  async getForecastByDealer(dealerId, startDate, endDate) {
    try {
      const response = await aiServiceClient.get(
        `/forecast/dealer/${dealerId}`,
        {
          params: { startDate, endDate },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting forecast by dealer:", error);
      throw error;
    }
  }

  /**
   * Quick forecast for variant
   */
  async quickForecast(variantId, daysToForecast = 30, method = "AUTO") {
    try {
      const response = await aiServiceClient.get(
        `/forecast/variant/${variantId}`,
        {
          params: { daysToForecast, method },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error in quick forecast:", error);
      throw error;
    }
  }

  /**
   * Generate production plan
   */
  async generateProductionPlan(planMonth) {
    try {
      const response = await aiServiceClient.post(
        `/production-plan/generate`,
        null,
        {
          params: { planMonth },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error generating production plan:", error);
      throw error;
    }
  }

  /**
   * Get production plans
   */
  async getProductionPlans(month) {
    try {
      const response = await aiServiceClient.get(`/production-plan`, {
        params: { month },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting production plans:", error);
      throw error;
    }
  }

  /**
   * Approve production plan
   */
  async approveProductionPlan(planId) {
    try {
      const response = await aiServiceClient.put(
        `/production-plan/${planId}/approve`
      );
      return response.data;
    } catch (error) {
      console.error("Error approving production plan:", error);
      throw error;
    }
  }

  /**
   * Get dashboard analytics
   */
  async getDashboard(daysBack = 30) {
    try {
      const response = await aiServiceClient.get(`/analytics/dashboard`, {
        params: { daysBack },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting dashboard:", error);
      throw error;
    }
  }
}

export default new AIForecastService();
