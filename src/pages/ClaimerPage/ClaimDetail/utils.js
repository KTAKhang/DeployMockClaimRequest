import { STATUS_COLORS } from "./constants";
import profileImage from "../../../assets/img/profile.png";

/**
 * Get the appropriate status color classes
 * @param {string} status - The current status
 * @returns {object} The color classes for the status
 */
export const getStatusColor = (status) => {
  if (!status) return STATUS_COLORS.default.bg;

  const statusLower = typeof status === "string" ? status.toLowerCase() : "";
  return STATUS_COLORS[statusLower]?.bg || STATUS_COLORS.default.bg;
};

/**
 * Get the appropriate status text color class
 * @param {string} status - The current status
 * @returns {string} The text color class for the status
 */
export const getStatusTextColor = (status) => {
  if (!status) return STATUS_COLORS.default.text;

  const statusLower = typeof status === "string" ? status.toLowerCase() : "";
  return STATUS_COLORS[statusLower]?.text || STATUS_COLORS.default.text;
};

/**
 * Format a timestamp to a human-readable "time ago" string
 * @param {string} dateString - The date string to format
 * @returns {string} A formatted "time ago" string
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
 * Format a full name to a shorter display version
 * @param {string} fullName - The full name to format
 * @returns {string} A formatted name for display
 */
export const formatName = (fullName) => {
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
 * Extract date range from duration string
 * @param {string} duration - The duration string
 * @returns {object} The from and to dates
 */
export const extractDateRange = (duration) => {
  if (!duration) return { from: "", to: "" };

  const fromDate = duration.split("From ")[1]?.split(" To ")[0]?.trim() || "";
  const toDate = duration.split("To ")[1]?.trim() || "";

  return { from: fromDate, to: toDate };
};

/**
 * Get image source with fallback
 * @param {string} src - The primary image source
 * @returns {string} The image source or fallback
 */
export const getImageSrc = (src) => {
  return src || profileImage;
};

/**
 * Create initial form data from claim details
 * @param {object} claimDetail - The claim detail object
 * @returns {object} Initial form data for update form
 */
export const createInitialFormData = (claimDetail) => {
  if (!claimDetail) return {};

  const { from, to } = extractDateRange(claimDetail.duration);

  return {
    staffName: claimDetail.staff || "",
    projectName: claimDetail.project || "",
    from_date: from,
    to_date: to,
    totalHours: claimDetail.hours?.toString() || "",
    reason: claimDetail.reason_claimer || "",
    projectId: claimDetail.project_id || "",
  };
};
