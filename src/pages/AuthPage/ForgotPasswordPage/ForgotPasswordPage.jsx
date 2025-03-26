// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// function ForgotPasswordPage() {
//   const [email, setEmail] = useState("");
//   const [isVerificationSent, setIsVerificationSent] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const navigate = useNavigate();

//   const handleForgotPasswordSubmit = async (e) => {
//     e.preventDefault();
//     setErrorMessage("");

//     if (!/\S+@\S+\.\S+/.test(email)) {
//       setErrorMessage("Please enter a valid email address.");
//       return;
//     }

//     console.log("Sending request with email:", email);

//     if (email) {
//       try {
//         const result = await axios.post(
//           "https://ojtbe-production.up.railway.app/api/auth/forgot-password",
//           { email }
//         );
//         console.log("API Response:", result.data);

//         if (result.data && result.data.status === "OK") {
//           setIsVerificationSent(true);
//           navigate(`/verify-code?email=${email}`);
//         } else {
//           setErrorMessage(
//             result.data.message ||
//               "Failed to send verification code. Please try again."
//           );
//         }
//       } catch (error) {
//         console.error("Error sending verification code:", error);
//         setErrorMessage(
//           "There was an error sending the verification code. Please try again."
//         );
//       }
//     } else {
//       setErrorMessage("Please enter a valid email.");
//     }
//   };

//   const handleGoToLogin = () => {
//     navigate("/");
//   };

//   const formatEmail = (email) => {
//     const [localPart, domain] = email.split("@");
//     const visibleStart = localPart.slice(0, 2);
//     const visibleEnd = localPart.slice(-4);
//     return `${visibleStart}*******${visibleEnd}@${domain}`;
//   };

//   return (
//     <div
//       className="flex min-h-screen justify-center items-center bg-cover bg-center"
//       style={{
//         backgroundImage: `url('https://career.fpt-software.com/wp-content/uploads/2020/07/fville-hanoi.jpg')`,
//       }}
//     >
//       <div className="absolute inset-0 bg-black opacity-50"></div>
//       <div className="relative bg-white p-12 rounded-lg shadow-xl w-[550px] max-w-[90%]">
//         <h2 className="text-2xl font-bold text-center mb-6">
//           {isVerificationSent
//             ? "A verification code has been sent to your email"
//             : "Forgot Password"}
//         </h2>

//         {!isVerificationSent ? (
//           <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
//             <div>
//               <label htmlFor="email" className="block text-lg font-semibold">
//                 Enter your email
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded-md"
//                 placeholder="Enter your email"
//               />
//             </div>

//             {errorMessage && (
//               <div className="text-red-500 text-center mt-2">
//                 {errorMessage}
//               </div>
//             )}

//             <div className="flex justify-center mt-6">
//               <button
//                 type="submit"
//                 className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-md w-full"
//               >
//                 Send Code
//               </button>
//             </div>
//             <div className="text-center mt-4">
//               <button
//                 type="button"
//                 onClick={handleGoToLogin}
//                 className="text-blue-500 hover:underline"
//               >
//                 Go to Login
//               </button>
//             </div>
//           </form>
//         ) : (
//           <div className="text-center">
//             <p>
//               A verification code has been sent to your{" "}
//               <span className="text-blue-500">{formatEmail(email)}</span>
//             </p>
//             <button
//               onClick={handleGoToLogin}
//               className="mt-4 text-blue-500 hover:underline"
//             >
//               Go to Login
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ForgotPasswordPage;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading
  const navigate = useNavigate();

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // Hiển thị Toastify khi bắt đầu gửi mã
    setIsLoading(true);

    try {
      const result = await axios.post(
        "https://ojtbe-production.up.railway.app/api/auth/forgot-password",
        { email }
      );
      console.log("API Response:", result.data);

      if (result.data && result.data.status === "OK") {
        setIsVerificationSent(true);
        toast.success("Verification code sent successfully!");
        navigate(`/verify-code?email=${email}`);
      } else {
        setErrorMessage(
          result.data.message ||
            "Failed to send verification code. Please try again."
        );
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      setErrorMessage(
        "There was an error sending the verification code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate("/");
  };

  const formatEmail = (email) => {
    const [localPart, domain] = email.split("@");
    const visibleStart = localPart.slice(0, 2);
    const visibleEnd = localPart.slice(-4);
    return `${visibleStart}*******${visibleEnd}@${domain}`;
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
          {isVerificationSent
            ? "A verification code has been sent to your email"
            : "Forgot Password"}
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
                  !/\S+@\S+\.\S+/.test(email) || isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
                disabled={!/\S+@\S+\.\S+/.test(email) || isLoading}
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
                Go to Login
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
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
