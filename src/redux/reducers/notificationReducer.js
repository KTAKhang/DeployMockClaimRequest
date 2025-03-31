import {
  GET_NOTIFICATIONS_REQUEST,
  GET_NOTIFICATIONS_SUCCESS,
  GET_NOTIFICATIONS_FAILURE,
  UPDATE_COMMENT_STATUS_REQUEST,
  UPDATE_COMMENT_STATUS_SUCCESS,
  UPDATE_COMMENT_STATUS_FAILURE,
} from "../actions/notificationActions";

// Initial state for notifications
const initialState = {
  notifications: [],
  loading: false,
  error: null,
  updatingCommentStatus: false,
  updateCommentStatusError: null,
};

export const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_NOTIFICATIONS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        notifications: action.payload,
        loading: false,
        error: null,
      };

    case GET_NOTIFICATIONS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case UPDATE_COMMENT_STATUS_REQUEST:
      return {
        ...state,
        updatingCommentStatus: true,
        updateCommentStatusError: null,
      };

    case UPDATE_COMMENT_STATUS_SUCCESS:
      // Update the status of the specific notification in the list
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification._id === action.payload.commentId
            ? { ...notification, status: action.payload.status }
            : notification
        ),
        updatingCommentStatus: false,
        updateCommentStatusError: null,
      };

    case UPDATE_COMMENT_STATUS_FAILURE:
      return {
        ...state,
        updatingCommentStatus: false,
        updateCommentStatusError: action.payload,
      };

    default:
      return state;
  }
};

export default notificationReducer;
