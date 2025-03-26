import {
  GET_NOTIFICATIONS_REQUEST,
  GET_NOTIFICATIONS_SUCCESS,
  GET_NOTIFICATIONS_FAILURE,
} from "../actions/notificationActions";

// Initial state for notifications
const initialState = {
  notifications: [],
  loading: false,
  error: null,
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
        notifications: action.payload, // This might need adjustment based on actual response structure
        loading: false,
        error: null,
      };

    case GET_NOTIFICATIONS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default notificationReducer;
