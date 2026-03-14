import { useState, useEffect } from 'react';

export const useSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePath, setActivePath] = useState("");

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

  return {
    isSidebarOpen,
    setIsSidebarOpen,
    activePath,
    setActivePath
  };
};