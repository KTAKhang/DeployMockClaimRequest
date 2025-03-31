import { call, put, takeLatest, all } from "redux-saga/effects";
import axios from "axios";

// Import action types and action creators
import {
  SEND_MESSAGE_REQUEST,
  sendMessageSuccess,
  sendMessageFailure,
} from "../actions/chatActions";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Saga worker function
function* sendMessageSaga(action) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error(
        "Missing API Key. Please check your environment variables."
      );
    }

    const userMessage = action.payload;

    const response = yield call(
      axios.post,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: userMessage }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.data || !response.data.candidates) {
      throw new Error("Invalid response from API");
    }

    const botMessage =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't understand that.";

    yield put(
      sendMessageSuccess({
        userMessage,
        botMessage,
      })
    );
  } catch (error) {
    console.error(
      "Error sending message:",
      error.response?.data || error.message
    );
    yield put(sendMessageFailure("Network error, please try again."));
  }
}

// Saga watcher function
export default function* watchSendMessage() {
  yield all([takeLatest(SEND_MESSAGE_REQUEST, sendMessageSaga)]);
}
