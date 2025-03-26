import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Hàm kiểm tra mật khẩu có hợp lệ không (ít nhất 8 ký tự, chứa chữ hoa và chữ số)
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
};

const ChangePasswordPage = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState(""); // Mật khẩu cũ
  const [newPassword, setNewPassword] = useState(""); // Mật khẩu mới
  const [confirmPassword, setConfirmPassword] = useState(""); // Xác nhận mật khẩu mới
  const [error, setError] = useState(""); // Thông báo lỗi chung
  const [oldPasswordError, setOldPasswordError] = useState(""); // Thông báo lỗi cho mật khẩu cũ
  const [successMessage, setSuccessMessage] = useState(""); // Thông báo thành công khi thay đổi mật khẩu
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading cho nút "CONTINUE"

  const [isFormValid, setIsFormValid] = useState(false); // Kiểm tra tính hợp lệ của form

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Kiểm tra nếu mật khẩu mới không hợp lệ khi nhấn "CONTINUE"
    if (!validatePassword(newPassword)) {
      setError(
        "Password must contain at least 8 characters, including uppercase and number"
      );
      return;
    }

    // Kiểm tra mật khẩu xác nhận có khớp không
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    // Kiểm tra mật khẩu cũ có được nhập không
    if (oldPassword === "") {
      setError("Vui lòng nhập mật khẩu cũ");
      return;
    }

    setIsLoading(true); // Bật trạng thái loading khi bắt đầu yêu cầu

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        "https://ojtbe-production.up.railway.app/api/user/change-password",
        {
          old_password: oldPassword, // Gửi mật khẩu cũ
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response from server:", response); // Log response để kiểm tra phản hồi từ server

      // Kiểm tra mã trạng thái và thông báo từ server
      if (response.status === 200) {
        if (
          response.data.status === "ERR" &&
          response.data.message === "Old password is incorrect"
        ) {
          // Đặt lỗi cho mật khẩu cũ không đúng
          setOldPasswordError("Mật khẩu cũ không chính xác.");
          setError(""); // Reset lỗi chung
        } else if (
          response.data.status === "OK" &&
          response.data.message === "Change password success"
        ) {
          // Nếu thay đổi mật khẩu thành công
          setSuccessMessage("Thay đổi mật khẩu thành công!");
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setError("");
          setOldPasswordError(""); // Reset lỗi mật khẩu cũ
          toast.success("Password has been successfully changed!"); // Hiển thị thông báo Toastify thành công
          onClose(); // Đóng popup khi thay đổi mật khẩu thành công
        }
      }
    } catch (err) {
      // Bắt lỗi nếu có sự cố kết nối hoặc lỗi khác
      console.error("Error caught during API call:", err); // Log lỗi để kiểm tra

      if (err.response && err.response.data) {
        // Kiểm tra nếu có lỗi phản hồi từ server
        if (err.response.data.message === "Old password is incorrect") {
          setOldPasswordError("Mật khẩu cũ không chính xác.");
        } else {
          setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
        }
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    } finally {
      setIsLoading(false); // Tắt trạng thái loading
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Change Password
      </h2>
      <form onSubmit={handlePasswordChange} data-testid="change-password-form">
        <div className="mb-4">
          <label
            htmlFor="oldPassword"
            className="block text-sm font-medium text-gray-700"
          >
            OLD PASSWORD
          </label>
          <input
            type="password"
            id="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {oldPasswordError && (
            <div className="text-red-500 text-sm mt-1">{oldPasswordError}</div>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700"
          >
            NEW PASSWORD
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            CONFIRM NEW PASSWORD
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        {successMessage && (
          <div className="text-green-500 text-sm mb-4">{successMessage}</div>
        )}

        <button
          type="submit"
          className={`px-6 py-2 font-semibold rounded-md w-full transition duration-300 ${
            !newPassword || isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          disabled={isLoading}
        >
          {isLoading ? "In Progress..." : "CONTINUE"}
        </button>
      </form>

      <button
        onClick={onClose} // Đóng popup khi nhấn Cancel
        className="mt-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-md w-full"
      >
        Cancel
      </button>
    </div>
  );
};

export default ChangePasswordPage;
