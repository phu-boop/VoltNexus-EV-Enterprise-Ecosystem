import apiConstReportService from "../../../../services/apiConstReportService"; // Hoặc đường dẫn đúng đến file axios của bạn

/**
 * Gọi API để lấp đầy (backfill) dữ liệu cache của Đại lý
 * API: POST /api/v1/admin/backfill/dealers
 *
 */
export const callBackfillDealers = () => {
  return apiConstReportService.post("/api/v1/admin/backfill/dealers");
};

/**
 * Gọi API để lấp đầy (backfill) dữ liệu cache của Xe
 * API: POST /api/v1/admin/backfill/vehicles
 *
 */
export const callBackfillVehicles = () => {
  return apiConstReportService.post("/api/v1/admin/backfill/vehicles");
};
