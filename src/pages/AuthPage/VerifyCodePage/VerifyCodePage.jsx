import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

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
    const otpRegex = /^[0-9]{6}$/;
    if (!otpRegex.test(verificationCode)) {
      formErrors.verificationCode = "Invalid OTP. Please enter a 6-digit OTP.";
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      formErrors.password =
        "Password must contain at least 8 characters, including uppercase and a number.";
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    if (verificationCode && password && email) {
      setIsLoading(true); // Đặt trạng thái loading là true khi bắt đầu gửi

      try {
        const result = await axios.post(
          "https://ojtbe-production.up.railway.app/api/auth/reset-password",
          { email, otp: verificationCode, newPassword: password }
        );

        if (result.data) {
          setIsCodeVerified(true);
          toast.success("Password has been successfully reset!", {
            autoClose: 8000,
          });
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setErrors({
            ...formErrors,
            verificationCode: "Invalid verification code. Please try again.",
          });
        }
      } catch (error) {
        console.error("Error during password reset:", error);
        setErrors({
          ...formErrors,
          verificationCode: "You entered the wrong OTP code. Please try again.",
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
          {isCodeVerified ? "Enter New Password" : "Enter Verification Code"}
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
              placeholder="Enter your verification code"
            />
            {errors.verificationCode && (
              <p className="text-red-500 text-sm">{errors.verificationCode}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-lg font-semibold">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="Enter new password"
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
              {isLoading ? "Please wait..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VerifyCodePage;
