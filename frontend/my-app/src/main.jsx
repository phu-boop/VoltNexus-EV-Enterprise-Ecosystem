// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import AppRoutes from "./routes/index.jsx";
import initFirebaseMessaging from "./services/firebase/firebaseMessagingListener.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// ----------------------------------------------------------------------
// 🚀 Đăng ký Service Worker với Environment Variables
// ----------------------------------------------------------------------

const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      // 1. Lấy config từ biến môi trường Vite
      const firebaseConfigParams = new URLSearchParams({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
      });

      // 2. Tạo URL cho Service Worker kèm theo params
      const swUrl = `/firebase-messaging-sw.js?${firebaseConfigParams.toString()}`;

      // 3. Đăng ký
      const registration = await navigator.serviceWorker.register(swUrl);
    } catch (err) {
      console.error("❌ Service Worker registration failed:", err);
    }
  }
};

// Gọi hàm đăng ký
registerServiceWorker();

// Khởi động lắng nghe Messaging (Foreground)
try {
  initFirebaseMessaging();
} catch (error) {
  console.error("❌ Firebase Messaging initialization failed:", error);
}

createRoot(document.getElementById("root")).render(
  // <StrictMode>  <-- Tạm tắt StrictMode nếu muốn tránh render 2 lần lúc dev
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={true}
        pauseOnHover={true}
        theme="light"
      />
      <AppRoutes />
    </QueryClientProvider>
  </BrowserRouter>
  // </StrictMode>
);
