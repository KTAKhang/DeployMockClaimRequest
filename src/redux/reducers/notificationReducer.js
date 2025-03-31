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
      return {
        ...state,
        notifications: state.notifications.map((notification) => {
          // Check if this notification is in the updated list
          const updatedNotification = action.payload.find(
            (updated) => updated._id === notification._id
          );

          // If found in updated list, return the updated version, otherwise return original
          return updatedNotification || notification;
        }),
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
