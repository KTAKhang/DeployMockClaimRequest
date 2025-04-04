import { call, put, takeEvery, select } from "redux-saga/effects";
import api from "../api/apiUtils"; // ✅ Import the new API object
import {
  GET_STAFF_ALL,
  GET_STAFF_BY_ID,
  ADD_STAFF,
  UPDATE_STAFF,
  UPDATE_STAFF_SUCCESS,
  ADD_STAFF_SUCCESS,
  getStaffAllSuccess,
  getStaffByIdSuccess,
  getStaffAllFailure,
  getStaffByIdFailure,
  updateStaffFailure,
  addStaffFailure,
} from "../actions/staffActions";
import axios from "axios";

// API Calls - Updated to use the api object instead of direct axios calls
const fetchStaffAll = async () => api.get("user/get-all");

const fetchStaffById = async (id) => api.get(`user/${id}`);

const addStaffApi = async (data) => api.post("user/sign-up", data);

const updateStaffApi = async (data) =>
  api.put(`user/update-user/${data._id}`, data);

// 🛠 **Saga: Fetch All Staff**
function* fetchStaffAllSaga() {
  try {
    const response = yield call(fetchStaffAll);
    yield put(getStaffAllSuccess(response)); // ✅ Send full list to Redux
  } catch (error) {
    yield put(getStaffAllFailure(error.message || "Failed to fetch staff."));
  }
}

// 🛠 **Saga: Fetch Staff by ID**
function* fetchStaffByIdSaga(action) {
  try {
    const response = yield call(fetchStaffById, action.payload);
    yield put(getStaffByIdSuccess(response)); // ✅ Send to Redux
  } catch (error) {
    yield put(
      getStaffByIdFailure(error.message || "Failed to fetch staff details.")
    );
  }
}

// 🛠 **Saga: Add Staff**
function* addStaffSaga(action) {
  try {
    // ✅ Ensure all required fields are properly formatted
    const data = {
      user_name: action.payload.user_name?.trim() || "",
      department: action.payload.department?.trim() || "",
      job_rank: action.payload.job_rank?.trim() || "",
      salary: Number(action.payload.salary) || 0, // Ensure salary is a number
      role: action.payload.role?.trim() || "",
      email: action.payload.email?.trim() || "",
      password: action.payload.password || "", // Password must be included
    };

    // ✅ Check if any required field is missing
    if (Object.values(data).some((value) => value === "")) {
      throw new Error("All fields are required");
    }

    console.log("📡 Sending sign-up request:", data);

    const response = yield call(addStaffApi, data);
    yield put({ type: ADD_STAFF_SUCCESS, payload: response });

    // ✅ Refresh staff list after adding
    yield put({ type: GET_STAFF_ALL });
  } catch (error) {
    yield put(addStaffFailure(error.message));
  }
}

// 🛠 **Saga: Update Staff**
function* updateStaffSaga(action) {
  try {
    console.log("📤 Updating staff with data:", action.payload);

    // Lấy thông tin người dùng hiện tại
    const currentUser = yield select((state) => state.auth.user);
    console.log("Current user in saga:", currentUser);

    // Kiểm tra quyền admin - chú ý kiểm tra cả role và role_name
    const isAdmin =
      currentUser?.role_name === "Administrator" ||
      currentUser?.role === "Administrator";

    console.log("Is admin in saga:", isAdmin);

    // Chuẩn bị dữ liệu cập nhật
    const updateData = { ...action.payload };

    // Quan trọng: Chuyển đổi role_name thành role để gửi đúng format API yêu cầu
    if (updateData.role_name) {
      updateData.role = updateData.role_name;
      delete updateData.role_name;
    }

    // Nếu không phải admin, loại bỏ role để không thay đổi role
    if (!isAdmin && updateData.role) {
      console.warn("⚠️ User is not admin, removing role from update request");
      delete updateData.role;
    }

    // Tạo FormData để gửi dữ liệu dạng multipart/form-data
    const formData = new FormData();

    // Thêm các trường vào FormData
    Object.keys(updateData).forEach((key) => {
      if (key !== "_id") {
        // Xử lý đặc biệt cho trường status - chuyển từ boolean sang string
        if (key === "status") {
          formData.append(key, updateData[key].toString());
        }
        // Xử lý các trường còn lại
        else if (updateData[key] !== undefined && updateData[key] !== null) {
          formData.append(key, updateData[key]);
        }
      }
    });

    // Gửi request API với FormData và headers thích hợp
    const token = localStorage.getItem("token");
    const response = yield call(
      axios.put,
      `https://ojt-be.onrender.com/api/user/update-user/${updateData._id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    console.log("✅ Update API response:", response.data);

    // Chuyển đổi role thành role_name trong response
    const responseData = response.data?.data || {};
    if (responseData.role && !responseData.role_name) {
      responseData.role_name = responseData.role;
    }

    yield put({ type: UPDATE_STAFF_SUCCESS, payload: responseData });

    // In updateStaffSaga
    yield put({ type: GET_STAFF_ALL });

    // ✅ **Ensure single staff is refetched if on details page**
    if (updateData._id) {
      yield put({ type: GET_STAFF_BY_ID, payload: updateData._id });
    }
  } catch (error) {
    console.error("❌ Update error:", error);
    yield put(updateStaffFailure(error.message || "Failed to update staff"));
  }
}

// 🛠 **Watcher Saga**
export default function* staffSaga() {
  yield takeEvery(GET_STAFF_ALL, fetchStaffAllSaga);
  yield takeEvery(GET_STAFF_BY_ID, fetchStaffByIdSaga);
  yield takeEvery(ADD_STAFF, addStaffSaga);
  yield takeEvery(UPDATE_STAFF, updateStaffSaga);
}
