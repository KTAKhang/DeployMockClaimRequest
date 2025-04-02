import profileImage from "../../../../assets/img/profile.png";

/**
 * Gets status color class based on status
 * @param {string} status - The claim status
 * @returns {string} Tailwind CSS class for background color
 */
export const getStatusColor = (status) => {
  if (!status) return "bg-gray-400";

  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-500";
    case "approved":
      return "bg-green-500";
    case "rejected":
      return "bg-red-500";
    case "paid":
      return "bg-blue-500";
    case "cancelled":
      return "bg-pink-500";
    case "draft":
      return "bg-gray-500";
    default:
      return "bg-gray-400";
  }
};

/**
 * Gets status text color class based on status
 * @param {string} status - The claim status
 * @returns {string} Tailwind CSS class for text color
 */
export const getStatusTextColor = (status) => {
  if (!status) return "text-gray-500";

  switch (status.toLowerCase()) {
    case "pending":
      return "text-yellow-500";
    case "approved":
      return "text-green-500";
    case "rejected":
      return "text-red-500";
    case "paid":
      return "text-blue-500";
    case "cancelled":
      return "text-pink-500";
    case "draft":
      return "text-gray-400";
    default:
      return "text-gray-400";
  }
};

/**
 * Formats a date string to a readable format
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) {
    // If no date is provided, return current date in YYYY-MM-DD format
    return new Date().toISOString().split("T")[0];
  }
  return new Date(dateString.split("T")[0]).toISOString().split("T")[0];
};

/**
 * Formats time elapsed since a given date
 * @param {string} dateString - The date string to calculate from
 * @returns {string} Formatted time ago string
 */
export const formatTimeAgo = (dateString) => {
  if (!dateString) return "just now";

  const commentDate = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - commentDate) / 1000);

  // Less than a minute
  if (diffInSeconds < 60) {
    return "just now";
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }

  // Less than a month (approx 30 days)
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  }

  // Less than a year
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }

  // More than a year
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
};

/**
 * Formats a name to a shorter version
 * @param {string} fullName - The full name to format
 * @returns {string} Formatted name
 */
export const formatName = (fullName) => {
  if (!fullName) return "N/A";

  const parts = fullName.split(" ");
  if (parts.length > 2) {
    const lastPart = parts[parts.length - 1];
    const secondLastPart = parts[parts.length - 2];

    if (!isNaN(lastPart)) {
      const initials = parts
        .slice(0, -2)
        .map((name) => name[0])
        .join("");
      return `${initials}. ${secondLastPart} ${lastPart}`;
    } else {
      const initials = parts
        .slice(0, -1)
        .map((name) => name[0])
        .join("");
      return `${initials}. ${lastPart}`;
    }
  }
  return fullName;
};

/**
 * Gets image source with fallback
 * @param {string} src - The image source URL
 * @returns {string} Image source URL or default profile image
 */
export const getImageSrc = (src) => {
  return src || profileImage;
};
