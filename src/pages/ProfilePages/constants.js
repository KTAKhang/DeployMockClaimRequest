/**
 * Constants for Profile Page
 */

// Status constants
export const STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive"
};

// Toast configuration
export const TOAST_CONFIG = {
  POSITION: "top-right",
  AUTO_CLOSE: 3000,
  HIDE_PROGRESS_BAR: false,
  CLOSE_ON_CLICK: true,
  PAUSE_ON_HOVER: true,
  DRAGGABLE: true
};

// Form field names
export const FIELD_NAMES = {
  USER_NAME: "user_name",
  DEPARTMENT: "department",
  JOB_RANK: "job_rank",
  SALARY: "salary",
  ROLE_NAME: "role_name",
  STATUS: "status",
  AVATAR: "avatar"
};

// User role types
export const ROLE_TYPES = {
  ADMINISTRATOR: "Administrator"
};

// Regular expressions
export const REGEX = {
  USER_NAME: /^[A-ZÀ-Ỹ][a-zà-ỹ]+(\s[A-ZÀ-Ỹ][a-zà-ỹ]+)+$/
};

// Default values
export const DEFAULT_VALUES = {
  AVATAR: "default-avatar.png",
  NA: "N/A"
};

// CSS classes
export const CSS_CLASSES = {
  STATUS_INDICATOR: {
    ACTIVE: "bg-green-500",
    INACTIVE: "bg-red-500"
  },
  ICON_COLORS: {
    USER: "text-blue-500",
    BUILDING: "text-purple-500",
    BRIEFCASE: "text-indigo-500",
    DOLLAR: "text-green-500",
    USER_TIE: "text-orange-500",
    DOT: "text-blue-500",
    CLOCK: "text-gray-500",
    HISTORY: "text-gray-500"
  }
};
