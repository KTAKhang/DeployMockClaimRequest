import { all, call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import {
    LOGIN_REQUEST,
    LOGOUT,
    RESTORE_USER,
    loginSuccess,
    loginFailure,
    logoutSuccess
} from "../actions/authActions";
import axios from "axios";

const apiLogin = async (credentials) => {
    try {
        const response = await axios.post(
            `https://ojtbe-production.up.railway.app/api/user/sign-in`,
            credentials
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to login");
    }
};

function* handleLogin(action) {
    try {
        const { email, password } = action.payload;
        const data = yield call(apiLogin, { email, password });

        const token = data.token.access_token;
        const user = data.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Đảm bảo xóa tất cả toast hiện tại trước khi hiển thị toast mới
        toast.dismiss();
        
        // Dispatch action trước để cập nhật state
        yield put(loginSuccess(token, user));
        
        // Hiển thị toast với ID duy nhất
        toast.success("Login successful", {
            toastId: "login-success-" + new Date().getTime(),
            position: "top-right",
            autoClose: 3000
        });
    } catch (error) {
        console.error("Login failed:", error.message);
        
        // Xóa toast hiện tại
        toast.dismiss();
        
        yield put(loginFailure(error.message));
        
        // Hiển thị toast lỗi với ID duy nhất
        toast.error(error.message, {
            toastId: "login-error-" + new Date().getTime(),
            position: "top-right",
            autoClose: 5000
        });
    }
}

// Thêm hàm xử lý restore user riêng biệt
function* handleRestoreUser() {
    try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const storedToken = localStorage.getItem("token");
        
        if (storedToken && storedUser) {
            // Chỉ dispatch action, KHÔNG hiển thị toast
            yield put(loginSuccess(storedToken, storedUser));
        }
    } catch (error) {
        console.error("Restore user error:", error);
    }
}

function* handleLogout() {
    try {
        // Xóa dữ liệu từ localStorage
        localStorage.clear(); 
        
        // Xóa tất cả toast hiện tại
        toast.dismiss();
        
        // Dispatch action success
        yield put(logoutSuccess());

        // Hiển thị toast thành công với ID duy nhất
        toast.success("Logged out successfully", {
            toastId: "logout-success-" + new Date().getTime(),
            position: "top-right",
            autoClose: 3000
        });
        
        // Chuyển hướng về trang login
        window.location.href = '/login';
    } catch (error) {
        console.error("Logout error:", error);
        
        toast.error("Logout failed", {
            toastId: "logout-error-" + new Date().getTime(),
            position: "top-right",
            autoClose: 5000
        });
    }
}

export default function* authSaga() {
    yield all([
        takeLatest(LOGIN_REQUEST, handleLogin),
        takeLatest(LOGOUT, handleLogout),
        takeLatest(RESTORE_USER, handleRestoreUser)
    ]);
}
