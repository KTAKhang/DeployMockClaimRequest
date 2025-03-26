import { STATUS } from './constants';

/**
 * Get CSS class for status button
 * @param {boolean} status - Current status
 * @returns {string} CSS class string
 */
export const getStatusButtonClass = (status) => {
  if (status === true) {
    return "bg-red-500 hover:bg-red-600";
  } else {
    return "bg-green-500 hover:bg-green-600";
  }
};

/**
 * Get CSS class for status badge
 * @param {boolean} status - Current status
 * @returns {string} CSS class string
 */
export const getStatusBadgeClass = (status) => {
  if (status === true) {
    return "bg-green-100 text-green-800 border border-green-300";
  } else {
    return "bg-red-100 text-red-800 border border-red-300";
  }
};

/**
 * Get text for the status button based on current status
 * @param {boolean} status - Current status
 * @returns {string} Button text
 */
export const getStatusButtonText = (status) => {
  if (status === true) {
    return "Set Inactive";
  } else {
    return "Set Active";
  }
};

/**
 * Format date string from ISO to YYYY-MM-DD
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date or N/A if not available
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return dateString.split("T")[0];
};

/**
 * Check if an item is an array and has elements
 * @param {any} item - Item to check
 * @returns {boolean} True if item is a non-empty array
 */
export const isNonEmptyArray = (item) => {
  return Array.isArray(item) && item.length > 0;
};

/**
 * Format status text for display
 * @param {boolean} status - Current status
 * @returns {string} Status text
 */
export const formatStatusText = (status) => {
  return status ? STATUS.ACTIVE : STATUS.INACTIVE;
};

/**
 * Sanitize project data for update
 * @param {Object} projectData - Project data to sanitize
 * @param {string} id - Project ID
 * @returns {Object} Sanitized project data
 */
export const sanitizeProjectData = (projectData, id) => {
  // Add ID if missing
  if (!projectData._id && id) {
    return {
      ...projectData,
      _id: id
    };
  }
  return projectData;
};

/**
 * Truncate ID for display
 * @param {string} id - ID to truncate
 * @param {number} length - Length to truncate to
 * @returns {string} Truncated ID
 */
export const truncateId = (id, length = 10) => {
  if (!id) return '';
  return id.substring(0, length);
};
