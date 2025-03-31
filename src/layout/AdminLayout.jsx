import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  // Effect to detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      // Set mobile view state based on screen width
      setIsMobileView(window.innerWidth <= 768);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
            isAdmin={true}
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
};

export default AdminLayout;