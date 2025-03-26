import { call, put, takeLatest, delay } from "redux-saga/effects";
import { toast } from "react-toastify";
import api from "../api/apiUtils";

import {
  CLAIMER_FETCH_CLAIMS_REQUEST,
  CLAIMER_FETCH_CLAIM_DETAIL_REQUEST,
  FETCH_PROJECTS_REQUEST,
  CREATE_CLAIM_REQUEST,
  UPDATE_CLAIM_REQUEST,
  CLAIMER_UPDATE_CLAIM_REQUEST,
  fetchClaimsSuccess,
  fetchClaimsFailure,
  fetchClaimDetailSuccess,
  fetchClaimDetailFailure,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  createClaimSuccess,
  createClaimFailure,
  fetchClaimsRequestClaimer,
  updateClaimSuccess,
  updateClaimFailure,
  updateClaimSuccessDraft,
  updateClaimFailureDraft,
  fetchClaimDetailRequest,
  BULK_UPDATE_CLAIM_REQUEST,
  bulkUpdateClaimSuccess,
  bulkUpdateClaimFailure,
  BULK_UPDATE_CLAIM_SUCCESS,
} from "../actions/claimerActions";

// API Call Function: Fetch projects
const fetchProjectsAPI = async () => {
  return await api.get("project");
};

// API Functions
const fetchClaimsAPI = async (filters) => {
  return await api.get("claim", null, filters);
};

const fetchClaimByIdAPI = async (id) => {
  return await api.get(`claim/${id}`);
};

const createClaimAPI = async (claimData) => {
  return await api.post("claim", claimData);
};

const updateClaimAPI = async (id, claimData) => {
  return api.put(`claim/${id}`, claimData);
};

// API Call Function: Update claim status
const updateClaimStatusAPI = async (ids, status, reason) => {
  const payload = {
    claimIds: Array.isArray(ids) ? ids : [ids],
    status,
    reason,
  };
  return api.put("claim/update-list", payload);
};

// Format response functions

const formatClaimResponse = (claim) => ({
  id: claim._id,
  staff: claim.user?.user_name || "Unknown Staff",
  project: claim.project?.project_name || "Unknown Project",
  duration: `From ${claim.from?.split("T")[0] || "N/A"} To ${claim.to?.split("T")[0] || "N/A"
    }`,
  hours: claim.total_no_of_hours || 0,
  status: claim.status?.name || "Unknown Status",
  reason_claimer: claim.reason_claimer || "Unknown Reason",
  // Add this line to include the approver reason
  reason_approver: claim.reason_approver || null,
  // Existing fields
  avatar: claim.user?.avatar || null,
  attached_file: claim.attached_file || null,
});
const formatClaimsListResponse = (claims) =>
  claims.map((claim) => ({
    id: claim._id,
    staff: claim.user_name,
    project: claim.project_name,
    duration: `From ${claim.from.split("T")[0]} To ${claim.to.split("T")[0]}`,
    hours: claim.total_no_of_hours,
    status: claim.status,
    reason_claimer: claim.reason_claimer,
    reason_approver: claim.reason_approver, // Add this line
    updateAt: claim.updatedAt.split("T")[0],
  }));

// Saga Functions

function* fetchClaimsSaga(action) {
  try {
    const response = yield call(fetchClaimsAPI, action.payload);
    const formattedClaims = formatClaimsListResponse(response.claims);
    yield put(fetchClaimsSuccess(formattedClaims));
  } catch (error) {
    yield put(fetchClaimsFailure(error.message));
    toast.error(error.message);
  }
}

function* fetchClaimDetailSaga(action) {
  try {
    const response = yield call(fetchClaimByIdAPI, action.payload);
    const formattedClaim = formatClaimResponse(response);
    yield put(fetchClaimDetailSuccess(formattedClaim));
  } catch (error) {
    yield put(fetchClaimDetailFailure(error.message));
    toast.error(error.message);
  }
}

function* updateClaimSagaDraft(action) {
  try {
    const { id, status } = action.payload;
    const updatedClaim = yield call(updateClaimStatusAPI, id, status);
    yield put(updateClaimSuccessDraft(updatedClaim));
  } catch (error) {
    yield put(updateClaimFailureDraft(error.message || "Update failed"));
  }
}

// Saga Function: Fetch projects
function* fetchProjectsSaga() {
  try {
    const projects = yield call(fetchProjectsAPI);
    yield put(fetchProjectsSuccess(projects));
  } catch (error) {
    yield put(fetchProjectsFailure(error.message));
    toast.error(error.message);
  }
}

function* createClaimSaga(action) {
  try {
    const response = yield call(createClaimAPI, action.payload);

    // Chỉ hiển thị toast một lần

    yield put(createClaimSuccess(response));
  } catch (error) {
    yield put(createClaimFailure(error.message));
    toast.error(error.message, {
      toastId: "createClaimError",
    });
  }
}

function* updateClaimSaga(action) {
  try {
    const { id, claimData } = action.payload;
    const response = yield call(updateClaimAPI, id, claimData);

    toast.success("Claim updated successfully!", {
      toastId: "updateClaimSuccess",
      position: "top-right",
      autoClose: 3000,
    });

    yield put(updateClaimSuccess(response));

  } catch (error) {
    yield put(updateClaimFailure(error.message));
    toast.error(error.message, {
      toastId: "updateClaimError",
    });
  }
}
function* bulkUpdateClaimSaga(action) {
  try {
    const { claimIds, status } = action.payload;
    const response = yield call(updateClaimStatusAPI, claimIds, status);

    // Kiểm tra response: Nếu là mảng, thì dùng luôn; nếu là object, lấy response.data
    const updatedClaims = Array.isArray(response) ? response : response?.data;
    if (!Array.isArray(updatedClaims)) {
      console.error("Invalid API response format:", response);
      throw new Error("Invalid response format");
    }
    // Dispatch action với đúng dữ liệu đã được chuẩn hóa
    yield put(bulkUpdateClaimSuccess({ data: updatedClaims }));
  } catch (error) {
    console.error("Bulk Update Claim API Error:", error);
    yield put(
      bulkUpdateClaimFailure(
        error?.response?.data || error.message || "Update failed"
      )
    );
  }
}

function* updateClaimStatusSaga(action) {
  try {
    const { id, status } = action.payload;
    const response = yield call(updateClaimAPI, id, { status });
    yield put(updateClaimSuccessDraft(response));
    toast.success(`Claim status updated to ${status ? "active" : "inactive"}`);

    yield delay(500);
    yield put(fetchClaimDetailRequest(id));
    yield put(fetchClaimsRequest({ status: "draft" }));
  } catch (error) {
    yield put(updateClaimFailureDraft(error.message));
    toast.error(error.message);
  }
}

// Thêm saga để xử lý sau khi bulk update thành công
function* handleBulkUpdateSuccess(action) {
  try {
    // Lấy status từ action.payload nếu có
    const status = action.payload?.status || "draft";
    // Fetch lại danh sách claims với status mới
    yield put(fetchClaimsRequestClaimer({ status }));
  } catch (error) {
    console.error("Error after bulk update:", error);
  }
}

// Root Saga
export function* claimerSaga() {
  yield takeLatest(CLAIMER_FETCH_CLAIMS_REQUEST, fetchClaimsSaga);
  yield takeLatest(CLAIMER_FETCH_CLAIM_DETAIL_REQUEST, fetchClaimDetailSaga);
  yield takeLatest(FETCH_PROJECTS_REQUEST, fetchProjectsSaga);
  yield takeLatest(CREATE_CLAIM_REQUEST, createClaimSaga);
  yield takeLatest(UPDATE_CLAIM_REQUEST, updateClaimSaga);
  yield takeLatest(CLAIMER_UPDATE_CLAIM_REQUEST, updateClaimSagaDraft);
  yield takeLatest(BULK_UPDATE_CLAIM_REQUEST, bulkUpdateClaimSaga);
  yield takeLatest(CLAIMER_UPDATE_CLAIM_REQUEST, updateClaimStatusSaga);
  // Thêm listener cho bulk update success
  yield takeLatest(BULK_UPDATE_CLAIM_SUCCESS, handleBulkUpdateSuccess);
}
