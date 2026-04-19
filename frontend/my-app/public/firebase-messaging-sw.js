// ===========================================================
// 🔥 Firebase Cloud Messaging Service Worker (FCM)
// ===========================================================

// 🔹 Import Firebase compat libraries
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// -----------------------------------------------------------
// ⚡ 1. Hardcode Firebase Config
// -----------------------------------------------------------
firebase.initializeApp({
  apiKey: "AIzaSyDM7qyWVqh3kYbbECM9TPaFRTYXf_2Vb4k",
  authDomain: "eletricvehicl.firebaseapp.com",
  projectId: "eletricvehicl",
  storageBucket: "eletricvehicl.appspot.com",
  messagingSenderId: "903235101201",
  appId: "1:903235101201:web:e7a6ef46f73d8a086b47b0",
  measurementId: "G-H10W8LJ2ZF",
});

// -----------------------------------------------------------
// 💬 Get Firebase Messaging instance
// -----------------------------------------------------------
const messaging = firebase.messaging();

// -----------------------------------------------------------
// 📩 Handle background message
// -----------------------------------------------------------
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  const notificationTitle = title || "🔔 New Notification";
  const notificationOptions = {
    body: body || "You have a new message.",
    icon: icon || "/logo.png",
    badge: "/badge.png",
    data: { url: "/login" }, // luôn mở login
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// -----------------------------------------------------------
// 🖱️ Handle notification click event
// -----------------------------------------------------------
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          client.navigate("/login");
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/login");
      }
    })
  );
});
