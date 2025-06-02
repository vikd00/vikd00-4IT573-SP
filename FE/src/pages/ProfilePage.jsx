import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Avatar,
  Alert
} from '@mui/material';
import { AccountCircle, Save } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
    setMessage('');

    try {
      // TODO: Call profile update API
      console.log('Updating profile:', formData);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('Profil bol úspešne aktualizovaný');
    } catch (err) {
      setError('Nastala chyba pri aktualizácii profilu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Paper sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" mb={4}>
            <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}>
              <AccountCircle sx={{ fontSize: 60 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" gutterBottom>
                Môj profil
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Upravte svoje osobné údaje
              </Typography>
            </Box>
          </Box>

          {message && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="username"
                  label="Používateľské meno"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  helperText="Používateľské meno sa nedá zmeniť"
                  InputProps={{
                    readOnly: true
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="firstName"
                  label="Meno"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="lastName"
                  label="Priezvisko"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Telefón"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="address"
                  label="Adresa"
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loading}
                  >
                    {loading ? 'Ukladá sa...' : 'Uložiť zmeny'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={() => window.location.reload()}
                    disabled={loading}
                  >
                    Zrušiť
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfilePage;
