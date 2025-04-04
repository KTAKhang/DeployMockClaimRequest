export const LABELS = {
  TOTAL_CLAIMS: "Total Claims:",
  ACTIVE_FILTERS: "Active filters:",
  CLEAR_ALL: "Clear all",
  NO_CLAIMS: "No claims found.",
  LOADING_CLAIMS: "Loading claims...",

  // Field labels
  FIELD_LABELS: {
    all: "All Fields",
    id: "ID",
    staff: "Staff",
    project: "Project",
    status: "Status",
    dateFrom: "From Date",
    dateTo: "To Date",
    duration: "Duration",
    hours: "Hours",
    date: "Updated",
    actions: "Actions",
  },

  // Button labels
  BUTTONS: {
    PAY_ALL: "PayAll",
    DOWNLOAD_ALL: "DownloadAll",
    APPROVE: "Approve",
    REJECT: "Reject",
    SUBMIT_ALL: "SubmitAll",
    CANCEL_ALL: "CancelAll",
    FIRST: "First",
    PREVIOUS: "Previous",
    NEXT: "Next",
    LAST: "Last",
    PAGE: "Page",
    OF: "of",
  },

  // Toast messages
  TOAST: {
    REASON_REQUIRED: "Please enter a reason.",
    CLAIMS_APPROVED: "Claims Approved Successfully!",
    CLAIMS_REJECTED: "Claims Rejected Successfully!",
    CLAIMS_PAID: "Pay Claims Successfully!",
    CLAIMS_SUBMITTED: "Selected claims have been pending!",
    CLAIMS_CANCELLED: "Selected claims have been cancelled!",
  },
};

// Navigation paths based on filter condition
export const NAVIGATION_PATHS = {
  ClaimsHistory: (id) => `/approver/history/${id}`,
  ForMyVetting: (id) => `/approver/vetting/${id}`,
  Draft: (id) => `/claimer/draft/${id}`,
  Pending: (id) => `/claimer/pending/${id}`,
  Approved: (id) => `/claimer/approved/${id}`,
  Paid: (id) => `/claimer/paid/${id}`,
  Rejected: (id) => `/claimer/rejected/${id}`,
  Cancelled: (id) => `/claimer/cancelled/${id}`,
  FinanceApproved: (id) => `/finance/approved/${id}`,
  FinancePaid: (id) => `/finance/paid/${id}`,
  ClaimManagerment: (id) => `/admin/claim-management/${id}`, // Fixed typo from "ClaimManagerment"
  ClaimerDashboard: (id) => `/claimer/draft/${id}`, // Fixed typo from "ClaimManagerment"
};

// Navigation states based on filter condition
export const NAVIGATION_STATES = {
  ClaimsHistory: { mode: "history" },
  ForMyVetting: { mode: "vetting" },
  ClaimManagement: { mode: "admin" }, // Fixed typo from "ClaimManagerment"
};

export const truncateString = (str, length = 5) => {
  if (!str) return ""; // Handle cases where str might be undefined/null
  return str.length > length ? `${str.substring(0, length)}...` : str;
};
