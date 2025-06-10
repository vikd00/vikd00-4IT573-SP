import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AccessDeniedPage from "../pages/AccessDeniedPage";

const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const { loading, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return null;
  }

  if (!isAuthenticated()) {
    return null;
  }

  if (!isAdmin()) {
    return <AccessDeniedPage />;
  }

  return children;
};

export default AdminRoute;
