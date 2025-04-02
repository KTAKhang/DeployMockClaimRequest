export const ITEMS_PER_PAGE = 10;

export const COLUMN_CONFIGURATIONS = [
  {
    label: "User ID",
    shortLabel: "ID",
    key: "_id",
    width: "w-[12%]",
    sortable: true,
    priority: "high",
  },
  {
    label: "Staff Name",
    shortLabel: "Name",
    key: "user_name",
    width: "w-[18%]",
    sortable: true,
    priority: "high",
  },
  {
    label: "Role",
    shortLabel: "Role",
    key: "role_name",
    width: "w-[15%]",
    sortable: true,
    priority: "high",
  },
  {
    label: "Department",
    shortLabel: "Dept",
    key: "department",
    width: "w-[15%]",
    sortable: false,
    priority: "medium",
  },
  {
    label: "Job Rank",
    shortLabel: "Rank",
    key: "job_rank",
    width: "w-[10%]",
    sortable: true,
    priority: "medium",
  },
  {
    label: "Salary",
    shortLabel: "Salary",
    key: "salary",
    width: "w-[10%]",
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
    priority: "low",
  },
];

export const STATUS_CLASSES = {
  active:
    "bg-green-200 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] xs:text-xs sm:text-sm font-medium",
  inactive:
    "bg-red-200 text-red-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] xs:text-xs sm:text-sm font-medium",
};

export const SEARCH_FILTER_TYPES = {
  TEXT: "text",
  DATE: "date",
};

export const FILTER_FIELDS = {
  ALL: "all",
  USER_NAME: "user_name",
  ROLE: "role_name",
  STATUS: "status",
  DEPARTMENT: "department",
};
