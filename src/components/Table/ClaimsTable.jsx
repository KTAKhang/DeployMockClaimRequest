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

import {
  ACTION_TYPES,
  STATUS_OPTIONS,
  FILTER_CONDITIONS,
  MODES,
  PAGINATION,
  SEARCH_FIELDS,
  INITIAL_SEARCH_DATA,
} from "./constants";
import {
  LABELS,
  NAVIGATION_PATHS,
  NAVIGATION_STATES,
  truncateString,
} from "./strings";
import {
  filterClaims,
  sortClaims,
  createFiltersFromSearchData,
  handleStatusUpdate,
  buildUrlParams,
  getNavigationDetails,
} from "./utils";

export default function ClaimsTable({
  title,
  claimsData,
  filterCondition,
  hideUpdatedAt = false,
  hideActionButtons = false,
}) {
  // State Variables
  const { isIPhoneSE, isMobile } = useMobileView();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedClaims, setSelectedClaims] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(STATUS_OPTIONS.ALL);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("1");
  const [reason, setReason] = useState("");
  const [isOpenDownloadModal, setIsOpenDownloadModal] = useState(false);
  const [searchData, setSearchData] = useState({
    term: "",
    field: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [activeFilters, setActiveFilters] = useState([]);
  const [actionType, setActionType] = useState("");

  // Redux hooks
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const financeLoading = useSelector((state) => state.finance.loading);
  const approverLoading = useSelector((state) => state.claims.loading);
  const claimerLoading = useSelector((state) => state.claimer.loading);
  const isPaidSuccess = useSelector((state) => state.finance.isPaidSuccess);

  // Determine mode based on filter condition
  const mode =
    filterCondition === FILTER_CONDITIONS.FOR_MY_VETTING
      ? MODES.VETTING
      : MODES.HISTORY;
  const financeStatus = filterCondition;

  // Effects
  useEffect(() => {
    const urlStatus = searchParams.get("status") || STATUS_OPTIONS.ALL;
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
        label: LABELS.FIELD_LABELS[urlSearchField],
        value: urlSearchTerm,
        field: urlSearchField,
        type: "text",
      });
    }

    if (urlDateFrom) {
      initialFilters.push({
        id: `date-from-init`,
        label: LABELS.FIELD_LABELS.dateFrom,
        value: urlDateFrom,
        field: "dateFrom",
        type: "date",
      });
    }

    if (urlDateTo) {
      initialFilters.push({
        id: `date-to-init`,
        label: LABELS.FIELD_LABELS.dateTo,
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
    if (claimsData && claimsData.length > 0 && loading) {
      setLoading(false);
    }
  }, [claimsData, loading]);

  useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  // Event Handlers
  const handleSearch = (searchData) => {
    setSearchData(searchData);
    setCurrentPage(1); // Reset to first page on search

    // Build URL params object with all search parameters
    const params = buildUrlParams(searchData, statusFilter);
    setSearchParams(params);

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

    // Create new filter objects based on search inputs
    const newFilters = createFiltersFromSearchData(searchData);

    if (newFilters.length > 0) {
      // Remove existing filters of the same types as the new filters
      const newFilterTypes = new Set(newFilters.map((f) => f.type));
      const remainingFilters = activeFilters.filter(
        (f) => !newFilterTypes.has(f.type)
      );
      setActiveFilters([...remainingFilters, ...newFilters]);
    }
  };

  const handleOpenModal = (action, claimId = null) => {
    if (claimId) {
      setSelectedClaims([claimId]); // Single selection
    }
    setSelectedAction(action);
    setIsModalOpen(true);
    setActionType(action);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClaims([]);
  };

  const handleBulkAction = (action) => {
    if (!selectedClaims.length) return;

    let status;
    switch (action) {
      case ACTION_TYPES.SUBMIT_ALL:
      case ACTION_TYPES.SUBMIT:
        status = STATUS_OPTIONS.PENDING;
        break;
      case ACTION_TYPES.CANCEL_ALL:
      case ACTION_TYPES.CANCELLED:
        status = STATUS_OPTIONS.CANCELLED;
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
      toast.error(LABELS.TOAST.REASON_REQUIRED);
      return;
    }

    if (
      selectedAction === ACTION_TYPES.APPROVE_ALL ||
      selectedAction === ACTION_TYPES.REJECT_ALL
    ) {
      handleBulkStatusUpdate(
        selectedAction.includes("Approve")
          ? ACTION_TYPES.APPROVE
          : ACTION_TYPES.REJECT,
        reason
      );
    } else if (
      selectedAction === ACTION_TYPES.SUBMIT_ALL ||
      selectedAction === ACTION_TYPES.CANCEL_ALL
    ) {
      handleBulkAction(selectedAction);
    } else if (selectedAction === ACTION_TYPES.PAY_ALL) {
      handlePayStatusUpdate();
    } else if (
      [
        ACTION_TYPES.SUBMIT_ALL,
        ACTION_TYPES.CANCEL_ALL,
        ACTION_TYPES.SUBMIT,
        ACTION_TYPES.CANCELLED,
      ].includes(selectedAction)
    ) {
      handleBulkAction(selectedAction);
    } else if (selectedAction === ACTION_TYPES.PAID) {
      selectedClaims.forEach(() => {
        handlePayStatusUpdate();
      });
    } else {
      selectedClaims.forEach((claimId) => {
        handleStatusUpdate(claimId, selectedAction, reason, dispatch);
      });
    }

    console.log(`${selectedAction} confirmed for claims:`, selectedClaims);

    // Navigate only when the action is "Approve"
    if (
      selectedAction === ACTION_TYPES.APPROVE ||
      selectedAction === ACTION_TYPES.APPROVE_ALL
    ) {
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

  const handleBulkStatusUpdate = (action, reason = "") => {
    if (!selectedClaims.length) return;

    dispatch({
      type: UPDATE_CLAIM_STATUS_REQUEST,
      payload: {
        ids: selectedClaims, // Send an array of claim IDs
        status:
          action === ACTION_TYPES.APPROVE
            ? STATUS_OPTIONS.APPROVED
            : STATUS_OPTIONS.REJECTED,
        reason_approver: reason,
      },
    });

    toast.success(
      action === ACTION_TYPES.APPROVE
        ? LABELS.TOAST.CLAIMS_APPROVED
        : LABELS.TOAST.CLAIMS_REJECTED
    );
    setSelectedClaims([]);
  };

  const handlePayStatusUpdate = () => {
    if (!selectedClaims.length) return;
    dispatch(
      financeUpdateClaimStatusRequest(selectedClaims, STATUS_OPTIONS.PAID)
    );
    toast.success(LABELS.TOAST.CLAIMS_PAID);
    setSelectedClaims([]);
    dispatch(fetchClaimsRequest({}));
    setTimeout(() => {
      navigate(`/finance/paid`);
    }, 1500);


  };

  // Filter and sort claims
  const filteredClaims = filterClaims(
    claimsData,
    searchData,
    statusFilter,
    filterCondition
  );
  const sortedClaims = sortClaims(filteredClaims, sortConfig);

  // Pagination logic
  const totalPages = Math.ceil(sortedClaims.length / PAGINATION.ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * PAGINATION.ITEMS_PER_PAGE;
  const paginatedClaims = sortedClaims.slice(
    startIndex,
    startIndex + PAGINATION.ITEMS_PER_PAGE
  );

  // Handle sorting when clicking headers
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Remove a filter
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

  // Navigate to details with mode
  const handleViewDetail = (id) => {
    const { path, state } = getNavigationDetails(filterCondition, id);
    navigate(path, state);
  };

  return (
    <div className="px-0 sm:px-2 md:px-4 -ml-1 sm:-ml-0 min-h-fit flex flex-col items-center">
      <div className="w-full max-w-[350px] sm:max-w-[550px] md:max-w-none bg-white shadow-lg border rounded-xl p-3 sm:p-4 md:p-6 overflow-hidden">
        {/* Header - Stacked and centered on mobile, side-by-side on larger screens */}
        <div className="flex flex-col items-center lg:flex-row lg:justify-between lg:items-center gap-3 mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 text-center lg:text-left mb-2 lg:mb-0">
            {title}
          </h3>

          {/* Search and Filters Section - Centered */}
          <div className="w-full lg:flex-1 text-xs sm:text-sm lg:max-w-md mb-3 lg:mb-0 flex justify-center lg:justify-start">
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
              <div className="flex justify-center md:justify-start sm:flex-1 gap-2">
                {financeStatus === FILTER_CONDITIONS.FINANCE_APPROVED ? (
                  <button
                    onClick={() => handleOpenModal(ACTION_TYPES.PAY_ALL)}
                    disabled={selectedClaims.length === 0}
                    className={`flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all shadow-sm
              ${selectedClaims.length > 0
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }
            `}
                  >
                    <FaCheckCircle className="text-base" />
                    <span>{LABELS.BUTTONS.PAY_ALL}</span>
                  </button>
                ) : financeStatus === FILTER_CONDITIONS.FINANCE_PAID ? (
                  <button
                    onClick={() => setIsOpenDownloadModal(true)}
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all shadow-sm bg-green-600 text-white hover:bg-green-700"
                  >
                    <FaCheckCircle className="text-base" />
                    <span>{LABELS.BUTTONS.DOWNLOAD_ALL}</span>
                  </button>
                ) : null}

                {mode === MODES.VETTING && (
                  <>
                    <button
                      onClick={() => handleOpenModal(ACTION_TYPES.APPROVE_ALL)}
                      disabled={selectedClaims.length === 0}
                      className={`flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all shadow-sm
                ${selectedClaims.length > 0
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }
              `}
                    >
                      <FaCheckCircle className="text-base" />
                      <span>{LABELS.BUTTONS.APPROVE}</span>
                    </button>

                    <button
                      onClick={() => handleOpenModal(ACTION_TYPES.REJECT_ALL)}
                      disabled={selectedClaims.length === 0}
                      className={`flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all shadow-sm
                ${selectedClaims.length > 0
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }
              `}
                    >
                      <FaTimesCircle className="text-base" />
                      <span>{LABELS.BUTTONS.REJECT}</span>
                    </button>
                  </>
                )}

                {(mode === MODES.DRAFT ||
                  filteredClaims.some(
                    (claim) => claim.status === STATUS_OPTIONS.DRAFT
                  )) && (
                    <>
                      <button
                        onClick={() => handleOpenModal(ACTION_TYPES.SUBMIT_ALL)}
                        disabled={selectedClaims.length === 0}
                        className={`flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all shadow-sm
                ${selectedClaims.length > 0
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }
              `}
                      >
                        <FaCheckCircle className="text-base" />
                        <span>{LABELS.BUTTONS.SUBMIT_ALL}</span>
                      </button>

                      <button
                        onClick={() => handleOpenModal(ACTION_TYPES.CANCEL_ALL)}
                        disabled={selectedClaims.length === 0}
                        className={`flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all shadow-sm
                ${selectedClaims.length > 0
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }
              `}
                      >
                        <FaTimesCircle className="text-base" />
                        <span>{LABELS.BUTTONS.CANCEL_ALL}</span>
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
                <option value={STATUS_OPTIONS.ALL}>{STATUS_OPTIONS.ALL}</option>
                {filterCondition === FILTER_CONDITIONS.CLAIMS_HISTORY && (
                  <>
                    <option value={STATUS_OPTIONS.APPROVED}>
                      {STATUS_OPTIONS.APPROVED}
                    </option>
                    <option value={STATUS_OPTIONS.PAID}>
                      {STATUS_OPTIONS.PAID}
                    </option>
                  </>
                )}
              </select>

              <span className="px-3 py-2 text-xs sm:text-sm font-medium rounded-md border border-gray-300 bg-gray-100 flex items-center gap-1">
                📋 {LABELS.TOTAL_CLAIMS}{" "}
                <span className="font-bold">{filteredClaims.length}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Active Filters Display - Centered on mobile */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap md:justify-start justify-center lg:justify-start gap-2 mb-4">
            <span className="text-xs sm:text-sm pt-0.5 md:pt-0 lg:pt-0 text-gray-600">
              {LABELS.ACTIVE_FILTERS}
            </span>
            {activeFilters.map((filter) => (
              <div
                key={filter.id}
                className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
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
                  setSearchData(INITIAL_SEARCH_DATA);
                  setSearchParams({ status: statusFilter });
                  setCurrentPage(1);
                }}
                className="text-xs text-gray-600 hover:text-gray-800 underline"
              >
                {LABELS.CLEAR_ALL}
              </button>
            )}
          </div>
        )}

        {/* Table Container with Horizontal Scroll for Mobile */}
        <div className={`w-full ${isMobile ? "px-1" : "px-2 sm:px-3 md:px-4"}`}>
          <div
            className="w-full overflow-x-auto overflow-hidden"
            style={{
              minHeight: paginatedClaims.length > 0 ? "500px" : "auto",
            }}
          >
            {/* Added width constraint here for sm breakpoint with overflow handling */}
            <div className="w-full sm:w-full overflow-x-auto md:w-full overflow-hidden">
              <div className="h-[500px] overflow-y-auto">
                <table className="w-full border-collapse text-gray-700 text-[10px] xs:text-xs sm:text-sm min-w-[300px] sm:min-w-[500px]">
                  <thead className="bg-gray-200 text-gray-600 sticky top-0 z-20">
                    <tr className="border-b">
                      <th className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-left font-medium">
                        <input
                          type="checkbox"
                          checked={
                            paginatedClaims.length > 0 &&
                            selectedClaims.length === paginatedClaims.length
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
                        {
                          label: LABELS.FIELD_LABELS.id,
                          key: "id",
                          priority: "high",
                        },
                        {
                          label: LABELS.FIELD_LABELS.staff,
                          key: "staff",
                          priority: "high",
                        },
                        {
                          label: LABELS.FIELD_LABELS.project,
                          key: "project",
                          priority: "high",
                        },
                        {
                          label: LABELS.FIELD_LABELS.duration,
                          key: "duration",
                          priority: "high",
                        },
                        {
                          label: LABELS.FIELD_LABELS.hours,
                          key: "hours",
                          priority: "medium",
                        },
                        !hideUpdatedAt && {
                          label: LABELS.FIELD_LABELS.date,
                          key: "date",
                          priority: "low",
                        },
                        {
                          label: LABELS.FIELD_LABELS.status,
                          key: "",
                          priority: "high",
                        },
                        {
                          label: LABELS.FIELD_LABELS.actions,
                          key: "",
                          priority: "high",
                        },
                      ]
                        .filter(Boolean)
                        .map(({ label, key, priority }, index) => (
                          <th
                            key={index}
                            className={`px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-left font-medium whitespace-nowrap ${priority === "low"
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
                                    className={`translate-y-[6px] transition-all ${sortConfig.key === key &&
                                      sortConfig.direction === "asc"
                                      ? "text-blue-500"
                                      : "text-gray-400"
                                      }`}
                                  />
                                  <FaSortDown
                                    className={`translate-y-[-6px] transition-all ${sortConfig.key === key &&
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
                          <Loading message={LABELS.LOADING_CLAIMS} />
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
                              {truncateString(claim.id)}
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
                          <td className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 min-w-[80px]">
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
                  ${claim.status === "Approved"
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
                            className={`px-1 sm:px-2 md:px-4 py-2 sm:py-3 md:py-4 ${isModalOpen
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
                          {LABELS.NO_CLAIMS}
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
                    {LABELS.BUTTONS.FIRST}
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
                    {LABELS.BUTTONS.PREVIOUS}
                  </span>
                  <span className="sm:hidden">‹</span>
                </button>
              </div>

              {/* Page Input */}
              <div className="flex items-center">
                <span className="text-gray-700 text-xs sm:text-sm">
                  {LABELS.BUTTONS.PAGE}
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
                  className={`px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:bg-blue-100"
                    }`}
                >
                  <span className="hidden sm:inline">
                    {LABELS.BUTTONS.NEXT}
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
                    {LABELS.BUTTONS.LAST}
                  </span>
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
