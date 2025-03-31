import { all, call, put, takeLatest } from "redux-saga/effects";

import {
  GET_NOTIFICATIONS_REQUEST,
  GET_NOTIFICATIONS_SUCCESS,
  GET_NOTIFICATIONS_FAILURE,
  UPDATE_COMMENT_STATUS_REQUEST,
  UPDATE_COMMENT_STATUS_SUCCESS,
  UPDATE_COMMENT_STATUS_FAILURE,
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

export function* notificationSaga() {
  yield all([
    takeLatest(GET_NOTIFICATIONS_REQUEST, handleGetNotifications),
    takeLatest(UPDATE_COMMENT_STATUS_REQUEST, handleUpdateCommentStatus),
  ]);
}

export default notificationSaga;
