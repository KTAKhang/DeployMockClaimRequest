import { REGEX, FIELD_NAMES, ROLE_TYPES } from './constants';
import { ERROR_MESSAGES } from './strings';

/**
 * Validate user name
 * @param {string} name - User name to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateUserName = (name) => {
  if (!name.trim()) {
    return ERROR_MESSAGES.USER_NAME_REQUIRED;
  }
  if (!REGEX.USER_NAME.test(name)) {
    return ERROR_MESSAGES.USER_NAME_FORMAT;
  }
  return null;
};

/**
 * Format date to locale date string
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

/**
 * Format currency
 * @param {number} value - Currency value
 * @returns {string} Formatted currency
 */
export const formatCurrency = (value) => {
  if (!value && value !== 0) return "N/A";
  return `$${value.toLocaleString()}`;
};

/**
 * Create update data based on user role
 * @param {Object} formData - Form data
 * @param {string} currentRole - Current user role
 * @returns {Object} Filtered update data
 */
export const createUpdateData = (formData, currentRole) => {
  if (currentRole === ROLE_TYPES.ADMINISTRATOR) {
    return {
      [FIELD_NAMES.USER_NAME]: formData.user_name,
      [FIELD_NAMES.DEPARTMENT]: formData.department,
      [FIELD_NAMES.JOB_RANK]: formData.job_rank,
      [FIELD_NAMES.SALARY]: Number(formData.salary),
      [FIELD_NAMES.ROLE_NAME]: formData.role_name,
      [FIELD_NAMES.STATUS]: Boolean(formData.status),
      [FIELD_NAMES.AVATAR]: formData.avatar,
    };
  } else {
    return {
      [FIELD_NAMES.USER_NAME]: formData.user_name,
      [FIELD_NAMES.AVATAR]: formData.avatar,
    };
  }
};

/**
 * Handle file reader for avatar upload
 * @param {File} file - The uploaded file
 * @returns {Promise<string>} Data URL of the file
 */
export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Handle image error by replacing with default
 * @param {Event} event - The error event
 * @param {string} defaultSrc - Default image source
 */
export const handleImageError = (event, defaultSrc) => {
  event.target.onerror = null;
  event.target.src = defaultSrc;
};
