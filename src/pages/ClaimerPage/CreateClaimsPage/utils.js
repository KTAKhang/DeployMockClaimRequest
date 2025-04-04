/**
 * Utility functions for CreateClaim component
 */

/**
 * Get day of week from date string
 * @param {string} dateString - Date string in ISO format
 * @returns {string} Day of week name
 */
export const getDayOfWeek = (dateString) => {
  if (!dateString) return "";
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(dateString);
  return days[date.getDay()];
};

/**
 * Get current date and time formatted as strings
 * @returns {Object} Object containing date and time strings
 */
export const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}:${seconds}`
  };
};

/**
 * Calculate total hours from claim rows
 * @param {Array} claimRows - Array of claim row objects
 * @returns {number} Total hours
 */
export const calculateTotalHours = (claimRows) => {
  return claimRows.reduce((total, row) => total + (Number(row.totalNoOfHours) || 0), 0);
};

/**
 * Format claim data for API submission
 * @param {Object} claim - Claim row data
 * @param {string} projectId - Project ID
 * @param {string} status - Claim status
 * @returns {Object} Formatted data for API
 */
export const formatClaimData = (claim, projectId, status) => {
  return {
    date: claim.date,
    from: `${claim.from_date}T${claim.from_time}:00`,
    to: `${claim.to_date}T${claim.to_time}:00`,
    total_no_of_hours: parseFloat(claim.totalNoOfHours),
    project_id: projectId,
    reason_claimer: claim.reason_claimer,
    status: status
  };
};

/**
 * Create a new claim row with default values
 * @param {number} id - Unique ID for the row
 * @param {Object} currentDateTime - Object with date and time
 * @param {string} defaultStartTime - Default start time
 * @param {string} defaultEndTime - Default end time
 * @returns {Object} New claim row object
 */
export const createNewClaimRow = (id, currentDateTime, defaultStartTime, defaultEndTime) => {
  return {
    id,
    date: currentDateTime.date,
    time: currentDateTime.time,
    day: getDayOfWeek(currentDateTime.date),
    from_date: "",
    to_date: "",
    from_time: defaultStartTime,
    to_time: defaultEndTime,
    totalNoOfHours: "",
    reason_claimer: "",
  };
};

/**
 * Get user name from local storage
 * @returns {string} User name or empty string
 */
export const getUserNameFromStorage = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user && user.user_name ? user.user_name : "";
    } catch (error) {
      console.error("Error parsing user data:", error);
      return "";
    }
  }
  return "";
};

/**
 * Validate all claim form fields
 * @param {Object} form - Form data
 * @param {Array} claimRows - Claim rows data
 * @returns {Object} Object with isValid flag and errors object
 */
export const validateClaimForm = (form, claimRows) => {
  const newErrors = {
    projectName: "",
    claimRows: claimRows.map(() => ({}))
  };

  let isValid = true;

  // Kiểm tra project name
  if (!form.projectName) {
    newErrors.projectName = "Please select a project";
    isValid = false;
  }

  // Kiểm tra từng claim row
  claimRows.forEach((row, index) => {
    if (!row.from_date) {
      newErrors.claimRows[index].from_date = "Start date is required";
      isValid = false;
    }

    if (!row.to_date) {
      newErrors.claimRows[index].to_date = "End date is required";
      isValid = false;
    } else if (row.from_date && new Date(row.from_date) > new Date(row.to_date)) {
      newErrors.claimRows[index].to_date = "End date must be after start date";
      isValid = false;
    } 

    if (!row.totalNoOfHours) {
      newErrors.claimRows[index].totalNoOfHours = "Total working hours is required";
      isValid = false;
    } else {
      const hours = parseFloat(row.totalNoOfHours);
      if (isNaN(hours) || hours <= 0) {
        newErrors.claimRows[index].totalNoOfHours = "Total working hours must be a positive number";
        isValid = false;
      }
    }

    if (!row.reason_claimer) {
      newErrors.claimRows[index].reason_claimer = "Reason is required";
      isValid = false;
    }
  });

  return { isValid, errors: newErrors };
};
