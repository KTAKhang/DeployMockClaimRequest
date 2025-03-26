import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { API_URLS, BACKGROUND_IMAGE_URL } from "./const";
import { MESSAGES } from "./string";
import { isValidEmail, formatEmail } from "./utils";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading
  const navigate = useNavigate();

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!isValidEmail(email)) {
      setErrorMessage(MESSAGES.PLEASE_ENTER_VALID_EMAIL);
      return;
    }

    // Hiển thị Toastify khi bắt đầu gửi mã
    setIsLoading(true);

    try {
      const result = await axios.post(API_URLS.FORGOT_PASSWORD, { email });
      console.log("API Response:", result.data);

      if (result.data && result.data.status === "OK") {
        setIsVerificationSent(true);
        toast.success(MESSAGES.SUCCESS_SENDING_CODE);
        navigate(`/verify-code?email=${email}`);
      } else {
        setErrorMessage(result.data.message || MESSAGES.ERROR_SENDING_CODE);
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      setErrorMessage(MESSAGES.ERROR_SENDING_CODE);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate("/");
  };

  return (
    <div
      className="flex min-h-screen justify-center items-center bg-cover bg-center"
      style={{
        backgroundImage: `url(${BACKGROUND_IMAGE_URL})`,
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative bg-white p-12 rounded-lg shadow-xl w-[550px] max-w-[90%]">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isVerificationSent
            ? MESSAGES.VERIFICATION_CODE_SENT
            : MESSAGES.FORGOT_PASSWORD_TITLE}
        </h2>

        {!isVerificationSent ? (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-lg font-semibold">
                Enter your email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter your email"
              />
            </div>

            {errorMessage && (
              <div className="text-red-500 text-center mt-2">
                {errorMessage}
              </div>
            )}

            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className={`px-6 py-2 font-semibold rounded-md w-full transition duration-300 ${
                  !isValidEmail(email) || isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
                disabled={!isValidEmail(email) || isLoading}
              >
                {isLoading ? "Sending Code..." : "Send Code"}
              </button>
            </div>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={handleGoToLogin}
                className="text-blue-500 hover:underline"
              >
                {MESSAGES.GO_TO_LOGIN}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <p>
              A verification code has been sent to your{" "}
              <span className="text-blue-500">{formatEmail(email)}</span>
            </p>
            <button
              onClick={handleGoToLogin}
              className="mt-4 text-blue-500 hover:underline"
            >
              {MESSAGES.GO_TO_LOGIN}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
