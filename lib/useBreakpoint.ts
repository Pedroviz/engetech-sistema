"use client";

import { useEffect, useState } from "react";

/**
 * Hook que detecta se a tela é mobile (< 768px) ou tablet (< 1024px).
 * Usado para renderização condicional de layouts responsivos.
 */
export function useBreakpoint() {
  const [isMobile, setIsMobile]   = useState(false);
  const [isTablet, setIsTablet]   = useState(false);
  const [mounted,  setMounted]    = useState(false);

  useEffect(() => {
    setMounted(true);

    function update() {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    mounted,
  };
}
