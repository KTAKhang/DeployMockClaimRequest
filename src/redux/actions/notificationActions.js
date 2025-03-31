// Action Types
export const GET_NOTIFICATIONS_REQUEST = "GET_NOTIFICATIONS_REQUEST";
export const GET_NOTIFICATIONS_SUCCESS = "GET_NOTIFICATIONS_SUCCESS";
export const GET_NOTIFICATIONS_FAILURE = "GET_NOTIFICATIONS_FAILURE";

export const UPDATE_COMMENT_STATUS_REQUEST = "UPDATE_COMMENT_STATUS_REQUEST";
export const UPDATE_COMMENT_STATUS_SUCCESS = "UPDATE_COMMENT_STATUS_SUCCESS";
export const UPDATE_COMMENT_STATUS_FAILURE = "UPDATE_COMMENT_STATUS_FAILURE";

// Action Creators
export const getNotificationsRequest = () => ({
  type: GET_NOTIFICATIONS_REQUEST,
});

export const getNotificationsSuccess = (notifications) => ({
  type: GET_NOTIFICATIONS_SUCCESS,
  payload: notifications,
});

export const getNotificationsFailure = (error) => ({
  type: GET_NOTIFICATIONS_FAILURE,
  payload: error,
});

export const updateCommentStatusRequest = (commentId, status) => ({
  type: UPDATE_COMMENT_STATUS_REQUEST,
  payload: { commentId, status: status === "read" ? true : status },
});

export const updateCommentStatusSuccess = (commentId, status) => ({
  type: UPDATE_COMMENT_STATUS_SUCCESS,
  payload: { commentId, status },
});

export const updateCommentStatusFailure = (error) => ({
  type: UPDATE_COMMENT_STATUS_FAILURE,
  payload: error,
});
