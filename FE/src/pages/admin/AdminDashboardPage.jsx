import { Container, Box } from '@mui/material';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../../components/Dashboard';
import { AdminContext } from '../../contexts/AdminContext';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AdminContext);

  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Don't render the dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Dashboard />
      </Box>
    </Container>
  );
};

export default AdminDashboardPage;
