// src/services/firebase/firebaseMessagingListener.jsx
import { onMessage } from "firebase/messaging";
import { messaging } from "./firebaseConfig";
import { toast } from "react-toastify";

// Custom Toast Component
const NotificationToast = ({ title, body, icon, type = "info" }) => {
  const typeConfig = {
    info: {
      gradient: "from-blue-500 to-cyan-600",
      bg: "bg-white border-l-blue-500 shadow-lg",
      icon: "🔔",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-600",
      textColor: "text-blue-600",
    },
    success: {
      gradient: "from-green-500 to-emerald-600",
      bg: "bg-white border-l-green-500 shadow-lg",
      icon: "✅",
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
      textColor: "text-green-600",
    },
    warning: {
      gradient: "from-amber-500 to-orange-600",
      bg: "bg-white border-l-amber-500 shadow-lg",
      icon: "⚠️",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      textColor: "text-amber-600",
    },
    error: {
      gradient: "from-red-500 to-rose-600",
      bg: "bg-white border-l-red-500 shadow-lg",
      icon: "❌",
      iconBg: "bg-gradient-to-br from-red-500 to-rose-600",
      textColor: "text-red-600",
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div
      className={`animate-scaleIn p-4 rounded-xl border-l-4 ${config.bg} backdrop-blur-sm bg-white/95 transform transition-all duration-300 hover:shadow-xl max-w-sm w-full relative overflow-hidden border border-gray-100`}
    >
      <div
        className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${config.gradient}`}
      ></div>

      <div
        onClick={() => {
          window.location.href = "/evm/admin/products/promotions";
        }}
        className="flex items-start space-x-3 relative"
      >
        <div className="flex-shrink-0">
          {icon ? (
            <img
              src={icon}
              alt="Notification"
              className="w-10 h-10 rounded-lg object-cover border-2 border-white shadow-md"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md ${config.iconBg}`}
            >
              {config.icon}
            </div>
          )}
        </div>

        <div
          onClick={() => {
            window.location.href = "/evm/admin/products/promotions";
          }}
          className="flex-1 min-w-0"
        >
          <h4
            className={`text-sm font-semibold ${config.textColor} truncate leading-tight`}
          >
            {title || "Thông báo mới"}
          </h4>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
            {body || "Bạn có một thông báo mới từ ứng dụng."}
          </p>

          <div className="flex items-center mt-2 text-xs text-gray-400">
            <svg
              className="w-3 h-3 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            Vừa xong
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toast.dismiss();
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-full p-1"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 rounded-b-xl overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${config.gradient} animate-[progress_5s_linear_forwards]`}
        />
      </div>
    </div>
  );
};

// // 🔥 Hàm đăng ký Service Worker
// const registerServiceWorker = async () => {
//   if (!("serviceWorker" in navigator)) {
//     console.warn("🚫 Trình duyệt không hỗ trợ Service Worker");
//     return null;
//   }

//   try {
//     const registration = await navigator.serviceWorker.register(
//       "/firebase-messaging-sw.js"
//     );

//     return registration;
//   } catch (error) {
//     console.error("❌ Lỗi đăng ký Service Worker:", error);
//     return null;
//   }
// };

// 🔥 Hàm yêu cầu quyền notification và đăng ký service worker
const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("🚫 Trình duyệt không hỗ trợ Notification API.");
    return false;
  }

  // try {
  //   const permission = await Notification.requestPermission();

  //   if (permission === "granted") {
  //     // Đăng ký service worker sau khi có quyền
  //     await registerServiceWorker();
  //     return true;
  //   } else {
  //     console.warn("❌ Từ chối quyền thông báo");
  //     return false;
  //   }
  // } catch (error) {
  //   console.error("❌ Lỗi khi yêu cầu quyền notification:", error);
  //   return false;
  // }
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      return true;
    } else {
      console.warn("❌ Từ chối quyền thông báo");
      return false;
    }
  } catch (error) {
    console.error("❌ Lỗi khi yêu cầu quyền notification:", error);
    return false;
  }
};

export default function initFirebaseMessaging() {
  if (!("Notification" in window)) {
    console.warn("🚫 Trình duyệt không hỗ trợ Notification API.");
    return;
  }

  // // 🔥 Tự động đăng ký service worker khi app khởi động
  // if ("serviceWorker" in navigator) {
  //   registerServiceWorker().then((registration) => {});
  // }

  // 📩 Lắng nghe foreground messages (khi app đang mở)
  onMessage(messaging, (payload) => {
    const { title, body, icon, image } = payload.notification || {};

    let type = "info";
    if (payload.data?.type) {
      type = payload.data.type;
    } else if (payload.data?.priority === "high") {
      type = "warning";
    } else if (payload.data?.priority === "urgent") {
      type = "error";
    }

    // Hiển thị custom toast trong app
    toast(
      <NotificationToast
        title={title}
        body={body}
        icon={image || icon}
        type={type}
      />,
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        draggablePercent: 60,
        closeButton: false,
        toastId: `fcm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      }
    );
  });
}

// Hook tiện ích
export const useFirebaseNotification = () => {
  const showNotification = (notificationData) => {
    const {
      title,
      body,
      icon,
      type = "info",
      duration = 5000,
    } = notificationData;

    const toastId = toast(
      <NotificationToast title={title} body={body} icon={icon} type={type} />,
      {
        position: "top-right",
        autoClose: duration,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        toastId: `custom-${Date.now()}`,
      }
    );

    return toastId;
  };

  const showSuccess = (title, body = "", icon = null, duration = 5000) => {
    return showNotification({ title, body, icon, type: "success", duration });
  };

  const showError = (title, body = "", icon = null, duration = 5000) => {
    return showNotification({ title, body, icon, type: "error", duration });
  };

  const showWarning = (title, body = "", icon = null, duration = 5000) => {
    return showNotification({ title, body, icon, type: "warning", duration });
  };

  const showInfo = (title, body = "", icon = null, duration = 5000) => {
    return showNotification({ title, body, icon, type: "info", duration });
  };

  const requestPermission = requestNotificationPermission;

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    requestPermission,
  };
};
