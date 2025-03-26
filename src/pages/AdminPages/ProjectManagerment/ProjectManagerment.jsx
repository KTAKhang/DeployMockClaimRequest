import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaEye, FaPlus, FaSortUp, FaSortDown } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import {
  getProjectsAll,
  createProject,
} from "../../../redux/actions/projectActions";
import PopupProjectInfo from "../../../components/Popup/Project/PopupProjectInfor";
import Loading from "../../../components/Loading/Loading";
import EnhancedSearch from "../../../components/Search/EnhancedSearch";

// Import from constants, strings, and utils files
import {
  COLUMNS,
  PAGINATION,
  SORT_DIRECTION,
  ROUTES,
  FILTER_TYPES,
  DATE_FILTER_FIELDS,
  DELAY_TIMES
} from "./constants";

import {
  PAGE_STRINGS,
  BUTTON_STRINGS,
  FILTER_STRINGS,
  PAGINATION_STRINGS,
  EMPTY_STATE_STRINGS,
  LOADING_STRINGS,
  FIELD_VALUES,
  STATUS_TEXT
} from "./strings";

import {
  getStatusClass,
  formatDate,
  truncateWithTooltip,
  applySorting,
  applyFilters,
  createFiltersFromSearchParams,
  buildSearchParamsFromFilters,
  getPaginatedItems,
  calculateTotalPages
} from "./utils";

export default function ProjectTable() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(PAGINATION.DEFAULT_CURRENT_PAGE);
  const [inputValue, setInputValue] = useState(currentPage.toString());
  const itemsPerPage = PAGINATION.ITEMS_PER_PAGE;
  const [popupData, setPopupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ 
    key: null, 
    direction: SORT_DIRECTION.ASC 
  });

  // Add state for search filters
  const [searchFilters, setSearchFilters] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);

  const { projectsAll, error } = useSelector((state) => state.projects);

  useEffect(() => {
    dispatch(getProjectsAll());
  }, [dispatch]);

  const projectList = useMemo(() => {
    return Array.isArray(projectsAll?.data) ? projectsAll.data : [];
  }, [projectsAll]);

  useEffect(() => {
    if (projectList.length > 0) {
      setLoading(false);
      setFilteredProjects(projectList); // Initialize filtered projects with all projects
    }
  }, [projectList]);

  useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  // Apply sorting to the filtered projects list
  const sortedProjects = useMemo(() => {
    return applySorting(filteredProjects, sortConfig);
  }, [filteredProjects, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === SORT_DIRECTION.ASC 
        ? SORT_DIRECTION.DESC 
        : SORT_DIRECTION.ASC,
    }));
  };

  const handleAddProject = async (newData) => {
    await dispatch(createProject(newData));
    setTimeout(() => {
      dispatch(getProjectsAll());
    }, DELAY_TIMES.RELOAD_PROJECTS);
    setPopupData(null);
  };

  // Handle search
  const handleSearch = (searchParams) => {
    // Create filter objects based on search parameters
    const newFilters = createFiltersFromSearchParams(searchParams);
    setSearchFilters(newFilters);

    // Apply filters to project list
    const filtered = applyFilters(projectList, searchParams);
    setFilteredProjects(filtered);
    setCurrentPage(PAGINATION.DEFAULT_CURRENT_PAGE); // Reset to first page when applying filters
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
    const searchParams = buildSearchParamsFromFilters(updatedFilters);
    handleSearch(searchParams);
  };

  const totalProjects = filteredProjects.length;
  const totalPages = calculateTotalPages(totalProjects, itemsPerPage);
  
  // Get paginated projects for display
  const paginatedProjects = useMemo(() => {
    return getPaginatedItems(sortedProjects, currentPage, itemsPerPage);
  }, [sortedProjects, currentPage, itemsPerPage]);

  return (
    <div className="px-0 sm:px-2 md:px-4 -ml-1 sm:-ml-0 min-h-fit flex flex-col items-center">
      <div className="w-full max-w-[350px] sm:max-w-[550px] md:max-w-none bg-white shadow-lg border rounded-xl p-3 sm:p-4 md:p-6 overflow-hidden">
        {/* Header - Stacked and centered on mobile, side-by-side on larger screens */}
        <div className="flex flex-col items-center lg:flex-row lg:justify-between lg:items-center gap-3 mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-center lg:text-left mb-2 lg:mb-0">
            {PAGE_STRINGS.TITLE}
          </h3>

          {/* Search and Filters Section - Centered */}
          <div className="w-full lg:flex-1 text-xs sm:text-sm lg:max-w-md mb-3 lg:mb-0 flex justify-center lg:justify-start">
            <EnhancedSearch
              onSearch={handleSearch}
              activeFilters={searchFilters}
              onRemoveFilter={handleRemoveFilter}
            />
          </div>

          {/* Controls Section - Centered on mobile, aligned with the layout in second component */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 w-full lg:w-auto">
            {/* Action Button - Centered */}
            <div className="flex items-center justify-center sm:justify-start gap-2 w-full">
              <button
                className="bg-green-500 text-white px-2 sm:px-3 py-1 rounded-lg shadow hover:bg-green-600 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                onClick={() => setPopupData({})}
              >
                <FaPlus /> {BUTTON_STRINGS.ADD_PROJECT}
              </button>

              {/* Total Projects Counter - Similar to the status counter in second component */}
              <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md border border-gray-300 bg-gray-100 flex items-center gap-1 sm:gap-2">
                📊 {PAGE_STRINGS.TOTAL_PROJECTS}{" "}
                <span className="font-bold">{totalProjects}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Display active filters - Centered on mobile */}
        {searchFilters.length > 0 && (
          <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
            <span className="text-sm text-gray-600">{FILTER_STRINGS.ACTIVE_FILTERS}</span>
            {searchFilters.map((filter, index) => (
              <div
                key={index}
                className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
              >
                <span>
                  {filter.type === FILTER_TYPES.TEXT && (
                    <>
                      {filter.field === "all"
                        ? FILTER_STRINGS.ALL_FIELDS
                        : filter.field.charAt(0).toUpperCase() +
                          filter.field.slice(1)}
                      : {filter.value}
                    </>
                  )}
                  {filter.field === DATE_FILTER_FIELDS.DATE_FROM && (
                    <>{FILTER_STRINGS.FROM_DATE} {new Date(filter.value).toLocaleDateString()}</>
                  )}
                  {filter.field === DATE_FILTER_FIELDS.DATE_TO && (
                    <>{FILTER_STRINGS.TO_DATE} {new Date(filter.value).toLocaleDateString()}</>
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
                setFilteredProjects(projectList);
                setCurrentPage(PAGINATION.DEFAULT_CURRENT_PAGE);
              }}
              className="text-xs text-gray-600 hover:text-gray-800 underline"
            >
              {BUTTON_STRINGS.CLEAR_ALL}
            </button>
          </div>
        )}

        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {/* Table container with proper overflow handling */}
        <div
          className="w-full overflow-x-auto overflow-hidden"
          style={{ minHeight: paginatedProjects.length > 0 ? "500px" : "auto" }}
        >
          <div className="h-[500px] overflow-y-auto">
            <table className="w-full border-collapse text-gray-700 text-[10px] xs:text-xs sm:text-sm min-w-[700px]">
              <thead className="bg-gray-200 text-gray-600 sticky top-0 z-20">
                <tr className="border-b">
                  {COLUMNS.map((column, index) => (
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
                                sortConfig.direction === SORT_DIRECTION.ASC
                                  ? "text-blue-500"
                                  : "text-gray-400"
                              }`}
                            />
                            <FaSortDown
                              className={`translate-y-[-6px] transition-all ${
                                sortConfig.key === column.key &&
                                sortConfig.direction === SORT_DIRECTION.DESC
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
                      colSpan={COLUMNS.length + 1}
                      className="text-center py-10 sm:py-20"
                    >
                      <Loading message={LOADING_STRINGS.PROJECTS} />
                    </td>
                  </tr>
                ) : paginatedProjects.length > 0 ? (
                  paginatedProjects.map((project, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-100 transition min-h-[40px] sm:min-h-[48px]"
                    >
                      <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[40px] sm:min-w-[60px] md:min-w-[100px]">
                        <span
                          className="cursor-pointer group relative"
                          title={project?._id}
                        >
                          {truncateWithTooltip(project?._id, 5).displayText}
                          <span className="absolute left-0 top-full z-10 bg-gray-800 text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                            {project?._id}
                          </span>
                        </span>
                      </td>
                      <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[80px] sm:min-w-[100px]">
                        {project?.project_name || FIELD_VALUES.NA}
                      </td>
                      <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[60px] sm:min-w-[80px] md:min-w-[100px]">
                        {project?.pm?.user_name || FIELD_VALUES.NA}
                      </td>
                      <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[100px] sm:min-w-[120px] hidden md:table-cell">
                        {project?.qa?.user_name || FIELD_VALUES.NA}
                      </td>
                      <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[60px] sm:min-w-[80px] md:min-w-[100px]">
                        <span className={getStatusClass(project?.status)}>
                          {project?.status ? STATUS_TEXT.ACTIVE : STATUS_TEXT.INACTIVE}
                        </span>
                      </td>
                      <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[100px] sm:min-w-[120px] hidden md:table-cell">
                        {formatDate(project?.createdAt)}
                      </td>
                      <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 text-center align-middle">
                        <div className="inline-flex items-center justify-center w-full h-full">
                          <FaEye
                            className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 cursor-pointer hover:text-blue-600 transition"
                            onClick={() => {
                              if (!project?._id) {
                                console.error("Invalid project ID:", project);
                                return;
                              }
                              navigate(`${ROUTES.PROJECT_DETAIL}${project._id}`, {
                                state: { project },
                              });
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={COLUMNS.length + 1}
                      className="text-center text-gray-500 py-4"
                    >
                      {EMPTY_STATE_STRINGS.NO_PROJECTS}
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
                <span className="hidden sm:inline">{BUTTON_STRINGS.FIRST}</span>
                <span className="sm:hidden">{BUTTON_STRINGS.FIRST_SYMBOL}</span>
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
                <span className="hidden sm:inline">{BUTTON_STRINGS.PREVIOUS}</span>
                <span className="sm:hidden">{BUTTON_STRINGS.PREVIOUS_SYMBOL}</span>
              </button>
            </div>

            {/* Page Input */}
            <div className="flex items-center">
              <span className="text-gray-700 text-[10px] xs:text-xs sm:text-sm">
                {PAGINATION_STRINGS.PAGE}
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
                {PAGINATION_STRINGS.OF} {totalPages || 1}
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
                <span className="hidden sm:inline">{BUTTON_STRINGS.NEXT}</span>
                <span className="sm:hidden">{BUTTON_STRINGS.NEXT_SYMBOL}</span>
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
                <span className="hidden sm:inline">{BUTTON_STRINGS.LAST}</span>
                <span className="sm:hidden">{BUTTON_STRINGS.LAST_SYMBOL}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {popupData && (
        <PopupProjectInfo
          initialData={popupData}
          onClose={() => setPopupData(null)}
          onAdd={handleAddProject}
        />
      )}
    </div>
  );
}
