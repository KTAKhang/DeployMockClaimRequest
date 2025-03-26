import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaEye,
  FaSortUp,
  FaSortDown,
  FaCheckCircle,
  FaTimesCircle,
  FaDownload,
  FaMoneyCheckAlt,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import ApproverModal from "../../components/Modal/Modal.jsx";
import EnhancedSearch from "../../components/Search/EnhancedSearch"; // Import the EnhancedSearch component
import {
  claimerRemoveProcessedClaims,
  updateClaimRequestDraft,
  bulkUpdateClaimRequest,
  fetchClaimsRequestClaimer,
} from "../../redux/actions/claimerActions.js";
import Loading from "../../components/Loading/Loading.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  UPDATE_CLAIM_STATUS_REQUEST,
  removeProcessedClaims,
} from "../../redux/actions/approverClaimActions";
import { financeUpdateClaimStatusRequest } from "../../redux/actions/financeAction.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FinanceDownLoadModal from "../../pages/FinancePage/FinanceDownLoadModal/FinanceDownLoadModal.jsx";
import useMobileView from "../../hook/useMobileView.jsx";

// eslint-disable-next-line react/prop-types
export default function ClaimsTable({
  title,
  claimsData,
  filterCondition,
  hideUpdatedAt = false,
  onViewDetail,
  hideActionButtons = false,
}) {
  // State Variables
  const { isIPhoneSE, isMobile } = useMobileView();
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedClaims, setSelectedClaims] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [loading, setLoading] = useState(true); // Loading state
  const [inputValue, setInputValue] = useState("1");
  const [reason, setReason] = useState(""); // ✅ Add state for reason
  const [isOpenDownloadModal, setIsOpenDownloadModal] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [actionType, setActionType] = useState("");
  const financeLoading = useSelector((state) => state.finance.loading);
  const approverLoading = useSelector((state) => state.claims.loading);
  const claimerLoading = useSelector((state) => state.claimer.loading);
  const isPaidSuccess = useSelector((state) => state.finance.isPaidSuccess);

  // Search state
  const [searchData, setSearchData] = useState({ term: "", field: "all" });
  const [activeFilters, setActiveFilters] = useState([]);

  // Derived state and values
  const mode = filterCondition === "ForMyVetting" ? "vetting" : "history"; // Determine mode
  const financeStatus = filterCondition;

  useEffect(() => {
    const urlStatus = searchParams.get("status") || "All";
    const urlSearchTerm = searchParams.get("searchTerm") || "";
    const urlSearchField = searchParams.get("searchField") || "all";
    const urlDateFrom = searchParams.get("dateFrom") || "";
    const urlDateTo = searchParams.get("dateTo") || "";

    // Prevent unnecessary state updates
    setStatusFilter((prev) => (prev !== urlStatus ? urlStatus : prev));

    const newSearchData = {
      term: urlSearchTerm,
      field: urlSearchField,
      dateFrom: urlDateFrom,
      dateTo: urlDateTo,
    };

    setSearchData((prev) =>
      JSON.stringify(prev) !== JSON.stringify(newSearchData)
        ? newSearchData
        : prev
    );

    const initialFilters = [];

    if (urlSearchTerm) {
      initialFilters.push({
        id: `term-init`,
        label:
          urlSearchField === "all"
            ? "All Fields"
            : urlSearchField === "id"
            ? "ID"
            : urlSearchField === "staff"
            ? "Staff"
            : urlSearchField === "project"
            ? "Project"
            : urlSearchField === "status"
            ? "Status"
            : urlSearchField,
        value: urlSearchTerm,
        field: urlSearchField,
        type: "text",
      });
    }

    if (urlDateFrom) {
      initialFilters.push({
        id: `date-from-init`,
        label: "From Date",
        value: urlDateFrom,
        field: "dateFrom",
        type: "date",
      });
    }

    if (urlDateTo) {
      initialFilters.push({
        id: `date-to-init`,
        label: "To Date",
        value: urlDateTo,
        field: "dateTo",
        type: "date",
      });
    }

    setActiveFilters((prev) =>
      JSON.stringify(prev) !== JSON.stringify(initialFilters)
        ? initialFilters
        : prev
    );
  }, [searchParams]);

  useEffect(() => {
    // eslint-disable-next-line react/prop-types
    if (claimsData && claimsData.length > 0 && loading) {
      setLoading(false);
    }
  }, [claimsData, loading]); // Include `loading` to avoid redundant updates

  useEffect(() => {
    setInputValue(currentPage.toString()); // Sync input with current page
  }, [currentPage]);

  // Helper Functions for handling enhanced search
  // Replace the handleSearch function with this improved version:

  const handleSearch = (searchData) => {
    // Log the search data to help with debugging
    console.log("Search data:", searchData);

    // Save all search data including date range
    setSearchData(searchData);
    setCurrentPage(1); // Reset to first page on search

    // Build URL params object with all search parameters
    const params = {
      status: statusFilter,
    };

    // Only add search term parameters if they exist
    if (searchData.term) {
      params.searchTerm = searchData.term;
      params.searchField = searchData.field;
    }

    // Add date range parameters to URL if they exist
    if (searchData.dateFrom) params.dateFrom = searchData.dateFrom;
    if (searchData.dateTo) params.dateTo = searchData.dateTo;

    // Update URL params with all search data
    setSearchParams(params);

    // Create new filter objects based on search inputs
    const newFilters = [];

    // Check if this is a text search with an empty term
    const isEmptyTextSearch = searchData.term === "";

    // If it's an explicit empty text search, remove text filters
    if (isEmptyTextSearch) {
      // Remove text filters but keep other filters like date filters
      const remainingFilters = activeFilters.filter(
        (filter) => filter.type !== "text"
      );
      setActiveFilters(remainingFilters);
      return; // Exit early as we've handled this case
    }

    // Add text search filter if term exists
    if (searchData.term) {
      newFilters.push({
        id: `term-${Date.now()}`,
        label:
          searchData.field === "all"
            ? "All Fields"
            : searchData.field === "id"
            ? "ID"
            : searchData.field === "staff"
            ? "Staff"
            : searchData.field === "project"
            ? "Project"
            : searchData.field === "status"
            ? "Status"
            : searchData.field,
        value: searchData.term,
        field: searchData.field,
        type: "text",
      });
    }

    // Add date filters if they exist
    if (searchData.dateFrom) {
      newFilters.push({
        id: `date-from-${Date.now()}`,
        label: "From Date",
        value: searchData.dateFrom,
        field: "dateFrom",
        type: "date",
      });
    }

    if (searchData.dateTo) {
      newFilters.push({
        id: `date-to-${Date.now()}`,
        label: "To Date",
        value: searchData.dateTo,
        field: "dateTo",
        type: "date",
      });
    }

    if (newFilters.length > 0) {
      // Remove existing filters of the same types as the new filters
      const newFilterTypes = new Set(newFilters.map((f) => f.type));
      const remainingFilters = activeFilters.filter(
        (f) => !newFilterTypes.has(f.type)
      );
      setActiveFilters([...remainingFilters, ...newFilters]);
    }
  };
  // Helper Functions
  const handleOpenModal = (action, claimId = null) => {
    if (claimId) {
      setSelectedClaims([claimId]); // Single selection
    }
    setSelectedAction(action);
    setIsModalOpen(true);
    setActionType(action); // Cập nhật actionType
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClaims([]); // Clear selected checkboxes
  };

  const handleBulkAction = (action) => {
    if (!selectedClaims.length) return;

    let status;
    switch (action) {
      case "SubmitAll":
      case "Submit":
        status = "Pending";
        break;
      case "CancelAll":
      case "Cancelled":
        status = "Cancelled";
        break;
      default:
        return;
    }

    dispatch(claimerRemoveProcessedClaims(selectedClaims));
    dispatch(bulkUpdateClaimRequest({ claimIds: selectedClaims, status }));
    dispatch(fetchClaimsRequestClaimer({ status }));
    navigate(`/claimer/${status.toLowerCase()}`);
    toast.success(`Selected claims have been ${status.toLowerCase()}!`);
  };

  const handleConfirm = (reason) => {
    setIsModalOpen(false);
    console.log(selectedClaims);
    if (!selectedClaims.length || !selectedAction) return;

    if (
      (selectedAction.includes("Approve") ||
        selectedAction.includes("Reject")) &&
      (!reason || !reason.trim())
    ) {
      toast.error("Please enter a reason.");
      return;
    }

    if (selectedAction === "ApproveAll" || selectedAction === "RejectAll") {
      handleBulkStatusUpdate(
        selectedAction.includes("Approve") ? "Approve" : "Reject",
        reason
      );
    } else if (
      selectedAction === "SubmitAll" ||
      selectedAction === "CancelAll"
    ) {
      handleBulkAction(selectedAction);
    } else if (selectedAction === "PayAll") {
      handlePayStatusUpdate();
    } else if (
      ["SubmitAll", "CancelAll", "Submit", "Cancelled"].includes(selectedAction)
    ) {
      handleBulkAction(selectedAction);
    } else if (selectedAction === "Paid") {
      selectedClaims.forEach((claimId) => {
        handlePayStatusUpdate();
      });
    } else {
      selectedClaims.forEach((claimId) => {
        handleStatusUpdate(claimId, selectedAction, reason);
      });
    }

    console.log(`${selectedAction} confirmed for claims:`, selectedClaims);

    // ✅ Navigate only when the action is "Approve"
    if (selectedAction === "Approve" || selectedAction === "ApproveAll") {
      setTimeout(() => {
        navigate("/approver/history?status=Approved");
      }, 100);
    }

    // Dispatch Redux action to remove claims from UI
    dispatch(removeProcessedClaims(selectedClaims));

    // Reset selection
    setSelectedClaims([]);
    setTimeout(() => setReason(""), 100);
  };

  const handleStatusUpdate = (ids, action, reason_approver = "") => {
    const status = action === "Approve" ? "Approved" : "Rejected";

    dispatch({
      type: UPDATE_CLAIM_STATUS_REQUEST,
      payload: {
        ids,
        status,
        reason_approver, // ✅ Include reason
      },
    });

    // Show toast notification
    toast.success(`Claim ${status} Successfully!`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  };
  const handlePayStatusUpdate = () => {
    if (!selectedClaims.length) return;
    dispatch(financeUpdateClaimStatusRequest(selectedClaims, "Paid"));
    // dispatch(fetchClaimsRequest({}));
    toast.success(`Pay Claims Successfully!`);
    setSelectedClaims([]);
  };

  const handleBulkStatusUpdate = (action, reason = "") => {
    if (!selectedClaims.length) return;

    dispatch({
      type: UPDATE_CLAIM_STATUS_REQUEST,
      payload: {
        ids: selectedClaims, // Send an array of claim IDs
        status: action === "Approve" ? "Approved" : "Rejected",
        reason_approver: reason, // ✅ Always pass reason
      },
    });

    toast.success(
      `Claims ${action}${action === "Approve" ? "d" : "ed"} Successfully!`
    );
    setSelectedClaims([]);
  };

  // Filter Claims based on search and status
  // eslint-disable-next-line react/prop-types
  const filteredClaims = claimsData.filter((claim) => {
    // Mode Filtering
    if (filterCondition === "ForMyVetting" && claim.status !== "Pending") {
      return false;
    }
    if (
      filterCondition === "ClaimsHistory" &&
      !["Approved", "Paid"].includes(claim.status)
    ) {
      return false;
    }

    // Status Filtering
    if (statusFilter !== "All" && claim.status !== statusFilter) {
      return false;
    }

    // Inside your filter function, add this check
    if (
      typeof claim.duration !== "string" &&
      !(claim.duration instanceof Date)
    ) {
      // If duration isn't a string or Date object, it might be in an unexpected format
      console.warn(
        `Claim ${claim.id} has duration in unexpected format:`,
        claim.duration
      );
      return false;
    }

    // Date Range Filtering
    let passesDateFilter = true;
    if (searchData.dateFrom || searchData.dateTo) {
      // Parse filter dates first
      let filterFromDate = searchData.dateFrom
        ? new Date(searchData.dateFrom)
        : null;
      let filterToDate = searchData.dateTo ? new Date(searchData.dateTo) : null;

      // If dates are reversed, swap them
      if (filterFromDate && filterToDate && filterFromDate > filterToDate) {
        console.log("Dates are reversed, swapping them");
        [filterFromDate, filterToDate] = [filterToDate, filterFromDate];
      }

      // Normalize filter dates
      if (filterFromDate) filterFromDate.setHours(0, 0, 0, 0);
      if (filterToDate) filterToDate.setHours(23, 59, 59, 999);

      // Use claim.duration as the date field
      const dateValue = claim.duration;

      // Skip this claim if no date value exists
      if (!dateValue) {
        passesDateFilter = false;
      } else {
        // Extract only the 'From' date from the duration string
        // Format is "From YYYY-MM-DD To YYYY-MM-DD"
        const fromDateMatch = dateValue.match(/From (\d{4}-\d{2}-\d{2})/);

        if (!fromDateMatch) {
          console.log(
            `Invalid duration format: ${dateValue} for claim ID: ${claim.id}`
          );
          passesDateFilter = false;
        } else {
          // Extract the start date from the duration string
          const claimStartDate = new Date(fromDateMatch[1]);

          // Skip invalid dates
          if (isNaN(claimStartDate.getTime())) {
            console.log(
              `Invalid date parsing in duration: ${dateValue} for claim ID: ${claim.id}`
            );
            passesDateFilter = false;
          } else {
            // Normalize claim 'from' date to midnight
            claimStartDate.setHours(0, 0, 0, 0);

            // Apply date filters (Only checking 'from' date now)
            if (filterFromDate && claimStartDate < filterFromDate)
              passesDateFilter = false;
            if (filterToDate && claimStartDate > filterToDate)
              passesDateFilter = false;
          }
        }
      }
    }

    // Search Term Filtering
    let passesSearchFilter = true;
    if (searchData.term) {
      const searchTerm = searchData.term.toLowerCase();

      // Search based on field
      if (searchData.field === "all") {
        // Search in all fields
        passesSearchFilter =
          claim.id.toLowerCase().includes(searchTerm) ||
          claim.staff.toLowerCase().includes(searchTerm) ||
          claim.project.toLowerCase().includes(searchTerm) ||
          claim.status.toLowerCase().includes(searchTerm);
      } else {
        // Search in specific field
        passesSearchFilter = claim[searchData.field]
          .toLowerCase()
          .includes(searchTerm);
      }
    }

    // Return true only if both filters pass
    return passesDateFilter && passesSearchFilter;
  });

  // Remove a filter
  // Update the removeFilter function
  const removeFilter = (filterToRemove) => {
    // Create a copy of active filters without the one being removed
    const updatedFilters = activeFilters.filter(
      (f) => f.id !== filterToRemove.id
    );
    setActiveFilters(updatedFilters);

    // Create new searchData object based on remaining filters
    const newSearchData = { ...searchData };

    // Only reset the specific field that's being removed
    if (filterToRemove.field === "dateFrom") {
      newSearchData.dateFrom = "";
    } else if (filterToRemove.field === "dateTo") {
      newSearchData.dateTo = "";
    } else if (filterToRemove.type === "text") {
      // Only reset text search if we're removing the text filter
      newSearchData.term = "";
      newSearchData.field = "all";
    }

    // Update search data with remaining values
    setSearchData(newSearchData);

    // Build URL params with remaining filters
    const params = { status: statusFilter };

    // Add remaining text search if exists
    const textFilter = updatedFilters.find((f) => f.type === "text");
    if (textFilter) {
      params.searchTerm = textFilter.value;
      params.searchField = textFilter.field;
    }

    // Add date filters if they exist
    const dateFromFilter = updatedFilters.find((f) => f.field === "dateFrom");
    if (dateFromFilter) params.dateFrom = dateFromFilter.value;

    const dateToFilter = updatedFilters.find((f) => f.field === "dateTo");
    if (dateToFilter) params.dateTo = dateToFilter.value;

    // Update URL params
    setSearchParams(params);
  };
  // Sorting function
  const sortedClaims = [...filteredClaims].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const key = sortConfig.key;
    if (a[key] < b[key]) return sortConfig.direction === "asc" ? -1 : 1;
    if (a[key] > b[key]) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Handle sorting when clicking headers
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Pagination logic
  const totalPages = Math.ceil(sortedClaims.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClaims = sortedClaims.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Navigate to details with mode
  const handleViewDetail = (id) => {
    let path;
    switch (filterCondition) {
      case "ClaimsHistory":
        path = `/approver/history/${id}`;
        navigate(path, { state: { mode: "history" } });
        break;

      case "ForMyVetting":
        path = `/approver/vetting/${id}`;
        navigate(path, { state: { mode: "vetting" } });
        break;

      case "Draft":
        path = `/claimer/draft/${id}`;
        navigate(path);
        break;

      case "Pending":
        path = `/claimer/pending/${id}`;
        navigate(path);
        break;

      case "Approved":
        path = `/claimer/approved/${id}`;
        navigate(path);
        break;

      case "Paid":
        path = `/claimer/paid/${id}`;
        navigate(path);
        break;
      case "Rejected":
        path = `/claimer/rejected/${id}`;
        navigate(path);
        break;
      case "Cancelled":
        path = `/claimer/cancelled/${id}`;
        navigate(path);
        break;
      case "FinanceApproved":
        path = `/finance/approved/${id}`;
        navigate(path);
        break;
      case "FinancePaid":
        path = `/finance/paid/${id}`;
        navigate(path);
        break;
      case "ClaimManagerment":
        path = `/admin/claim-management/${id}`;
        navigate(path, { state: { mode: "admin" } }); // Thêm state mode="admin" để xác định đang xem từ trang admin
        break;

      default:
        path = `/approver/history/${id}`;
        navigate(path, { state: { mode: "history" } });
    }
  };

  return (
    <div className="px-0 sm:px-2 md:px-4 -ml-1 sm:-ml-0 min-h-fit flex flex-col items-center">
      <div className="w-full max-w-[350px] sm:max-w-[550px] md:max-w-none bg-white shadow-lg border rounded-xl p-3 sm:p-4 md:p-6 overflow-hidden">
        {/* Header - Stacked and centered on mobile, side-by-side on larger screens */}
        <div className="flex flex-col items-center lg:flex-row lg:justify-between lg:items-center gap-3 mb-4">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-800 text-center lg:text-left mb-2 lg:mb-0">
            {title}
          </h3>

          {/* Search and Filters Section - Centered */}
          <div className="w-full lg:flex-1 text-xs sm:text-sm lg:text-base  lg:max-w-md mb-3 lg:mb-0 flex justify-center lg:justify-start">
            <EnhancedSearch
              onSearch={handleSearch}
              activeFilters={activeFilters}
              onRemoveFilter={removeFilter}
            />
          </div>

          {/* Controls Section - Centered */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 w-full lg:w-auto">
            {/* Action Buttons - Centered */}
            {!hideActionButtons && (
              <div className="flex justify-center sm:flex-1 gap-2">
                {financeStatus === "FinanceApproved" ? (
                  <button
                    onClick={() => handleOpenModal("PayAll")}
                    disabled={selectedClaims.length === 0}
                    className={`flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all shadow-sm
              ${
                selectedClaims.length > 0
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }
            `}
                  >
                    <FaCheckCircle className="text-base" />
                    <span>PayAll</span>
                  </button>
                ) : financeStatus === "FinancePaid" ? (
                  <button
                    onClick={() => setIsOpenDownloadModal(true)}
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all shadow-sm bg-green-600 text-white hover:bg-green-700"
                  >
                    <FaCheckCircle className="text-base" />
                    <span>DownloadAll</span>
                  </button>
                ) : null}

                {mode === "vetting" && (
                  <>
                    <button
                      onClick={() => handleOpenModal("ApproveAll")}
                      disabled={selectedClaims.length === 0}
                      className={`flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all shadow-sm
                ${
                  selectedClaims.length > 0
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
                    >
                      <FaCheckCircle className="text-base" />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => handleOpenModal("RejectAll")}
                      disabled={selectedClaims.length === 0}
                      className={`flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all shadow-sm
                ${
                  selectedClaims.length > 0
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
                    >
                      <FaTimesCircle className="text-base" />
                      <span>Reject</span>
                    </button>
                  </>
                )}

                {(mode === "draft" ||
                  filteredClaims.some((claim) => claim.status === "Draft")) && (
                  <>
                    <button
                      onClick={() => handleOpenModal("SubmitAll")}
                      disabled={selectedClaims.length === 0}
                      className={`flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all shadow-sm
                ${
                  selectedClaims.length > 0
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
                    >
                      <FaCheckCircle className="text-base" />
                      <span>SubmitAll</span>
                    </button>

                    <button
                      onClick={() => handleOpenModal("CancelAll")}
                      disabled={selectedClaims.length === 0}
                      className={`flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all shadow-sm
                ${
                  selectedClaims.length > 0
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
                    >
                      <FaTimesCircle className="text-base" />
                      <span>CancelAll</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Status Filter and Count - Centered */}
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  // Preserve search terms when changing status
                  if (searchData.term) {
                    setSearchParams({
                      status: newStatus,
                      searchTerm: searchData.term,
                      searchField: searchData.field,
                    });
                  } else {
                    setSearchParams({ status: newStatus });
                  }
                  setStatusFilter(newStatus);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 w-24 sm:w-32 text-xs sm:text-sm border rounded-lg bg-white shadow-sm"
              >
                <option value="All">All</option>
                {filterCondition === "ClaimsHistory" && (
                  <>
                    <option value="Approved">Approved</option>
                    <option value="Paid">Paid</option>
                  </>
                )}
              </select>

              <span className="px-3 py-2 text-xs sm:text-sm font-medium rounded-md border border-gray-300 bg-gray-100 flex items-center gap-1">
                📋 Total Claims:{" "}
                <span className="font-bold">{filteredClaims.length}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Active Filters Display - Centered on mobile */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
            <span className="text-sm text-gray-600">Active filters:</span>
            {activeFilters.map((filter) => (
              <div
                key={filter.id}
                className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                <span>
                  {filter.label}: {filter.value}
                </span>
                <button
                  onClick={() => removeFilter(filter)}
                  className="ml-1.5 text-blue-700 hover:text-blue-900"
                  aria-label={`Remove ${filter.label} filter`}
                >
                  <FaXmark />
                </button>
              </div>
            ))}
            {activeFilters.length > 0 && (
              <button
                onClick={() => {
                  setActiveFilters([]);
                  setSearchData({
                    term: "",
                    field: "all",
                    dateFrom: "",
                    dateTo: "",
                  });
                  setSearchParams({ status: statusFilter });
                  setCurrentPage(1);
                }}
                className="text-xs text-gray-600 hover:text-gray-800 underline"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Table Container with Horizontal Scroll for Mobile */}
        <div className={`w-full ${isMobile ? "px-1" : "px-2 sm:px-3 md:px-4"}`}>
          <div
            className="w-full flex-1 overflow-x-auto overflow-y-hidden rounded-md"
            style={{ minHeight: paginatedClaims.length > 0 ? "600px" : "auto" }}
          >
            {/* Added width constraint here for sm breakpoint with overflow handling */}
            <div className="w-full sm:w-full overflow-x-auto md:w-full overflow-hidden">
              <div className="h-[600px] overflow-y-auto">
                <table className="w-full border-collapse text-gray-700 text-[10px] xs:text-xs sm:text-sm min-w-[300px] sm:min-w-[500px]">
                  <thead className="bg-gray-200 text-gray-600 sticky top-0 z-20">
                    <tr className="border-b">
                      <th className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-left font-medium">
                        <input
                          type="checkbox"
                          checked={
                            paginatedClaims.length > 0 &&
                            selectedClaims.length > 0
                          }
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setSelectedClaims(
                              isChecked
                                ? paginatedClaims.map((claim) => claim.id)
                                : []
                            );
                          }}
                        />
                      </th>
                      {[
                        { label: "ID", key: "id", priority: "high" },
                        { label: "Staff", key: "staff", priority: "high" },
                        { label: "Project", key: "project", priority: "high" },
                        { label: "Duration", key: "duration", priority: "low" },
                        { label: "Hours", key: "hours", priority: "medium" },
                        !hideUpdatedAt && {
                          label: "Updated",
                          key: "date",
                          priority: "low",
                        },
                        { label: "Status", key: "", priority: "high" },
                        { label: "Actions", key: "", priority: "high" },
                      ]
                        .filter(Boolean)
                        .map(({ label, key, priority }, index) => (
                          <th
                            key={index}
                            className={`px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-left font-medium whitespace-nowrap ${
                              priority === "low"
                                ? "hidden sm:table-cell lg:table-cell"
                                : priority === "medium"
                                ? "hidden sm:hidden md:table-cell"
                                : ""
                            }`}
                          >
                            <div className="flex items-center cursor-pointer">
                              {label}
                              {key && (
                                <span
                                  className="ml-1 relative flex flex-col items-center cursor-pointer"
                                  onClick={() => handleSort(key)}
                                >
                                  <FaSortUp
                                    className={`translate-y-[6px] transition-all ${
                                      sortConfig.key === key &&
                                      sortConfig.direction === "asc"
                                        ? "text-blue-500"
                                        : "text-gray-400"
                                    }`}
                                  />
                                  <FaSortDown
                                    className={`translate-y-[-6px] transition-all ${
                                      sortConfig.key === key &&
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
                    </tr>
                  </thead>

                  <tbody>
                    {financeLoading || claimerLoading || approverLoading ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="text-center py-10 sm:py-16 md:py-20"
                        >
                          <Loading message="Loading claims..." />
                        </td>
                      </tr>
                    ) : paginatedClaims.length > 0 ? (
                      paginatedClaims.map((claim, index) => (
                        <tr
                          key={index}
                          className="border-b hover:bg-gray-100 transition"
                        >
                          <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4">
                            <input
                              type="checkbox"
                              checked={selectedClaims.includes(claim.id)}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                setSelectedClaims((prev) =>
                                  isChecked
                                    ? [...prev, claim.id]
                                    : prev.filter((id) => id !== claim.id)
                                );
                              }}
                            />
                          </td>
                          <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[50px] sm:min-w-[60px] md:min-w-[80px]">
                            <span
                              className="cursor-pointer group relative"
                              title={claim.id}
                            >
                              {claim.id.substring(0, 5)}...
                              <span className="absolute left-0 top-full z-10 bg-gray-800 text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                                {claim.id}
                              </span>
                            </span>
                          </td>
                          <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[70px] sm:min-w-[80px] md:min-w-[100px]">
                            {claim.staff}
                          </td>
                          <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[80px] sm:min-w-[90px] md:min-w-[120px]">
                            {claim.project}
                          </td>
                          <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[80px] hidden sm:table-cell lg:table-cell">
                            {claim.duration}
                          </td>
                          <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[60px] hidden sm:hidden md:table-cell">
                            {claim.hours}h
                          </td>
                          {!hideUpdatedAt && (
                            <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[80px] hidden sm:table-cell lg:table-cell">
                              {claim.updateAt}
                            </td>
                          )}

                          <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 sm:text-xs md:py-4 min-w-[60px] sm:min-w-[70px] md:min-w-[90px]">
                            <span
                              className={`px-2 py-1 font-semibold rounded-full 
                  ${
                    claim.status === "Approved"
                      ? "bg-green-200 text-green-700"
                      : claim.status === "Paid"
                      ? "bg-blue-200 text-blue-700"
                      : claim.status === "Pending"
                      ? "bg-yellow-200 text-yellow-700"
                      : claim.status === "Rejected"
                      ? "bg-red-200 text-red-700"
                      : claim.status === "Cancelled"
                      ? "bg-pink-200 text-pink-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                            >
                              {claim.status}
                            </span>
                          </td>
                          <td
                            className={`px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 ${
                              isModalOpen
                                ? "pointer-events-none opacity-50"
                                : ""
                            }`}
                          >
                            <div className="flex gap-1 sm:gap-2 md:gap-3">
                              <FaEye
                                className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-500 cursor-pointer hover:text-blue-600 transition"
                                onClick={() => handleViewDetail(claim.id)}
                              />
                              {filterCondition !== "ClaimManagerment" && (
                                <>
                                  {financeStatus === "FinanceApproved" && (
                                    <FaMoneyCheckAlt
                                      className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-500 cursor-pointer hover:text-green-700 transition"
                                      onClick={() =>
                                        handleOpenModal("Paid", claim.id)
                                      }
                                    />
                                  )}

                                  {mode === "vetting" && (
                                    <>
                                      <FaCheckCircle
                                        className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-500 cursor-pointer hover:text-green-700 transition"
                                        onClick={() =>
                                          handleOpenModal("Approve", claim.id)
                                        }
                                      />
                                      <FaTimesCircle
                                        className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 text-red-500 cursor-pointer hover:text-red-700 transition"
                                        onClick={() =>
                                          handleOpenModal("Reject", claim.id)
                                        }
                                      />
                                    </>
                                  )}
                                  {claim.status &&
                                    claim.status.toLowerCase() === "draft" && (
                                      <>
                                        <FaCheckCircle
                                          className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 text-green-500 cursor-pointer hover:text-green-700 transition"
                                          onClick={() =>
                                            handleOpenModal("Submit", claim.id)
                                          }
                                        />
                                        <FaTimesCircle
                                          className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 text-red-500 cursor-pointer hover:text-red-700 transition"
                                          onClick={() =>
                                            handleOpenModal(
                                              "Cancelled",
                                              claim.id
                                            )
                                          }
                                        />
                                      </>
                                    )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="text-center py-4 sm:py-5 md:py-6 text-gray-500"
                        >
                          No claims found.
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
                  className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  <span className="hidden sm:inline">First</span>
                  <span className="sm:hidden">«</span>
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
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
                <span className="text-gray-700 text-xs sm:text-sm">Page</span>
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
                  className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
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
                  className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
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
      </div>

      {/* Modals - Outside the main content area */}
      <FinanceDownLoadModal
        isOpenDownloadModal={isOpenDownloadModal}
        setIsOpenDownloadModal={setIsOpenDownloadModal}
      />
      <ApproverModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={(reason) => {
          console.log("Received reason in parent component:", reason);
          handleConfirm(reason);
        }}
        actionType={selectedAction}
        reason={reason}
        setReason={setReason}
        source="ClaimsTable"
      />
    </div>
  );
}
