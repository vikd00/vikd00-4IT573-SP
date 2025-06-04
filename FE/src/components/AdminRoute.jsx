import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../contexts/AdminContext';

const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading } = useContext(AdminContext);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  // Show nothing while loading auth
  if (isAuthLoading) {
    return null; // You could return a loading spinner here if desired
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Render the protected admin component
  return children;
};

export default AdminRoute;
