// reducer.js
import {
  SEND_MESSAGE_REQUEST,
  SEND_MESSAGE_SUCCESS,
  SEND_MESSAGE_FAILURE,
} from "../actions/chatActions";

const initialState = {
  messages: [],
  isLoading: false,
  error: null,
};

const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case SEND_MESSAGE_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case SEND_MESSAGE_SUCCESS:
      return {
        ...state,
        messages: [
          ...state.messages,
          { sender: "user", text: action.payload.userMessage },
          { sender: "bot", text: action.payload.botMessage },
        ],
        isLoading: false,
      };
    case SEND_MESSAGE_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default chatReducer;
