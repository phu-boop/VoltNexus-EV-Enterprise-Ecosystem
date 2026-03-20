import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "../features/auth/AuthProvider";

// layouts
import EvmLayout from "../layouts/evmLayout/EvmLayout.jsx";
import UserLayout from "../layouts/UserLayout";
import DealerLayout from "../layouts/dealerLayout/DealerLayout.jsx";
import AuthLayout from "../layouts/AuthLayout";

// pages
import Home from "../pages/Home";
import Login from "../pages/Login.jsx";
// import Dashboard from "../features/dashboard/pages/Dashboard";
// import DashboardForDealer from "../features/dashboard/pages/DashboardForDealer.jsx";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import UserManagement from "../features/dashboard/users/pages/UserManagement.jsx";
import ProfileForm from "../features/profile/components/ProfileForm.jsx";
import SecuritySettings from "../features/profile/components/SecuritySettings.jsx";
import OAuthSuccess from "../pages/OAuthSuccess";
import ResetPassword from "../features/auth/pages/ResetPassword.jsx";
import DealerDashboardPage from "../features/dealer/dashboard/pages/DashboardPage.jsx";
import StaffDashboardPage from "../features/dealer/staff/dashboard/pages/StaffDashboardPage.jsx";
import AdminDashboardPage from "../features/admin/dashboard/pages/AdminDashboardPage.jsx";
import EvmStaffDashboardPage from "../features/evm/dashboard/pages/EvmStaffDashboardPage.jsx";
import AdminPromotionManager from "../features/admin/promotions/pages/AdminPromotionManager.jsx";
import CustomerPromotionView from "../features/dealer/promotions/CustomerPromotionView.jsx";
import NotificationManagement from "../features/admin/notifications/NotificationManagement.jsx";

// customer pages
import CustomerList from "../features/customers/management/pages/CustomerList.jsx";
import CreateCustomer from "../features/customers/management/pages/CreateCustomer.jsx";
import CustomerDetail from "../features/customers/management/pages/CustomerDetail.jsx";

// test drive pages
import TestDriveManagement from "../features/customers/testdrive/pages/TestDriveManagement.jsx";
import CreateTestDrive from "../features/customers/testdrive/pages/CreateTestDrive.jsx";
import EditTestDrive from "../features/customers/testdrive/pages/EditTestDrive.jsx";

// feedback pages
import FeedbackManagement from "../features/customers/feedback/pages/FeedbackManagement.jsx";
import CreateFeedback from "../features/customers/feedback/pages/CreateFeedback.jsx";
import FeedbackDetail from "../features/customers/feedback/pages/FeedbackDetail.jsx";
import FeedbackStatistics from "../features/customers/feedback/pages/FeedbackStatistics.jsx";

// EVM
import VehicleCatalogManager from "../features/evm/catalog/pages/VehicleCatalogPage.jsx";
import VariantManager from "../features/evm/catalog/pages/VariantManagementPage.jsx";
import MainPromotion from "../features/evm/promotions/pages/MainPromotion.jsx";
import InventoryCentral from "../features/evm/inventory/pages/InventoryPage.jsx";
import AllocationPage from "../features/evm/inventory/pages/AllocationPage.jsx";
import FeatureManagementPage from "../features/evm/catalog/pages/FeatureManagementPage.jsx";
import DistributionHistoryPage from "../features/evm/inventory/pages/DistributionHistoryPage.jsx";

// Thông báo (Socket)
import StaffNotificationPage from "../features/evm/notification/pages/StaffNotificationPage.jsx";
import B2BOrderDetailsPage from "../features/evm/notification/pages/B2BOrderDetailsPage.jsx";

// EVM Orders & Invoices Management
import B2BOrdersManagementPage from "../features/evm/orders/pages/B2BOrdersManagementPage.jsx";
import CashPaymentsManagementPage from "../features/evm/orders/pages/CashPaymentsManagementPage.jsx";
import CreateInvoiceFromOrderPage from "../features/evm/orders/pages/CreateInvoiceFromOrderPage.jsx";
import DealerDebtManagementPage from "../features/evm/orders/pages/DealerDebtManagementPage.jsx";
import DealerInvoicesListPage from "../features/evm/orders/pages/DealerInvoicesListPage.jsx";
import DealerInvoiceDetailsPage from "../features/evm/orders/pages/DealerInvoiceDetailsPage.jsx";

// Dealer
import B2BOrderPage from "../features/dealer/ordervariants/pages/DealerOrdersPage.jsx";
import B2BOrderForm from "../features/dealer/ordervariants/pages/B2BOrderForm.jsx";
import DealerInventoryStockPage from "../features/dealer/ordervariants/pages/DealerInventoryStockPage.jsx";
import DealerProductCatalogPage from "../features/dealer/ordervariants/pages/DealerProductCatalogPage.jsx";
import AvailableVehicleCatalogPage from "../features/dealer/sales/availableVehicle/pages/AvailableVehicleCatalogPage.jsx";

// Manage Dealer
import DealersPage from "../features/admin/manageDealer/dealers/DealersPage.jsx";
// Reporting
import SalesReportPage from "../features/admin/reporting/pages/SalesReportPage.jsx";
import InventoryReportPage from "../features/admin/reporting/pages/InventoryReportPage.jsx";

// AI Forecast
import ForecastDashboard from "../pages/ai-forecast/ForecastDashboard.jsx";
import DemandForecastPage from "../pages/ai-forecast/DemandForecastPage.jsx";
import ProductionPlanPage from "../pages/ai-forecast/ProductionPlanPage.jsx";

// SYSTEM (ADMIN)
import BackfillPage from "../features/admin/system/pages/BackfillPage.jsx";

// Staff Dealer
import QuotationCreatePage from "../features/dealer/sales/quotation/pages/QuotationCreatePage.jsx";
import QuotationListPage from "../features/dealer/sales/quotations/pages/QuotationListPage.jsx";

//feature sale
import SalesRoutes from "../features/dealer/sales/SalesRoutes.jsx";

// Payment features
import PaymentMethodsManagement from "../features/payments/pages/PaymentMethodsManagement.jsx";
import CustomerPaymentPage from "../features/payments/pages/CustomerPaymentPage.jsx";
import DealerInvoiceManagement from "../features/payments/pages/DealerInvoiceManagement.jsx";
import DealerInvoicesPage from "../features/payments/pages/DealerInvoicesPage.jsx";
import DealerPaymentPage from "../features/payments/pages/DealerPaymentPage.jsx";
import PayInvoicePage from "../features/payments/pages/PayInvoicePage.jsx";
import B2COrdersListPage from "../features/payments/pages/B2COrdersListPage.jsx";
import B2COrderDetailPage from "../features/payments/pages/B2COrderDetailPage.jsx";
import PayB2COrderPage from "../features/payments/pages/PayB2COrderPage.jsx";
import B2CCashPaymentsManagementPage from "../features/payments/pages/B2CCashPaymentsManagementPage.jsx";
import B2CDebtManagementPage from "../features/payments/pages/B2CDebtManagementPage.jsx";
import DealerPaymentResultPage from "../features/payments/pages/DealerPaymentResultPage.jsx";
import VnpayReturnPage from "../pages/VnpayReturnPage.jsx";
import PaymentResultPage from "../features/payments/pages/PaymentResultPage.jsx";

// Reporting features
import DealerDebtReportPage from "../features/dealer/reporting/pages/DealerDebtReportPage.jsx";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* ================================================================== */}
        {/* ======================= PUBLIC ROUTES ============================ */}
        {/* ================================================================== */}

        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          {/* Public Payment Routes */}
          <Route path="payment/vnpay-return" element={<VnpayReturnPage />} />
        </Route>

        {/* --- Layout cho trang xác thực FULL-SCREEN --- */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="oauth-success" element={<OAuthSuccess />} />
          <Route path="reset-password" element={<ResetPassword />} />
          {/* Public Payment Routes */}
          <Route path="payment/vnpay-return" element={<VnpayReturnPage />} />
          {/* VNPAY */}
          <Route path="payment/result" element={<PaymentResultPage />} />
        </Route>

        {/* ================================================================== */}
        {/* ================== EVM ROUTES (ADMIN & STAFF) ==================== */}
        {/* ================================================================== */}
        <Route
          element={<ProtectedRoute allowedRoles={["ADMIN", "EVM_STAFF"]} />}
        >
          <Route path="evm" element={<EvmLayout />}>
            {/* --- SHARED ROUTES (Cả Admin và Staff đều vào được) --- */}
            <Route path="profile" element={<ProfileForm />} />
            <Route path="settings" element={<SecuritySettings />} />
            <Route path="promotions/*" element={<MainPromotion />} />
            <Route path="notifications" element={<StaffNotificationPage />} />
            <Route
              path="b2b-orders/:orderId"
              element={<B2BOrderDetailsPage />}
            />

            {/* --- ADMIN ONLY ROUTES --- */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="admin/dashboard" element={<AdminDashboardPage />} />
              {/* 1. SẢN PHẨM */}
              <Route
                path="admin/products/promotions/*"
                element={<MainPromotion />}
              />
              <Route
                path="admin/products/catalog"
                element={<VehicleCatalogManager />}
              />
              <Route
                path="admin/products/variants"
                element={<VariantManager />}
              />
              <Route
                path="admin/products/features"
                element={<FeatureManagementPage />}
              />
              {/* 2. PHÂN PHỐI */}
              <Route
                path="admin/distribution/allocation"
                element={<AllocationPage />}
              />
              <Route
                path="admin/distribution/inventory/central"
                element={<InventoryCentral />}
              />
              <Route
                path="admin/distribution/history"
                element={<DistributionHistoryPage />}
              />
              {/* Reuse các component của Staff cho Admin */}
              <Route
                path="admin/orders"
                element={<B2BOrdersManagementPage />}
              />
              <Route
                path="admin/orders/:orderId/create-invoice"
                element={<CreateInvoiceFromOrderPage />}
              />
              <Route
                path="admin/payments/invoices"
                element={<DealerInvoiceManagement />}
              />
              <Route path="admin/debt" element={<DealerDebtManagementPage />} />
              <Route
                path="admin/debt/:dealerId/invoices"
                element={<DealerInvoicesListPage />}
              />
              <Route
                path="admin/debt/invoices/:invoiceId"
                element={<DealerInvoiceDetailsPage />}
              />
              <Route
                path="admin/payments/cash-history"
                element={<CashPaymentsManagementPage />}
              />
              <Route
                path="admin/payments/methods"
                element={<PaymentMethodsManagement />}
              />
              {/* 4. QUẢN LÝ ĐẠI LÝ */}
              <Route path="admin/dealers/list" element={<DealersPage />} />
              <Route
                path="admin/dealers/accounts"
                element={<UserManagement />}
              />
              {/* 5. BÁO CÁO */}
              <Route path="admin/reports/sales" element={<SalesReportPage />} />
              <Route
                path="admin/reports/inventory"
                element={<InventoryReportPage />}
              />
              <Route
                path="admin/reports/notifications"
                element={<NotificationManagement />}
              />
              {/* AI Forecast */}
              <Route
                path="admin/reports/forecast"
                element={<ForecastDashboard />}
              />
              <Route
                path="admin/reports/forecast/demand"
                element={<DemandForecastPage />}
              />
              <Route
                path="admin/reports/forecast/production"
                element={<ProductionPlanPage />}
              />
              {/* 6. SYSTEM */}
              <Route path="admin/system/users" element={<UserManagement />} />
              <Route
                path="admin/system/data-backfill"
                element={<BackfillPage />}
              />
              {/* <Route path="admin/system/permissions" ... /> */}
              {/* <Route path="admin/system/config" ... /> */}
              {/* <Route path="admin/system/audit" ... /> */}
            </Route>

            {/* --- STAFF ONLY ROUTES --- */}
            {/* Các route này giữ nguyên cho Staff, Admin đã có các route tương đương ở trên */}
            <Route element={<ProtectedRoute allowedRoles={["EVM_STAFF"]} />}>
              <Route index element={<EvmStaffDashboardPage />} />
              <Route
                path="staff/dashboard"
                element={<EvmStaffDashboardPage />}
              />

              {/* Sản phẩm */}
              <Route
                path="staff/products/catalog"
                element={<VehicleCatalogManager />}
              />
              <Route
                path="staff/products/variants"
                element={<VariantManager />}
              />
              <Route
                path="staff/products/promotions"
                element={<MainPromotion />}
              />

              {/* Phân phối */}
              <Route
                path="staff/distribution/inventory/central"
                element={<InventoryCentral />}
              />
              <Route
                path="staff/distribution/allocation"
                element={<AllocationPage />}
              />

              {/* Đại lý */}
              <Route path="staff/dealers/list" element={<DealersPage />} />
              <Route
                path="staff/dealers/dealer-accounts"
                element={<UserManagement />}
              />

              {/* Thanh toán & Đơn hàng (Staff Routes) */}
              <Route
                path="staff/payments/dealer-invoices"
                element={<DealerInvoiceManagement />}
              />
              <Route
                path="staff/orders"
                element={<B2BOrdersManagementPage />}
              />
              <Route
                path="staff/orders/:orderId/create-invoice"
                element={<CreateInvoiceFromOrderPage />}
              />

              <Route path="staff/debt" element={<DealerDebtManagementPage />} />
              <Route
                path="staff/debt/:dealerId/invoices"
                element={<DealerInvoicesListPage />}
              />
              <Route
                path="staff/debt/invoices/:invoiceId"
                element={<DealerInvoiceDetailsPage />}
              />


              <Route
                path="staff/payments/cash-payments"
                element={<CashPaymentsManagementPage />}
              />
              {/* Báo cáo & phân tích (Staff) */}
              <Route path="staff/reports/sales" element={<SalesReportPage />} />
              <Route
                path="staff/reports/inventory"
                element={<InventoryReportPage />}
              />
              <Route
                path="staff/reports/forecast"
                element={<ForecastDashboard />}
              />
              <Route
                path="staff/reports/forecast/demand"
                element={<DemandForecastPage />}
              />
              <Route
                path="staff/reports/forecast/production"
                element={<ProductionPlanPage />}
              />
            </Route>
          </Route>
        </Route>

        {/* ================================================================== */}
        {/* ================== DEALER ROUTES (MANAGER & STAFF) =============== */}
        {/* ================================================================== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["DEALER_MANAGER", "DEALER_STAFF"]} />
          }
        >
          <Route path="dealer" element={<DealerLayout />}>
            {/* Sales Module */}
            <Route path="*" element={<SalesRoutes />} />
            {/* <Route index element={<DashboardForDealer />} /> */}
            <Route path="dashboard" element={<DealerDashboardPage />} />
            <Route path="profile" element={<ProfileForm />} />
            <Route path="settings" element={<SecuritySettings />} />

            {/* Staff Dashboard */}
            <Route path="staff/dashboard" element={<StaffDashboardPage />} />

            {/* --- DEALER MANAGER ONLY ROUTES --- */}
            <Route
              element={<ProtectedRoute allowedRoles={["DEALER_MANAGER"]} />}
            >
              <Route index element={<DealerDashboardPage />} />
              {/* Customer Management */}
              <Route
                path="manager/customers/create"
                element={<CreateCustomer />}
              />
              <Route
                path="manager/customers/:id/edit"
                element={<CreateCustomer />}
              />
              <Route path="manager/customers/list" element={<CustomerList />} />
              <Route
                path="manager/customers/:id"
                element={<CustomerDetail />}
              />

              {/* Test Drive Management */}
              <Route
                path="manager/testdrives"
                element={<TestDriveManagement />}
              />
              <Route
                path="manager/testdrives/create"
                element={<CreateTestDrive />}
              />
              <Route
                path="manager/testdrives/edit/:id"
                element={<EditTestDrive />}
              />

              {/* Feedback Management */}
              <Route path="manager/feedback" element={<FeedbackManagement />} />
              <Route path="manager/feedback/new" element={<CreateFeedback />} />
              <Route
                path="manager/feedback/statistics"
                element={<FeedbackStatistics />}
              />
              <Route path="manager/feedback/:id" element={<FeedbackDetail />} />

              {/* Quotation Management */}

              <Route
                path="manager/quotes/create"
                element={<QuotationCreatePage />}
              />

              <Route
                path="manager/list/quotations"
                element={<QuotationListPage />}
              />

              {/* Inventory Management */}
              <Route
                path="manager/inventory/stock"
                element={<DealerInventoryStockPage />}
              />
              <Route
                path="manager/vehicles/all"
                element={<DealerProductCatalogPage />}
              />
              <Route
                path="manager/inventory/available"
                element={<AvailableVehicleCatalogPage />}
              />

              {/* Báo cáo đại lý */}
              <Route
                path="manager/reports/model"
                element={<DealerDebtReportPage />}
              />

              {/* --------------------------------Cai dar dai ly-------------------------------------------------- */}

              <Route
                path="manager/settings/staff/*"
                element={<UserManagement />}
              />

              <Route
                path="manager/vehicles/all"
                element={<DealerProductCatalogPage />}
              />

              {/* Promotions */}
              <Route path="manager/promotions/*" element={<MainPromotion />} />

              {/* System */}
              <Route path="manager/system/users" element={<UserManagement />} />

              {/* Đặt xe từ hãng và xem trạng thái đơn hàng */}
              <Route
                path="manager/inventory/order"
                element={<B2BOrderForm />}
              />
              <Route path="manager/inventory/info" element={<B2BOrderPage />} />

              {/* Promotions */}
              <Route path="manager/promotions/*" element={<MainPromotion />} />

              {/* Quotation Management */}
              <Route
                path="manager/quotations"
                element={<QuotationCreatePage />}
              />
              <Route
                path="manager/list/quotations"
                element={<QuotationListPage />}
              />

              {/* System Management */}
              <Route
                path="manager/settings/staff/*"
                element={<UserManagement />}
              />
              <Route path="manager/system/users" element={<UserManagement />} />

              {/* Payment Management (Dealer Manager) */}
              <Route
                path="manager/payments/invoices"
                element={<DealerInvoicesPage />}
              />
              <Route
                path="manager/payments/invoices/:invoiceId/pay"
                element={<PayInvoicePage />}
              />
              <Route
                path="manager/payments/invoices/:invoiceId"
                element={<DealerPaymentPage />}
              />
              <Route
                path="manager/payments/vnpay-result"
                element={<DealerPaymentResultPage />}
              />
              <Route
                path="manager/payments/b2c-cash-payments"
                element={<B2CCashPaymentsManagementPage />}
              />
              <Route
                path="manager/payments/b2c-debt"
                element={<B2CDebtManagementPage />}
              />
              <Route
                path="manager/payments/b2c-orders/:orderId"
                element={<B2COrderDetailPage />}
              />
              <Route
                path="manager/payments/orders/:orderId"
                element={<CustomerPaymentPage />}
              />
            </Route>

            {/* --- DEALER STAFF ONLY ROUTES --- */}
            <Route element={<ProtectedRoute allowedRoles={["DEALER_STAFF"]} />}>
              <Route index element={<StaffDashboardPage />} />
              {/* Customer Management */}
              <Route
                path="staff/customers/create"
                element={<CreateCustomer />}
              />
              <Route
                path="staff/customers/:id/edit"
                element={<CreateCustomer />}
              />
              <Route path="staff/customers/list" element={<CustomerList />} />
              <Route path="staff/customers/:id" element={<CustomerDetail />} />

              {/* Test Drive Management */}
              <Route
                path="staff/testdrives"
                element={<TestDriveManagement />}
              />
              <Route
                path="staff/testdrives/create"
                element={<CreateTestDrive />}
              />
              <Route
                path="staff/testdrives/edit/:id"
                element={<EditTestDrive />}
              />

              {/* Feedback Management */}
              <Route path="staff/feedback" element={<FeedbackManagement />} />
              <Route path="staff/feedback/new" element={<CreateFeedback />} />
              <Route
                path="staff/feedback/statistics"
                element={<FeedbackStatistics />}
              />
              <Route path="staff/feedback/:id" element={<FeedbackDetail />} />

              {/* Quotation Management */}
              <Route
                path="staff/quotations"
                element={<QuotationCreatePage />}
              />

              <Route
                path="staff/list/quotations"
                element={<QuotationListPage />}
              />

              {/* Danh mục xe & báo cáo */}
              {/* Xe có sẵn trong kho đại lí */}
              <Route
                path="staff/inventory/stock"
                element={<DealerInventoryStockPage />}
              />
              {/* Tất cả phiên bảng (hãng) */}
              <Route
                path="staff/vehicles/all"
                element={<DealerProductCatalogPage />}
              />
              <Route
                path="staff/inventory/available"
                element={<AvailableVehicleCatalogPage />}
              />

              {/* Promotions */}
              <Route
                path="staff/promotions"
                element={<CustomerPromotionView />}
              />

              {/* Payment Management (Dealer Staff) */}
              <Route
                path="staff/payments/b2c-orders"
                element={<B2COrdersListPage />}
              />
              <Route
                path="staff/payments/b2c-orders/:orderId"
                element={<B2COrderDetailPage />}
              />
              <Route
                path="staff/payments/b2c-orders/:orderId/pay"
                element={<PayB2COrderPage />}
              />
              <Route
                path="staff/payments/orders/:orderId"
                element={<CustomerPaymentPage />}
              />
            </Route>
          </Route>
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
