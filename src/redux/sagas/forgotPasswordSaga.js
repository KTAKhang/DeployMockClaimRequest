import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import {
  FORGOT_PASSWORD_REQUEST,
  forgotPasswordSuccess,
  forgotPasswordFailure,
} from "../actions/forgotPasswordActions";
import { API_URLS } from "../../pages/AuthPage/ForgotPasswordPage/const";

function* forgotPasswordSaga(action) {
  try {
    const result = yield call(axios.post, API_URLS.FORGOT_PASSWORD, {
      email: action.payload,
    });

    if (result.data && result.data.status === "OK") {
      yield put(forgotPasswordSuccess());
    } else {
      yield put(
        forgotPasswordFailure(result.data.message || "Error sending code")
      );
    }
  } catch (error) {
    console.error("Error sending verification code:", error);
    yield put(forgotPasswordFailure("Error sending code"));
  }
}

export function* watchForgotPassword() {
  yield takeLatest(FORGOT_PASSWORD_REQUEST, forgotPasswordSaga);
}
