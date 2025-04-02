import { takeLatest, call, put, delay } from "redux-saga/effects";
import axios from "axios";
import {
  VERIFY_CODE_REQUEST,
  verifyCodeSuccess,
  verifyCodeFailure,
  redirectToLogin,
  resetVerificationCodeState,
} from "../actions/verifyCodeActions";
import { API_URL } from "../../pages/AuthPage/VerifyCodePage/const";
import { MESSAGES } from "../../pages/AuthPage/VerifyCodePage/string";
import { toast } from "react-toastify";

function* verifyCodeSaga(action) {
  const { email, verificationCode, password } = action.payload;

  try {
    const result = yield call(axios.post, API_URL, {
      email,
      otp: verificationCode,
      newPassword: password,
    });

    if (result.data) {
      console.log("API call success, dispatching success action");
      yield put(verifyCodeSuccess());
      console.log("Dispatched success action");
      toast.success(MESSAGES.PASSWORD_RESET_SUCCESS, { autoClose: 8000 });

      yield delay(1000);
      window.location.href = "/login";
    } else {
      yield put(
        verifyCodeFailure({
          verificationCode: MESSAGES.INVALID_VERIFICATION_CODE,
        })
      );
      toast.error(MESSAGES.INVALID_VERIFICATION_CODE, { autoClose: 8000 });
      yield put(resetVerificationCodeState());
    }
  } catch (error) {
    console.error("Lỗi trong quá trình đặt lại mật khẩu:", error);
    yield put(verifyCodeFailure({ verificationCode: MESSAGES.WRONG_OTP }));
    toast.error(MESSAGES.WRONG_OTP, { autoClose: 8000 });
    yield put(resetVerificationCodeState());
  }
}

export function* watchVerifyCodeRequest() {
  yield takeLatest(VERIFY_CODE_REQUEST, verifyCodeSaga);
}
