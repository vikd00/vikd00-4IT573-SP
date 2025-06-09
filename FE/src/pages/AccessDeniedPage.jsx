import { Container, Paper, Typography, Box, Button } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AccessDeniedPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
          <LockIcon sx={{ fontSize: 64, color: 'error.main' }} />
        </Box>
        <Typography variant="h4" component="h1" gutterBottom color="error">
          Prístup zamietnutý
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Nemáte oprávnenie na zobrazenie tejto stránky. Pre prístup k administrátorskej časti je potrebné mať administrátorské práva.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate(-1)}
          >
            Späť
          </Button>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
          >
            Domov
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AccessDeniedPage;
