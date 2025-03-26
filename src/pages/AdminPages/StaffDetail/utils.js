import { BADGE_COLORS, STATUS } from "./constants";
import profileImage from "../../../assets/img/profile.png";

/**
 * Format a currency value with commas and VND
 * @param {number|string} value - The value to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  if (!value && value !== 0) return "N/A";
  
  return `${Number(value).toLocaleString()} VND`;
};

/**
 * Get badge color class based on the specified color
 * @param {string} color - The color name
 * @returns {string} CSS class for the badge
 */
export const getBadgeColorClass = (color) => {
  switch (color) {
    case BADGE_COLORS.GREEN:
      return "bg-green-100 text-green-800";
    case BADGE_COLORS.RED:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Determine the badge color based on staff status
 * @param {boolean} status - The staff status
 * @returns {string} Badge color
 */
export const getStatusBadgeColor = (status) => {
  return status ? BADGE_COLORS.GREEN : BADGE_COLORS.RED;
};

/**
 * Format staff status text
 * @param {boolean} status - The staff status
 * @returns {string} Formatted status text
 */
export const formatStatusText = (status) => {
  if (status === undefined) return "N/A";
  return status ? STATUS.ACTIVE : STATUS.INACTIVE;
};

/**
 * Get staff avatar image
 * @param {string} avatarUrl - Avatar URL
 * @returns {string} Image URL
 */
export const getStaffAvatar = (avatarUrl) => {
  return avatarUrl || profileImage;
};

/**
 * Truncate ID for display
 * @param {string} id - The ID to truncate
 * @param {number} length - Number of characters to show
 * @returns {string} Truncated ID
 */
export const truncateId = (id, length = 10) => {
  if (!id) return '';
  return id.substring(0, length);
};

/**
 * Check if two objects have different values
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {boolean} True if objects are different
 */
export const isObjectChanged = (obj1, obj2) => {
  return JSON.stringify(obj1) !== JSON.stringify(obj2);
};

/**
 * Merge staff data with updates
 * @param {Object} original - Original staff data
 * @param {Object} updates - Updated data
 * @returns {Object} Merged data
 */
export const mergeStaffData = (original, updates) => {
  return {
    ...original,
    ...updates
  };
};
