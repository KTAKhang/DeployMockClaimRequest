import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  FaReply,
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaProjectDiagram,
  FaClock,
  FaCalendarAlt,
  FaClipboard,
  FaExclamationCircle,
  FaComment,
  FaLock,
  FaCopy,
} from "react-icons/fa";
import ApproverModal from "../../../components/Modal/Modal.jsx";
import profileImage from "../../../assets/img/profile.png";
import { useDispatch, useSelector } from "react-redux";
import { removeProcessedClaims } from "../../../redux/actions/approverClaimActions.js";
import Loading from "../../../components/Loading/Loading.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  createCommentRequest,
  getCommentsRequest,
  replyCommentRequest,
  GET_COMMENTS_REQUEST,
} from "../../../redux/actions/commentAction.js";
import {
  UPDATE_CLAIM_STATUS_REQUEST,
  FETCH_CLAIM_DETAIL_REQUEST,
} from "../../../redux/actions/approverClaimActions.js";
// Import constants and strings
import {
  STATUS_STYLES,
  COMMENT_LOADING_TIMEOUT,
  EMPTY_COMMENTS_LOADING_TIMEOUT,
  TOAST_SETTINGS,
  ROUTES,
} from "./constants.js";
import {
  PAGE_TITLES,
  NAVIGATION,
  FORM,
  BUTTONS,
  COMMENTS,
  ERRORS,
  TOAST_MESSAGES,
} from "./strings";
import {
  formatTimeAgo,
  formatName,
  formatDate,
  getStatusColor,
} from "./utils.js";

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [mode, setMode] = useState(location.state?.mode || "vetting");

  const {
    claimDetail: claim,
    loading,
    error,
  } = useSelector((state) => state.claims);
  const currentUserId = useSelector((state) => state.auth?.user?._id);
  const currentUser = useSelector((state) => state.auth?.user);

  // Comments state
  const { comments, loadingComment, errorComment } = useSelector(
    (state) => state.comment
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [localReason, setLocalReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [reasonFocused, setReasonFocused] = useState(false);
  const [initialCommentsLoading, setInitialCommentsLoading] = useState(true);
  const [emptyCommentsLoading, setEmptyCommentsLoading] = useState(false);
  const [fetchingComments, setFetchingComments] = useState(false);
  const [replyTo, setReplyTo] = useState("");
  const [commentId, setCommentId] = useState(null);
  const [commentData, setCommentData] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isAddingReply, setIsAddingReply] = useState(false);
  const [lastActionType, setLastActionType] = useState(null); // "reply" or "comment"
  const [lastTargetId, setLastTargetId] = useState(null);
  const notificationTimeoutRef = useRef(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Refs for scrolling and focus
  const commentsContainerRef = useRef(null);
  const commentInputRef = useRef(null);
  const commentRefs = useRef({});
  const replyRefs = useRef({});
  const lastCommentRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [commentsPerPage] = useState(10);

  useEffect(() => {
    // Check if comments exists and is an array before using forEach
    if (Array.isArray(comments)) {
      // Keep only refs for existing comments
      const newCommentRefs = {};
      const newReplyRefs = {};

      comments.forEach((comment) => {
        if (commentRefs.current[comment._id]) {
          newCommentRefs[comment._id] = commentRefs.current[comment._id];
        }

        // Handle reply refs
        if (Array.isArray(comment.replies)) {
          comment.replies.forEach((reply) => {
            if (replyRefs.current[reply._id]) {
              newReplyRefs[reply._id] = replyRefs.current[reply._id];
            }
          });
        }
      });

      commentRefs.current = newCommentRefs;
      replyRefs.current = newReplyRefs;
    }
  }, [comments]);

  useEffect(() => {
    if (claim) {
      setLocalReason(claim.reason_approver || "");
    }
  }, [claim]);

  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    setMode(pathSegments.includes("history") ? "history" : "vetting");
  }, [location.pathname]);

  useEffect(() => {
    dispatch({
      type: FETCH_CLAIM_DETAIL_REQUEST,
      payload: { id, mode },
    });
  }, [dispatch, id, mode]);

  useEffect(() => {
    setInitialCommentsLoading(true);
    dispatch({ type: GET_COMMENTS_REQUEST, payload: id });

    const timer = setTimeout(() => {
      setInitialCommentsLoading(false);
    }, COMMENT_LOADING_TIMEOUT);

    return () => clearTimeout(timer); // Cleanup function
  }, [dispatch, id]);

  // Effect to handle scrolling based on action type
  // Modify useEffect for scrolling and comment handling
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
      }, EMPTY_COMMENTS_LOADING_TIMEOUT);
    }
  }, [loadingComment]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <Loading message={ERRORS.LOADING_ERROR} />
      </div>
    );

  if (error)
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
          <FaArrowLeft className="mr-2" /> {NAVIGATION.BACK}
        </button>
      </div>
    );

  if (!claim)
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-160px)]">
        <FaExclamationCircle className="text-red-500 text-4xl mb-4" />
        <div className="text-center text-red-500 font-bold text-lg">
          {ERRORS.CLAIM_NOT_FOUND}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
        >
          <FaArrowLeft className="mr-2" /> {NAVIGATION.BACK}
        </button>
      </div>
    );

  const handleCopyId = () => {
    navigator.clipboard
      .writeText(id)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      })
      .catch(() => {});
  };

  const handleOpenModal = (action) => {
    if (!localReason.trim()) {
      setReasonError(ERRORS.REASON_REQUIRED);
      return;
    }
    setReasonError("");
    setSelectedAction(action);
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    if (!selectedAction) return;

    const status = selectedAction === BUTTONS.APPROVE ? "Approved" : "Rejected";
    dispatch(removeProcessedClaims([id]));

    dispatch({
      type: UPDATE_CLAIM_STATUS_REQUEST,
      payload: {
        ids: [id],
        status,
        reason_approver: localReason,
      },
    });

    if (selectedAction === BUTTONS.APPROVE) {
      toast.success(TOAST_MESSAGES.APPROVE_SUCCESS, TOAST_SETTINGS);
      navigate(ROUTES.HISTORY_APPROVED);
    } else {
      toast.error(TOAST_MESSAGES.REJECT_MESSAGE, TOAST_SETTINGS);
      navigate(ROUTES.VETTING);
    }

    setIsModalOpen(false);
  };

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

  const handleKeyDown = (e) => {
    // Check if Enter key is pressed without Shift key
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default behavior (new line)
      handleSend(); // Call the send function
    }
  };

  // Modify the handleSend function to correctly set the lastActionType to "comment" when creating a new comment
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

  const statusStyle = getStatusColor(claim.status?.name, STATUS_STYLES);

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
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center hover:text-blue-600 transition-colors mr-2"
        >
          <FaArrowLeft className="mr-1 sm:mr-2" /> {NAVIGATION.BACK}
        </button>
        <span className="mx-1 sm:mx-2">|</span>
        <span>{NAVIGATION.PAGES}</span>
        <span className="mx-1 sm:mx-2">&gt;</span>
        <button
          className="hover:text-blue-600 transition-colors"
          onClick={() =>
            navigate(mode === "vetting" ? ROUTES.VETTING : ROUTES.HISTORY)
          }
        >
          {mode === "vetting" ? NAVIGATION.VETTING : NAVIGATION.HISTORY}
        </button>
        <span className="mx-1 sm:mx-2">&gt;</span>
        <span className="text-blue-600 font-semibold">
          {NAVIGATION.CLAIM_DETAILS}
        </span>
      </div>

      {/* Claim Details Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-3 sm:px-6 py-3 sm:py-4 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-lg sm:text-xl font-bold mb-2 sm:mb-0">
              {PAGE_TITLES.CLAIM_DETAIL}
            </h1>
            <div className="flex items-center">
              <span className="text-xs sm:text-sm opacity-80 mr-1 sm:mr-2">
                ID:
              </span>
              <div
                className="bg-white bg-opacity-20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm flex items-center group cursor-pointer hover:bg-opacity-30 transition-all"
                onClick={handleCopyId}
              >
                <span className="font-mono mr-2">{claim._id}</span>
                {isCopied ? (
                  <FaCheck className="text-green-400 group-hover:text-green-300 transition-colors" />
                ) : (
                  <FaCopy className="text-white opacity-70 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Section*/}
        <div className="p-3 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="relative">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img
                  src={claim.user?.avatar || profileImage}
                  alt="User Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className={`absolute bottom-1 right-1 w-5 h-5 sm:w-6 sm:h-6 ${statusStyle.bgColor} rounded-full border-2 border-white`}
              ></div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {claim.user?.user_name || "N/A"}
              </h2>
              <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-3 sm:gap-10 flex-wrap">
                <div className="flex flex-col sm:flex-row items-center sm:items-start w-full sm:w-auto">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <FaProjectDiagram className="text-blue-600" />
                  </div>
                  <div className="ml-0 sm:ml-2 text-center sm:text-left mt-1 sm:mt-0 w-full sm:w-auto">
                    <p className="text-xs text-gray-500">Project</p>
                    <p className="font-medium text-gray-800 text-sm">
                      {claim.project?.project_name || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start w-full sm:w-auto">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <FaClock className="text-green-600" />
                  </div>
                  <div className="ml-0 sm:ml-2 text-center sm:text-left mt-1 sm:mt-0 w-full sm:w-auto">
                    <p className="text-xs text-gray-500">Working Hours</p>
                    <p className="font-medium text-gray-800 text-sm">
                      {claim.total_no_of_hours
                        ? `${claim.total_no_of_hours} hrs`
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start w-full sm:w-auto">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                    <FaCalendarAlt className="text-purple-600" />
                  </div>
                  <div className="ml-0 sm:ml-2 text-center sm:text-left mt-1 sm:mt-0 w-full sm:w-auto">
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-medium text-gray-800 text-sm">
                      {claim.project?.duration?.from &&
                      claim.project?.duration?.to
                        ? `From ${formatDate(
                            claim.project.duration.from
                          )} To ${formatDate(claim.project.duration.to)}`
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start w-full sm:w-auto">
                  <div
                    className={`flex items-center justify-center w-8 h-8 ${statusStyle.lightBgColor} rounded-full`}
                  >
                    <FaClipboard className={statusStyle.iconColor} />
                  </div>
                  <div className="ml-0 sm:ml-2 text-center sm:text-left mt-1 sm:mt-0 w-full sm:w-auto">
                    <p className="text-xs text-gray-500">Status</p>
                    <p
                      className={`font-semibold text-sm ${statusStyle.textColor}`}
                    >
                      {claim.status?.name || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Claimer and Approver Reason Section - Side by side */}
        <div className="p-3 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
            {mode === "vetting" ? (
              <>
                <FaClipboard className="mr-2 text-blue-600" />
                {PAGE_TITLES.DECISION_REASON}
              </>
            ) : (
              <>
                <FaClipboard className="mr-2 text-blue-600" />
                {PAGE_TITLES.APPROVER_COMMENT}
              </>
            )}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Claimer's Reason Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <FaComment className="mr-2 text-gray-500" />
                {FORM.CLAIMER_REASON_LABEL}
              </h4>
              <div
                className="text-sm text-gray-700"
                style={{ minHeight: "100px" }}
              >
                {claim?.reason_claimer || COMMENTS.NO_CLAIMER_REASON}
              </div>
            </div>

            {/* Approver's Reason Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                {mode === "vetting" ? (
                  <>{FORM.YOUR_DECISION_LABEL}</>
                ) : (
                  <>
                    <FaComment className="mr-2 text-gray-500" />
                    {FORM.APPROVER_DECISION_LABEL}
                  </>
                )}
              </h4>
              {mode === "vetting" ? (
                <>
                  <textarea
                    className={`w-full border ${
                      reasonError
                        ? "border-red-400"
                        : reasonFocused
                        ? "border-blue-400"
                        : "border-gray-200"
                    } p-2 sm:p-4 rounded-lg bg-white shadow-sm resize-none transition-all focus:outline-none focus:ring-2 focus:ring-blue-200`}
                    style={{ minHeight: "100px" }}
                    placeholder={FORM.REASON_PLACEHOLDER}
                    value={localReason}
                    onChange={(e) => {
                      setLocalReason(e.target.value);
                      if (e.target.value.trim()) {
                        setReasonError("");
                      }
                    }}
                    onFocus={() => setReasonFocused(true)}
                    onBlur={() => setReasonFocused(false)}
                  />
                  {reasonError && (
                    <div className="text-red-500 text-xs sm:text-sm mt-2 flex items-center">
                      <FaExclamationCircle className="mr-1" />
                      {reasonError}
                    </div>
                  )}
                  {!reasonError && (
                    <p className="text-xs text-gray-500 mt-2">
                      {FORM.DECISION_HELP_TEXT}
                    </p>
                  )}
                </>
              ) : (
                <div
                  className="text-sm text-gray-700"
                  style={{ minHeight: "100px" }}
                >
                  {localReason || COMMENTS.NO_APPROVER_COMMENT}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end items-center gap-2 sm:gap-3">
          {mode === "vetting" && (
            <div className="flex w-full sm:w-auto gap-2 sm:gap-3">
              <button
                onClick={() => handleOpenModal("Reject")}
                className="flex-1 sm:flex-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors flex items-center justify-center"
              >
                <FaTimes className="mr-2" /> {BUTTONS.REJECT}
              </button>
              <button
                onClick={() => handleOpenModal("Approve")}
                className="flex-1 sm:flex-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors flex items-center justify-center"
              >
                <FaCheck className="mr-2" /> {BUTTONS.APPROVE}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section - GitHub style */}

      <div className="border-b rounded border-gray-200 bg-gray-50 px-4 py-3">
        <h3 className="text-base font-medium text-gray-700 flex items-center">
          <FaComment className="mr-2 text-gray-500" />
          {PAGE_TITLES.COMMENTS_HISTORY}
          <span className="ml-2 text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">
            {comments?.length || 0}
          </span>
        </h3>
      </div>

      <div className="flex flex-col">
        {/* Comment input */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          {claim.status?.name === "Paid" ? (
            <div className="flex items-center justify-center p-3 border bg-white rounded-lg">
              <FaLock className="text-gray-400 mr-2" />
              <span className="text-gray-500 text-sm">
                {COMMENTS.COMMENTS_LOCKED}
              </span>
            </div>
          ) : (
            <>
              {replyTo && (
                <div className="bg-blue-50 rounded-lg flex items-center justify-between p-3 mb-4 border border-blue-100">
                  <p className="text-blue-700 flex items-center text-sm">
                    <span className="mr-2">↩️</span> {COMMENTS.REPLYING_TO}{" "}
                    {replyTo}
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
                    placeholder={FORM.COMMENT_PLACEHOLDER}
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
                          {BUTTONS.SENDING}
                        </>
                      ) : (
                        <>{BUTTONS.SEND}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Comments List */}
        <div ref={commentsContainerRef} className="flex-1 overflow-y-auto p-4">
          {initialCommentsLoading || emptyCommentsLoading ? (
            <div className="flex justify-center items-center py-40">
              <Loading
                message={
                  emptyCommentsLoading
                    ? COMMENTS.ADDING_COMMENT
                    : COMMENTS.LOADING_COMMENTS
                }
              />
            </div>
          ) : comments && Array.isArray(comments) && comments.length > 0 ? (
            <div className="space-y-6">
              {currentComments.map((comment, index) => (
                <div
                  key={comment._id || `comment-${index}`}
                  className="comment-thread group border-b border-gray-100 pb-6 mb-6 last:border-0"
                  ref={
                    index === currentComments.length - 1 ? lastCommentRef : null
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
                        {comment.user_id._id !== currentUserId &&
                          claim.status?.name !== "Paid" && (
                            <button
                              className="text-xs text-gray-500 hover:text-blue-600 transition-all flex items-center"
                              onClick={() =>
                                handleReply(
                                  formatName(comment.user_id?.user_name),
                                  comment._id
                                )
                              }
                            >
                              <FaReply className="mr-1" /> {BUTTONS.REPLY}
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
              <p className="font-medium text-base">{COMMENTS.NO_COMMENTS}</p>
              <p className="text-sm text-gray-400 mt-1">{COMMENTS.BE_FIRST}</p>
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

      <ApproverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        actionType={selectedAction}
      />
    </div>
  );
}
