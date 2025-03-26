import { call, put, takeLatest } from "redux-saga/effects";
import {
  FETCH_CLAIMS_REQUEST,
  fetchClaimsSuccess,
  fetchClaimsFailure,
  FETCH_CLAIM_DETAIL_REQUEST,
  fetchClaimDetailSuccess,
  fetchClaimDetailFailure,
  UPDATE_CLAIM_STATUS_REQUEST,
  updateClaimStatusSuccess,
  updateClaimStatusFailure,
} from "../actions/approverClaimActions";
import api from "../api/apiUtils"; // ✅ Updated to use the new api object

const fetchClaimsAPI = async (filters) =>
  (await api.get("claim", filters))?.claims?.map((claim) => ({
    id: claim._id,
    staff: claim.user_name,
    project: claim.project_name,
    duration: `From ${claim.from.split("T")[0]} To ${claim.to.split("T")[0]}`,
    hours: claim.total_no_of_hours,
    status: claim.status,
  })) || [];

const fetchClaimDetailAPI = async (id) => api.get(`claim/${id}`);

const updateClaimStatusAPI = async (ids, status, reason) => {
  const payload = {
    claimIds: Array.isArray(ids) ? ids : [ids],
    status,
    reason,
  };
  return api.put("claim/update-list", payload);
};

function* fetchClaimsSaga({ payload }) {
  try {
    const claims = yield call(fetchClaimsAPI, payload);
    yield put(fetchClaimsSuccess(claims));
  } catch (error) {
    yield put(fetchClaimsFailure(error.message || "Failed to fetch claims."));
  }
}

function* fetchClaimDetailSaga({ payload }) {
  try {
    const claimData = yield call(fetchClaimDetailAPI, payload.id);

    const statusName = claimData.status?.name;
    if (payload.mode === "vetting" && statusName !== "Pending") {
      throw new Error("No Pending claims available for vetting.");
    }
    if (
      payload.mode === "history" &&
      !["Approved", "Paid"].includes(statusName)
    ) {
      throw new Error("No Approved or Paid claims available in history.");
    }

    yield put(fetchClaimDetailSuccess(claimData));
  } catch (error) {
    yield put(fetchClaimDetailFailure(error.message));
  }
}

function* updateClaimStatusSaga({ payload }) {
  try {
    const { ids, status, reason_approver } = payload;

    // ✅ Use the bulk update API at /claim/update-list
    yield call(updateClaimStatusAPI, ids, status, reason_approver);

    // ✅ Dispatch success action with updated claim IDs
    yield put(updateClaimStatusSuccess({ ids, status, reason_approver }));

    // ✅ Refresh claims list after update
    yield put({ type: FETCH_CLAIMS_REQUEST });
  } catch (error) {
    yield put(
      updateClaimStatusFailure(
        error.message || "Failed to update claim status."
      )
    );
  }
}

export function* watchClaimActions() {
  yield takeLatest(FETCH_CLAIMS_REQUEST, fetchClaimsSaga);
  yield takeLatest(FETCH_CLAIM_DETAIL_REQUEST, fetchClaimDetailSaga);
  yield takeLatest(UPDATE_CLAIM_STATUS_REQUEST, updateClaimStatusSaga);
}
