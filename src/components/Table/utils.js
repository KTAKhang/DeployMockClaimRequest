import { toast } from "react-toastify";
import { LABELS, NAVIGATION_PATHS, NAVIGATION_STATES } from "./strings";
import { UPDATE_CLAIM_STATUS_REQUEST } from "../../redux/actions/approverClaimActions";
import { SEARCH_FIELDS, FILTER_CONDITIONS } from "./constants";

/**
 * Filters claims based on search criteria and status
 * @param {Array} claims - The claims data array
 * @param {Object} searchData - The search criteria
 * @param {String} statusFilter - The status filter
 * @param {String} filterCondition - The filter condition
 * @returns {Array} - Filtered claims
 */
export const filterClaims = (
  claims,
  searchData,
  statusFilter,
  filterCondition
) => {
  if (!Array.isArray(claims) || claims.length === 0) {
    return [];
  }

  return claims.filter((claim) => {
    // Mode Filtering
    if (
      filterCondition === FILTER_CONDITIONS.FOR_MY_VETTING &&
      claim.status !== "Pending"
    ) {
      return false;
    }
    if (
      filterCondition === FILTER_CONDITIONS.CLAIMS_HISTORY &&
      !["Approved", "Paid"].includes(claim.status)
    ) {
      return false;
    }

    // Status Filtering
    if (statusFilter !== "All" && claim.status !== statusFilter) {
      return false;
    }

    // Check for valid duration format
    if (
      typeof claim.duration !== "string" &&
      !(claim.duration instanceof Date)
    ) {
      console.warn(
        `Claim ${claim.id} has duration in unexpected format:`,
        claim.duration
      );
      return false;
    }

    // Date Range Filtering
    let passesDateFilter = true;
    if (searchData.dateFrom || searchData.dateTo) {
      // Parse filter dates first
      let filterFromDate = searchData.dateFrom
        ? new Date(searchData.dateFrom)
        : null;
      let filterToDate = searchData.dateTo ? new Date(searchData.dateTo) : null;

      // If dates are reversed, swap them
      if (filterFromDate && filterToDate && filterFromDate > filterToDate) {
        console.log("Dates are reversed, swapping them");
        [filterFromDate, filterToDate] = [filterToDate, filterFromDate];
      }

      // Normalize filter dates
      if (filterFromDate) filterFromDate.setHours(0, 0, 0, 0);
      if (filterToDate) filterToDate.setHours(23, 59, 59, 999);

      // Use claim.duration as the date field
      const dateValue = claim.duration;

      // Skip this claim if no date value exists
      if (!dateValue) {
        passesDateFilter = false;
      } else {
        // Extract only the 'From' date from the duration string
        // Format is "From YYYY-MM-DD To YYYY-MM-DD"
        const fromDateMatch = dateValue.match(/From (\d{4}-\d{2}-\d{2})/);

        if (!fromDateMatch) {
          console.log(
            `Invalid duration format: ${dateValue} for claim ID: ${claim.id}`
          );
          passesDateFilter = false;
        } else {
          // Extract the start date from the duration string
          const claimStartDate = new Date(fromDateMatch[1]);

          // Skip invalid dates
          if (isNaN(claimStartDate.getTime())) {
            console.log(
              `Invalid date parsing in duration: ${dateValue} for claim ID: ${claim.id}`
            );
            passesDateFilter = false;
          } else {
            // Normalize claim 'from' date to midnight
            claimStartDate.setHours(0, 0, 0, 0);

            // Apply date filters (Only checking 'from' date now)
            if (filterFromDate && claimStartDate < filterFromDate)
              passesDateFilter = false;
            if (filterToDate && claimStartDate > filterToDate)
              passesDateFilter = false;
          }
        }
      }
    }

    // Search Term Filtering
    let passesSearchFilter = true;
    if (searchData.term) {
      const searchTerm = searchData.term.toLowerCase();

      // Search based on field
      if (searchData.field === SEARCH_FIELDS.ALL) {
        // Search in all fields
        passesSearchFilter =
          (claim.id?.toLowerCase() || "").includes(searchTerm) ||
          (claim.staff?.toLowerCase() || "").includes(searchTerm) ||
          (claim.project?.toLowerCase() || "").includes(searchTerm) ||
          (claim.status?.toLowerCase() || "").includes(searchTerm);
      } else {
        // Search in specific field
        const fieldValue = claim[searchData.field];
        passesSearchFilter =
          fieldValue && typeof fieldValue === "string"
            ? fieldValue.toLowerCase().includes(searchTerm)
            : false;
      }
    }

    // Return true only if both filters pass
    return passesDateFilter && passesSearchFilter;
  });
};

/**
 * Sorts claims based on sort configuration
 * @param {Array} claims - The claims data array
 * @param {Object} sortConfig - The sort configuration
 * @returns {Array} - Sorted claims
 */
export const sortClaims = (claims, sortConfig) => {
  if (!Array.isArray(claims) || claims.length === 0 || !sortConfig.key) {
    return claims;
  }

  return [...claims].sort((a, b) => {
    const key = sortConfig.key;

    // Handle null or undefined values
    const valueA = a[key] === undefined || a[key] === null ? "" : a[key];
    const valueB = b[key] === undefined || b[key] === null ? "" : b[key];

    // Handle string comparison
    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortConfig.direction === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    // Handle numeric comparison
    if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
};

/**
 * Creates a filter object from search data
 * @param {Object} searchData - The search data
 * @returns {Array} - Array of filter objects
 */
export const createFiltersFromSearchData = (searchData) => {
  const filters = [];

  if (searchData.term) {
    filters.push({
      id: `term-${Date.now()}`,
      label: LABELS.FIELD_LABELS[searchData.field],
      value: searchData.term,
      field: searchData.field,
      type: "text",
    });
  }

  if (searchData.dateFrom) {
    filters.push({
      id: `date-from-${Date.now()}`,
      label: LABELS.FIELD_LABELS.dateFrom,
      value: searchData.dateFrom,
      field: "dateFrom",
      type: "date",
    });
  }

  if (searchData.dateTo) {
    filters.push({
      id: `date-to-${Date.now()}`,
      label: LABELS.FIELD_LABELS.dateTo,
      value: searchData.dateTo,
      field: "dateTo",
      type: "date",
    });
  }

  return filters;
};

/**
 * Handles status update for claims
 * @param {Array|String} ids - Claim ID or array of claim IDs
 * @param {String} action - The action to perform
 * @param {String} reason_approver - The reason for approval/rejection
 * @param {Function} dispatch - Redux dispatch function
 */
export const handleStatusUpdate = (
  ids,
  action,
  reason_approver = "",
  dispatch
) => {
  if (!ids || !action || !dispatch) {
    console.error("Missing required parameters for handleStatusUpdate");
    return;
  }

  const status = action === "Approve" ? "Approved" : "Rejected";

  dispatch({
    type: UPDATE_CLAIM_STATUS_REQUEST,
    payload: {
      ids: Array.isArray(ids) ? ids : [ids],
      status,
      reason_approver,
    },
  });

  // Show toast notification
  const toastMessage =
    status === "Approved"
      ? LABELS.TOAST.CLAIMS_APPROVED
      : LABELS.TOAST.CLAIMS_REJECTED;

  toast.success(toastMessage, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
  });
};

/**
 * Builds URL parameters from search data and status filter
 * @param {Object} searchData - The search data
 * @param {String} statusFilter - The status filter
 * @returns {Object} - URL parameters object
 */
export const buildUrlParams = (searchData, statusFilter) => {
  const params = {
    status: statusFilter || "All",
  };

  // Only add search term parameters if they exist
  if (searchData.term) {
    params.searchTerm = searchData.term;
    params.searchField = searchData.field;
  }

  // Add date range parameters to URL if they exist
  if (searchData.dateFrom) params.dateFrom = searchData.dateFrom;
  if (searchData.dateTo) params.dateTo = searchData.dateTo;

  return params;
};

/**
 * Gets navigation path and state for claim detail view
 * @param {String} filterCondition - The filter condition
 * @param {String} id - The claim ID
 * @returns {Object} - Object with path and state properties
 */
export const getNavigationDetails = (filterCondition, id) => {
  if (!filterCondition || !id) {
    console.warn("Missing required parameters for getNavigationDetails");
    return {
      path: `/approver/history/${id || ""}`,
      state: { mode: "history" },
    };
  }

  const defaultPath = `/approver/history/${id}`;
  const defaultState = { mode: "history" };

  // Use navigation paths from strings.js
  const path = NAVIGATION_PATHS[filterCondition]
    ? NAVIGATION_PATHS[filterCondition](id)
    : defaultPath;

  // Use navigation states from strings.js
  const state = NAVIGATION_STATES[filterCondition] || defaultState;

  return { path, state };
};
