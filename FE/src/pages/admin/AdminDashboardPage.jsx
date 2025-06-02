import { Container, Box } from '@mui/material';
import Dashboard from '../../components/Dashboard';

const AdminDashboardPage = () => {
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Dashboard />
      </Box>
    </Container>
  );
};

export default AdminDashboardPage;
