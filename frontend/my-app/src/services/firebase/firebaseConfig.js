// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
// if ("serviceWorker" in navigator) {
//   // Tạo query string từ firebaseConfig để truyền sang SW
//   const params = new URLSearchParams({
//     apiKey: firebaseConfig.apiKey,
//     authDomain: firebaseConfig.authDomain,
//     projectId: firebaseConfig.projectId,
//     storageBucket: firebaseConfig.storageBucket,
//     messagingSenderId: firebaseConfig.messagingSenderId,
//     appId: firebaseConfig.appId,
//     measurementId: firebaseConfig.measurementId || "",
//   });

//   // Gắn params vào URL file SW
//   const swUrl = `/firebase-messaging-sw.js?${params.toString()}`;

//   navigator.serviceWorker
//     .register(swUrl) // Đăng ký với URL mới có chứa params
//     .then((registration) => {})
//     .catch((err) => {
//       console.error("❌ Service Worker registration failed:", err);
//     });
// }
// Khởi tạo Firebase App (Dùng cho React Context)
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
