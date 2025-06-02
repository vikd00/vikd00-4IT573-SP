import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Slovensko'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setShippingData({
      ...shippingData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      setError('Váš košík je prázdny');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Call order creation API
      console.log('Creating order:', {
        items: cartItems,
        shippingAddress: shippingData,
        total: getCartTotal() + 5 // Including shipping
      });

      // Mock order creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearCart();
      navigate('/orders', { 
        state: { 
          message: 'Objednávka bola úspešne vytvorená!' 
        } 
      });
      
    } catch (err) {
      setError('Nastala chyba pri vytváraní objednávky');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="md">
        <Box textAlign="center" py={8}>
          <Typography variant="h5" gutterBottom>
            Váš košík je prázdny
          </Typography>
          <Button variant="contained" onClick={() => navigate('/products')}>
            Pokračovať v nakupovaní
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Dokončenie objednávky
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Shipping Form */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Dodacia adresa
              </Typography>

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="firstName"
                      label="Meno"
                      value={shippingData.firstName}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="lastName"
                      label="Priezvisko"
                      value={shippingData.lastName}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="address"
                      label="Adresa"
                      value={shippingData.address}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="city"
                      label="Mesto"
                      value={shippingData.city}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="postalCode"
                      label="PSČ"
                      value={shippingData.postalCode}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="country"
                      label="Krajina"
                      value={shippingData.country}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3 }}
                >
                  {loading ? 'Spracováva sa...' : 'Dokončiť objednávku'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Súhrn objednávky
                </Typography>

                <List>
                  {cartItems.map((item) => (
                    <ListItem key={item.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={item.name}
                        secondary={`${item.quantity}x €${item.price.toFixed(2)}`}
                      />
                      <Typography variant="body2">
                        €{(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Medzisúčet:</Typography>
                  <Typography>€{getCartTotal().toFixed(2)}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Doprava:</Typography>
                  <Typography>€5.00</Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6">Celkom:</Typography>
                  <Typography variant="h6">
                    €{(getCartTotal() + 5).toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default CheckoutPage;
