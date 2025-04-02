import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  resetVerificationCodeState,
  verifyCodeRequest,
} from "../../../redux/actions/verifyCodeActions";
import { validateVerificationCode, validatePassword } from "./utils";
import { toast } from "react-toastify";
import { MESSAGES } from "./string";

function VerifyCodePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading, isCodeVerified, redirectToLoginFlag, error } = useSelector(
    (state) => state.verifyCode
  );

  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({
    verificationCode: "",
    password: "",
  });

  useEffect(() => {
    dispatch(resetVerificationCodeState());
  }, [dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailFromUrl = params.get("email");

    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [location]);

  const handleVerificationSubmit = (e) => {
    e.preventDefault();

    let formErrors = {};

    formErrors.verificationCode = validateVerificationCode(verificationCode);
    formErrors.password = validatePassword(password);

    if (formErrors.verificationCode || formErrors.password) {
      setErrors(formErrors);
      return;
    }

    dispatch(verifyCodeRequest({ email, verificationCode, password }));
  };

  useEffect(() => {
    console.log("Navigation effect running");
    console.log("isCodeVerified:", isCodeVerified);
    console.log("redirectToLoginFlag:", redirectToLoginFlag);
    console.log("error:", error);

    if (isCodeVerified || redirectToLoginFlag) {
      console.log("Navigation condition met - will redirect in 3 seconds");
      setTimeout(() => {
        console.log("Executing navigation to /login");
        navigate("/login");
      }, 3000);
    }

    if (error) {
      toast.error(error.verificationCode, { autoClose: 8000 });
    }
  }, [isCodeVerified, redirectToLoginFlag, error, navigate]);

  return (
    <div
      className="flex min-h-screen justify-center items-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://career.fpt-software.com/wp-content/uploads/2020/07/fville-hanoi.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative bg-white p-12 rounded-lg shadow-xl w-[550px] max-w-[90%]">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isCodeVerified ? "VERIFICATION" : "VERIFICATION"}
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
              Enter Verification Code
            </label>
            <input
              id="verificationCode"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Enter the verification code"
            />
            {errors.verificationCode && (
              <p className="text-red-500 text-sm">{errors.verificationCode}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-lg font-semibold">
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Enter your new password"
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
