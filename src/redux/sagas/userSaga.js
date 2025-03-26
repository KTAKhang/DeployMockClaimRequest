import { call, put, takeLatest } from "redux-saga/effects";
import {
  GET_USER_PROFILE,
  getUserProfileFailure,
  getUserProfileSuccess,
  UPDATE_USER_PROFILE,
  updateUserProfileFailure,
  updateUserProfileSuccess,
} from "../actions/userActions";
import { updateAuthUser } from "../actions/authActions";
import api from "../api/apiUtils";
import { toast } from 'react-toastify';

// API functions
const fetchUserProfileAPI = async () => {
  const cachedProfile = localStorage.getItem("userProfile");
  if (cachedProfile) {
    return JSON.parse(cachedProfile);
  }
  const response = await api.get("user");
  // Lưu cache
  localStorage.setItem("userProfile", JSON.stringify(response));
  return response;
};

const updateUserProfileAPI = async (userId, userData) => {
  const profile = JSON.parse(localStorage.getItem("userProfile"));
  
  // Xử lý payload dựa vào role
  const payload = profile.role_name === "Administrator" 
    ? {
        user_name: userData.user_name,
        department: userData.department,
        job_rank: userData.job_rank,
        salary: Number(userData.salary),
        role_name: userData.role_name,
        status: Boolean(userData.status),
        password: userData.password,
        avatar: userData.avatar,
      }
    : {
        user_name: userData.user_name,
        avatar: userData.avatar,
      };

  const response = await api.put(`user/update-user/${userId}`, payload);
  // Cập nhật cache
  localStorage.setItem("userProfile", JSON.stringify(response));
  return response;
};

// Saga functions
function* fetchUserProfile() {
  try {
    const userData = yield call(fetchUserProfileAPI);
    yield put(getUserProfileSuccess(userData));
  } catch (error) {
    yield put(getUserProfileFailure(error.message));
    toast.error(error.message, {
      toastId: 'profile-fetch-error-' + new Date().getTime(),
      position: "top-right",
      autoClose: 5000,
    });
  }
}

function* updateUserProfile(action) {
  try {
    const profile = JSON.parse(localStorage.getItem("userProfile"));
    const userId = profile._id;

    const updatedUser = yield call(updateUserProfileAPI, userId, action.payload);
    
    // Dispatch actions khi thành công
    yield put(updateUserProfileSuccess(updatedUser));
    yield put(updateAuthUser(updatedUser));

    toast.success('Profile updated successfully!', {
      toastId: 'profile-update-success-' + new Date().getTime(),
      position: "top-right",
      autoClose: 3000,
    });

  } catch (error) {
    yield put(updateUserProfileFailure(error.message));
    
    toast.error(`Update failed: ${error.message}`, {
      toastId: 'profile-update-error-' + new Date().getTime(),
      position: "top-right",
      autoClose: 5000,
    });
  }
}

// Root saga
export default function* userSaga() {
  yield takeLatest(GET_USER_PROFILE, fetchUserProfile);
  yield takeLatest(UPDATE_USER_PROFILE, updateUserProfile);
}
