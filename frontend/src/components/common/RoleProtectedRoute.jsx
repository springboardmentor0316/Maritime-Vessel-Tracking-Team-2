import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
