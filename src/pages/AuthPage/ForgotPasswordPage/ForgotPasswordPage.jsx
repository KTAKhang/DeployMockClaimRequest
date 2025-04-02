import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { forgotPasswordRequest } from "../../../redux/actions/forgotPasswordActions";
import { isValidEmail, formatEmail } from "./utils";
import { MESSAGES } from "./string";
import { BACKGROUND_IMAGE_URL } from "./const";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    isVerificationSent,
    errorMessage: stateErrorMessage,
    isLoading,
  } = useSelector((state) => state.forgotPassword);

  useEffect(() => {
    setEmail("");

    if (isVerificationSent) {
      dispatch({ type: "RESET_FORGOT_PASSWORD_STATE" });
    }
  }, [dispatch, isVerificationSent]);

  useEffect(() => {
    if (isVerificationSent) {
      navigate(`/verify-code?email=${email}`);
    }
  }, [isVerificationSent, email, navigate]);

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!isValidEmail(email)) {
      setErrorMessage(MESSAGES.PLEASE_ENTER_VALID_EMAIL);
      return;
    }

    dispatch(forgotPasswordRequest(email));
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
                data-testid="enter-email-input"
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
