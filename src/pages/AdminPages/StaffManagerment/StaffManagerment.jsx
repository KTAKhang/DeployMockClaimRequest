import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaEye, FaPlus, FaSortUp, FaSortDown, FaXmark } from "react-icons/fa6";
import { getStaffAll, addStaff } from "../../../redux/actions/staffActions";
import PopupStaffInfor from "../../../components/Popup/Staff/PopupStaffInfor";
import Loading from "../../../components/Loading/Loading";
import EnhancedSearch from "../../../components/Search/EnhancedSearch";
import useMobileView from "../../../hook/useMobileView.jsx";

// Import utilities and constants
import { ITEMS_PER_PAGE, COLUMN_CONFIGURATIONS } from "./constants.js";
import { STRINGS } from "./strings.js";
import {
  getStatusClass,
  formatStaffId,
  formatDate,
  sortData,
  filterData,
  buildSearchParams,
} from "./utils.js";

export default function StaffManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const { isMobile } = useMobileView();
  const [inputValue, setInputValue] = useState(currentPage.toString());
  const [popupData, setPopupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchFilters, setSearchFilters] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);

  // Redux state
  const { staffAll, error } = useSelector((state) => state.staff);
  const staffList = useMemo(
    () => (Array.isArray(staffAll?.data) ? staffAll.data : []),
    [staffAll]
  );

  // Fetch staff data
  useEffect(() => {
    dispatch(getStaffAll());
  }, [dispatch]);

  // Update filtered staff and loading state
  useEffect(() => {
    if (staffList.length > 0) {
      setLoading(false);
      setFilteredStaff(staffList);
    }
  }, [staffList]);

  // Update input value when page changes
  useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  // Sorting and pagination
  const sortedStaff = sortData(filteredStaff, sortConfig);
  const totalStaff = filteredStaff.length;
  const totalPages = Math.max(Math.ceil(totalStaff / ITEMS_PER_PAGE), 1);

  const paginatedStaff = sortedStaff.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Event Handlers
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleAddStaff = async (newData) => {
    await dispatch(addStaff(newData));
    setTimeout(() => {
      dispatch(getStaffAll());
    }, 1000);
  };

  const handleSearch = (searchParams) => {
    const newFilters = [];

    // Add text search filter
    if (searchParams.term) {
      newFilters.push({
        type: "text",
        field: searchParams.field,
        value: searchParams.term,
      });
    }

    // Add date filters
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

    // Apply filters
    const filtered = filterData(staffList, searchParams);
    setFilteredStaff(filtered);
    setCurrentPage(1);
  };

  const handleRemoveFilter = (filterToRemove) => {
    const updatedFilters = searchFilters.filter(
      (filter) =>
        !(
          filter.field === filterToRemove.field &&
          filter.type === filterToRemove.type
        )
    );

    setSearchFilters(updatedFilters);

    // Rebuild search params from remaining filters
    const searchParams = buildSearchParams(updatedFilters);
    handleSearch(searchParams);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="px-0 sm:px-2 md:px-4 -ml-1 sm:-ml-0 min-h-fit flex flex-col items-center">
      <div className="w-full max-w-[350px] sm:max-w-[550px] md:max-w-none bg-white shadow-lg border rounded-xl p-3 sm:p-4 md:p-6 overflow-hidden">
        {/* Header - Stacked and centered on mobile, side-by-side on larger screens */}
        <div className="flex flex-col items-center lg:flex-row lg:justify-between lg:items-center gap-3 mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-center lg:text-left mb-2 lg:mb-0">
            {STRINGS.STAFF_MANAGEMENT_TITLE}
          </h3>

          {/* Search and Filters Section - Centered */}
          <div className="w-full lg:flex-1 text-xs sm:text-sm lg:max-w-md mb-3 lg:mb-0 flex justify-center lg:justify-start">
            <EnhancedSearch
              onSearch={handleSearch}
              activeFilters={searchFilters}
              onRemoveFilter={handleRemoveFilter}
            />
          </div>

          {/* Controls Section */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 w-full lg:w-auto">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <button
                className="bg-green-500 text-white px-2 sm:px-3 py-1 rounded-lg shadow hover:bg-green-600 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                onClick={() => setPopupData({})}
              >
                <FaPlus /> {STRINGS.ADD_STAFF_BUTTON}
              </button>

              <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md border border-gray-300 bg-gray-100 flex items-center gap-1 sm:gap-2">
                👥 {STRINGS.TOTAL_STAFF_PREFIX}{" "}
                <span className="font-bold">{totalStaff}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Active Filters Display - Centered on mobile */}
        {searchFilters.length > 0 && (
          <div className="flex flex-wrap md:justify-start justify-center lg:justify-start gap-2 mb-4">
            <span className="text-xs sm:text-sm pt-0.5 md:pt-0 lg:pt-0 text-gray-600">
              {STRINGS.SEARCH.ACTIVE_FILTERS}
            </span>
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
                  aria-label={`Remove ${filter.field} filter`}
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
              {STRINGS.SEARCH.CLEAR_ALL}
            </button>
          </div>
        )}

        {error && (
          <p className="text-center text-red-500">
            {STRINGS.ERROR.LOADING}: {error}
          </p>
        )}

        {/* Table Container with Horizontal Scroll for Mobile */}
        <div className={`w-full ${isMobile ? "px-1" : "px-2 sm:px-3 md:px-4"}`}>
          <div
            className="w-full overflow-x-auto overflow-hidden"
            style={{ minHeight: paginatedStaff.length > 0 ? "440px" : "auto" }}
          >
            {/* Added width constraint here for sm breakpoint with overflow handling */}
            <div className="w-full sm:w-full overflow-x-auto md:w-full overflow-hidden">
              <div className="h-[440px] overflow-y-auto">
                <table className="w-full border-collapse text-gray-700 text-[10px] xs:text-xs sm:text-sm min-w-[300px] sm:min-w-[500px]">
                  <thead className="bg-gray-200 text-gray-600 sticky top-0 z-20">
                    <tr className="border-b">
                      {COLUMN_CONFIGURATIONS.map((column, index) => (
                        <th
                          key={index}
                          className={`px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-left font-medium  ${column.priority === "low"
                            ? "hidden sm:table-cell lg:table-cell"
                            : column.priority === "medium"
                              ? "hidden sm:hidden md:table-cell"
                              : ""
                            } ${column.width} ${column.sortable ? "cursor-pointer" : ""
                            }`}
                          onClick={() =>
                            column.sortable && handleSort(column.key)
                          }
                        >
                          <div className="flex items-center">
                            <span className="hidden sm:inline">
                              {column.label}
                            </span>
                            <span className="sm:hidden">
                              {column.shortLabel || column.label}
                            </span>
                            {column.sortable && (
                              <span className="ml-1 relative flex flex-col items-center">
                                <FaSortUp
                                  className={`translate-y-[6px] transition-all ${sortConfig.key === column.key &&
                                    sortConfig.direction === "asc"
                                    ? "text-blue-500"
                                    : "text-gray-400"
                                    }`}
                                />
                                <FaSortDown
                                  className={`translate-y-[-6px] transition-all ${sortConfig.key === column.key &&
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
                      <th className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-center font-medium">
                        {STRINGS.TABLE.ACTION || "Action"}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={COLUMN_CONFIGURATIONS.length + 1}
                          className="text-center py-10 sm:py-16 md:py-20"
                        >
                          <Loading
                            message={
                              STRINGS.LOADING_STAFF || "Loading staff..."
                            }
                          />
                        </td>
                      </tr>
                    ) : paginatedStaff.length > 0 ? (
                      paginatedStaff.map((staff, index) => (
                        <tr
                          key={index}
                          className="border-b hover:bg-gray-100 transition"
                        >
                          {COLUMN_CONFIGURATIONS.map((column) => (
                            <td
                              key={column.key}
                              className={`px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 ${column.priority === "low"
                                ? "hidden sm:table-cell lg:table-cell"
                                : column.priority === "medium"
                                  ? "hidden sm:hidden md:table-cell"
                                  : ""
                                } ${column.width || ""}`}
                            >
                              {column.key === "_id" ? (
                                <span
                                  className="cursor-pointer group relative"
                                  title={staff?._id}
                                >
                                  {formatStaffId(staff?._id)}
                                  <span className="absolute left-0 top-full z-10 bg-gray-800 text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                                    {staff?._id}
                                  </span>
                                </span>
                              ) : column.key === "status" ? (
                                <span className={getStatusClass(staff?.status)}>
                                  {staff?.status ? "Active" : "Inactive"}
                                </span>
                              ) : column.key === "createdAt" ? (
                                formatDate(staff?.createdAt)
                              ) : (
                                staff?.[column.key] || "N/A"
                              )}
                            </td>
                          ))}
                          <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4">
                            <div className="flex gap-1 sm:gap-2 md:gap-3 justify-center">
                              <FaEye
                                className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-500 cursor-pointer hover:text-blue-600 transition"
                                onClick={() =>
                                  navigate(`/admin/staff/${staff._id}`, {
                                    state: { staff },
                                  })
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={COLUMN_CONFIGURATIONS.length + 1}
                          className="text-center py-4 sm:py-5 md:py-6 text-gray-500"
                        >
                          {searchFilters.length > 0
                            ? STRINGS.TABLE.NO_MATCHING_STAFF
                            : STRINGS.TABLE.NO_STAFF}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Simplified Mobile Pagination */}
          <div className="flex justify-center items-center mt-4 pt-2 sm:pt-3 md:pt-4">
            <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2">
              {/* First/Previous buttons */}
              <div className="flex items-center">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:bg-blue-100"
                    }`}
                >
                  <span className="hidden sm:inline">
                    {STRINGS.PAGINATION.FIRST}
                  </span>
                  <span className="sm:hidden">«</span>
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:bg-blue-100"
                    }`}
                >
                  <span className="hidden sm:inline">
                    {STRINGS.PAGINATION.PREVIOUS}
                  </span>
                  <span className="sm:hidden">‹</span>
                </button>
              </div>

              {/* Page Input */}
              <div className="flex items-center">
                <span className="text-gray-700 text-xs sm:text-sm">
                  {STRINGS.PAGINATION.PAGE || "Page"}
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
                  className="w-8 sm:w-10 md:w-12 mx-1 sm:mx-1.5 md:mx-2 px-1 py-0.5 border rounded-md text-center text-xs sm:text-sm text-gray-700"
                />
                <span className="text-gray-700 text-xs sm:text-sm">
                  {STRINGS.PAGINATION.PAGE_OF || "of"} {totalPages || 1}
                </span>
              </div>

              {/* Next/Last buttons */}
              <div className="flex items-center">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:bg-blue-100"
                    }`}
                >
                  <span className="hidden sm:inline">
                    {STRINGS.PAGINATION.NEXT}
                  </span>
                  <span className="sm:hidden">›</span>
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:bg-blue-100"
                    }`}
                >
                  <span className="hidden sm:inline">
                    {STRINGS.PAGINATION.LAST}
                  </span>
                  <span className="sm:hidden">»</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Information Popup */}
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
