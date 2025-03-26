export const PAGINATION = {
  ITEMS_PER_PAGE: 4,
};

export const ROUTES = {
  ADMIN_PROJECT: "/admin/project",
  ADMIN_STAFF: "/admin/staff",
};

export const COLORS = {
  PROJECT_STATUS: {
    COMPLETED: "#22c55e",
    IN_PROGRESS: "#facc15",
  },
  EMPLOYEE_STATUS: {
    ACTIVE: {
      BACKGROUND: "bg-green-200",
      TEXT: "text-green-700",
    },
    INACTIVE: {
      BACKGROUND: "bg-red-200",
      TEXT: "text-red-700",
    },
  },
};

export const CHART_OPTIONS = {
  LABELS: ["Completed", "In Progress"],
  LEGEND: {
    POSITION: "bottom",
    HORIZONTAL_ALIGN: "center",
    FONT_SIZE: "14px",
    OFFSET_Y: 5,
    MOBILE_FONT_SIZE: "12px",
  },
};
