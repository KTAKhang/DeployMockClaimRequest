import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../../../redux/actions/authActions";
import { toast } from "react-toastify";

import { BACKGROUND_IMAGE_URL, ROLE_REDIRECTS } from "./const";
import { MESSAGES } from "./string";
import { validateForm, handleRememberMeChange } from "./utils";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token, role } = useSelector((state) => state.auth);

  useEffect(() => {
    toast.dismiss();
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem("accessToken", token.access_token);
      localStorage.setItem("role", role);

      const redirectUrl = ROLE_REDIRECTS[role] || "/login";
      navigate(redirectUrl);
    }
  }, [token, role, navigate]);

  const handleForgotPasswordClick = () => {
    navigate("/forgot-password");
  };

  const isFormValid = validateForm(email, password);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error(MESSAGES.PLEASE_ENTER_ACCOUNT);
      return;
    }

    dispatch(loginRequest({ email, password }));
  };

  if (token) {
    return null;
  }

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
          {MESSAGES.SIGN_IN}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-lg font-semibold">
              Email
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
          <div>
            <label htmlFor="password" className="block text-lg font-semibold">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter your password"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="flex items-center mt-4">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={() => handleRememberMeChange(rememberMe, setRememberMe)}
              className="mr-2"
            />
            <label htmlFor="rememberMe" className="text-sm font-semibold">
              Remember me
            </label>
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className={`px-6 py-2 font-semibold rounded-md w-full transition duration-300 ${
                !isFormValid || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={!isFormValid || loading}
            >
              {loading ? MESSAGES.SIGNING_IN : MESSAGES.SIGN_IN}
            </button>
          </div>
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={handleForgotPasswordClick}
              className="text-blue-500 hover:underline"
            >
              {MESSAGES.FORGOT_PASSWORD}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
