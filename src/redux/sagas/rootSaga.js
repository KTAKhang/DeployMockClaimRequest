import { all } from "redux-saga/effects";
import authSaga from "./authSaga";

import projectSaga from "./projectSaga";
import staffSaga from "./staffSaga";
import { watchClaimActions } from "./approverClaimSaga"; // Import your saga
import financeSaga from "./financeSaga";
import userSaga from "./userSaga";
import { claimerSaga } from "./claimerSaga";
import { commentSaga } from "./commentSaga";
import { notificationSaga } from "./notificationSaga";
import chatSaga from "./chatSaga";
import { watchForgotPassword } from "./forgotPasswordSaga";
import { watchVerifyCodeRequest } from "./verifyCodeSaga";
import watchChangePassword from "./changePasswordSaga";
export default function* rootSaga() {
  yield all([
    authSaga(),
    watchClaimActions(),
    userSaga(),
    financeSaga(),
    claimerSaga(),
    projectSaga(),
    staffSaga(),
    commentSaga(),
    notificationSaga(),
    chatSaga(),
    watchForgotPassword(),
    watchVerifyCodeRequest(),
    watchChangePassword(),
  ]);
}
