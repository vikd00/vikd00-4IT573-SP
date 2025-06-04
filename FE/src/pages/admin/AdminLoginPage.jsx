import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert
} from '@mui/material';
import { AdminPanelSettings } from '@mui/icons-material';
import { AdminContext } from '../../contexts/AdminContext';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useContext(AdminContext);
  
  // Check if already authenticated and redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(formData.username, formData.password);
      
      if (success) {
        navigate('/admin');
      } else {
        setError('Admin login failed - invalid credentials or insufficient privileges');
      }
    } catch (error) {
      setError('An error occurred during login');
      console.error('Admin login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="80vh"
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box textAlign="center" mb={3}>
            <AdminPanelSettings sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Admin Login
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in as administrator
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              name="username"
              label="Admin Username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <TextField
              fullWidth
              margin="normal"
              name="password"
              label="Admin Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              color="error"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Signing in...' : 'Sign in as Admin'}
            </Button>

            <Box textAlign="center">
              <Typography variant="body2">
                <Link component={RouterLink} to="/login">
                  User Login
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminLoginPage;
