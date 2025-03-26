import { useState, useRef, useEffect } from "react";
import { RxTextAlignJustify, RxCross2 } from "react-icons/rx";
import { FaUser, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/actions/authActions";
import { toast } from "react-toastify";

const Navbar = ({ toggleSidebar, isSidebarOpen, isMobileView }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHome = () => {
    navigate("/");
  };

  // Function to get profile path based on role
  const getProfilePath = () => {
    const role = user?.role_name;
    switch (role) {
      case "Claimer":
        return "/claimer/profile";
      case "Administrator":
        return "/admin/profile";
      case "Approver":
        return "/approver/profile";
      case "Finance":
        return "/finance/profile";
      default:
        return "/claimer/profile"; // fallback path
    }
  };

  const handleSignOut = () => {
    // Clear all current toasts
    toast.dismiss();

    dispatch(logout()); // Dispatch logout action
    setIsDropdownOpen(false); // Close dropdown

    // Navigate to login page after a short delay
    // to ensure saga has time to process
    setTimeout(() => {
      navigate("/login");
    }, 3000);
  };

  return (
    <div className="w-full bg-white shadow-sm">
      <div className="flex justify-between items-center p-2 sm:p-4">
        {/* Left Section: Toggle Button (desktop or mobile) */}
        {/* Left Section: Toggle Button (desktop only) */}
        <div className="flex items-center">
          {/* Only show this button in desktop view, never in mobile view */}
          {!isMobileView && (
            <button
              onClick={toggleSidebar}
              className={`p-1 sm:p-2 rounded-lg transition-colors ${
                isSidebarOpen
                  ? "bg-gray-100 text-blue-600"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? (
                <RxCross2 className="text-xl sm:text-2xl" />
              ) : (
                <RxTextAlignJustify className="text-xl sm:text-2xl" />
              )}
            </button>
          )}

          {/* Reserved space for mobile view where sidebar's toggle will appear */}
          {isMobileView && <div className="w-8 sm:w-10"></div>}
        </div>
        {/* Center Section: Logo */}
        <div className="flex-grow ml-2 sm:ml-4 flex justify-start items-center">
          <button
            onClick={handleHome}
            className="outline-none focus:outline-none transition-transform hover:scale-105"
          >
            <img
              alt="FPT Software Logo"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/FPT_Software_logo.svg/512px-FPT_Software_logo.svg.png"
              className="w-20 h-8 sm:w-28 sm:h-10 md:w-32 md:h-12"
            />
          </button>
        </div>
        {/* Right Section: User Info */}
        <div className="flex items-center">
          {/* User Profile Section */}
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer p-1 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  {user?.user_name}
                </p>
                <p className="text-xs text-gray-500">{user?.role_name}</p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden border-2 border-gray-100">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-blue-500 flex items-center justify-center text-white">
                    <FaUser />
                  </div>
                )}
              </div>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 sm:w-60 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-700">
                    {user?.user_name}
                  </p>
                  <p className="text-xs text-gray-500">{user?.role_name}</p>
                </div>

                <Link
                  to={getProfilePath()}
                  className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaUser className="text-gray-500" />
                  <span>My Profile</span>
                </Link>

                <div className="border-t border-gray-100 mt-2">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <FaSignOutAlt className="text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
