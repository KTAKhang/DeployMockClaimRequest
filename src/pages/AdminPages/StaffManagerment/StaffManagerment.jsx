import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaEye, FaPlus, FaSortUp, FaSortDown } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { getStaffAll, addStaff } from "../../../redux/actions/staffActions";
import PopupStaffInfor from "../../../components/Popup/PopupStaffInfor";
import Loading from "../../../components/Loading/Loading";
import EnhancedSearch from "../../../components/Search/EnhancedSearch"; // Import the EnhancedSearch component

const columns = [
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

const getStatusClass = (status) => {
  return status
    ? "bg-green-200 text-green-700 px-2 py-1 rounded-full text-xs font-medium"
    : "bg-red-200 text-red-700 px-2 py-1 rounded-full text-xs font-medium";
};

export default function StaffManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [inputValue, setInputValue] = useState(currentPage.toString());
  const itemsPerPage = 10;
  const { staffAll, error } = useSelector((state) => state.staff);
  const [popupData, setPopupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Add state for search filters
  const [searchFilters, setSearchFilters] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);

  useEffect(() => {
    dispatch(getStaffAll()); // ✅ Fetch staff once without page & limit
  }, [dispatch]);

  const staffList = Array.isArray(staffAll?.data) ? staffAll.data : [];

  useEffect(() => {
    if (staffList.length > 0) {
      setLoading(false);
      setFilteredStaff(staffList); // Initialize filtered staff with all staff
    }
  }, [staffList]);

  useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  // Apply sorting to the filtered staff list
  const sortedStaff = [...filteredStaff].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const key = sortConfig.key;
    if (a[key] < b[key]) return sortConfig.direction === "asc" ? -1 : 1;
    if (a[key] > b[key]) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleAddStaff = async (newData) => {
    await dispatch(addStaff(newData));
    setTimeout(() => {
      dispatch(getStaffAll()); // ✅ Refresh staff list
    }, 1000);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle search
  const handleSearch = (searchParams) => {
    // Create filter objects based on search parameters
    const newFilters = [];

    // Add text search filter if term exists
    if (searchParams.term) {
      newFilters.push({
        type: "text",
        field: searchParams.field,
        value: searchParams.term,
      });
    }

    // Add date filters if they exist
    if (searchParams.dateFrom) {
      newFilters.push({
        type: "date",
        field: "dateFrom",
        value: searchParams.dateFrom,
      });
    }

    if (searchParams.dateTo) {
      newFilters.push({
        type: "date",
        field: "dateTo",
        value: searchParams.dateTo,
      });
    }

    setSearchFilters(newFilters);

    // Apply filters to staff list
    let filtered = [...staffList];

    // Apply text filter
    if (searchParams.term) {
      const term = searchParams.term.toLowerCase();
      filtered = filtered.filter((staff) => {
        if (searchParams.field === "all") {
          // Search in all fields, including special handling for status
          return Object.entries(staff).some(([key, value]) => {
            // Special handling for status field - convert boolean to text
            if (key === "status") {
              const statusText = value ? "active" : "inactive";
              return statusText === term;
            }
            return value && value.toString().toLowerCase().includes(term);
          });
        } else if (searchParams.field === "status") {
          // Special handling for status field
          const statusValue = staff.status;
          const statusText = statusValue ? "active" : "inactive";
          return statusText === term.toLowerCase();
        } else {
          // Search in specific field
          return (
            staff[searchParams.field] &&
            staff[searchParams.field].toString().toLowerCase().includes(term)
          );
        }
      });
    }

    // Apply date filters
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
          // Add one day to include the end date
          dateTo.setDate(dateTo.getDate() + 1);
          isValid = isValid && createdAt <= dateTo;
        }

        return isValid;
      });
    }

    setFilteredStaff(filtered);
    setCurrentPage(1); // Reset to first page when applying filters
  };

  // Handle filter removal
  const handleRemoveFilter = (filterToRemove) => {
    const updatedFilters = searchFilters.filter(
      (filter) =>
        !(
          filter.field === filterToRemove.field &&
          filter.type === filterToRemove.type
        )
    );

    setSearchFilters(updatedFilters);

    // Re-apply remaining filters
    const searchParams = {
      term: "",
      field: "all",
      dateFrom: "",
      dateTo: "",
    };

    // Build search params from remaining filters
    updatedFilters.forEach((filter) => {
      if (filter.type === "text") {
        searchParams.term = filter.value;
        searchParams.field = filter.field;
      } else if (filter.field === "dateFrom") {
        searchParams.dateFrom = filter.value;
      } else if (filter.field === "dateTo") {
        searchParams.dateTo = filter.value;
      }
    });

    handleSearch(searchParams);
  };

  const totalStaff = filteredStaff.length;
  const totalPages = Math.max(Math.ceil(totalStaff / itemsPerPage), 1);

  const paginatedStaff = sortedStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="px-0 sm:px-2 md:px-4 -ml-1 sm:-ml-0 min-h-fit flex flex-col items-center">
      <div className="w-full max-w-[350px] sm:max-w-[550px] md:max-w-none bg-white shadow-lg border rounded-xl p-3 sm:p-4 md:p-6 overflow-hidden">
        {/* Header - Stacked and centered on mobile, side-by-side on larger screens */}
        <div className="flex flex-col items-center lg:flex-row lg:justify-between lg:items-center gap-3 mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-center lg:text-left mb-2 lg:mb-0">
            Staff Management
          </h3>

          {/* Search and Filters Section - Centered */}
          <div className="w-full lg:flex-1 lg:max-w-md mb-3 lg:mb-0 flex justify-center lg:justify-start">
            <EnhancedSearch
              onSearch={handleSearch}
              activeFilters={searchFilters}
              onRemoveFilter={handleRemoveFilter}
            />
          </div>

          {/* Controls Section - Centered on mobile, aligned with the layout in first component */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 w-full lg:w-auto">
            {/* Action Button - Centered */}
            <div className="flex items-center justify-center sm:justify-start gap-2 w-full">
              <button
                className="bg-green-500 text-white px-2 sm:px-3 py-1 rounded-lg shadow hover:bg-green-600 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                onClick={() => setPopupData({})}
              >
                <FaPlus /> Add Staff
              </button>

              {/* Total Staff Counter - Similar to the counter in first component */}
              <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md border border-gray-300 bg-gray-100 flex items-center gap-1 sm:gap-2">
                👥 Total Staffs: <span className="font-bold">{totalStaff}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Display active filters - Centered on mobile */}
        {searchFilters.length > 0 && (
          <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchFilters.map((filter, index) => (
              <div
                key={index}
                className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
              >
                <span>
                  {filter.type === "text" && (
                    <>
                      {filter.field === "all"
                        ? "All fields"
                        : filter.field.charAt(0).toUpperCase() +
                          filter.field.slice(1)}
                      : {filter.value}
                    </>
                  )}
                  {filter.field === "dateFrom" && (
                    <>From: {new Date(filter.value).toLocaleDateString()}</>
                  )}
                  {filter.field === "dateTo" && (
                    <>To: {new Date(filter.value).toLocaleDateString()}</>
                  )}
                </span>
                <button
                  onClick={() => handleRemoveFilter(filter)}
                  className="ml-1.5 text-blue-700 hover:text-blue-900"
                >
                  <FaXmark />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                setSearchFilters([]);
                setFilteredStaff(staffList);
                setCurrentPage(1);
              }}
              className="text-xs text-gray-600 hover:text-gray-800 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {/* Table container with proper overflow handling */}
        <div
          className="w-full overflow-x-auto overflow-hidden"
          style={{ minHeight: paginatedStaff.length > 0 ? "600px" : "auto" }}
        >
          <div className="h-[600px] overflow-y-auto">
            <table className="w-full border-collapse text-gray-700 text-[10px] xs:text-xs sm:text-sm min-w-[700px]">
              <thead className="bg-gray-200 text-gray-600 sticky top-0 z-20">
                <tr className="border-b">
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className={`px-1 sm:px-2 md:px-4 py-1 sm:py-2 md:py-3 text-left font-medium whitespace-nowrap ${
                        column.priority === "low"
                          ? "hidden sm:table-cell"
                          : column.priority === "medium"
                          ? "hidden md:table-cell"
                          : ""
                      } ${column.width} ${
                        column.sortable ? "cursor-pointer" : ""
                      }`}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center">
                        <span className="hidden sm:inline">{column.label}</span>
                        <span className="sm:hidden">{column.shortLabel}</span>
                        {column.sortable && (
                          <span className="ml-1 relative flex flex-col items-center">
                            <FaSortUp
                              className={`translate-y-[6px] transition-all ${
                                sortConfig.key === column.key &&
                                sortConfig.direction === "asc"
                                  ? "text-blue-500"
                                  : "text-gray-400"
                              }`}
                            />
                            <FaSortDown
                              className={`translate-y-[-6px] transition-all ${
                                sortConfig.key === column.key &&
                                sortConfig.direction === "desc"
                                  ? "text-blue-500"
                                  : "text-gray-400"
                              }`}
                            />
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-1 sm:px-4 py-1 sm:py-3 font-medium text-center w-[8%]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* Table body rows with updated padding and sizes */}
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="text-center py-10 sm:py-20"
                    >
                      <Loading message="Loading staff..." />
                    </td>
                  </tr>
                ) : paginatedStaff.length > 0 ? (
                  paginatedStaff.map((staff, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-100 transition min-h-[40px] sm:min-h-[48px]"
                    >
                      <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[40px] sm:min-w-[60px] md:min-w-[100px]">
                        <span
                          className="cursor-pointer group relative"
                          title={staff?._id}
                        >
                          {staff?._id.substring(0, 5)}...
                          <span className="absolute left-0 top-full z-10 bg-gray-800 text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                            {staff?._id}
                          </span>
                        </span>
                      </td>
                      <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[80px] sm:min-w-[100px]">
                        {staff?.user_name || "N/A"}
                      </td>
                      <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[60px] sm:min-w-[80px] md:min-w-[100px]">
                        {staff?.role_name || "N/A"}
                      </td>
                      <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[100px] sm:min-w-[120px] hidden md:table-cell">
                        {staff?.department || "N/A"}
                      </td>
                      <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[60px] sm:min-w-[80px] hidden md:table-cell">
                        {staff?.job_rank || "N/A"}
                      </td>
                      <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[80px] sm:min-w-[100px] hidden md:table-cell">
                        {staff?.salary || "N/A"}
                      </td>
                      <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[60px] sm:min-w-[80px] md:min-w-[100px]">
                        <span className={getStatusClass(staff?.status)}>
                          {staff?.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[100px] sm:min-w-[120px] hidden md:table-cell">
                        {staff?.createdAt
                          ? new Date(staff.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 flex items-center justify-center">
                        <button className="flex justify-center items-center">
                          <FaEye
                            className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 cursor-pointer hover:text-blue-600 transition"
                            onClick={() =>
                              navigate(`/admin/staff/detail/${staff._id}`, {
                                state: { staff },
                              })
                            }
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="text-center text-gray-500 py-4"
                    >
                      {searchFilters.length > 0
                        ? "No matching staff found. Try adjusting your search criteria."
                        : "No staff found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Simplified Mobile Pagination */}
        <div className="flex justify-center items-center mt-2 sm:mt-4 pt-2 sm:pt-4">
          <div className="flex flex-wrap justify-center items-center gap-0.5 sm:gap-1 md:gap-2">
            {/* First/Previous buttons */}
            <div className="flex items-center">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg text-[10px] xs:text-xs sm:text-sm font-medium transition ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:bg-blue-100"
                }`}
              >
                <span className="hidden sm:inline">First</span>
                <span className="sm:hidden">«</span>
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg text-[10px] xs:text-xs sm:text-sm font-medium transition ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:bg-blue-100"
                }`}
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">‹</span>
              </button>
            </div>

            {/* Page Input */}
            <div className="flex items-center">
              <span className="text-gray-700 text-[10px] xs:text-xs sm:text-sm">
                Page
              </span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setInputValue(value);
                  }
                }}
                onBlur={() => {
                  let page = Number(inputValue);
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page);
                  } else {
                    setInputValue(currentPage.toString());
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    let page = Number(inputValue);
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page);
                    } else {
                      setInputValue(currentPage.toString());
                    }
                  }
                }}
                className="w-6 xs:w-8 sm:w-12 mx-1 sm:mx-2 px-1 py-0.5 border rounded-md text-center text-[10px] xs:text-xs sm:text-sm text-gray-700"
              />
              <span className="text-gray-700 text-[10px] xs:text-xs sm:text-sm">
                of {totalPages || 1}
              </span>
            </div>

            {/* Next/Last buttons */}
            <div className="flex items-center">
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg text-[10px] xs:text-xs sm:text-sm font-medium transition ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:bg-blue-100"
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">›</span>
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className={`px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg text-[10px] xs:text-xs sm:text-sm font-medium transition ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:bg-blue-100"
                }`}
              >
                <span className="hidden sm:inline">Last</span>
                <span className="sm:hidden">»</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {popupData && (
        <PopupStaffInfor
          initialData={popupData}
          onClose={() => setPopupData(null)}
          onAdd={handleAddStaff}
        />
      )}
    </div>
  );
}
