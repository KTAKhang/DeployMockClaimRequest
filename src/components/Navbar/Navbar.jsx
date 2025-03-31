import { useState, useRef, useEffect } from "react";
import { RxTextAlignJustify, RxCross2 } from "react-icons/rx";
import {
  FaUser,
  FaSignOutAlt,
  FaBell,
  FaComment,
  FaReply,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/actions/authActions";
import {
  getNotificationsRequest,
  updateCommentStatusRequest,
  FETCH_CLAIM_STATUS_REQUEST, // Import the action type directly
} from "../../redux/actions/notificationActions";
import { toast } from "react-toastify";

const useNotificationManager = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notifications);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getNotificationsRequest());

    const intervalId = setInterval(() => {
      dispatch(getNotificationsRequest());
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  const markNotificationAsSeen = (notificationId) => {
    if (!notificationId) {
      console.error("Invalid notification ID");
      return;
    }

    dispatch(updateCommentStatusRequest(notificationId, true));

    // Refetch notifications after update
    setTimeout(() => {
      dispatch(getNotificationsRequest());
    }, 500); // Delay for smooth UX
  };

  // Filter notifications that are not from the logged-in user
  const filteredNotifications = notifications.filter(
    (notification) => notification.user_id !== user?.user_id
  );

  const unseenNotifications = filteredNotifications.filter(
    (notification) => !notification.status
  );

  const seenNotifications = filteredNotifications.filter(
    (notification) => notification.status
  );

  const clearSeenNotifications = () => {
    try {
      // Get the current user's ID to create a user-specific key
      const userId = user?.user_id;
      if (!userId) {
        console.error("No user ID found");
        return;
      }

      // Create a key specific to the user's seen notifications
      const storageKey = `seenNotifications_${userId}`;

      // Remove seen notifications from localStorage
      localStorage.removeItem(storageKey);

      // Optional: You might want to dispatch an action to refresh notifications
      dispatch(getNotificationsRequest());

      // Optionally show a toast notification
      toast.success("Seen notifications cleared");
    } catch (error) {
      console.error("Error clearing seen notifications:", error);
      toast.error("Failed to clear seen notifications");
    }
  };

  return {
    allNotifications: filteredNotifications,
    unseenNotifications,
    seenNotifications,
    markNotificationAsSeen,
    clearSeenNotifications,
  };
};

const Navbar = ({ toggleSidebar, isSidebarOpen, isMobileView }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [activeNotificationTab, setActiveNotificationTab] = useState("unseen");
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { claimDetail: claim = {} } = useSelector((state) => {
    if (user?.role_name === "Claimer") return state.claimer || {};
    if (user?.role_name === "Approver") return state.claims || {};
    return state.finance || {};
  });

  const {
    allNotifications,
    unseenNotifications,
    seenNotifications,
    markNotificationAsSeen,
    clearSeenNotifications,
  } = useNotificationManager();

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check dropdowns for closing
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }

      // Enhanced notification dropdown logic
      if (
        notificationRef.current &&
        notificationButtonRef.current &&
        !notificationRef.current.contains(event.target) &&
        !notificationButtonRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationDetails = (notification) => {
    switch (notification.type) {
      case "claims":
        return {
          icon: <FaComment />,
          text: "New Comment",
          color: "bg-blue-100 text-blue-600",
        };
      case "comments":
        return {
          icon: <FaComment />,
          text: "New Comment",
          color: "bg-blue-100 text-blue-600",
        };
      case "replies":
        return {
          icon: <FaReply />,
          text: "Comment Reply",
          color: "bg-green-100 text-green-600",
        };

      default:
        return {
          icon: <FaBell />,
          text: "Notification",
          color: "bg-gray-100 text-gray-600",
        };
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(); // Formats based on the user's locale
  };

  const handleHome = () => {
    navigate("/");
  };

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
        return "/claimer/profile";
    }
  };

  const handleSignOut = () => {
    toast.dismiss();

    dispatch(logout());
    setIsDropdownOpen(false);

    setTimeout(() => {
      navigate("/login");
    }, 3000);
  };

  const handleNotificationClick = (notification) => {
    // Immediately update the local state to mark as seen
    markNotificationAsSeen(notification._id);

    if (notification.claim_id) {
      // Dispatch with simpler payload
      dispatch({
        type: FETCH_CLAIM_STATUS_REQUEST,
        payload: {
          claimId: notification.claim_id,
          userRole: user?.role_name,
        },
      });
    }

    setIsNotificationOpen(false);
  };

  const renderNotificationList = (notifications, isSeen = false) => {
    return notifications.map((notification) => {
      const notificationDetails = getNotificationDetails(notification);
      return (
        <div
          key={notification._id}
          className="relative group"
          onClick={() => handleNotificationClick(notification)}
        >
          <div
            className={`px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${isSeen ? "bg-gray-50" : "bg-blue-50"
              }`}
          >
            <div className="flex items-start space-x-2.5">
              <div className="flex-shrink-0">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center ${notificationDetails.color}`}
                >
                  {notificationDetails.icon}
                </div>
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-xs text-gray-700 line-clamp-2 break-words">
                  {notificationDetails.text}: {notification.content}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {formatTimeAgo(notification.createdAt)} •{" "}
                  {formatDate(notification.createdAt)}
                  {!isSeen && (
                    <span className="ml-1.5 text-blue-600 font-semibold">
                      New
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="flex justify-between items-center p-2 sm:p-4">
        {/* Sidebar Toggle */}
        <div className="flex items-center">
          {!isMobileView && (
            <button
              onClick={toggleSidebar}
              className={`p-1 sm:p-2 rounded-lg transition-colors ${isSidebarOpen
                  ? "bg-gray-100 text-blue-600"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? (
                <RxCross2 className="text-lg sm:text-xl" />
              ) : (
                <RxTextAlignJustify className="text-lg sm:text-xl" />
              )}
            </button>
          )}

          {isMobileView && <div className="w-8 sm:w-10"></div>}
        </div>

        {/* Logo */}
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

        {/* Notifications and User Dropdown */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notification Button */}
          <div className="relative" ref={notificationRef}>
            {user?.role_name !== "Administrator" && (
              <button
                ref={notificationButtonRef}
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                <FaBell className="text-gray-600 text-base sm:text-lg" />
                {unseenNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]">
                    {unseenNotifications.length}
                  </span>
                )}
              </button>
            )}

            {/* Desktop Notification Dropdown */}
            {isNotificationOpen && !isMobileView && (
              <div
                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Tabs */}
                <div className="flex">
                  <button
                    onClick={() => setActiveNotificationTab("unseen")}
                    className={`flex-1 py-2 text-sm ${activeNotificationTab === "unseen"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500"
                      }`}
                  >
                    Unseen ({unseenNotifications.length})
                  </button>
                  <button
                    onClick={() => setActiveNotificationTab("seen")}
                    className={`flex-1 py-2 text-sm ${activeNotificationTab === "seen"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500"
                      }`}
                  >
                    Seen ({seenNotifications.length})
                  </button>
                </div>

                {/* Notification List */}
                <div className="max-h-[50vh] overflow-y-auto">
                  {activeNotificationTab === "unseen" ? (
                    unseenNotifications.length === 0 ? (
                      <div className="px-4 py-3 text-center text-gray-500 text-sm">
                        No new notifications
                      </div>
                    ) : (
                      renderNotificationList(unseenNotifications, false)
                    )
                  ) : seenNotifications.length === 0 ? (
                    <div className="px-4 py-3 text-center text-gray-500 text-sm">
                      No seen notifications
                    </div>
                  ) : (
                    renderNotificationList(seenNotifications, true)
                  )}
                </div>

                {/* Clear Seen Notifications */}
                {activeNotificationTab === "seen" &&
                  seenNotifications.length > 0 && (
                    <div className="sticky bottom-0 px-4 py-2 border-t bg-white">
                      <button
                        onClick={clearSeenNotifications}
                        className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        Clear All Seen Notifications
                      </button>
                    </div>
                  )}
              </div>
            )}

            {/* Mobile Notification Dropdown */}
            {isNotificationOpen && isMobileView && (
              <div
                className="fixed inset-0 z-40 bg-black/50 sm:hidden"
                onClick={() => setIsNotificationOpen(false)}
              >
                <div
                  className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[95%] max-w-md max-h-[70vh] bg-white rounded-lg shadow-lg overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button */}
                  <div className="sticky top-0 bg-white z-10 border-b flex justify-between items-center p-3">
                    <h2 className="text-base font-semibold text-gray-800">
                      Notifications
                    </h2>
                    <button
                      onClick={() => setIsNotificationOpen(false)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <RxCross2 className="text-xl" />
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex">
                    <button
                      onClick={() => setActiveNotificationTab("unseen")}
                      className={`flex-1 py-2 text-sm ${activeNotificationTab === "unseen"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500"
                        }`}
                    >
                      Unseen ({unseenNotifications.length})
                    </button>
                    <button
                      onClick={() => setActiveNotificationTab("seen")}
                      className={`flex-1 py-2 text-sm ${activeNotificationTab === "seen"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500"
                        }`}
                    >
                      Seen ({seenNotifications.length})
                    </button>
                  </div>

                  {/* Notification List */}
                  <div className="overflow-y-auto max-h-[50vh] px-2">
                    {activeNotificationTab === "unseen" ? (
                      unseenNotifications.length === 0 ? (
                        <div className="px-4 py-3 text-center text-gray-500 text-sm">
                          No new notifications
                        </div>
                      ) : (
                        renderNotificationList(unseenNotifications, false)
                      )
                    ) : seenNotifications.length === 0 ? (
                      <div className="px-4 py-3 text-center text-gray-500 text-sm">
                        No seen notifications
                      </div>
                    ) : (
                      renderNotificationList(seenNotifications, true)
                    )}
                  </div>

                  {/* Clear Seen Notifications */}
                  {activeNotificationTab === "seen" &&
                    seenNotifications.length > 0 && (
                      <div className="sticky bottom-0 px-4 py-2 border-t bg-white">
                        <button
                          onClick={clearSeenNotifications}
                          className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                          Clear All Seen Notifications
                        </button>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer p-1 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  {user?.user_name}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500">
                  {user?.role_name}
                </p>
              </div>
              <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full overflow-hidden border-2 border-gray-100">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="User avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-blue-500 flex items-center justify-center text-white">
                    <FaUser className="text-sm" />
                  </div>
                )}
              </div>
            </div>

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
                  className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaUser className="text-gray-500 text-sm" />
                  <span>My Profile</span>
                </Link>

                <div className="border-t border-gray-100 mt-2">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left text-sm"
                  >
                    <FaSignOutAlt className="text-red-500 text-sm" />
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
