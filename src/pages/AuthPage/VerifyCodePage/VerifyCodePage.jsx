import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { API_URL } from "./const";
import { MESSAGES } from "./string";
import { validateVerificationCode, validatePassword } from "./utils";

function VerifyCodePage() {
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [errors, setErrors] = useState({
    verificationCode: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailFromUrl = params.get("email");

    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [location]);

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();

    let formErrors = {};

    // Xác thực mã OTP và mật khẩu
    formErrors.verificationCode = validateVerificationCode(verificationCode);
    formErrors.password = validatePassword(password);

    if (formErrors.verificationCode || formErrors.password) {
      setErrors(formErrors);
      return;
    }

    if (verificationCode && password && email) {
      setIsLoading(true); // Đặt trạng thái loading là true khi bắt đầu gửi

      try {
        const result = await axios.post(API_URL, {
          email,
          otp: verificationCode,
          newPassword: password,
        });

        if (result.data) {
          setIsCodeVerified(true);
          toast.success(MESSAGES.PASSWORD_RESET_SUCCESS, {
            autoClose: 8000,
          });
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setErrors({
            ...formErrors,
            verificationCode: MESSAGES.INVALID_VERIFICATION_CODE,
          });
        }
      } catch (error) {
        console.error("Lỗi trong quá trình đặt lại mật khẩu:", error);
        setErrors({
          ...formErrors,
          verificationCode: MESSAGES.WRONG_OTP,
        });
      } finally {
        setIsLoading(false); // Đặt trạng thái loading là false khi hoàn thành
      }
    }
  };

  return (
    <div
      className="flex min-h-screen justify-center items-center bg-cover bg-center"
      style={{
        backgroundImage: `url('https://career.fpt-software.com/wp-content/uploads/2020/07/fville-hanoi.jpg')`,
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative bg-white p-12 rounded-lg shadow-xl w-[550px] max-w-[90%]">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isCodeVerified ? "Nhập Mật Khẩu Mới" : "Nhập Mã Xác Minh"}
        </h2>

        <form onSubmit={handleVerificationSubmit} className="space-y-4">
          <input
            id="email"
            type="email"
            value={email}
            readOnly
            className="hidden"
          />

          <div>
            <label
              htmlFor="verificationCode"
              className="block text-lg font-semibold"
            >
              Nhập Mã Xác Minh
            </label>
            <input
              id="verificationCode"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Nhập mã xác minh của bạn"
            />
            {errors.verificationCode && (
              <p className="text-red-500 text-sm">{errors.verificationCode}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-lg font-semibold">
              Mật Khẩu Mới
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Nhập mật khẩu mới"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className={`px-6 py-2 font-semibold rounded-md w-full transition duration-300 ${
                !verificationCode || !password || isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={!verificationCode || !password || isLoading}
            >
              {isLoading
                ? MESSAGES.PLEASE_WAIT_TEXT
                : MESSAGES.SUBMIT_BUTTON_TEXT}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VerifyCodePage;
