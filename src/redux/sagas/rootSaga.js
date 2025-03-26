import { all } from "redux-saga/effects";
import authSaga from "./authSaga";

import projectSaga from "./projectSaga";
import staffSaga from "./staffSaga";
import { watchClaimActions } from "./approverClaimSaga"; // Import your saga
import financeSaga from "./financeSaga";
import userSaga from "./userSaga";
import { claimerSaga } from "./claimerSaga";
import { commentSaga } from "./commentSaga";
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
  ]);
}
