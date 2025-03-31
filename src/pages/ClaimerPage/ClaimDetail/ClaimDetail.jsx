import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchClaimDetailRequest,
  updateClaimRequest,
  resetUpdateState,
  claimerRemoveProcessedClaims,
  bulkUpdateClaimRequest,
} from "../../../redux/actions/claimerActions";
import {
  getCommentsRequest,
  createCommentRequest,
  replyCommentRequest,
} from "../../../redux/actions/commentAction";
import profileImage from "../../../assets/img/profile.png";
import {
  FaFileAlt,
  FaExclamationCircle,
  FaArrowLeft,
  FaProjectDiagram,
  FaClock,
  FaCalendarAlt,
  FaClipboard,
  FaComment,
  FaLock,
  FaTimes,
  FaEdit,
  FaCheck,
} from "react-icons/fa";
import UpdateClaimForm from "../../../components/Popup/Claim/UpdateClaimForm";
import ClaimModal from "../ClaimModal/ClaimModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../../../components/Loading/Loading";

// Import from separated files
import { STATUS, ACTION_TYPES, LOCKED_COMMENT_STATUSES } from "./constants";
import {
  PAGE_STRINGS,
  BUTTON_STRINGS,
  SECTION_HEADERS,
  COMMENT_STRINGS,
  REASON_STRINGS,
  ERROR_STRINGS,
  LOADING_STRINGS,
  TOAST_STRINGS,
} from "./strings";
import {
  getStatusColor,
  getStatusTextColor,
  formatTimeAgo,
  formatName,
  createInitialFormData,
  getImageSrc,
} from "./utils";
import { formatDate } from "../../ApproverPages/Detail/utils";

const ClaimDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Refs for handling comment interactions
  const commentRefs = useRef({});
  const replyRefs = useRef({});
  const lastCommentRef = useRef(null);
  const commentsContainerRef = useRef(null);
  const commentInputRef = useRef(null);
  const notificationTimeoutRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [commentsPerPage] = useState(10);

  // Get all states from Redux
  const {
    claimDetail: claim,
    loading,
    error,
    updateClaimSuccess,
    updateClaimLoading,
  } = useSelector((state) => state.claimer);
  const { comments, loadingComment, errorComment } = useSelector(
    (state) => state.comment
  );

  // Local states
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [localClaimDetail, setLocalClaimDetail] = useState(null);
  const [replyTo, setReplyTo] = useState("");
  const [commentId, setCommentId] = useState(null);
  const [commentData, setCommentData] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [initialCommentsLoading, setInitialCommentsLoading] = useState(true);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isAddingReply, setIsAddingReply] = useState(false);
  const [emptyCommentsLoading, setEmptyCommentsLoading] = useState(false);
  const [lastActionType, setLastActionType] = useState(null);
  const [lastTargetId, setLastTargetId] = useState(null);
  const [fetchingComments, setFetchingComments] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get current user ID and User for checking comment ownership
  const currentUserId = useSelector((state) => state.auth?.user?._id);
  const currentUser = useSelector((state) => state.auth?.user);

  // Determine if this is a draft claim
  const isDraft = claim?.status?.toLowerCase() === STATUS.DRAFT;

  // Fetch claim detail when component mounts
  useEffect(() => {
    dispatch(fetchClaimDetailRequest(id));
  }, [dispatch, id]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!loadingComment) {
      setFetchingComments(false);

      // Introduce slight delay before setting emptyCommentsLoading to false
      setTimeout(() => {
        setEmptyCommentsLoading(false);
      }, 2000); // Adjust timing if needed
    }
  }, [loadingComment]);

  // Fetch comments only if not in draft state
  useEffect(() => {
    if (!isDraft) {
      dispatch(getCommentsRequest(id));
    }
  }, [dispatch, id, isDraft]);

  // Update localClaimDetail when claimDetail changes
  useEffect(() => {
    if (claim) {
      setLocalClaimDetail(claim);
    }
  }, [claim]);

  useEffect(() => {
    setInitialCommentsLoading(true);
    dispatch({ type: "GET_COMMENTS_REQUEST", payload: id });

    const timer = setTimeout(() => {
      setInitialCommentsLoading(false);
    }, 5000); // Adjust the delay as needed

    return () => clearTimeout(timer); // Cleanup function
  }, [dispatch, id]);

  // Handle successful update
  useEffect(() => {
    if (updateClaimSuccess) {
      setShowUpdatePopup(false);

      dispatch(resetUpdateState());

      if (localClaimDetail) {
        setIsRefreshing(true);

        setTimeout(() => {
          setIsRefreshing(false);
        }, 300); // Reduced from 500ms
      }
    }
  }, [updateClaimSuccess, dispatch, id, localClaimDetail]);

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetUpdateState());
    };
  }, [dispatch]);

  // Effect to handle scrolling based on action type
  useEffect(() => {
    if (!loadingComment) {
      if (emptyCommentsLoading) {
        setFetchingComments(true);
        dispatch(getCommentsRequest(id)); // Fetch comments
      }

      if (Array.isArray(comments)) {
        if (
          isAddingReply &&
          lastTargetId &&
          commentRefs.current[lastTargetId]
        ) {
          commentRefs.current[lastTargetId].scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
          setIsAddingReply(false);
          setLastTargetId(null);
        } else if (
          lastActionType === "reply" &&
          lastTargetId &&
          commentRefs.current[lastTargetId]
        ) {
          commentRefs.current[lastTargetId].scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
          setLastActionType(null);
          setLastTargetId(null);
        } else if (lastActionType === "comment" && lastCommentRef.current) {
          lastCommentRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start", // Ensure it stays at the top
          });
          setLastActionType(null);
        }
      }
    }
  }, [
    comments,
    loadingComment,
    isAddingReply,
    lastTargetId,
    lastActionType,
    emptyCommentsLoading,
    dispatch,
    id,
  ]);

  // Handle key down events in the comment input
  const handleKeyDown = (e) => {
    // Check if Enter key is pressed without Shift key
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default behavior (new line)
      handleSend(); // Call the send function
    }
  };

  // Handle update form submission for draft claims
  const handleUpdateSubmit = (formData) => {
    // Update UI immediately (optimistic update)
    setLocalClaimDetail((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        from: formData.from,
        to: formData.to,
        hours: formData.total_no_of_hours,
        reason_claimer: formData.reason_claimer,
      };
    });

    // Dispatch update action
    dispatch(updateClaimRequest(id, formData));
  };

  // Handle reply action in comments
  const handleReply = (username, id) => {
    setReplyTo(`@${username} `);
    setCommentId(id);

    // Scroll to the comment being replied to
    if (commentRefs.current[id]) {
      commentRefs.current[id].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }

    setTimeout(() => {
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    }, 100);
  };

  // Handle sending a comment
  const handleSend = () => {
    if (commentData.trim() === "") return;

    // Check if user is a Claimer and needs to reply but hasn't selected a comment
    const isUserClaimer = localStorage.getItem("role") === "Claimer";

    if (isUserClaimer && !commentId) {
      // Show notification
      setShowNotification(true);

      // Clear any existing timeout
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }

      // Auto-hide notification after 3 seconds
      notificationTimeoutRef.current = setTimeout(() => {
        setShowNotification(false);
      }, 3000);

      return;
    }

    const targetCommentId = commentId; // Save the ID before resetting

    // Check if this is the first comment
    const isFirstComment =
      !commentId && (!Array.isArray(comments) || comments.length === 0);

    if (commentId) {
      // We're adding a reply
      setIsAddingReply(true);
      dispatch(
        replyCommentRequest({ content: commentData, comment_id: commentId })
      );
      setLastTargetId(targetCommentId);
    } else {
      // We're adding a new comment
      setIsAddingComment(true);
      // If this is the first comment, show special loading state
      if (isFirstComment) {
        setEmptyCommentsLoading(true);
      }
      dispatch(createCommentRequest({ content: commentData, claim_id: id }));
    }

    // Reset input
    setCommentData("");
    setReplyTo("");
    setCommentId(null);
    // Clear lastActionType to prevent other scrolling behaviors
    setLastActionType(null);
  };

  // Handle modal actions for draft claims
  const openModal = (type) => {
    setActionType(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleConfirm = () => {
    setModalOpen(false);

    if (
      actionType === ACTION_TYPES.SUBMIT ||
      actionType === ACTION_TYPES.CANCEL
    ) {
      handleBulkAction(actionType, [id]);
    }
  };

  const handleBulkAction = (action, claimIds) => {
    if (!claimIds.length) return;

    let status;
    if (action === ACTION_TYPES.SUBMIT) status = "Pending";
    else if (action === ACTION_TYPES.CANCEL) status = "Cancelled";
    else return;

    dispatch(claimerRemoveProcessedClaims(claimIds));
    dispatch(bulkUpdateClaimRequest({ claimIds, status }));
    navigate(`/claimer/${status.toLowerCase()}`);
    toast.success(
      `${TOAST_STRINGS.CLAIM_STATUS_UPDATED} ${status.toLowerCase()}`
    );
  };

  // Display loading state
  if (loading && !isRefreshing) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <Loading message={LOADING_STRINGS.CLAIM_DETAILS} />
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-160px)]">
        <FaExclamationCircle className="text-red-500 text-4xl mb-4" />
        <div className="text-center text-red-500 font-bold text-lg">
          {error}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
        >
          <FaArrowLeft className="mr-2" /> {BUTTON_STRINGS.BACK}
        </button>
      </div>
    );
  }

  // Display not found state
  if (!claim) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-160px)]">
        <FaExclamationCircle className="text-red-500 text-4xl mb-4" />
        <div className="text-center text-red-500 font-bold text-lg">
          {ERROR_STRINGS.CLAIM_NOT_FOUND}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
        >
          <FaArrowLeft className="mr-2" /> {BUTTON_STRINGS.BACK}
        </button>
      </div>
    );
  }

  // Display data from localClaimDetail instead of claimDetail
  const displayData = localClaimDetail || claim;
  const currentStatus = displayData.status?.toLowerCase() || STATUS.DRAFT;
  const statusColor = getStatusColor(currentStatus);
  const statusTextColor = getStatusTextColor(currentStatus);

  // Pagination logic
  const reversedComments = Array.isArray(comments)
    ? [...comments].reverse()
    : [];

  const currentComments = reversedComments.slice(
    (currentPage - 1) * commentsPerPage,
    currentPage * commentsPerPage
  );

  const totalPages = comments
    ? Math.ceil(comments.length / commentsPerPage)
    : 0;

  // Pagination handler functions
  const handleNextPage = () => {
    setCurrentPage((prevPage) =>
      prevPage < totalPages ? prevPage + 1 : prevPage
    );
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => (prevPage > 1 ? prevPage - 1 : prevPage));
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="px-2 sm:px-4 py-4 sm:py-6 min-h-screen max-w-full overflow-x-hidden">
      {/* Display loading overlay during update */}
      {updateClaimLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-lg font-semibold">
              {LOADING_STRINGS.UPDATING_CLAIM}
            </p>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center hover:text-blue-600 transition-colors mr-2"
        >
          <FaArrowLeft className="mr-1 sm:mr-2" /> {BUTTON_STRINGS.BACK}
        </button>
        <span className="mx-1 sm:mx-2">|</span>
        <span>{PAGE_STRINGS.PAGES}</span>
        <span className="mx-1 sm:mx-2">&gt;</span>
        <button
          className="hover:text-blue-600 transition-colors"
          onClick={() =>
            navigate(isDraft ? "/claimer/draft" : `/claimer/${currentStatus}`)
          }
        >
          {isDraft
            ? "Draft"
            : currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
        </button>
        <span className="mx-1 sm:mx-2">&gt;</span>
        <span className="text-blue-600 font-semibold">
          {PAGE_STRINGS.CLAIM_DETAILS}
        </span>
      </div>

      {/* Claim Details Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-3 sm:px-6 py-3 sm:py-4 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-lg sm:text-xl font-bold mb-2 sm:mb-0">
              {PAGE_STRINGS.TITLE}
            </h1>
            <div className="flex items-center">
              <span className="text-xs sm:text-sm opacity-80 mr-1 sm:mr-2">
                ID:
              </span>
              <span className="text-xs sm:text-sm bg-white bg-opacity-20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full truncate max-w-[150px] sm:max-w-none">
                {id}
              </span>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-3 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="relative">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img
                  src={getImageSrc(displayData.avatar)}
                  alt="User Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = profileImage; // Fallback to default if avatar URL fails
                  }}
                />
              </div>
              <div
                className={`absolute bottom-1 right-1 w-5 h-5 sm:w-6 sm:h-6 ${statusColor} rounded-full border-2 border-white`}
              ></div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {displayData.staff || "N/A"}
              </h2>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-start">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <FaProjectDiagram className="text-blue-600" />
                  </div>
                  <div className="ml-0 sm:ml-2 text-center sm:text-left mt-1 sm:mt-0">
                    <p className="text-xs text-gray-500">Project</p>
                    <p className="font-medium text-gray-800 text-sm">
                      {displayData.project || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <FaClock className="text-green-600" />
                  </div>
                  <div className="ml-0 sm:ml-2 text-center sm:text-left mt-1 sm:mt-0">
                    <p className="text-xs text-gray-500">Working Hours</p>
                    <p className="font-medium text-gray-800 text-sm">
                      {displayData.hours ? `${displayData.hours} hrs` : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                    <FaCalendarAlt className="text-purple-600" />
                  </div>
                  <div className="ml-0 sm:ml-2 text-center sm:text-left mt-1 sm:mt-0">
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-medium text-gray-800 text-sm">
                      {displayData.duration || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center sm:items-start">
                  <div
                    className={`flex items-center justify-center w-8 h-8 ${
                      currentStatus === STATUS.CANCELLED
                        ? "bg-pink-100"
                        : statusColor
                            .replace("bg-", "bg-")
                            .replace("500", "100")
                    } rounded-full`}
                  >
                    <FaClipboard
                      className={
                        currentStatus === STATUS.DRAFT
                          ? "text-gray-600"
                          : currentStatus === STATUS.PENDING
                          ? "text-yellow-600"
                          : currentStatus === STATUS.CANCELLED
                          ? "text-pink-600"
                          : statusColor
                              .replace("bg-", "text-")
                              .replace("500", "600")
                      }
                    />
                  </div>
                  <div className="ml-0 sm:ml-2 text-center sm:text-left mt-1 sm:mt-0">
                    <p className="text-xs text-gray-500">Status</p>
                    <p
                      className={`font-semibold text-sm ${statusTextColor} whitespace-nowrap`}
                    >
                      {displayData.status || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Reason/Decision Section - Redesigned to match Side by Side layout */}
        <div className="p-3 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
            <FaClipboard className="mr-2 text-blue-600" />
            {SECTION_HEADERS.DECISION_REASON}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Claimer's Reason Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <FaComment className="mr-2 text-gray-500" />
                {SECTION_HEADERS.CLAIMER_REASON}
              </h4>
              <div
                className="text-sm text-gray-700"
                style={{ minHeight: "100px" }}
              >
                {claim?.reason_claimer || REASON_STRINGS.NO_CLAIMER_REASON}
              </div>
            </div>

            {/* Approver's Reason Section - Conditionally Rendered */}
            {["approved", "rejected", "paid"].includes(currentStatus) && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <FaComment className="mr-2 text-gray-500" />
                  {SECTION_HEADERS.DECISION_REASON_TITLE}
                </h4>

                <p className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  {displayData.reason_approver ||
                    REASON_STRINGS.NO_DECISION_REASON}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end items-center gap-2 sm:gap-3">
          {isDraft && (
            <div className="flex w-full sm:w-auto gap-2 sm:gap-3">
              <button
                onClick={() => openModal(ACTION_TYPES.CANCEL)}
                className="flex-1 sm:flex-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors flex items-center justify-center"
              >
                <FaTimes className="mr-2" /> {BUTTON_STRINGS.CANCEL}
              </button>
              <button
                onClick={() => setShowUpdatePopup(true)}
                className="flex-1 sm:flex-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors flex items-center justify-center"
              >
                <FaEdit className="mr-2" /> {BUTTON_STRINGS.UPDATE}
              </button>
              <button
                onClick={() => openModal(ACTION_TYPES.SUBMIT)}
                className="flex-1 sm:flex-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors flex items-center justify-center"
              >
                <FaCheck className="mr-2" /> {BUTTON_STRINGS.SUBMIT}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Section - Modified for GitHub-like design */}
      <div className="grid grid-cols-1 gap-4">
        {isDraft ? (
          /* Draft Specific Content - Left empty as requested */
          <div className="flex flex-col h-full">
            {/* Left empty for draft claims as requested */}
          </div>
        ) : (
          <>
            <div className="border-b rounded border-gray-200 bg-gray-50 px-4 py-3">
              <h3 className="text-base font-medium text-gray-700 flex items-center">
                <FaComment className="mr-2 text-gray-500" />
                {SECTION_HEADERS.COMMENTS_HISTORY}
                <span className="ml-2 text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">
                  {comments?.length || 0}
                </span>
              </h3>
            </div>

            <div className="flex flex-col">
              {/* Comment input */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                {claim.status?.name === LOCKED_COMMENT_STATUSES ? (
                  <div className="flex items-center justify-center p-3 border bg-white rounded-lg">
                    <FaLock className="text-gray-400 mr-2" />
                    <span className="text-gray-500 text-sm">
                      {COMMENT_STRINGS.LOCKED_COMMENTS}
                    </span>
                  </div>
                ) : (
                  <>
                    {replyTo && (
                      <div className="bg-blue-50 rounded-lg flex items-center justify-between p-3 mb-4 border border-blue-100">
                        <p className="text-blue-700 flex items-center text-sm">
                          <span className="mr-2">↩️</span>{" "}
                          {COMMENT_STRINGS.REPLYING_TO} {replyTo}
                        </p>
                        <button
                          onClick={() => {
                            setReplyTo("");
                            setCommentId(null);
                          }}
                          className="ml-2 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                          ✖️
                        </button>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 hidden sm:block">
                        <img
                          src={currentUser?.avatar || profileImage}
                          alt="Your Profile"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </div>
                      <div className="flex-1 rounded-lg overflow-hidden border border-gray-300 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
                        <textarea
                          ref={commentInputRef}
                          className="w-full bg-white p-3 text-sm focus:outline-none resize-none rounded-t-lg min-h-[100px]"
                          placeholder={COMMENT_STRINGS.PLACEHOLDER}
                          value={commentData}
                          onChange={(e) => setCommentData(e.target.value)}
                          onKeyDown={handleKeyDown}
                        ></textarea>
                        <div className="bg-gray-50 p-2 flex justify-end items-center border-t border-gray-200 rounded-b-lg">
                          <button
                            onClick={handleSend}
                            disabled={
                              loadingComment ||
                              !commentData.trim() ||
                              (localStorage.getItem("role") === "Claimer" &&
                                replyTo === "")
                            }
                            className={`px-4 py-2 rounded-md font-medium text-sm text-white flex items-center ${
                              loadingComment ||
                              !commentData.trim() ||
                              (localStorage.getItem("role") === "Claimer" &&
                                replyTo === "")
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600"
                            } transition-colors`}
                          >
                            {loadingComment ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                {BUTTON_STRINGS.SENDING}
                              </>
                            ) : (
                              <>{BUTTON_STRINGS.SEND}</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Comments List */}
              <div
                ref={commentsContainerRef}
                className="flex-1 overflow-y-auto p-4"
              >
                {initialCommentsLoading || emptyCommentsLoading ? (
                  <div className="flex justify-center items-center py-40">
                    <Loading
                      message={
                        emptyCommentsLoading
                          ? COMMENT_STRINGS.ADDING_COMMENT
                          : COMMENT_STRINGS.LOADING_COMMENTS
                      }
                    />
                  </div>
                ) : comments &&
                  Array.isArray(comments) &&
                  comments.length > 0 ? (
                  <div className="space-y-6">
                    {currentComments.map((comment, index) => (
                      <div
                        key={comment._id || `comment-${index}`}
                        className="comment-thread group border-b border-gray-100 pb-6 mb-6 last:border-0"
                        ref={
                          index === currentComments.length - 1
                            ? lastCommentRef
                            : null
                        }
                        id={`comment-${comment._id}`}
                      >
                        {/* Main comment */}
                        <div
                          ref={(el) => {
                            commentRefs.current[comment._id] = el;
                            if (index === comments.length - 1) {
                              lastCommentRef.current = el;
                            }
                          }}
                          className="flex gap-3"
                        >
                          <div className="flex-shrink-0">
                            <img
                              src={comment.user_id.avatar || profileImage}
                              alt="Profile"
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="font-semibold text-gray-900">
                                  {formatName(comment.user_id.user_name)}
                                </span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                  {comment.user_id.role_id.name}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatTimeAgo(comment.createdAt)} •{" "}
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>

                              <p className="text-gray-700">{comment.content}</p>
                            </div>
                            <div className="mt-2 ml-2 flex items-center gap-3">
                              {comment.user_id._id !== currentUserId && (
                                <button
                                  className="text-xs text-gray-500 hover:text-blue-600 transition-all flex items-center"
                                  onClick={() =>
                                    handleReply(
                                      formatName(comment.user_id.user_name),
                                      comment._id
                                    )
                                  }
                                >
                                  <span className="mr-1">↩️</span>{" "}
                                  {BUTTON_STRINGS.REPLY}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Replies */}
                        {Array.isArray(comment.replies) &&
                          comment.replies.length > 0 && (
                            <div className="ml-10 mt-3 pl-6 border-l-2 border-gray-100 group-hover:border-gray-300 transition-colors">
                              {comment.replies.map((reply, replyIndex) => (
                                <div
                                  key={reply._id || replyIndex}
                                  ref={(el) => {
                                    if (reply._id) {
                                      replyRefs.current[reply._id] = el;
                                    }
                                  }}
                                  className="flex gap-3 mt-3"
                                  id={`reply-${reply._id}`}
                                >
                                  <div className="flex-shrink-0">
                                    <img
                                      src={reply.user.avatar || profileImage}
                                      alt="Profile"
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
                                      <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="font-medium text-gray-900 text-sm">
                                          {formatName(reply.user.user_name)}
                                        </span>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                          {reply.user.role}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                          {formatTimeAgo(reply.createdAt)} •{" "}
                                          {formatDate(reply.createdAt)}
                                        </span>
                                      </div>
                                      <p className="text-gray-700 text-sm">
                                        {reply.content}
                                      </p>
                                    </div>
                                    <div className="mt-1 ml-2"></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-gray-500">
                    <FaComment className="text-gray-300 text-4xl mb-3" />
                    <p className="font-medium text-base">
                      {COMMENT_STRINGS.NO_COMMENTS}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {COMMENT_STRINGS.BE_FIRST}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination Component */}
              {comments && comments.length > commentsPerPage && (
                <div className="flex justify-center items-center mt-6 space-x-2 p-3 border-t rounded-b">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span className="mr-1">◀</span> Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`w-8 h-8 rounded text-xs transition-colors ${
                            currentPage === pageNumber
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-blue-600 hover:bg-blue-200"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Next <span className="ml-1">▶</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {/* Update Form Modal */}
      {showUpdatePopup && isDraft && displayData && (
        <UpdateClaimForm
          initialData={createInitialFormData(displayData)}
          readOnlyFields={["staffName"]}
          onClose={() => setShowUpdatePopup(false)}
          onSubmit={handleUpdateSubmit}
          claimId={id}
        />
      )}

      {/* Action Confirmation Modal */}
      {modalOpen && (
        <ClaimModal
          isOpen={modalOpen}
          onClose={closeModal}
          onConfirm={handleConfirm}
          actionType={actionType}
        />
      )}
    </div>
  );
};

export default ClaimDetail;
