import { STATUS_COLORS } from "./constants";

export const getStatusColor = (status) => {
  if (!status) return STATUS_COLORS.text.default;
  return STATUS_COLORS.text[status] || STATUS_COLORS.text.default;
};

export const getStatusBgColor = (status) => {
  if (!status) return STATUS_COLORS.background.default;
  return STATUS_COLORS.background[status] || STATUS_COLORS.background.default;
};

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

export const formatName = (fullName) => {
  if (!fullName) return "Unknown";

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

// Format a date string into a standard format
export const formatDate = (dateString) => {
  if (!dateString) {
    // If no date is provided, return current date in YYYY-MM-DD format
    return new Date().toISOString().split("T")[0];
  }
  return new Date(dateString.split("T")[0]).toISOString().split("T")[0];
};
