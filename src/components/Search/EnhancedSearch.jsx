import { useState, useRef, useEffect } from "react";
import { FaMagnifyingGlass, FaXmark, FaFilter } from "react-icons/fa6";
import { useLocation } from "react-router-dom";

// Enhanced search component that can be integrated into your Navbar
const EnhancedSearch = ({ onSearch, activeFilters = [], onRemoveFilter }) => {
  // Extract existing filters on component mount and updates
  const dateFromFilter = activeFilters.find((f) => f.field === "dateFrom");
  const dateToFilter = activeFilters.find((f) => f.field === "dateTo");
  const textFilter = activeFilters.find((f) => f.type === "text");

  // Set initial state from active filters
  const [searchTerm, setSearchTerm] = useState(textFilter?.value || "");
  const [searchField, setSearchField] = useState(textFilter?.field || "all");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(
    !!(dateFromFilter || dateToFilter)
  );
  const [dateFrom, setDateFrom] = useState(dateFromFilter?.value || "");
  const [dateTo, setDateTo] = useState(dateToFilter?.value || "");
  const [dateError, setDateError] = useState(""); // Add state for date validation errors
  const searchInputRef = useRef(null);
  const searchDropdownRef = useRef(null);
  const location = useLocation();

  // Update local state when activeFilters change
  useEffect(() => {
    const newDateFromFilter = activeFilters.find((f) => f.field === "dateFrom");
    const newDateToFilter = activeFilters.find((f) => f.field === "dateTo");
    const newTextFilter = activeFilters.find((f) => f.type === "text");

    // Only update if values have changed to prevent loops
    if (newDateFromFilter?.value !== dateFrom) {
      setDateFrom(newDateFromFilter?.value || "");
      if (newDateFromFilter) setIsAdvancedSearch(true);
    }

    if (newDateToFilter?.value !== dateTo) {
      setDateTo(newDateToFilter?.value || "");
      if (newDateToFilter) setIsAdvancedSearch(true);
    }

    if (newTextFilter?.value !== searchTerm) {
      setSearchTerm(newTextFilter?.value || "");
    }

    if (newTextFilter?.field !== searchField) {
      setSearchField(newTextFilter?.field || "all");
    }
  }, [activeFilters]);

  // Determine context from current route
  const getSearchContext = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean); // Split and remove empty strings
    return pathSegments[pathSegments.length - 1] || "Claims"; // Return last segment or default to "Claims"
  };

  const searchContext = getSearchContext();

  // Load recent searches from localStorage with context
  useEffect(() => {
    try {
      const savedSearches = localStorage.getItem(
        `recentSearches_${searchContext}`
      );
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    } catch (error) {
      console.error("Error loading recent searches:", error);
    }
  }, [searchContext]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target) &&
        !searchInputRef.current?.contains(event.target)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isSearchFocused) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchFocused]);

  // Helper function to format dates
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(); // This will format according to the user's locale
  };

  // Debug function to log date values
  const logDateValues = (fromDate, toDate) => {
    console.log("Date from (input):", fromDate);
    console.log("Date to (input):", toDate);
    if (fromDate) {
      console.log("Parsed date from:", new Date(fromDate));
    }
    if (toDate) {
      console.log("Parsed date to:", new Date(toDate));
    }
  };

  // Validate dates and handle the case where dates are reversed
  const validateDates = (fromDate, toDate) => {
    // Clear previous errors
    setDateError("");

    // If both dates are empty or one of them is empty, no validation needed
    if (!fromDate || !toDate) {
      return { validFromDate: fromDate, validToDate: toDate, isValid: true };
    }

    // Parse the dates
    const parsedFromDate = new Date(fromDate);
    const parsedToDate = new Date(toDate);

    // Check if dates are valid
    if (isNaN(parsedFromDate.getTime()) || isNaN(parsedToDate.getTime())) {
      setDateError("Invalid date format");
      return { validFromDate: fromDate, validToDate: toDate, isValid: false };
    }

    // If from date is after to date, swap them
    if (parsedFromDate > parsedToDate) {
      console.log("Dates are reversed, swapping them");
      return {
        validFromDate: toDate,
        validToDate: fromDate,
        isValid: true,
        swapped: true,
      };
    }

    // Dates are valid and in correct order
    return { validFromDate: fromDate, validToDate: toDate, isValid: true };
  };

  const handleSearch = (e) => {
    e?.preventDefault();

    try {
      // Save to recent searches (no duplicates) if there's a search term
      if (searchTerm.trim()) {
        const updatedSearches = [
          { term: searchTerm, field: searchField },
          ...recentSearches.filter(
            (s) => s.term !== searchTerm || s.field !== searchField
          ),
        ].slice(0, 5);

        setRecentSearches(updatedSearches);
        localStorage.setItem(
          `recentSearches_${searchContext}`,
          JSON.stringify(updatedSearches)
        );
      }
    } catch (error) {
      console.error("Error saving recent searches:", error);
    }

    // Validate and potentially swap dates if needed
    const { validFromDate, validToDate, isValid, swapped } = validateDates(
      dateFrom,
      dateTo
    );

    // If dates were swapped, update the state to reflect this
    if (swapped) {
      setDateFrom(validFromDate);
      setDateTo(validToDate);
    }

    // Debug log the date values
    logDateValues(validFromDate, validToDate);

    // Only proceed with search if dates are valid
    if (isValid) {
      // Call the search function passed from parent with all filters
      if (onSearch) {
        onSearch({
          term: searchTerm.trim() || "",
          field: searchField,
          dateFrom: validFromDate || "",
          dateTo: validToDate || "",
        });
      }
      setIsSearchFocused(false);
    } else {
      // Don't close the dropdown if there are validation errors
      console.error("Date validation failed:", dateError);
    }
  };

  const clearSearch = () => {
    // Just clear the input field locally
    setSearchTerm("");

    // Focus back on the input field
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    // Don't trigger onSearch here at all
  };

  const selectRecentSearch = (search) => {
    setSearchTerm(search.term);
    setSearchField(search.field);
    if (onSearch) {
      onSearch({
        term: search.term,
        field: search.field,
        dateFrom: dateFrom || "",
        dateTo: dateTo || "",
      });
    }
    setIsSearchFocused(false);
  };

  const removeRecentSearch = (e, search) => {
    e.stopPropagation();
    try {
      const updatedSearches = recentSearches.filter(
        (s) => s.term !== search.term || s.field !== search.field
      );
      setRecentSearches(updatedSearches);
      localStorage.setItem(
        `recentSearches_${searchContext}`,
        JSON.stringify(updatedSearches)
      );
    } catch (error) {
      console.error("Error removing recent search:", error);
    }
  };

  const resetAdvancedFilters = () => {
    setDateFrom("");
    setDateTo("");
    setDateError(""); // Clear any date errors
  };

  const getFieldLabel = (field) => {
    const fields = {
      all: "All",
      staff: "Staff",
      project: "Project",
      status: "Status",
      id: "ID",
    };
    return fields[field] || field;
  };

  // Handle date input changes with validation
  const handleDateFromChange = (e) => {
    const newDateFrom = e.target.value;
    setDateFrom(newDateFrom);
    setDateError(""); // Clear error when user makes changes
  };

  const handleDateToChange = (e) => {
    const newDateTo = e.target.value;
    setDateTo(newDateTo);
    setDateError(""); // Clear error when user makes changes
  };

  return (
    <div className="relative w-full" ref={searchDropdownRef}>
      <form onSubmit={handleSearch} className="w-full" role="form">
        <div className="flex items-center">
          <div className="relative flex-grow">
            <input
              ref={searchInputRef}
              type="text"
              className="w-full h-[40px] border border-gray-300 rounded-l-full pl-12 pr-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder={`Search ${searchContext}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              aria-label="Search"
              aria-expanded={isSearchFocused}
              aria-controls="search-dropdown"
            />
            <FaMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <FaXmark />
              </button>
            )}
          </div>

          {/* Field selector */}
          <div className="relative">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="h-[40px] border-y border-r border-gray-300 rounded-r-full pl-3 pr-8 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-gray-700 appearance-none"
              aria-label="Search field"
            >
              <option value="all">All Fields</option>
              <option value="staff">Staff</option>
              <option value="project">Project</option>
              <option value="status">Status</option>
              <option value="id">ID</option>
            </select>
            {/* Custom dropdown arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg
                className="h-4 w-4 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Advanced search toggle */}
          <button
            type="button"
            onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
            className={`ml-2 p-2 rounded-full ${
              isAdvancedSearch
                ? "bg-blue-100 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            aria-label="Advanced search"
            title="Advanced search"
            aria-expanded={isAdvancedSearch}
            aria-controls="advanced-search-panel"
          >
            <FaFilter />
          </button>
        </div>
      </form>
      {/* Advanced search panel - Now absolutely positioned with responsive design */}
      {isAdvancedSearch && (
        <div
          id="advanced-search-panel"
          className="absolute top-full left-0 right-0 mt-2 p-3 border border-gray-200 rounded-lg bg-white shadow-md z-50 max-w-full"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            {/* Responsive flex container for date inputs */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="w-full sm:w-1/2">
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  className={`w-full px-3 py-2 border ${
                    dateError ? "border-red-500" : "border-gray-300"
                  } rounded-md text-sm`}
                  value={dateFrom || ""}
                  onChange={handleDateFromChange}
                  aria-label="From date"
                />
              </div>
              <div className="w-full sm:w-1/2">
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  className={`w-full px-3 py-2 border ${
                    dateError ? "border-red-500" : "border-gray-300"
                  } rounded-md text-sm`}
                  value={dateTo || ""}
                  onChange={handleDateToChange}
                  aria-label="To date"
                />
              </div>
            </div>
            {/* Date error message */}
            {dateError && (
              <div className="mt-1 text-sm text-red-500">{dateError}</div>
            )}
            {/* Date feedback message when dates are swapped */}
            {dateFrom &&
              dateTo &&
              new Date(dateFrom) > new Date(dateTo) &&
              !dateError && (
                <div className="mt-1 text-xs text-amber-600">
                  Dates will be automatically reordered when applied.
                </div>
              )}
            {/* Regular date display */}
            {(dateFrom || dateTo) && !dateError && (
              <div className="mt-1 text-xs text-gray-500">
                {dateFrom && <div>From: {formatDateForDisplay(dateFrom)}</div>}
                {dateTo && <div>To: {formatDateForDisplay(dateTo)}</div>}
              </div>
            )}
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={resetAdvancedFilters}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSearch}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Search Dropdown - Already absolutely positioned */}
      {isSearchFocused && !isAdvancedSearch && (
        <div
          id="search-dropdown"
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-40 overflow-hidden"
          role="listbox"
        >
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="p-2">
              <p className="text-xs text-gray-500 font-medium px-2 py-1">
                Recent Searches
              </p>
              {recentSearches.map((search, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer rounded"
                  onClick={() => selectRecentSearch(search)}
                  role="option"
                  aria-selected={
                    search.term === searchTerm && search.field === searchField
                  }
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      selectRecentSearch(search);
                    }
                  }}
                >
                  <div className="flex items-center">
                    <FaMagnifyingGlass className="text-gray-400 mr-3 text-sm" />
                    <span className="text-gray-700">{search.term}</span>
                    {search.field !== "all" && (
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {getFieldLabel(search.field)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => removeRecentSearch(e, search)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label={`Remove search term: ${search.term}`}
                  >
                    <FaXmark size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search suggestion */}
          {searchTerm && (
            <div className="border-t border-gray-100 p-2">
              <div
                className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer rounded"
                onClick={handleSearch}
                role="option"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSearch();
                  }
                }}
              >
                <FaMagnifyingGlass className="text-blue-500 mr-3" />
                <span className="text-gray-700">
                  Search for "<strong>{searchTerm}</strong>" in{" "}
                  {getFieldLabel(searchField)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;
