import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import profileImage from "../../../assets/img/profile.png";
import {
  FaReply,
  FaExclamationCircle,
  FaArrowLeft,
  FaComment,
  FaLock,
  FaClock,
  FaCalendarAlt,
  FaClipboard,
  FaCheck,
  FaFileAlt,
  FaCopy,
} from "react-icons/fa";
import {
  fetchClaimsRequest,
  financeFetchDetailRequest,
  financeUpdateClaimStatusRequest,
  resetIsPaidStatus,
} from "../../../redux/actions/financeAction";
import {
  getCommentsRequest,
  createCommentRequest,
  replyCommentRequest,
} from "../../../redux/actions/commentAction";

import { toast } from "react-toastify";
import Loading from "../../../components/Loading/Loading";
import Modal from "../../../components/Modal/Modal";
import { STATUS_COLORS, LOCKED_STATUSES, ROUTES } from "./constants.js";
import { MESSAGES, LABELS, PLACEHOLDERS, DATA, BUTTON, ROLES } from "./strings";
import {
  formatDate,
  formatName,
  formatTimeAgo,
  getStatusBgColor,
  getStatusColor,
} from "./utils.js";
const FinanceDetailPage = () => {
  // Hooks
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Refs for comment interactions
  const commentRefs = useRef({});
  const replyRefs = useRef({});
  const lastCommentRef = useRef(null);
  const commentsContainerRef = useRef(null);
  const commentInputRef = useRef(null);

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [localClaimDetail, setLocalClaimDetail] = useState(null);
  const [replyTo, setReplyTo] = useState("");
  const [commentId, setCommentId] = useState(null);
  const [commentData, setCommentData] = useState("");
  const [initialCommentsLoading, setInitialCommentsLoading] = useState(true);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isAddingReply, setIsAddingReply] = useState(false);
  const [emptyCommentsLoading, setEmptyCommentsLoading] = useState(false);
  const [lastActionType, setLastActionType] = useState(null);
  const [lastTargetId, setLastTargetId] = useState(null);
  const [fetchingComments, setFetchingComments] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const notificationTimeoutRef = useRef(null);
  const [showNotification, setShowNotification] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [commentsPerPage] = useState(5);
  // Get states from Redux
  const {
    claimDetail: claim,
    loading,
    error,
    updateClaimSuccess,
    updateClaimLoading,
  } = useSelector((state) => state.finance);

  const { comments, loadingComment, errorComment } = useSelector(
    (state) => state.comment
  );

  // Get current user ID for checking comment ownership
  const currentUserId = JSON.parse(localStorage.getItem("user"))?._id;

  // Fetch claim detail when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(financeFetchDetailRequest(id));
    }
  }, [dispatch, id]);

  // Update localClaimDetail when claimDetail changes
  useEffect(() => {
    if (claim) {
      setLocalClaimDetail(claim);
      // Fetch comments for this claim
      dispatch(getCommentsRequest(id));
    }
  }, [claim, dispatch, id]);

  // Initial comments loading with timeout
  useEffect(() => {
    setInitialCommentsLoading(true);
    dispatch(getCommentsRequest(id));

    const timer = setTimeout(() => {
      setInitialCommentsLoading(false);
    }, 5000);

    return () => clearTimeout(timer); // Cleanup function
  }, [dispatch, id]);

  // Handle successful updates
  useEffect(() => {
    if (updateClaimSuccess) {
      // Reset state after closing popup
      setTimeout(() => {
        dispatch(resetIsPaidStatus());
      }, 500);
    }
  }, [updateClaimSuccess, dispatch]);

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetIsPaidStatus());
    };
  }, [dispatch]);

  // Handle comment loading states
  useEffect(() => {
    if (!loadingComment) {
      setFetchingComments(false);

      // Introduce slight delay before setting emptyCommentsLoading to false
      setTimeout(() => {
        setEmptyCommentsLoading(false);
      }, 2000);
    }
  }, [loadingComment]);

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

  // Handler functions
  const handleOpenModal = (action) => {
    setSelectedAction(action);
    setIsModalOpen(true);
  };

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

  const handleConfirm = () => {
    if (!selectedAction) return;

    dispatch(financeUpdateClaimStatusRequest([id], "Paid"));

    toast.success(MESSAGES.PAYMENT_SUCCESS, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });

    setIsModalOpen(false);
    navigate("/finance/approved");

    setTimeout(() => {
      dispatch(fetchClaimsRequest({}));
    }, 1500);
  };

  const handleNavigate = (status) => {
    let path;
    switch (status) {
      case "Approved":
        path = ROUTES.APPROVED;
        break;
      default:
        path = ROUTES.PAID;
    }
    navigate(path);
  };

  // Handle key down events in the comment input
  const handleKeyDown = (e) => {
    // Check if Enter key is pressed without Shift key
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default behavior (new line)
      handleSend(); // Call the send function
    }
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

  // Display loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <Loading message={MESSAGES.LOADING_DETAILS} />
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
          <FaArrowLeft className="mr-2" /> {BUTTON.GO_BACK}
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
          {MESSAGES.CLAIM_NOT_FOUND}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
        >
          <FaArrowLeft className="mr-2" /> {BUTTON.GO_BACK}
        </button>
      </div>
    );
  }
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

  // Use localClaimDetail if available, otherwise use claim
  const displayData = localClaimDetail || claim;
  const currentStatus = displayData.status?.name || "N/A";

  const detailFields = [
    { label: LABELS.STAFF_NAME, value: displayData.user?.user_name || "N/A" },
    {
      label: LABELS.PROJECT_NAME,
      value: displayData.project?.project_name || "N/A",
    },
    {
      label: LABELS.PROJECT_DURATION,
      value:
        displayData.project?.duration?.from && displayData.project?.duration?.to
          ? `From ${displayData.project.duration.from.split("T")[0]} To ${
              displayData.project.duration.to.split("T")[0]
            }`
          : "N/A",
    },
    {
      label: LABELS.TOTAL_WORKING_HOURS,
      value: displayData.total_no_of_hours
        ? `${displayData.total_no_of_hours} ${LABELS.HOURS}`
        : "N/A",
    },
  ];

  // Render the main component
  return (
    <div className="px-2 sm:px-4 py-4 sm:py-6 min-h-screen max-w-full overflow-x-hidden">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center hover:text-blue-600 transition-colors mr-2"
        >
          <FaArrowLeft className="mr-1 sm:mr-2" /> {BUTTON.BACK}
        </button>
        <span className="mx-1 sm:mx-2">|</span>
        <span>Claim</span>
        <span className="mx-1 sm:mx-2">&gt;</span>
        <button
          className="hover:text-blue-600 transition-colors"
          onClick={() => navigate(`/finance/${currentStatus}`)}
        >
          {currentStatus}
        </button>
        <span className="mx-1 sm:mx-2">&gt;</span>
        <span className="text-blue-600 font-semibold">
          {LABELS.CLAIM_DETAILS}
        </span>
      </div>

      {/* Claim Details Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-3 sm:px-6 py-3 sm:py-4 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-lg sm:text-xl font-bold mb-2 sm:mb-0">
              {LABELS.CLAIM_DETAILS_INFO}
            </h1>
            <div className="flex items-center">
              <span className="text-xs sm:text-sm opacity-80 mr-1 sm:mr-2">
                {LABELS.ID}
              </span>
              <div
                className="bg-white bg-opacity-20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm flex items-center group cursor-pointer hover:bg-opacity-30 transition-all"
                onClick={handleCopyId}
              >
                <span className="font-mono mr-2">{displayData._id}</span>
                {isCopied ? (
                  <FaCheck className="text-green-400 group-hover:text-green-300 transition-colors" />
                ) : (
                  <FaCopy className="text-white opacity-70 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-3 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="relative">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img
                  src={displayData.user?.avatar || profileImage}
                  alt={LABELS.USER_PROFILE}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = profileImage;
                  }}
                />
              </div>
              <div
                className={`absolute bottom-1 right-1 w-5 h-5 sm:w-6 sm:h-6 bg-${getStatusBgColor(
                  currentStatus
                )}-500 rounded-full border-2 border-white`}
              ></div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {displayData.user?.user_name || ROLES.DEFAULT}
              </h2>
              <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-3 sm:gap-10 flex-wrap">
                <div className="flex flex-col sm:flex-row items-center sm:items-start w-full sm:w-auto">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <FaClipboard className="text-blue-600" />
                  </div>
                  <div className="ml-0 sm:ml-2 text-center sm:text-left mt-1 sm:mt-0 w-full sm:w-auto">
                    <p className="text-xs text-gray-500">{LABELS.PROJECT}</p>
                    <p className="font-medium text-gray-800 text-sm">
                      {detailFields[1].value}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start w-full sm:w-auto">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <FaClock className="text-green-600" />
                  </div>
                  <div className="ml-0 sm:ml-2 text-center sm:text-left mt-1 sm:mt-0 w-full sm:w-auto">
                    <p className="text-xs text-gray-500">
                      {LABELS.WORKING_HOURS}
                    </p>
                    <p className="font-medium text-gray-800 text-sm">
                      {detailFields[3].value}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start w-full sm:w-auto">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                    <FaCalendarAlt className="text-purple-600" />
                  </div>
                  <div className="ml-0 sm:ml-2 text-center sm:text-left mt-1 sm:mt-0 w-full sm:w-auto">
                    <p className="text-xs text-gray-500">{LABELS.DURATION}</p>
                    <p className="font-medium text-gray-800 text-sm">
                      {detailFields[2].value}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start w-full sm:w-auto">
                  <div
                    className={`flex items-center justify-center w-8 h-8 bg-${getStatusBgColor(
                      currentStatus
                    )}-100 rounded-full`}
                  >
                    <FaClipboard className={getStatusColor(currentStatus)} />
                  </div>
                  <div className="ml-0 sm:ml-2 text-center sm:text-left mt-1 sm:mt-0 w-full sm:w-auto">
                    <p className="text-xs text-gray-500">{DATA.STATUS}</p>
                    <p
                      className={`font-semibold text-sm ${getStatusColor(
                        currentStatus
                      )}`}
                    >
                      {currentStatus}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reason/Decision Section - Right column on larger screens */}
        <div className="p-3 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
            <FaClipboard className="mr-2 text-blue-600" />
            {LABELS.DR}
          </h3>

          {/* Claimer's Reason Section - Always shown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaComment className="mr-2 text-gray-500" />
                {LABELS.CLAIMER_REASON}
              </h4>
              <div
                className="text-sm text-gray-700"
                style={{ minHeight: "100px" }}
              >
                {claim?.reason_claimer || MESSAGES.NO_REASON_CLAIMER}
              </div>
            </div>

            {/* Approver's Reason Section - Always shown */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaComment className="mr-2 text-gray-500" />
                {LABELS.DECISION_REASON}
              </h4>
              <div
                className="text-sm text-gray-700"
                style={{ minHeight: "100px" }}
              >
                {displayData.reason_approver || MESSAGES.NO_DECISION_REASON}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end items-center gap-2 sm:gap-3">
          {currentStatus === "Approved" && (
            <button
              onClick={() => handleOpenModal("Paid")}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors flex items-center justify-center"
            >
              <FaCheck className="mr-2" /> {BUTTON.MARK_AS_PAID}
            </button>
          )}
        </div>
        {/* Comments Section */}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirm}
          actionType={selectedAction}
        />
      </div>

      <div className="border-b rounded border-gray-200 bg-gray-50 px-4 py-3">
        <h3 className="text-base font-medium text-gray-700 flex items-center">
          <FaComment className="mr-2 text-gray-500" />
          {LABELS.COMMENTS_HISTORY}
          <span className="ml-2 text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">
            {comments?.length || 0}
          </span>
        </h3>
      </div>

      <div className="flex flex-col">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          {/* Comment input */}
          {currentStatus?.toLowerCase() === "paid" ? (
            <div className="flex items-center justify-center p-3 border bg-white rounded-lg">
              <FaLock className="text-gray-400 mr-2" />
              <span className="text-gray-500 text-sm">
                {MESSAGES.COMMENTS_LOCKED}
              </span>
            </div>
          ) : (
            <>
              {replyTo && (
                <div className="bg-blue-50 rounded-lg flex items-center justify-between p-2 mb-3 border border-blue-100">
                  <p className="text-blue-700 text-xs flex items-center">
                    <span className="mr-1">↩️</span> {LABELS.REPLYING_TO}{" "}
                    {replyTo}
                  </p>
                  <button
                    onClick={() => {
                      setReplyTo("");
                      setCommentId(null);
                    }}
                    className="ml-2 text-gray-500 hover:text-gray-700 text-xs bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    ✖️
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <div className="flex-1 rounded-lg border border-gray-200 overflow-hidden">
                  <textarea
                    ref={commentInputRef}
                    className="w-full bg-white p-3 text-sm focus:outline-none resize-none rounded-t-lg min-h-[100px]"
                    placeholder={PLACEHOLDERS.COMMENT_INPUT}
                    value={commentData}
                    onChange={(e) => setCommentData(e.target.value)}
                    onKeyDown={handleKeyDown}
                  ></textarea>

                  <div className="bg-gray-50 p-3 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={handleSend}
                      disabled={loadingComment || !commentData.trim()}
                      className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-medium text-xs sm:text-sm text-white flex items-center ${
                        loadingComment || !commentData.trim()
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600"
                      } transition-colors shadow-sm`}
                    >
                      {loadingComment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          {BUTTON.SENDING}
                        </>
                      ) : (
                        <>{BUTTON.SEND}</>
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
                    ? MESSAGES.ADDING_COMMENT
                    : MESSAGES.LOADING_COMMENTS
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
                        alt={MESSAGES.PROFILE}
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
                          currentStatus?.toLowerCase() !== "paid" && (
                            <button
                              className="text-xs text-gray-500 hover:text-blue-600 transition-all flex items-center"
                              onClick={() =>
                                handleReply(
                                  formatName(comment.user_id.user_name),
                                  comment._id
                                )
                              }
                            >
                              <FaReply className="mr-1" /> {BUTTON.REPLY}
                            </button>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Render replies */}
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
                                src={reply.user?.avatar || profileImage}
                                alt={MESSAGES.PROFILE}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <span className="font-medium text-gray-900 text-sm">
                                    {formatName(
                                      reply.user?.user_name || ROLES.DEFAULT
                                    )}
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
              <p className="font-medium text-base">{MESSAGES.NO_COMMENTS}</p>
              <p className="text-sm text-gray-400 mt-1">
                {MESSAGES.FIRST_COMMENT_PROMPT}
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
    </div>
  );
};

export default FinanceDetailPage;
