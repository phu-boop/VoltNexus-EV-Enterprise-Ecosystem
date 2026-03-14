import { useState, useMemo, useEffect } from "react";
import { useAuthContext } from "../../../features/auth/AuthProvider.jsx";

export const useSocketToggle = () => {
  const { roles } = useAuthContext();
  const isAdmin = useMemo(() => roles.includes("ADMIN"), [roles]);

  // Load trạng thái từ localStorage, mặc định là Bật (true)
  const [isSocketEnabled, setIsSocketEnabled] = useState(() => {
    const saved = localStorage.getItem("socketEnabled");
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Lưu lại mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("socketEnabled", JSON.stringify(isSocketEnabled));
  }, [isSocketEnabled]);

  // Hàm để thay đổi
  const toggleSocket = () => {
    setIsSocketEnabled((prev) => !prev);
  };

  // Logic hiển thị chuông:
  // 1. Nếu là Staff -> Luôn luôn hiển thị
  // 2. Nếu là Admin -> Chỉ hiển thị nếu isSocketEnabled
  const showSocketBell = !isAdmin || (isAdmin && isSocketEnabled);

  return { isAdmin, isSocketEnabled, toggleSocket, showSocketBell };
};
