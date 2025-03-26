import { STATUS_CLASSES, SEARCH_FILTER_TYPES } from "./constants.js";

export const getStatusClass = (status) => {
  return status ? STATUS_CLASSES.active : STATUS_CLASSES.inactive;
};

export const formatStaffId = (id, showFull = false) => {
  if (!id) return "N/A";
  return showFull ? id : `${id.substring(0, 5)}...`;
};

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return "Invalid Date";
  }
};

export const buildSearchParams = (filters) => {
  const searchParams = {
    term: "",
    field: "all",
    dateFrom: "",
    dateTo: "",
  };

  filters.forEach((filter) => {
    if (filter.type === SEARCH_FILTER_TYPES.TEXT) {
      searchParams.term = filter.value;
      searchParams.field = filter.field;
    } else if (filter.field === "dateFrom") {
      searchParams.dateFrom = filter.value;
    } else if (filter.field === "dateTo") {
      searchParams.dateTo = filter.value;
    }
  });

  return searchParams;
};

export const sortData = (data, sortConfig) => {
  if (!sortConfig.key) return data;

  return [...data].sort((a, b) => {
    const key = sortConfig.key;
    if (a[key] < b[key]) return sortConfig.direction === "asc" ? -1 : 1;
    if (a[key] > b[key]) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });
};

export const filterData = (data, searchParams) => {
  let filtered = [...data];

  // Text search filter
  if (searchParams.term) {
    const term = searchParams.term.toLowerCase();
    filtered = filtered.filter((staff) => {
      if (searchParams.field === "all") {
        return Object.entries(staff).some(([key, value]) => {
          if (key === "status") {
            const statusText = value ? "active" : "inactive";
            return statusText === term;
          }
          return value && value.toString().toLowerCase().includes(term);
        });
      } else if (searchParams.field === "status") {
        const statusValue = staff.status;
        const statusText = statusValue ? "active" : "inactive";
        return statusText === term.toLowerCase();
      } else {
        return (
          staff[searchParams.field] &&
          staff[searchParams.field].toString().toLowerCase().includes(term)
        );
      }
    });
  }

  // Date filters
  if (searchParams.dateFrom || searchParams.dateTo) {
    filtered = filtered.filter((staff) => {
      const createdAt = new Date(staff.createdAt);
      let isValid = true;

      if (searchParams.dateFrom) {
        const dateFrom = new Date(searchParams.dateFrom);
        isValid = isValid && createdAt >= dateFrom;
      }

      if (searchParams.dateTo) {
        const dateTo = new Date(searchParams.dateTo);
        dateTo.setDate(dateTo.getDate() + 1);
        isValid = isValid && createdAt <= dateTo;
      }

      return isValid;
    });
  }

  return filtered;
};
