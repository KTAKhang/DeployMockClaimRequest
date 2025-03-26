// Status colors and styles
export const STATUS_STYLES = {
  Pending: {
    bgColor: "bg-yellow-500",
    textColor: "text-yellow-500",
    lightBgColor: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  Approved: {
    bgColor: "bg-green-500",
    textColor: "text-green-500",
    lightBgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  Rejected: {
    bgColor: "bg-red-500",
    textColor: "text-red-500",
    lightBgColor: "bg-red-100",
    iconColor: "text-red-600",
  },
  Paid: {
    bgColor: "bg-blue-500",
    textColor: "text-blue-500",
    lightBgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  default: {
    bgColor: "bg-gray-400",
    textColor: "text-gray-500",
    lightBgColor: "bg-gray-100",
    iconColor: "text-gray-600",
  },
};

// Comment loading timeouts
export const COMMENT_LOADING_TIMEOUT = 5000;
export const EMPTY_COMMENTS_LOADING_TIMEOUT = 2000;

// Redux action types
export const REDUX_ACTIONS = {
  FETCH_CLAIM_DETAIL_REQUEST: "FETCH_CLAIM_DETAIL_REQUEST",
  UPDATE_CLAIM_STATUS_REQUEST: "UPDATE_CLAIM_STATUS_REQUEST",
  GET_COMMENTS_REQUEST: "GET_COMMENTS_REQUEST",
};

// Toast notification settings
export const TOAST_SETTINGS = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
};

// Route paths
export const ROUTES = {
  VETTING: "/approver/vetting",
  HISTORY: "/approver/history",
  HISTORY_APPROVED: "/approver/history?status=Approved",
};
