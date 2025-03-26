// Action Types
export const GET_NOTIFICATIONS_REQUEST = "GET_NOTIFICATIONS_REQUEST";
export const GET_NOTIFICATIONS_SUCCESS = "GET_NOTIFICATIONS_SUCCESS";
export const GET_NOTIFICATIONS_FAILURE = "GET_NOTIFICATIONS_FAILURE";
export const CREATE_COMMENT_SUCCESS = "CREATE_COMMENT_SUCCESS";
export const REPLY_COMMENT_SUCCESS = "REPLY_COMMENT_SUCCESS";

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

export const createCommentSuccess = (commentData) => ({
  type: CREATE_COMMENT_SUCCESS,
  payload: commentData,
});

export const replyCommentSuccess = (replyData) => ({
  type: REPLY_COMMENT_SUCCESS,
  payload: replyData,
});
