import { useState, useEffect } from "react";

/**
 * Custom hook to detect mobile view with specific optimization for iPhone SE
 * iPhone SE: 320px width (1st gen) or 375px width (2nd/3rd gen)
 * @param {number} mobileBreakpoint - Optional custom breakpoint (default: 390px to catch iPhone SE and similar small devices)
 * @returns {Object} - Contains boolean flags for different viewport sizes
 */
const useMobileView = (mobileBreakpoint = 390) => {
  // Initialize with reasonable defaults based on common SSR patterns
  const [viewportInfo, setViewportInfo] = useState({
    isMobile: false,
    isIPhoneSE: false,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // Function to update viewport size info
    const updateViewportInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // iPhone SE detection (both generations)
      // 1st gen: 320px width, 2nd/3rd gen: 375px width
      const isIPhoneSE = width <= 375 && width >= 320;

      // General mobile detection
      const isMobile = width <= mobileBreakpoint;

      setViewportInfo({
        isMobile,
        isIPhoneSE,
        width,
        height,
      });
    };

    // Initial check
    updateViewportInfo();

    // Add event listener for resize
    window.addEventListener("resize", updateViewportInfo);

    // Clean up event listener
    return () => window.removeEventListener("resize", updateViewportInfo);
  }, [mobileBreakpoint]);

  return viewportInfo;
};

export default useMobileView;
