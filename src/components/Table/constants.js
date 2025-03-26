// Action types
export const ACTION_TYPES = {
  APPROVE: "Approve",
  APPROVE_ALL: "ApproveAll",
  REJECT: "Reject",
  REJECT_ALL: "RejectAll",
  SUBMIT: "Submit",
  SUBMIT_ALL: "SubmitAll",
  CANCEL_ALL: "CancelAll",
  CANCELLED: "Cancelled",
  PAY_ALL: "PayAll",
  PAID: "Paid",
};

// Status options
export const STATUS_OPTIONS = {
  ALL: "All",
  DRAFT: "Draft",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  PAID: "Paid",
};

// Filter conditions
export const FILTER_CONDITIONS = {
  FOR_MY_VETTING: "ForMyVetting",
  CLAIMS_HISTORY: "ClaimsHistory",
  DRAFT: "Draft",
  PENDING: "Pending",
  APPROVED: "Approved",
  PAID: "Paid",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  FINANCE_APPROVED: "FinanceApproved",
  FINANCE_PAID: "FinancePaid",
  CLAIM_MANAGEMENT: "ClaimManagement", // Fixed typo from "ClaimManagerment"
};

// Modes
export const MODES = {
  VETTING: "vetting",
  HISTORY: "history",
  ADMIN: "admin",
  DRAFT: "draft",
};

// Pagination settings
export const PAGINATION = {
  ITEMS_PER_PAGE: 10,
};

// Search field options
export const SEARCH_FIELDS = {
  ALL: "all",
  ID: "id",
  STAFF: "staff",
  PROJECT: "project",
  STATUS: "status",
};

// Initial search data
export const INITIAL_SEARCH_DATA = {
  term: "",
  field: SEARCH_FIELDS.ALL,
  dateFrom: "",
  dateTo: "",
};
