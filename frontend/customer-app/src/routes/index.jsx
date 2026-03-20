import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "../auth/AuthProvider";
import ProtectedRoute from "./ProtectedRoute";
import CustomerLayout from "../layouts/CustomerLayout";
import AuthLayout from "../layouts/AuthLayout";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import OAuthCallback from "../pages/OAuthCallback";
import ProductDetail from "../pages/ProductDetail";
import BookingPage from "../pages/BookingPage";
import TestDriveBooking from "../pages/TestDriveBooking";
import CarConfigurator from "../pages/CarConfigurator";
import TCOCalculator from "../pages/TCOCalculator";
import FinancingCalculator from "../pages/FinancingCalculator";
import ProductComparison from "../pages/ProductComparison";
import ChargingStationMap from "../pages/ChargingStationMap";
import Payment from "../pages/Payment";
import VehiclesPage from "../pages/VehiclesPage";
import VehicleDetailPage from "../pages/VehicleDetailPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrdersPage from "../pages/OrdersPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import PaymentReturnPage from "../pages/PaymentReturnPage";
import TestDriveBookingPage from "../pages/TestDriveBookingPage";
import MyTestDrivesPage from "../pages/MyTestDrivesPage";
import TestDriveDetailPage from "../pages/TestDriveDetailPage";
import MyReviewsPage from "../pages/MyReviewsPage";
import CompareVehiclesPage from "../pages/CompareVehiclesPage";
import PaymentResultPage from "../pages/PaymentResultPage";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="booking/:id" element={<BookingPage />} />
          <Route path="test-drive" element={<TestDriveBooking />} />
          <Route path="configure" element={<CarConfigurator />} />
          <Route path="tco-calculator" element={<TCOCalculator />} />
          <Route path="financing" element={<FinancingCalculator />} />
          <Route path="compare" element={<ProductComparison />} />
          <Route path="charging-stations" element={<ChargingStationMap />} />
          <Route path="payment" element={<Payment />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="vehicles/:variantId" element={<VehicleDetailPage />} />
          <Route path="compare" element={<CompareVehiclesPage />} />
          <Route path="payment/return" element={<PaymentReturnPage />} />
          <Route path="payment/result" element={<PaymentResultPage />} />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="oauth-success" element={<OAuthCallback />} />
        </Route>

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:orderId" element={<OrderDetailPage />} />
          <Route path="test-drive/book" element={<TestDriveBookingPage />} />
          <Route path="my-test-drives" element={<MyTestDrivesPage />} />
          <Route path="test-drives/:appointmentId" element={<TestDriveDetailPage />} />
          <Route path="my-reviews" element={<MyReviewsPage />} />
        </Route>

        {/* Admin Routes */}

        {/* 404 */}

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

