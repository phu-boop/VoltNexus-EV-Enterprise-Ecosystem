import apiConst from "./apiConst";

const reportingService = {
    getSalesSummary: async () => {
        try {
            // Gateway route: /reporting -> reporting-service
            const response = await apiConst.get("/reporting/api/reports/sales/summary");
            return response.data;
        } catch (error) {
            console.error("Error fetching sales summary:", error);
            throw error;
        }
    },

    getDemandForecast: async (modelName = "") => {
        try {
            const url = modelName 
                ? `/reporting/api/reports/forecast?modelName=${encodeURIComponent(modelName)}`
                : `/reporting/api/reports/forecast`;
                
            const response = await apiConst.post(url, {});
            return response.data;
        } catch (error) {
            console.error("Error fetching forecast:", error);
            throw error;
        }
    },

    syncData: async () => {
        try {
            const response = await apiConst.post("/reporting/api/sync/sales", {});
            return response.data;
        } catch (error) {
            console.error("Error syncing data:", error);
            throw error;
        }
    },

    syncInventoryData: async () => {
        try {
            const response = await apiConst.post("/reporting/api/sync/inventory", {});
            return response.data;
        } catch (error) {
            console.error("Error syncing inventory:", error);
            throw error;
        }
    },

    syncMetadata: async () => {
        try {
            const response = await apiConst.post("/reporting/api/sync/metadata", {});
            return response.data;
        } catch (error) {
            console.error("Error syncing metadata:", error);
            throw error;
        }
    },

    checkForecastStatus: async (modelName = "") => {
        try {
            const url = modelName 
                ? `/reporting/api/reports/forecast/check?modelName=${encodeURIComponent(modelName)}`
                : `/reporting/api/reports/forecast/check`;
            const response = await apiConst.get(url);
            return response.data; // { exists: true/false }
        } catch (error) {
            console.error("Error checking forecast status:", error);
            return { exists: false };
        }
    }
};

export default reportingService;

