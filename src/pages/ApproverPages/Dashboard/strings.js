// strings.js
export const DASHBOARD_TEXTS = {
  WELCOME_MESSAGE: "Welcome, Approver!",
  LOADING_MESSAGE: "Loading dashboard...",
  NO_PENDING_CLAIMS: "No pending approvals at the moment.",
  ALL_CAUGHT_UP: "All caught up!",
  SHOW_MORE: "Show More",
  SHOW_LESS: "Show Less",
  REVIEW_BUTTON: "Review",
};

export const DASHBOARD_STATS = [
  {
    label: "Pending Approvals",
    icon: "FaClock",
    color: {
      gradient: "from-yellow-50 to-yellow-100",
      hoverGradient: "hover:from-yellow-100 hover:to-yellow-200",
      text: "text-yellow-700",
      icon: "text-yellow-500",
    },
  },
  {
    label: "Approved Claims",
    icon: "FaClipboardCheck",
    color: {
      gradient: "from-green-50 to-green-100",
      hoverGradient: "hover:from-green-100 hover:to-green-200",
      text: "text-green-700",
      icon: "text-green-600",
    },
  },
  {
    label: "Paid Claims",
    icon: "FaMoneyCheckAlt",
    color: {
      gradient: "from-blue-50 to-blue-100",
      hoverGradient: "hover:from-blue-100 hover:to-blue-200",
      text: "text-blue-700",
      icon: "text-blue-600",
    },
  },
];
