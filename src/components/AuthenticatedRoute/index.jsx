import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AuthenticatedRoute = ({ children }) => {
  const { token, role } = useSelector((state) => state.auth);
  const isAuthenticated = !!token;

  if (typeof children === 'function') {
    return children({ isAuthenticated, role });
  }

  // Nếu component cần authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default AuthenticatedRoute;
