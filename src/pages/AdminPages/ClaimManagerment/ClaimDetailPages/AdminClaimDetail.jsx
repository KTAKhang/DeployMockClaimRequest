import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  FaArrowLeft,
  FaProjectDiagram,
  FaClock,
  FaCalendarAlt,
  FaClipboard,
  FaExclamationCircle,
  FaComment,
  FaCopy,
  FaCheck,
  FaLock,
} from "react-icons/fa";
import profileImage from "../../../../assets/img/profile.png";
import { useDispatch, useSelector } from "react-redux";
import {
  FETCH_CLAIM_DETAIL_REQUEST,
} from "../../../../redux/actions/approverClaimActions.js";
import Loading from "../../../../components/Loading/Loading.jsx";
import {
  createCommentRequest,
  getCommentsRequest,
  replyCommentRequest,
} from "../../../../redux/actions/commentAction.js";
import { toast } from "react-hot-toast";

// Import from separated files
import {
  STATUS,
  VIEW_MODE,
  COMMENT_ACTIONS,
  LOADING_TIMEOUTS
} from "./constants";
import {
  PAGE_STRINGS,
  BUTTON_STRINGS,
  SECTION_HEADERS,
  COMMENT_STRINGS,
  ERROR_STRINGS,
  LOADING_STRINGS,
  REASON_STRINGS,
  FIELD_LABELS
} from "./strings";
import {
  getStatusColor,
  getStatusTextColor,
  formatDate,
  formatTimeAgo,
  formatName,
  getImageSrc
} from "./utils";

export default function AdminClaimDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Thay đổi mode mặc định thành 'admin'
  const [mode, setMode] = useState(location.state?.mode || VIEW_MODE.ADMIN);
  const {
    claimDetail: claim,
    loading,
    error,
  } = useSelector((state) => state.claims);
  const [localReason, setLocalReason] = useState("");
  const [reasonFocused, setReasonFocused] = useState(false);
  const [initialCommentsLoading, setInitialCommentsLoading] = useState(true);
  const [emptyCommentsLoading, setEmptyCommentsLoading] = useState(false);
  const [fetchingComments, setFetchingComments] = useState(false);

  const currentUserId = useSelector((state) => state.auth?.user?._id);
  // Comments state
  const { comments, loadingComment, errorComment } = useSelector(
    (state) => state.comment
  );
  const [replyTo, setReplyTo] = useState("");
  const [commentId, setCommentId] = useState(null);
  const [commentData, setCommentData] = useState("");

  // Refs for scrolling and focus
  const commentsContainerRef = useRef(null);
  const commentInputRef = useRef(null);
  const commentRefs = useRef({});
  const replyRefs = useRef({});
  const lastCommentRef = useRef(null);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isAddingReply, setIsAddingReply] = useState(false);

  const [lastActionType, setLastActionType] = useState(null); // "reply" or "comment"
  const [lastTargetId, setLastTargetId] = useState(null);

  // Thêm state để theo dõi trạng thái copy
  const [isCopied, setIsCopied] = useState(false);

  // Thêm sau phần khai báo state hiện tại
  const [currentPage, setCurrentPage] = useState(1);
  const [commentsPerPage] = useState(10);
  const currentUser = useSelector((state) => state.auth?.user);

  // Các useEffect giữ nguyên như file Detail.jsx
  useEffect(() => {
    if (Array.isArray(comments)) {
      const newCommentRefs = {};
      const newReplyRefs = {};

      comments.forEach((comment) => {
        if (commentRefs.current[comment._id]) {
          newCommentRefs[comment._id] = commentRefs.current[comment._id];
        }

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

  // Thay đổi để sử dụng đường dẫn admin thay vì approver
  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    setMode(VIEW_MODE.ADMIN);
  }, [location.pathname]);

  useEffect(() => {
    dispatch({ type: FETCH_CLAIM_DETAIL_REQUEST, payload: { id, mode } });
  }, [dispatch, id, mode]);

  useEffect(() => {
    setInitialCommentsLoading(true);
    dispatch({ type: "GET_COMMENTS_REQUEST", payload: id });

    const timer = setTimeout(() => {
      setInitialCommentsLoading(false);
    }, LOADING_TIMEOUTS.COMMENTS);

    return () => clearTimeout(timer);
  }, [dispatch, id]);

  // Các useEffect khác giữ nguyên

  // Các hàm xử lý comments giữ nguyên
  useEffect(() => {
    if (!loadingComment) {
      if (emptyCommentsLoading) {
        setFetchingComments(true);
        dispatch(getCommentsRequest(id));
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
        } else if (isAddingComment && lastCommentRef.current) {
          lastCommentRef.current.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
          setIsAddingComment(false);
        } else if (
          lastActionType === COMMENT_ACTIONS.REPLY &&
          lastTargetId &&
          commentRefs.current[lastTargetId]
        ) {
          commentRefs.current[lastTargetId].scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
          setLastActionType(null);
          setLastTargetId(null);
        } else if (lastActionType === COMMENT_ACTIONS.ADD && lastCommentRef.current) {
          lastCommentRef.current.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
          setLastActionType(null);
        }
      }
    }
  }, [
    comments,
    loadingComment,
    isAddingComment,
    isAddingReply,
    lastTargetId,
    lastActionType,
    emptyCommentsLoading,
    dispatch,
    id,
  ]);

  useEffect(() => {
    if (!loadingComment) {
      setFetchingComments(false);
      setTimeout(() => {
        setEmptyCommentsLoading(false);
      }, 2000);
    }
  }, [loadingComment]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <Loading message={LOADING_STRINGS.CLAIM_DETAILS} />
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
          <FaArrowLeft className="mr-2" /> Go Back
        </button>
      </div>
    );

  if (!claim)
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-160px)]">
        <FaExclamationCircle className="text-red-500 text-4xl mb-4" />
        <div className="text-center text-red-500 font-bold text-lg">
          Claim Not Found
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Go Back
        </button>
      </div>
    );

  // Loại bỏ các hàm xử lý Approve/Reject không cần thiết cho admin
  // Admin chỉ xem, không phê duyệt

  const handleReply = (username, id) => {
    setReplyTo(`@${username} `);
    setCommentId(id);

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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (commentData.trim() === "") return;

    const targetCommentId = commentId;
    const isFirstComment =
      !commentId && (!Array.isArray(comments) || comments.length === 0);

    if (commentId) {
      setIsAddingReply(true);
      dispatch(
        replyCommentRequest({ content: commentData, comment_id: commentId })
      );
      setLastTargetId(targetCommentId);
    } else {
      setIsAddingComment(true);
      if (isFirstComment) {
        setEmptyCommentsLoading(true);
      }
      dispatch(createCommentRequest({ content: commentData, claim_id: id }));
    }

    setCommentData("");
    setReplyTo("");
    setCommentId(null);
    setLastActionType(null);
  };

  // Hàm xử lý copy ID
  const handleCopyId = () => {
    navigator.clipboard.writeText(id)
      .then(() => {
        setIsCopied(true);
        toast.success(TOAST_STRINGS.COPY_SUCCESS);
        setTimeout(() => {
          setIsCopied(false);
        }, NOTIFICATION_DURATION.SHORT);
      })
      .catch(() => {
        toast.error(TOAST_STRINGS.COPY_FAIL);
      });
  };

  // Pagination logic
  const reversedComments = Array.isArray(comments) ? [...comments].reverse() : [];
  const currentComments = reversedComments.slice(
    (currentPage - 1) * commentsPerPage,
    currentPage * commentsPerPage
  );

  const totalPages = Array.isArray(comments) && comments.length > 0
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
          <FaArrowLeft className="mr-1 sm:mr-2" /> {BUTTON_STRINGS.BACK}
        </button>
        <span className="mx-1 sm:mx-2">|</span>
        <button
          className="hover:text-blue-600 transition-colors"
          onClick={() => navigate("/admin/claim-management")}
        >
          Claim Management
        </button>
        <span className="mx-1 sm:mx-2">&gt;</span>
        <span className="text-blue-600 font-semibold">
          Claim Details
        </span>
      </div>

      {/* Claim Details Card - Giữ nguyên */}
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

        {/* User Profile Section */}
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
                className={`absolute bottom-1 right-1 w-5 h-5 sm:w-6 sm:h-6 ${getStatusColor(
                  claim.status?.name
                )} rounded-full border-2 border-white`}
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
                    <p className="text-xs text-gray-500">{FIELD_LABELS.PROJECT}</p>
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
                    <p className="text-xs text-gray-500">{FIELD_LABELS.WORKING_HOURS}</p>
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
                    <p className="text-xs text-gray-500">{FIELD_LABELS.DURATION}</p>
                    <p className="font-medium text-gray-800 text-sm">
                      {claim.from && claim.to
                        ? `From ${formatDate(claim.from)} To ${formatDate(claim.to)}`
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start w-full sm:w-auto">
                  <div
                    className={`flex items-center justify-center w-8 h-8 ${getStatusColor(
                      claim.status?.name
                    ).replace("bg-", "bg-").replace("500", "100")} rounded-full`}
                  >
                    <FaClipboard
                      className={getStatusColor(claim.status?.name)
                        .replace("bg-", "text-").replace("500", "600")}
                    />
                  </div>
                  <div className="ml-0 sm:ml-2 text-center sm:text-left mt-1 sm:mt-0 w-full sm:w-auto">
                    <p className="text-xs text-gray-500">{FIELD_LABELS.STATUS}</p>
                    <p
                      className={`font-semibold text-sm ${getStatusTextColor(
                        claim.status?.name
                      )}`}
                    >
                      {claim.status?.name || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


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

            {/* Approver's Reason Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <FaComment className="mr-2 text-gray-500" />
                {SECTION_HEADERS.DECISION_REASON_TITLE}
              </h4>
              <div className="text-sm text-gray-600">
                {localReason || REASON_STRINGS.NO_DECISION_REASON}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
      </div>


      <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6">
        {/* Header */}
        <div className="border-b rounded border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="text-base font-medium text-gray-700 flex items-center">
            <FaComment className="mr-2 text-gray-500" />
            {SECTION_HEADERS.COMMENTS_HISTORY}
            <span className="ml-2 text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">
              {Array.isArray(comments) ? comments.length : 0}
            </span>
          </h3>
        </div>

        <div className="flex flex-col">
          {/* Comment input area với thông báo khóa */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            {claim.status?.name === "Reject" || claim.status?.name === "Cancel" || claim.status?.name === "Draft" ? (
              <div className="flex items-center justify-center p-3 border bg-white rounded-lg">
                <FaLock className="text-gray-400 mr-2" />
                <span className="text-gray-500 text-sm">
                  Comments are not available for {claim.status?.name} claims
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center p-3 border bg-white rounded-lg">
                <FaLock className="text-gray-400 mr-2" />
                <span className="text-gray-500 text-sm">
                  Comments are not available in admin view
                </span>
              </div>
            )}
          </div>

          {/* Comments List */}
          <div ref={commentsContainerRef} className="flex-1 overflow-y-auto p-4">
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
            ) : Array.isArray(comments) && comments.length > 0 ? (
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
                              <span className="mr-1">↩️</span> {BUTTON_STRINGS.REPLY}
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
                <p className="font-medium text-base">{COMMENT_STRINGS.NO_COMMENTS}</p>
                <p className="text-sm text-gray-400 mt-1">{COMMENT_STRINGS.BE_FIRST}</p>
              </div>
            )}
          </div>

          {/* Pagination Component */}
          {Array.isArray(comments) && comments.length > commentsPerPage && (
            <div className="flex justify-center items-center my-4 space-x-2 p-3 border-t rounded-b">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center ${currentPage === 1
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
                      className={`w-8 h-8 rounded text-xs transition-colors ${currentPage === pageNumber
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
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center ${currentPage === totalPages
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
    </div>
  );
}
