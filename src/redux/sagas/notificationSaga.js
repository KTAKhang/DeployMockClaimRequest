import { all, call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";

import {
  GET_NOTIFICATIONS_REQUEST,
  GET_NOTIFICATIONS_SUCCESS,
  GET_NOTIFICATIONS_FAILURE,
} from "../actions/notificationActions";

import api from "../api/apiUtils";

const transformClaimComments = (comments, currentUserId, currentUserRole) => {
  const transformedNotifications = [];

  comments.forEach((comment) => {
    // Claimer specific: track new comments on their claims
    if (currentUserRole === "Claimer") {
      // Check if the comment is not made by the current user
      if (comment.user_id !== currentUserId) {
        transformedNotifications.push({
          _id: comment._id,
          type: "new_comment",
          claim_id: comment.claim_id,
          content: `New comment: ${comment.content}`,
          user_id: comment.user_id,
          createdAt: comment.createdAt,
        });
      }
    }

    // For Approver and Finance: track comment replies
    if (["Approver", "Finance"].includes(currentUserRole)) {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach((reply) => {
          // Only add notification if reply is not by current user
          if (reply.user._id !== currentUserId) {
            transformedNotifications.push({
              _id: reply._id,
              type: "comment_reply",
              claim_id: comment.claim_id,
              original_comment_id: comment._id,
              content: `Replied to your comment: ${reply.content}`,
              user_id: reply.user._id,
              user_name: reply.user.user_name,
              createdAt: reply.createdAt,
            });
          }
        });
      }
    }
  });

  // Sort notifications by most recent first
  return transformedNotifications.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};

function* handleGetNotifications() {
  try {
    console.group("📡 Notification Fetch Process");

    // Get current user from localStorage
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;

    if (!user || !user._id) {
      console.warn("No valid user found. Skipping notification fetch.");
      console.groupEnd();
      yield put({
        type: GET_NOTIFICATIONS_SUCCESS,
        payload: [],
      });
      return;
    }

    // Fetch user's claims for Claimers
    let claimComments = [];
    if (user.role_name === "Claimer") {
      try {
        // Fetch all claims for the current user
        const userClaimsResponse = yield call(api.get, "/claim");

        // Ensure userClaims is an array and filter for Pending and Approved claims
        const userClaims = (
          Array.isArray(userClaimsResponse)
            ? userClaimsResponse
            : userClaimsResponse.data || userClaimsResponse.claims || []
        ).filter(
          (claim) => claim.status === "Pending" || claim.status === "Approved"
        );

        // Fetch comments for each claim
        const claimCommentsPromises = userClaims.map((claim) =>
          call(api.get, `comment/${claim._id || claim.id}`)
        );

        // Resolve all claim comments
        const claimCommentsResults = yield all(claimCommentsPromises);

        // Flatten the comments from all claims
        claimComments = claimCommentsResults
          .flat()
          .filter((comment) => comment);
      } catch (error) {
        console.error("Error fetching claim comments:", error);
        claimComments = [];
      }
    } else {
      // For other roles, fetch general comments
      claimComments = yield call(api.get, "comment");
    }

    // Transform notifications based on user role
    const transformedNotifications = transformClaimComments(
      claimComments,
      user._id,
      user.role_name
    );

    console.groupEnd();

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
    toast.error("Failed to fetch notifications");
  }
}

export function* notificationSaga() {
  yield all([takeLatest(GET_NOTIFICATIONS_REQUEST, handleGetNotifications)]);
}

export default notificationSaga;
