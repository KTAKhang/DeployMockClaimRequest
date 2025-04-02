import { call, put, takeEvery } from "redux-saga/effects";
import axios from "axios";
import {
  changePasswordSuccess,
  changePasswordFailure,
} from "../actions/changePasswordActions";
import { CHANGE_PASSWORD_REQUEST } from "../actions/changePasswordActions";
import { API_URLS } from "../../pages/AuthPage/ChangePasswordPage/const";
import { MESSAGES } from "../../pages/AuthPage/ChangePasswordPage/string";
import { toast } from "react-toastify";

function* changePasswordSaga(action) {
  try {
    const { oldPassword, newPassword } = action.payload;
    const token = localStorage.getItem("token");

    const response = yield call(
      axios.put,
      API_URLS.CHANGE_PASSWORD,
      {
        old_password: oldPassword,
        new_password: newPassword,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 200 && response.data.status === "OK") {
      yield put(changePasswordSuccess());
      toast.success(MESSAGES.CHANGE_PASSWORD_SUCCESS, { autoClose: 8000 });
    } else {
      yield put(changePasswordFailure(response.data.message));
    }
  } catch (error) {
    yield put(
      changePasswordFailure("An error occurred, please try again later")
    );
  }
}

function* watchChangePassword() {
  yield takeEvery(CHANGE_PASSWORD_REQUEST, changePasswordSaga);
}

export default watchChangePassword;
