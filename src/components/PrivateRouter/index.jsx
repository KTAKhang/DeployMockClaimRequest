import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const PrivateRoute = ({ children, requiredRole }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (!storedRole || (requiredRole && storedRole !== requiredRole)) {
      navigate("/");
    }
  }, [requiredRole, navigate]);
  return children ? children : <Outlet />;
};

export default PrivateRoute;
