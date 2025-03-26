import { STATUS_CLASSES, PROJECT_STATUS, FILTER_TYPES, DATE_FILTER_FIELDS } from './constants';
import { FIELD_VALUES } from './strings';
/**
 * Get CSS class for project status
 * @param {boolean} status - Project status
 * @returns {string} CSS class for the status
 */
export const getStatusClass = (status) => {
  const isActive = Boolean(status);
  return isActive ? STATUS_CLASSES.ACTIVE : STATUS_CLASSES.INACTIVE;
};

/**
 * Get status text based on status value
 * @param {boolean} status - Project status
 * @returns {string} Status text
 */
export const getStatusText = (status) => {
  return Boolean(status) ? PROJECT_STATUS.ACTIVE : PROJECT_STATUS.INACTIVE;
};

/**
 * Format date to locale date string
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return FIELD_VALUES.NA;
  return new Date(dateString).toLocaleDateString();
};

/**
 * Truncate text with ellipsis and set up tooltip
 * @param {string} text - Text to truncate
 * @param {number} length - Max length before truncation
 * @returns {object} Object with displayText and tooltip
 */
export const truncateWithTooltip = (text, length = 5) => {
  if (!text) return { displayText: FIELD_VALUES.NA, tooltip: null };
  const displayText = `${text.substring(0, length)}...`;
  return { displayText, tooltip: text };
};

/**
 * Apply sorting to array of items
 * @param {Array} items - Items to sort
 * @param {Object} sortConfig - Sort configuration
 * @returns {Array} Sorted items
 */
export const applySorting = (items, sortConfig) => {
  if (!sortConfig.key) return [...items];
  
  return [...items].sort((a, b) => {
    const key = sortConfig.key;

    // Handle nested properties for pm and qa
    if (key === "pm") {
      const aValue = a.pm?.user_name || "";
      const bValue = b.pm?.user_name || "";
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    }

    if (key === "qa") {
      const aValue = a.qa?.user_name || "";
      const bValue = b.qa?.user_name || "";
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    }

    if (a[key] < b[key]) return sortConfig.direction === "asc" ? -1 : 1;
    if (a[key] > b[key]) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
};

/**
 * Apply filters to projects array
 * @param {Array} projects - Projects to filter
 * @param {Object} searchParams - Search parameters
 * @returns {Array} Filtered projects
 */
export const applyFilters = (projects, searchParams) => {
  let filtered = [...projects];

  // Apply text filter
  if (searchParams.term) {
    const term = searchParams.term.toLowerCase();
    filtered = filtered.filter((project) => {
      if (searchParams.field === "all") {
        // Search in all fields
        return Object.entries(project).some(([key, value]) => {
          // Special handling for nested fields: pm and qa
          if (key === "pm" || key === "qa") {
            return (
              value &&
              value.user_name &&
              value.user_name.toLowerCase().includes(term)
            );
          }
          // Special handling for status field
          else if (key === "status") {
            const statusText = value ? "active" : "inactive";
            return statusText === term;
          }
          // Regular fields
          else {
            return value && value.toString().toLowerCase().includes(term);
          }
        });
      } else if (searchParams.field === "pm") {
        // Search in PM field
        return (
          project.pm &&
          project.pm.user_name &&
          project.pm.user_name.toLowerCase().includes(term)
        );
      } else if (searchParams.field === "qa") {
        // Search in QA field
        return (
          project.qa &&
          project.qa.user_name &&
          project.qa.user_name.toLowerCase().includes(term)
        );
      } else if (searchParams.field === "status") {
        // Special handling for status field
        const statusValue = Boolean(project.status);
        const statusText = statusValue ? "active" : "inactive";
        return statusText === term.toLowerCase();
      } else {
        // Search in specific field
        return (
          project[searchParams.field] &&
          project[searchParams.field].toString().toLowerCase().includes(term)
        );
      }
    });
  }

  // Apply date filters
  if (searchParams.dateFrom || searchParams.dateTo) {
    filtered = filtered.filter((project) => {
      const createdAt = new Date(project.createdAt);
      let isValid = true;

      if (searchParams.dateFrom) {
        const dateFrom = new Date(searchParams.dateFrom);
        isValid = isValid && createdAt >= dateFrom;
      }

      if (searchParams.dateTo) {
        const dateTo = new Date(searchParams.dateTo);
        // Add one day to include the end date
        dateTo.setDate(dateTo.getDate() + 1);
        isValid = isValid && createdAt <= dateTo;
      }

      return isValid;
    });
  }

  return filtered;
};

/**
 * Create filters array from search parameters
 * @param {Object} searchParams - Search parameters
 * @returns {Array} Filters array
 */
export const createFiltersFromSearchParams = (searchParams) => {
  const filters = [];

  // Add text search filter if term exists
  if (searchParams.term) {
    filters.push({
      type: FILTER_TYPES.TEXT,
      field: searchParams.field,
      value: searchParams.term,
    });
  }

  // Add date filters if they exist
  if (searchParams.dateFrom) {
    filters.push({
      type: FILTER_TYPES.DATE,
      field: DATE_FILTER_FIELDS.DATE_FROM,
      value: searchParams.dateFrom,
    });
  }

  if (searchParams.dateTo) {
    filters.push({
      type: FILTER_TYPES.DATE,
      field: DATE_FILTER_FIELDS.DATE_TO,
      value: searchParams.dateTo,
    });
  }

  return filters;
};

/**
 * Build search parameters from filters array
 * @param {Array} filters - Filters array
 * @returns {Object} Search parameters
 */
export const buildSearchParamsFromFilters = (filters) => {
  const searchParams = {
    term: "",
    field: "all",
    dateFrom: "",
    dateTo: "",
  };

  // Build search params from filters
  filters.forEach((filter) => {
    if (filter.type === FILTER_TYPES.TEXT) {
      searchParams.term = filter.value;
      searchParams.field = filter.field;
    } else if (filter.field === DATE_FILTER_FIELDS.DATE_FROM) {
      searchParams.dateFrom = filter.value;
    } else if (filter.field === DATE_FILTER_FIELDS.DATE_TO) {
      searchParams.dateTo = filter.value;
    }
  });

  return searchParams;
};

/**
 * Get pagination slice
 * @param {Array} items - Items to paginate
 * @param {number} currentPage - Current page
 * @param {number} itemsPerPage - Items per page
 * @returns {Array} Paginated items
 */
export const getPaginatedItems = (items, currentPage, itemsPerPage) => {
  return items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
};

/**
 * Calculate total pages
 * @param {number} totalItems - Total number of items
 * @param {number} itemsPerPage - Items per page
 * @returns {number} Total pages
 */
export const calculateTotalPages = (totalItems, itemsPerPage) => {
  return Math.max(Math.ceil(totalItems / itemsPerPage), 1);
};
