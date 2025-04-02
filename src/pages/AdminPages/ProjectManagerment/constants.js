/**
 * Constants for Project Management
 */

// Table columns configuration
export const COLUMNS = [
  {
    label: "Project ID",
    shortLabel: "ID", // Shorter version for small screens
    key: "_id",
    width: "w-[12%]",
    sortable: true,
    priority: "high",
  },
  {
    label: "Project Name",
    shortLabel: "Name",
    key: "project_name",
    width: "w-[18%]",
    sortable: true,
    priority: "high",
  },
  {
    label: "Technical Lead",
    shortLabel: "Lead",
    key: "pm",
    width: "w-[15%]",
    sortable: true,
    priority: "high",
  },
  {
    label: "Quality Assurance",
    shortLabel: "QA",
    key: "qa",
    width: "w-[15%]",
    sortable: true,
    priority: "medium",
  },
  {
    label: "Status",
    shortLabel: "Status",
    key: "status",
    width: "w-[10%]",
    sortable: false,
    priority: "high",
  },
  {
    label: "Created At",
    shortLabel: "Date",
    key: "createdAt",
    width: "w-[10%]",
    sortable: true,
    priority: "medium",
  },
];

// Pagination constants
export const PAGINATION = {
  ITEMS_PER_PAGE: 10,
  DEFAULT_CURRENT_PAGE: 1,
};

// Sort direction constants
export const SORT_DIRECTION = {
  ASC: "asc",
  DESC: "desc",
};

// Project status constants
export const PROJECT_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

// CSS classes for status
export const STATUS_CLASSES = {
  ACTIVE:
    "bg-green-200 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] xs:text-xs sm:text-sm font-medium",
  INACTIVE:
    "bg-red-200 text-red-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] xs:text-xs sm:text-sm font-medium",
};

// Routes
export const ROUTES = {
  PROJECT_DETAIL: "/admin/project/",
};

// Filter types
export const FILTER_TYPES = {
  TEXT: "text",
  DATE: "date",
};

// Field names for date filters
export const DATE_FILTER_FIELDS = {
  DATE_FROM: "dateFrom",
  DATE_TO: "dateTo",
};

// Delay times (in milliseconds)
export const DELAY_TIMES = {
  RELOAD_PROJECTS: 1000,
};
