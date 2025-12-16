// src/context/SidebarContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const SidebarContext = createContext(null);

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider");
  return ctx;
};

export const SidebarProvider = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // "mobileOrTablet" => anything < lg (1024)
  const [isMobile, setIsMobile] = useState(false);

  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const mobileOrTablet = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobileOrTablet);

      // close mobile drawer when switching to desktop
      if (!mobileOrTablet) setIsMobileOpen(false);

      // collapse sidebar on mobile/tablet
      if (mobileOrTablet) setIsHovered(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsExpanded((prev) => !prev);
  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);

  const toggleSubmenu = (item) =>
    setOpenSubmenu((prev) => (prev === item ? null : item));

  const value = useMemo(() => {
    // on mobile/tablet we want icons-only => no expanded state
    const effectiveExpanded = isMobile ? false : isExpanded;

    return {
      isExpanded: effectiveExpanded,
      isMobileOpen,
      isMobile, // <-- this now means mobile+tablet
      isHovered,
      activeItem,
      openSubmenu,
      toggleSidebar,
      toggleMobileSidebar,
      setIsHovered,
      setActiveItem,
      toggleSubmenu,
    };
  }, [isMobile, isExpanded, isMobileOpen, isHovered, activeItem, openSubmenu]);

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};
