import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getNotificationsRequest } from "../../redux/actions/notificationActions";

const NotificationManager = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notifications);
  const { user } = useSelector((state) => state.auth);

  // Load seen notification IDs from localStorage
  const [seenNotifications, setSeenNotifications] = useState(() => {
    const savedSeenNotifications = localStorage.getItem("seenNotifications");
    return savedSeenNotifications ? JSON.parse(savedSeenNotifications) : [];
  });

  // Fetch notifications periodically and on mount
  useEffect(() => {
    // Initial fetch
    dispatch(getNotificationsRequest());

    // Set up periodic polling
    const intervalId = setInterval(() => {
      dispatch(getNotificationsRequest());
    }, 5 * 60 * 1000); // Every 5 minutes

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [dispatch]);

  // Filter notifications not created by the current user
  const filteredNotifications = notifications.filter(
    (notification) => notification.user_id !== user?.user_id
  );

  // Mark a notification as seen locally
  const markNotificationAsSeen = (notificationId) => {
    const updatedSeenNotifications = [
      ...new Set([...seenNotifications, notificationId]),
    ];

    // Update local state
    setSeenNotifications(updatedSeenNotifications);

    // Persist to localStorage
    localStorage.setItem(
      "seenNotifications",
      JSON.stringify(updatedSeenNotifications)
    );
  };

  // Get unseen notifications
  const unseenNotifications = filteredNotifications.filter(
    (notification) => !seenNotifications.includes(notification._id)
  );

  // Get seen notifications
  const seenNotificationsList = filteredNotifications.filter((notification) =>
    seenNotifications.includes(notification._id)
  );

  // Clear all seen notifications
  const clearSeenNotifications = () => {
    setSeenNotifications([]);
    localStorage.removeItem("seenNotifications");
  };

  return {
    allNotifications: filteredNotifications,
    unseenNotifications,
    seenNotifications: seenNotificationsList,
    markNotificationAsSeen,
    clearSeenNotifications,
  };
};

export default NotificationManager;
