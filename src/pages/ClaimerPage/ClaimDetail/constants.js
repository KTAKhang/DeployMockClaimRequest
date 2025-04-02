// Status constants
export const STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  PAID: "paid",
  CANCELLED: "cancelled",
};

// Status colors mapping
export const STATUS_COLORS = {
  [STATUS.DRAFT]: {
    bg: "bg-gray-200",
    text: "text-gray-500",
    bgLight: "bg-gray-100",
    textLight: "text-gray-600",
  },
  [STATUS.PENDING]: {
    bg: "bg-yellow-500",
    text: "text-yellow-500",
    bgLight: "bg-yellow-100",
    textLight: "text-yellow-600",
  },
  [STATUS.APPROVED]: {
    bg: "bg-green-500",
    text: "text-green-500",
    bgLight: "bg-green-100",
    textLight: "text-green-600",
  },
  [STATUS.REJECTED]: {
    bg: "bg-red-500",
    text: "text-red-500",
    bgLight: "bg-red-100",
    textLight: "text-red-600",
  },
  [STATUS.PAID]: {
    bg: "bg-blue-500",
    text: "text-blue-500",
    bgLight: "bg-blue-100",
    textLight: "text-blue-600",
  },
  [STATUS.CANCELLED]: {
    bg: "bg-pink-500",
    text: "text-pink-500",
    bgLight: "bg-pink-100",
    textLight: "text-pink-600",
  },
  default: {
    bg: "bg-gray-400",
    text: "text-gray-500",
    bgLight: "bg-gray-100",
    textLight: "text-gray-600",
  },
};

// Comment states
export const COMMENT_STATES = {
  LOADING: "loading",
  ADDING: "adding",
  REPLYING: "replying",
  IDLE: "idle",
};

// Action types for modal
export const ACTION_TYPES = {
  SUBMIT: "Submit",
  CANCEL: "Cancel",
  UPDATE: "Update",
};

// Locked status for comments
export const LOCKED_COMMENT_STATUSES = [
  STATUS.PAID,
  STATUS.CANCELLED,
  STATUS.REJECTED,
];
