import { all, call, put, takeLatest } from "redux-saga/effects";

import {
  GET_NOTIFICATIONS_REQUEST,
  GET_NOTIFICATIONS_SUCCESS,
  GET_NOTIFICATIONS_FAILURE,
  UPDATE_COMMENT_STATUS_REQUEST,
  UPDATE_COMMENT_STATUS_SUCCESS,
  UPDATE_COMMENT_STATUS_FAILURE,
  NAVIGATE_TO_CLAIM,
  FETCH_CLAIM_STATUS_REQUEST,
} from "../actions/notificationActions";

import api from "../api/apiUtils";

const transformClaimComments = (comments, currentUserId, roleName) => {
  const transformedNotifications = [];

  comments.forEach((comment) => {
    // Approver and Finance should only receive replies
    if (roleName === "Approver" || roleName === "Finance") {
      if (comment.type === "replies" && comment.user._id !== currentUserId) {
        transformedNotifications.push({
          _id: comment._id,
          type: "replies",
          claim_id: comment.claim_id,
          original_comment_id: comment.original_comment_id,
          content: comment.content,
          user_id: comment.user._id,
          user_name: comment.user.user_name,
          createdAt: comment.createdAt,
          status: comment.status,
          claim_status: comment.claim_status, // Make sure this is included in your API response
        });
      }
    } else {
      // Other users receive all relevant notifications

      // Handle "comments" type (user's own comments)
      if (comment.type === "comments" && comment.user._id === currentUserId) {
        transformedNotifications.push({
          _id: comment._id,
          type: "comments",
          claim_id: comment.claim_id,
          content: comment.content,
          user_id: comment.user._id,
          createdAt: comment.createdAt,
          status: comment.status,
          claim_status: comment.claim_status, // Make sure this is included in your API response
        });
      }

      // Handle "replies" type (replies to the user's comments)
      if (comment.type === "replies" && comment.user._id !== currentUserId) {
        transformedNotifications.push({
          _id: comment._id,
          type: "replies",
          claim_id: comment.claim_id,
          original_comment_id: comment.original_comment_id,
          content: comment.content,
          user_id: comment.user._id,
          user_name: comment.user.user_name,
          createdAt: comment.createdAt,
          status: comment.status,
          claim_status: comment.claim_status, // Make sure this is included in your API response
        });
      }

      // Handle "claims" type (when someone comments on the user's claim)
      if (comment.type === "claims" && comment.user._id !== currentUserId) {
        transformedNotifications.push({
          _id: comment._id,
          type: "claims",
          claim_id: comment.claim_id,
          content: comment.content,
          user_id: comment.user._id,
          user_name: comment.user.user_name,
          createdAt: comment.createdAt,
          status: comment.status,
          claim_status: comment.claim_status, // Make sure this is included in your API response
        });
      }
    }
  });

  // Sort notifications by most recent first
  return transformedNotifications.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};

function* handleUpdateCommentStatus(action) {
  try {
    const { commentId, status } = action.payload;
    const commentIds = Array.isArray(commentId) ? commentId : [commentId];
    const booleanStatus = status === "read" || status === true;

    const response = yield call(api.put, `comment/update`, {
      comment_ids: commentIds,
      status: booleanStatus,
    });

    const responseData = response?.data || response; // Handle Axios wrapping

    // ✅ Check if response is an array and contains updated comments
    if (Array.isArray(responseData) && responseData.length > 0) {
      yield put({
        type: UPDATE_COMMENT_STATUS_SUCCESS,
        payload: responseData,
      });
      return;
    }

    console.error("Unexpected Response Format:", responseData);
    throw new Error("Failed to update comment status");
  } catch (error) {
    console.error("Detailed Error updating comment status:", error);
    yield put({
      type: UPDATE_COMMENT_STATUS_FAILURE,
      payload: error.message,
    });
  }
}

function* handleGetNotifications() {
  try {
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    if (!user || !user._id) {
      yield put({ type: GET_NOTIFICATIONS_SUCCESS, payload: [] });
      return;
    }

    if (user.role_name === "Administrator") {
      yield put({ type: GET_NOTIFICATIONS_SUCCESS, payload: [] });
      return;
    }

    let notifications = [];

    // Fetch notifications from API
    const response = yield call(api.get, "comment");
    notifications = response.data || response;

    // Transform notifications based on user role
    const transformedNotifications = transformClaimComments(
      notifications,
      user._id,
      user.role_name
    );

    yield put({
      type: GET_NOTIFICATIONS_SUCCESS,
      payload: transformedNotifications,
    });
  } catch (error) {
    console.error("❌ Notification Fetch Saga Error:", error);
    yield put({
      type: GET_NOTIFICATIONS_FAILURE,
      payload: error.message,
    });
  }
}

// Updated handleFetchClaimStatus function with fixes
function* handleFetchClaimStatus(action) {
  try {
    const { claimId, userRole } = action.payload;

    if (!claimId) {
      console.error("❌ Missing claimId in fetchClaimStatus action!");
      throw new Error("Missing claim ID");
    }

    let response;
    try {
      response = yield call(api.get, `claim/${claimId}`);
    } catch (apiError) {
      console.error("❌ API call failed:", apiError);
      throw apiError;
    }

    const responseData = response.data || response;
    let claimStatus = "unknown";

    if (responseData && typeof responseData === "object") {
      if (responseData.status !== undefined) {
        // Check if status is an object and extract the appropriate property
        if (
          typeof responseData.status === "object" &&
          responseData.status !== null
        ) {
          // Extract the appropriate property - adjust based on your API structure
          // Common pattern might be status.code, status.value, status.name, etc.
          claimStatus =
            responseData.status.value ||
            responseData.status.code ||
            responseData.status.name ||
            responseData.status.status ||
            "unknown";
        } else {
          claimStatus = responseData.status;
        }
      } else if (responseData.claim?.status !== undefined) {
        // Apply the same object check for nested status
        if (
          typeof responseData.claim.status === "object" &&
          responseData.claim.status !== null
        ) {
          claimStatus =
            responseData.claim.status.value ||
            responseData.claim.status.code ||
            responseData.claim.status.name ||
            responseData.claim.status.status ||
            "unknown";
        } else {
          claimStatus = responseData.claim.status;
        }
      } else {
        console.error(
          "❌ Could not find claim status in response:",
          responseData
        );
      }
    } else {
      console.error("❌ Invalid response format:", responseData);
    }

    // Ensure claimStatus is a string and handle edge cases
    if (typeof claimStatus === "object") {
      claimStatus = JSON.stringify(claimStatus);
    }

    claimStatus = (claimStatus || "").toString().trim().toLowerCase();

    let navigatePath;
    switch (userRole) {
      case "Approver":
        navigatePath =
          claimStatus === "pending"
            ? `/approver/vetting/${claimId}`
            : `/approver/history/${claimId}`;
        break;
      case "Claimer":
        if (claimStatus === "pending") {
          navigatePath = `/claimer/pending/${claimId}`;
        } else if (claimStatus === "paid") {
          navigatePath = `/claimer/paid/${claimId}`; // New dedicated route for paid claims
        } else if (claimStatus === "approved") {
          navigatePath = `/claimer/approved/${claimId}`;
        } else if (claimStatus === "reject") {
          navigatePath = `/claimer/rejected/${claimId}`;
        } else if (claimStatus === "cancelled") {
          navigatePath = `/claimer/cancelled/${claimId}`;
        } else {
          // Default fallback
          navigatePath = `/claimer/create-claim`; // General fallback route
        }
        break;
      case "Finance":
        if (claimStatus === "approved") {
          navigatePath = `/finance/approved/${claimId}`;
        } else if (claimStatus === "paid") {
          navigatePath = `/finance/paid/${claimId}`;
        } else {
          // Default fallback for other statuses
          navigatePath = `/finance`;
        }
        break;
      default:
        navigatePath = "/";
    }

    yield put({ type: NAVIGATE_TO_CLAIM, payload: navigatePath });
  } catch (error) {
    console.error("❌ Error in handleFetchClaimStatus:", error);
    const defaultPath =
      action.payload.userRole === "Finance"
        ? "/finance"
        : action.payload.userRole === "Approver"
        ? "/approver"
        : "/claimer/create-claim";
    yield put({ type: NAVIGATE_TO_CLAIM, payload: defaultPath });
  }
}

export function* notificationSaga() {
  yield all([
    takeLatest(GET_NOTIFICATIONS_REQUEST, handleGetNotifications),
    takeLatest(UPDATE_COMMENT_STATUS_REQUEST, handleUpdateCommentStatus),
    takeLatest(FETCH_CLAIM_STATUS_REQUEST, handleFetchClaimStatus),
  ]);
}

export default notificationSaga;
