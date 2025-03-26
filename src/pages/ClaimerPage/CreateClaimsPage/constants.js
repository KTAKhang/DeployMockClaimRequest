/**
 * Constants for CreateClaim component
 */

// Default times for work hours
export const DEFAULT_TIMES = {
  START_TIME: "09:00",
  END_TIME: "17:00"
};

// Claim status constants
export const CLAIM_STATUS = {
  DRAFT: "Draft",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected"
};

// Navigation routes
export const ROUTES = {
  DRAFT: "/claimer/draft",
  PENDING: "/claimer/pending"
};

// Form field names
export const FIELD_NAMES = {
  STAFF_NAME: "staffName",
  PROJECT_NAME: "projectName",
  REASON_CLAIMER: "reason_claimer",
  DATE: "date",
  TIME: "time",
  DAY: "day",
  FROM_DATE: "from_date",
  TO_DATE: "to_date", 
  FROM_TIME: "from_time",
  TO_TIME: "to_time",
  TOTAL_HOURS: "totalNoOfHours"
};

// Action types for modal
export const ACTION_TYPES = {
  SAVE: "Save",
  SUBMIT: "Submit",
  CANCEL: "Cancel"
};

// Timer constants
export const TIMER_CONSTANTS = {
  INTERVAL: 1000,
  REDIRECT_DELAY: 1000
};

// Toast configuration
export const TOAST_CONFIG = {
  POSITION: "top-right",
  AUTO_CLOSE: 3000,
  AUTO_CLOSE_ERROR: 5000,
  HIDE_PROGRESS_BAR: false,
  CLOSE_ON_CLICK: true,
  PAUSE_ON_HOVER: true,
  DRAGGABLE: true
};
