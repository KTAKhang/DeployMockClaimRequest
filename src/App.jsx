import AllRoutes from "./components/AllRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { restoreUser } from "./redux/actions/authActions";
import { setNavigator } from "./redux/store";
import Chatbot from "./components/ChatBot/Chatbot.jsx";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop.jsx";

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Set the navigator function in Redux
    dispatch(setNavigator(navigate));

    // Restore user if available
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      dispatch(restoreUser());
    }
  }, [dispatch, navigate]);

  return (
    <>
      <ScrollToTop />
      <AllRoutes />
      <ToastContainer />
      <div>
        <Chatbot />
      </div>
    </>
  );
}
