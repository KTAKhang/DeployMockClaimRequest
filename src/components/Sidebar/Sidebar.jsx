import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaChevronDown,
  FaChevronUp,
  FaUserCog,
  FaShoppingCart,
  FaCheckCircle,
  FaMoneyCheckAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { GoProjectRoadmap } from "react-icons/go";
import { HiUserGroup } from "react-icons/hi";
import { RiFileList2Line } from "react-icons/ri";
import { HiOutlinePencilSquare } from "react-icons/hi2";

const Sidebar = ({
  isFinance,
  isAdmin,
  isApprover,
  isClaimer,
  isOpen: propIsOpen,
  toggleSidebar,
  isMobileView,
  setIsMobileView,
}) => {
  const [isClaimsOpen, setIsClaimsOpen] = useState(true);
  const [windowSizeOverride, setWindowSizeOverride] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Effect for window resize
  useEffect(() => {
    function handleResize() {
      // Mobile view detection
      const mobile = window.innerWidth <= 768;

      // If transitioning to mobile, ensure mobile sidebar is closed
      if (!isMobileView && mobile) {
        setMobileSidebarOpen(false);
      }

      setIsMobileView(mobile);

      // Desktop sidebar collapse logic
      const shouldOverride = window.innerWidth <= 1068;
      if (shouldOverride !== windowSizeOverride) {
        setWindowSizeOverride(shouldOverride);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [windowSizeOverride, isMobileView, setIsMobileView]);

  // Effect to manage claims dropdown state when sidebar is toggled
  useEffect(() => {
    // When sidebar is collapsed, temporarily close the claims dropdown
    if (!propIsOpen && !isMobileView) {
      setIsClaimsOpen(false);
    }
  }, [propIsOpen, isMobileView]);

  // Handle mobile sidebar toggling separately
  const handleMobileToggle = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  // Use the appropriate toggle function based on view mode
  const effectiveToggle = isMobileView ? handleMobileToggle : toggleSidebar;

  // Determine effective isOpen value
  const effectiveIsOpen = isMobileView
    ? mobileSidebarOpen
    : windowSizeOverride
    ? false
    : propIsOpen;

  const toggleClaimsDropdown = (e) => {
    e.stopPropagation(); // Prevent propagation to parent links/buttons
    setIsClaimsOpen(!isClaimsOpen);
  };

  // Close mobile sidebar when navigating
  const handleNavigation = () => {
    if (isMobileView) {
      setMobileSidebarOpen(false);
    }
  };

  const financeMenuItems = [
    { name: "Dashboard", path: "/finance", icon: <FaHome /> },
  ];
  const claimsItems = [
    { name: "Approved", path: "/finance/approved", icon: <FaCheckCircle /> },
    { name: "Paid", path: "/finance/paid", icon: <FaMoneyCheckAlt /> },
  ];

  const generalMenuItems = isAdmin
    ? [
        { name: "Dashboard", path: "/admin", icon: <FaHome /> },
        {
          name: "Staff Management",
          path: "/admin/staff",
          icon: <HiUserGroup />,
        },
        {
          name: "Project Management",
          path: "/admin/project",
          icon: <GoProjectRoadmap />,
        },
        {
          name: "Claim Management",
          path: "/admin/claim-management",
          icon: <RiFileList2Line />,
        },
      ]
    : isApprover
    ? [
        { name: "Approver Dashboard", path: "/approver", icon: <FaHome /> },
        {
          name: "For my Vetting",
          path: "/approver/vetting",
          icon: <GoProjectRoadmap />,
        },
        {
          name: "Claims History",
          path: "/approver/history",
          icon: <FaShoppingCart />,
        },
      ]
    : isClaimer
    ? [
        {
          name: "Create Claim",
          path: "/claimer/create-claim",
          icon: <HiOutlinePencilSquare />,
        },
        {
          name: "Draft Claims",
          path: "/claimer/draft",
          icon: <RiFileList2Line />,
        },
        {
          name: "Pending Claims",
          path: "/claimer/pending",
          icon: <RiFileList2Line />,
        },
        {
          name: "Approved Claims",
          path: "/claimer/approved",
          icon: <RiFileList2Line />,
        },
        {
          name: "Paid Claims",
          path: "/claimer/paid",
          icon: <RiFileList2Line />,
        },
        {
          name: "Rejected Claims",
          path: "/claimer/rejected",
          icon: <RiFileList2Line />,
        },
        {
          name: "Cancelled Claims",
          path: "/claimer/cancelled",
          icon: <RiFileList2Line />,
        },
      ]
    : [
        { name: "Home", path: "/", icon: <FaHome /> },
        { name: "Orders", path: "/orders", icon: <FaShoppingCart /> },
        { name: "Profile", path: "/profile", icon: <FaUserCog /> },
      ];

  // Updated function to check if a claims page is active for any role
  const isClaimsPageActive = () => {
    // For Finance claims
    if (isFinance) {
      return claimsItems.some(
        (item) =>
          location.pathname === item.path ||
          location.pathname.startsWith(item.path + "/")
      );
    }
    // For Approver claims
    else if (isApprover) {
      return (
        location.pathname.startsWith("/approver/vetting/") ||
        location.pathname.startsWith("/approver/history/")
      );
    }
    // For Admin claims
    else if (isAdmin) {
      return (
        location.pathname.startsWith("/admin/claim-management") ||
        location.pathname.startsWith("/admin/staff") ||
        location.pathname.startsWith("/admin/project")
      );
    }
    // For Claimer claims
    else if (isClaimer) {
      return (
        location.pathname.startsWith("/claimer/draft") ||
        location.pathname.startsWith("/claimer/pending") ||
        location.pathname.startsWith("/claimer/approved") ||
        location.pathname.startsWith("/claimer/paid") ||
        location.pathname.startsWith("/claimer/rejected") ||
        location.pathname.startsWith("/claimer/cancelled")
      );
    }
    // For default user
    return location.pathname.startsWith("/orders");
  };

  // More descriptive active claim state
  const claimsActive = isClaimsPageActive();

  return (
    <>
      {/* Mobile Toggle Button - Only visible in mobile view and positioned to align with navbar */}
      {isMobileView && (
        <button
          onClick={handleMobileToggle}
          className={`fixed top-[0.9rem] left-2 sm:top-6 sm:left-4 z-50 p-1 sm:p-2 rounded-lg
          ${
            mobileSidebarOpen
              ? "bg-gray-100 text-blue-600"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          }
          transition-colors duration-300`}
          aria-label="Toggle menu"
        >
          {mobileSidebarOpen ? (
            <FaTimes className="text-xl sm:text-2xl" />
          ) : (
            <FaBars className="text-xl sm:text-2xl" />
          )}
        </button>
      )}

      {/* Desktop sidebar - only visible when NOT in mobile view */}
      {!isMobileView && (
        <div
          className={`h-fit min-h-[100vh] fixed left-0 bg-white shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${
            effectiveIsOpen ? "w-64" : "w-16"
          } flex flex-col justify-between`}
          style={{ flexShrink: 0 }}
        >
          <ul className="space-y-2 flex-1 mt-4">
            {isFinance ? (
              <>
                {financeMenuItems.map((item, index) => (
                  <li
                    key={index}
                    className={`p-2 rounded-md hover:shadow-lg ${
                      location.pathname === item.path
                        ? "bg-blue-100 border-r-4 border-blue-500"
                        : ""
                    }`}
                  >
                    <Link
                      to={item.path}
                      className="flex items-center space-x-3 relative h-8 w-full overflow-hidden"
                      onClick={handleNavigation}
                    >
                      <div className="flex items-center justify-center min-w-[24px] ml-3">
                        <span className="text-xl text-black">{item.icon}</span>
                      </div>
                      <span
                        className={`text-black whitespace-nowrap overflow-hidden absolute left-10 ${
                          effectiveIsOpen
                            ? "opacity-100 translate-x-0 transition-all duration-200"
                            : "opacity-0 -translate-x-4 pointer-events-none transition-all duration-300"
                        }`}
                      >
                        {item.name}
                      </span>
                    </Link>
                  </li>
                ))}

                {/* Claims Dropdown Header - Now showing active state when child items are active */}
                <li
                  className={`p-2 rounded-md hover:shadow-lg ${
                    claimsActive ? "bg-blue-50" : ""
                  }`}
                >
                  <button
                    onClick={toggleClaimsDropdown}
                    className={`flex items-center w-full relative h-8 ${
                      claimsActive ? "font-medium" : ""
                    }`}
                  >
                    <div className="flex items-center justify-center min-w-[24px] ml-3">
                      <span
                        className={`text-xl ${
                          claimsActive ? "text-blue-600" : "text-black"
                        }`}
                      >
                        {isClaimsOpen && effectiveIsOpen ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </span>
                    </div>
                    <span
                      className={`whitespace-nowrap overflow-hidden absolute left-12 pl-1 ${
                        claimsActive ? "text-blue-600" : "text-black"
                      } ${
                        effectiveIsOpen
                          ? "opacity-100 translate-x-0 transition-all duration-200"
                          : "opacity-0 -translate-x-4 pointer-events-none transition-all duration-300"
                      }`}
                    >
                      Claims
                    </span>
                  </button>
                </li>

                {/* Claims Dropdown Items - Only render if isClaimsOpen or if sidebar is collapsed */}
                {isClaimsOpen &&
                  effectiveIsOpen &&
                  claimsItems.map((item, index) => (
                    <li
                      key={index}
                      className={`py-2 pl-[30px] rounded-md hover:shadow-lg ${
                        location.pathname === item.path ||
                        location.pathname.startsWith(item.path + "/")
                          ? "bg-blue-100 border-r-4 border-blue-500"
                          : ""
                      }`}
                    >
                      <Link
                        to={item.path}
                        className="flex items-center space-x-3 relative h-8 w-full overflow-hidden"
                        onClick={handleNavigation}
                      >
                        <div className="flex items-center justify-center min-w-[24px] ml-3">
                          <span className="text-xl text-black">
                            {item.icon}
                          </span>
                        </div>
                        <span
                          className={`text-black whitespace-nowrap overflow-hidden absolute left-10 ${
                            effectiveIsOpen
                              ? "opacity-100 translate-x-0 transition-all duration-200"
                              : "opacity-0 -translate-x-4 pointer-events-none transition-all duration-300"
                          }`}
                        >
                          {item.name}
                        </span>
                      </Link>
                    </li>
                  ))}

                {/* Show icons only when sidebar is collapsed */}
                {(!isClaimsOpen || !effectiveIsOpen) &&
                  claimsItems.map((item, index) => (
                    <li
                      key={index}
                      className={`py-2 pl-2 rounded-md hover:shadow-lg ${
                        location.pathname === item.path ||
                        location.pathname.startsWith(item.path + "/")
                          ? "bg-blue-100 border-r-4 border-blue-500"
                          : ""
                      }`}
                      style={{ display: effectiveIsOpen ? "none" : "block" }}
                    >
                      <Link
                        to={item.path}
                        className="flex items-center space-x-3 relative h-8 w-full overflow-hidden"
                        onClick={handleNavigation}
                      >
                        <div className="flex items-center justify-center min-w-[24px] ml-3">
                          <span className="text-xl text-black">
                            {item.icon}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
              </>
            ) : (
              generalMenuItems.map((item, index) => (
                <li
                  key={index}
                  className={`p-2 rounded-md hover:shadow-lg ${
                    location.pathname === item.path ||
                    (isApprover &&
                      location.pathname.startsWith("/approver/vetting/") &&
                      item.path === "/approver/vetting") ||
                    (isApprover &&
                      location.pathname.startsWith("/approver/history/") &&
                      item.path === "/approver/history") ||
                    (isAdmin &&
                      location.pathname.startsWith(
                        "/admin/claim-management/"
                      ) &&
                      item.path === "/admin/claim-management") ||
                    (isAdmin &&
                      location.pathname.startsWith("/admin/staff/") &&
                      item.path === "/admin/staff") ||
                    (isAdmin &&
                      location.pathname.startsWith("/admin/project/") &&
                      item.path === "/admin/project") ||
                    (isClaimer &&
                      ((location.pathname.startsWith("/claimer/draft/") &&
                        item.path === "/claimer/draft") ||
                        (location.pathname.startsWith("/claimer/pending/") &&
                          item.path === "/claimer/pending") ||
                        (location.pathname.startsWith("/claimer/approved/") &&
                          item.path === "/claimer/approved") ||
                        (location.pathname.startsWith("/claimer/paid/") &&
                          item.path === "/claimer/paid") ||
                        (location.pathname.startsWith("/claimer/rejected/") &&
                          item.path === "/claimer/rejected") ||
                        (location.pathname.startsWith("/claimer/cancelled/") &&
                          item.path === "/claimer/cancelled")))
                      ? "bg-blue-100 border-r-4 border-blue-500"
                      : ""
                  }`}
                >
                  <Link
                    to={item.path}
                    className="flex items-center space-x-3 relative h-8 w-full overflow-hidden"
                    onClick={handleNavigation}
                  >
                    <div className="flex items-center justify-center min-w-[24px] ml-3">
                      <span className="text-xl text-black">{item.icon}</span>
                    </div>
                    <span
                      className={`text-black whitespace-nowrap overflow-hidden absolute left-10 ${
                        effectiveIsOpen
                          ? "opacity-100 translate-x-0 transition-all duration-200"
                          : "opacity-0 -translate-x-4 pointer-events-none transition-all duration-300"
                      }`}
                    >
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Mobile dropdown menu - only renders when in mobile view */}
      {isMobileView && (
        <>
          <div
            className={`fixed top-0 left-0 right-0 bg-white transition-transform duration-300 transform z-40 ${
              mobileSidebarOpen
                ? "translate-y-0 shadow-xl"
                : "-translate-y-full"
            }`}
            style={{
              maxHeight: "80vh",
              overflowY: "auto",
              display: isMobileView ? "block" : "none",
            }}
          >
            <div className="p-4 pt-16 pb-6">
              <ul className="space-y-2">
                {isFinance ? (
                  <>
                    {financeMenuItems.map((item, index) => (
                      <li
                        key={index}
                        className={`p-3 rounded-md hover:bg-blue-50 ${
                          location.pathname === item.path
                            ? "bg-blue-100 border-l-4 border-blue-500"
                            : ""
                        }`}
                      >
                        <Link
                          to={item.path}
                          className="flex items-center space-x-3 relative h-8 w-full overflow-hidden"
                          onClick={handleNavigation}
                        >
                          <span className="text-xl text-black">
                            {item.icon}
                          </span>
                          <span
                            className={`text-black ${
                              mobileSidebarOpen
                                ? "opacity-100 transform translate-x-0 transition-all duration-300 delay-200"
                                : "opacity-0 transform -translate-x-4 transition-all duration-200"
                            }`}
                          >
                            {item.name}
                          </span>
                        </Link>
                      </li>
                    ))}

                    {/* Mobile Claims Dropdown Header */}
                    <li
                      className={`p-3 rounded-md hover:bg-blue-50 ${
                        claimsActive ? "bg-blue-50" : ""
                      }`}
                    >
                      <button
                        onClick={toggleClaimsDropdown}
                        className={`flex items-center w-full space-x-3 ${
                          claimsActive ? "text-blue-600" : "text-black"
                        }`}
                      >
                        <span className="text-xl">
                          {isClaimsOpen ? <FaChevronUp /> : <FaChevronDown />}
                        </span>
                        <span
                          className={`${
                            mobileSidebarOpen
                              ? "opacity-100 transform translate-x-0 transition-all duration-300 delay-200"
                              : "opacity-0 transform -translate-x-4 transition-all duration-200"
                          }`}
                        >
                          Claims
                        </span>
                      </button>
                    </li>

                    {isClaimsOpen &&
                      claimsItems.map((item, index) => (
                        <li
                          key={index}
                          className={`py-3 pl-8 rounded-md hover:bg-blue-50 ${
                            location.pathname === item.path ||
                            location.pathname.startsWith(item.path + "/")
                              ? "bg-blue-100 border-l-4 border-blue-500"
                              : ""
                          }`}
                        >
                          <Link
                            to={item.path}
                            className="flex items-center space-x-3 relative h-8 w-full overflow-hidden"
                            onClick={handleNavigation}
                          >
                            <span className="text-xl text-black">
                              {item.icon}
                            </span>
                            <span
                              className={`text-black ${
                                mobileSidebarOpen
                                  ? "opacity-100 transform translate-x-0 transition-all duration-300 delay-200"
                                  : "opacity-0 transform -translate-x-4 transition-all duration-200"
                              }`}
                            >
                              {item.name}
                            </span>
                          </Link>
                        </li>
                      ))}
                  </>
                ) : (
                  generalMenuItems.map((item, index) => (
                    <li
                      key={index}
                      className={`p-3 rounded-md hover:bg-blue-50 ${
                        location.pathname === item.path ||
                        (isApprover &&
                          location.pathname.startsWith("/approver/vetting/") &&
                          item.path === "/approver/vetting") ||
                        (isApprover &&
                          location.pathname.startsWith("/approver/history/") &&
                          item.path === "/approver/history") ||
                        (isAdmin &&
                          location.pathname.startsWith(
                            "/admin/claim-management/"
                          ) &&
                          item.path === "/admin/claim-management") ||
                        (isClaimer &&
                          ((location.pathname.startsWith("/claimer/draft/") &&
                            item.path === "/claimer/draft") ||
                            (location.pathname.startsWith(
                              "/claimer/pending/"
                            ) &&
                              item.path === "/claimer/pending") ||
                            (location.pathname.startsWith(
                              "/claimer/approved/"
                            ) &&
                              item.path === "/claimer/approved") ||
                            (location.pathname.startsWith("/claimer/paid/") &&
                              item.path === "/claimer/paid") ||
                            (location.pathname.startsWith(
                              "/claimer/rejected/"
                            ) &&
                              item.path === "/claimer/rejected") ||
                            (location.pathname.startsWith(
                              "/claimer/cancelled/"
                            ) &&
                              item.path === "/claimer/cancelled")))
                          ? "bg-blue-100 border-l-4 border-blue-500"
                          : ""
                      }`}
                    >
                      <Link
                        to={item.path}
                        className="flex items-center space-x-3 relative h-8 w-full overflow-hidden"
                        onClick={handleNavigation}
                      >
                        <span className="text-xl text-black">{item.icon}</span>
                        <span
                          className={`text-black ${
                            mobileSidebarOpen
                              ? "opacity-100 transform translate-x-0 transition-all duration-300 delay-200"
                              : "opacity-0 transform -translate-x-4 transition-all duration-200"
                          }`}
                        >
                          {item.name}
                        </span>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Dark overlay when mobile sidebar is open */}
          {mobileSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30"
              onClick={handleMobileToggle}
            />
          )}
        </>
      )}
    </>
  );
};

export default Sidebar;
