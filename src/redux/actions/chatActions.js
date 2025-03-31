// actions.js
export const SEND_MESSAGE_REQUEST = "SEND_MESSAGE_REQUEST";
export const SEND_MESSAGE_SUCCESS = "SEND_MESSAGE_SUCCESS";
export const SEND_MESSAGE_FAILURE = "SEND_MESSAGE_FAILURE";

export const sendMessageRequest = (message) => ({
  type: SEND_MESSAGE_REQUEST,
  payload: message,
});

export const sendMessageSuccess = (message) => ({
  type: SEND_MESSAGE_SUCCESS,
  payload: message,
});

export const sendMessageFailure = (error) => ({
  type: SEND_MESSAGE_FAILURE,
  payload: error,
});
