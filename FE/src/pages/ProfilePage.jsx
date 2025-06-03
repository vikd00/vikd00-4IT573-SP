import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Alert,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { AccountCircle, Save, Lock, Person } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '../api/users';

const ProfilePage = () => {
  const { user, token, updateUser } = useAuth();
    const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      
      try {
        setFetchingProfile(true);
        const profileData = await getUserProfile(token);
        setFormData({
          username: profileData.username || '',
          email: profileData.email || '',
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          phone: profileData.phone || '',
          address: profileData.address || ''
        });
      } catch (err) {
        setError('Nastala chyba pri načítavaní profilu');
        console.error('Error fetching profile:', err);
      } finally {
        setFetchingProfile(false);
      }
    };

    fetchProfile();
  }, [token]);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Nie ste prihlásený');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const updateData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address
      };

      // Add password change if provided
      if (passwordData.newPassword) {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          setError('Nové heslá sa nezhodujú');
          setLoading(false);
          return;
        }
        if (passwordData.newPassword.length < 6) {
          setError('Nové heslo musí mať aspoň 6 znakov');
          setLoading(false);
          return;
        }
        if (!passwordData.currentPassword) {
          setError('Zadajte aktuálne heslo');
          setLoading(false);
          return;
        }
        
        updateData.currentPassword = passwordData.currentPassword;
        updateData.password = passwordData.newPassword;
      }

      const updatedUser = await updateUserProfile(updateData, token);
      
      // Update the auth context with new user data
      updateUser(updatedUser);
      
      // Clear password fields after successful update
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setMessage('Profil bol úspešne aktualizovaný');
    } catch (err) {
      setError(err.message || 'Nastala chyba pri aktualizácii profilu');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };
  if (fetchingProfile) {
    return (
      <Container maxWidth="md">
        <Box py={4} display="flex" justifyContent="center">
          <Typography>Načítavanie profilu...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
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
            <Box display="flex" flexDirection="column" gap={3}>
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

              <TextField
                fullWidth
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />

              <TextField
                fullWidth
                name="firstName"
                label="Meno"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
              />

              <TextField
                fullWidth
                name="lastName"
                label="Priezvisko"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
              />              <TextField
                fullWidth
                name="phone"
                label="Telefón"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />

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

              {/* Password Change Section */}
              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" gutterBottom>
                  Zmena hesla
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Nechajte prázdne, ak nechcete zmeniť heslo
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    fullWidth
                    name="currentPassword"
                    label="Aktuálne heslo"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    disabled={loading}
                  />

                  <TextField
                    fullWidth
                    name="newPassword"
                    label="Nové heslo"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    disabled={loading}
                    helperText="Minimálne 6 znakov"
                  />

                  <TextField
                    fullWidth
                    name="confirmPassword"
                    label="Potvrdiť nové heslo"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    disabled={loading}
                  />
                </Box>
              </Box>

              <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                <Button
                  variant="outlined"
                  onClick={() => window.location.reload()}
                  disabled={loading}
                >
                  Zrušiť
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                >
                  {loading ? 'Ukladá sa...' : 'Uložiť zmeny'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfilePage;
