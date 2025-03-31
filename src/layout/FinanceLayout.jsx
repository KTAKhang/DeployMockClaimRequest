import Navbar from "../components/Navbar/Navbar";
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";

function FinanceLayout() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  // Effect to detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      // Set mobile view state based on screen width
      const mobile = window.innerWidth <= 768;
      setIsMobileView(mobile);

      // Automatically close sidebar on mobile and open on desktop
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div>
      <Navbar
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isOpen}
        isMobileView={isMobileView}
      />
      <div className="flex">
        <div
          className={`transition-all duration-300 ease-in-out ${isMobileView ? "w-0" : isOpen ? "w-[290px]" : "w-16"
            }`}
        >
          <Sidebar
            isFinance={true}
            isOpen={isOpen}
            toggleSidebar={toggleSidebar}
            isMobileView={isMobileView}
            setIsMobileView={setIsMobileView}
          />
        </div>
        <div className="flex-1 p-4 transition-all duration-300 ease-in-out">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default FinanceLayout;
