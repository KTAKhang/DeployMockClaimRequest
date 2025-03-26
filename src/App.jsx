import AllRoutes from "./components/AllRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { restoreUser } from "./redux/actions/authActions";
import Chatbot from "./components/ChatBot/Chatbot.jsx";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      dispatch(restoreUser());
    }
  }, [dispatch]);

  return (
    <>
      <AllRoutes />
      <ToastContainer />
      <div>
        <Chatbot />
      </div>
    </>
  );
}
