import { all, call, put, takeLatest } from "redux-saga/effects";
import {
  FINANCE_FETCH_APPROVED_CLAIM_REQUEST,
  financeFetchApprovedSuccess,
  financeFetchApprovedFailure,
  FINANCE_FETCH_PAID_CLAIM_REQUEST,
  financeFetchPaidSuccess,
  financeFetchPaidFailure,
  FINANCE_FETCH_CLAIM_DETAIL_REQUEST,
  financeFetchDetailSuccess,
  financeFetchDetailFailure,
  FINANCE_FETCH_CLAIMS_REQUEST,
  fetchClaimsSuccess,
  fetchClaimsFailure,
  FINANCE_DOWNLOAD_CLAIMS_REQUEST,
  downloadClaimsSuccess,
  downloadClaimsFailure,
  FINANCE_PAID_CLAIMS_REQUEST,
  financePaidClaimsSuccess,
  financePaidClaimsFailure,
  FINANCE_UPDATE_CLAIM_STATUS_REQUEST,
  financeUpdateClaimStatusSuccess,
  financeUpdateClaimStatusFailure,
} from "../actions/financeAction";
import axios from "axios";
import api from "../api/apiUtils"; // ✅ Updated import to use the new API object

const fetchClaimDetailAPI = async (id) => api.get(`claim/${id}`);
const fetchClaimsAPI = async (filters) =>
  (await api.get("claim", filters))?.claims?.map((claim) => ({
    id: claim._id,
    staff: claim.user_name,
    project: claim.project_name,
    duration: `From ${claim.from.split("T")[0]} To ${claim.to.split("T")[0]}`,
    hours: claim.total_no_of_hours,
    updateAt: `${claim.updatedAt.split("T")[0]}`,
    status: claim.status,
  })) || [];

const updateMorePaidClaimStatusAPI = async (ids, status) => {
  const payload = {
    claimIds: Array.isArray(ids) ? ids : [ids],
    status,
  };
  return api.put("claim/update-list", payload);
};

function* handleFetchDetailClaim({ payload }) {
  try {
    const claimDetail = yield call(fetchClaimDetailAPI, payload.id);
    yield put(financeFetchDetailSuccess(claimDetail));
  } catch (error) {
    yield put(financeFetchDetailFailure(error.message));
  }
}

// Saga to fetch claims list
function* handleFetchClaimsSaga(action) {
  try {
    const formattedClaims = yield call(fetchClaimsAPI, action.payload);
    yield put(fetchClaimsSuccess(formattedClaims));
  } catch (error) {
    yield put(fetchClaimsFailure(error));
  }
}

function* downloadClaimsSaga(action) {
  try {
    const { month, year } = action.payload;
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");
    const response = yield call(() =>
      axios.get(
        `https://ojtbe-production.up.railway.app/api/claim/download?month=${month}&year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
          responseType: "blob",
        }
      )
    );

    // Trigger file download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Paid_Claims.xlsx");
    document.body.appendChild(link);
    link.click();

    yield put(downloadClaimsSuccess(response.data));
  } catch (error) {
    // Handle 404 error specifically
    if (error.response && error.response.status === 404) {
      error.message = "Không tìm thấy dữ liệu Paid Claims trong tháng yêu cầu";
    } else {
      error.message = "Đã xảy ra lỗi khi tải xuống. Vui lòng thử lại!";
    }
    yield put(downloadClaimsFailure(error.message));
  }
}

// Saga to update claim status (Handles **single & bulk** updates)
function* updateClaimStatusSaga({ payload }) {
  try {
    const { ids, status } = payload;

    yield call(updateMorePaidClaimStatusAPI, ids, status);

    yield put(financeUpdateClaimStatusSuccess({ ids, status }));

  } catch (error) {
    yield put(
      financeUpdateClaimStatusFailure(
        error.message || "Failed to update claim status."
      )
    );
  }
}

export default function* financeSaga() {
  yield all([
    takeLatest(FINANCE_FETCH_CLAIM_DETAIL_REQUEST, handleFetchDetailClaim),
    takeLatest(FINANCE_FETCH_CLAIMS_REQUEST, handleFetchClaimsSaga),
    takeLatest(FINANCE_DOWNLOAD_CLAIMS_REQUEST, downloadClaimsSaga),
    takeLatest(FINANCE_UPDATE_CLAIM_STATUS_REQUEST, updateClaimStatusSaga),
  ]);
}
