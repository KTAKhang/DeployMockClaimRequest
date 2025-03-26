// Constants for claim statuses
export const STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  PAID: "paid",
  CANCELLED: "cancelled",
  DRAFT: "draft"
};

// Constants for admin view modes
export const VIEW_MODE = {
  ADMIN: "admin",
  APPROVER: "approver"
};

// Constants for comment states
export const COMMENT_STATE = {
  LOADING: "loading",
  ADDING: "adding",
  REPLYING: "replying",
  IDLE: "idle"
};

// Constants for comment actions
export const COMMENT_ACTIONS = {
  REPLY: "reply",
  ADD: "add"
};

// Constants for notification durations (in milliseconds)
export const NOTIFICATION_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000
};

// Constants for loading timeouts (in milliseconds)
export const LOADING_TIMEOUTS = {
  COMMENTS: 5000,
  NOTIFICATION: 3000
};

// Constants for pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE: 1
};

// Constants indicating which statuses should have locked comments
export const LOCKED_COMMENT_STATUSES = [
  STATUS.DRAFT,
  STATUS.CANCELLED
];
