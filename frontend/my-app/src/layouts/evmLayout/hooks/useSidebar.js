import { useState, useEffect } from 'react';

export const useSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePath, setActivePath] = useState("");
  const [openSubmenus, setOpenSubmenus] = useState(new Set());

  // Auto close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSubmenu = (path) => {
    const newOpenSubmenus = new Set(openSubmenus);
    if (newOpenSubmenus.has(path)) {
      newOpenSubmenus.delete(path);
    } else {
      newOpenSubmenus.add(path);
    }
    setOpenSubmenus(newOpenSubmenus);
  };

  return {
    isSidebarOpen,
    setIsSidebarOpen,
    activePath,
    setActivePath,
    openSubmenus,
    setOpenSubmenus, // THÊM DÒNG NÀY
    toggleSubmenu
  };
};