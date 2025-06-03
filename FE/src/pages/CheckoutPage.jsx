import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Alert,
  CircularProgress,
} from "@mui/material";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { createOrder } from "../api/orders";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated, token } = useAuth();

  const [shippingData, setShippingData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Slovensko",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setShippingData({
      ...shippingData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      setError("Váš košík je prázdny");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const requiredFields = [
        "firstName",
        "lastName",
        "address",
        "city",
        "postalCode",
      ];
      const missingFields = requiredFields.filter(
        (field) => !shippingData[field]
      );

      if (missingFields.length > 0) {
        throw new Error("Vyplňte prosím všetky povinné polia");
      }

      const formattedAddress = `${shippingData.firstName} ${shippingData.lastName}, ${shippingData.address}, ${shippingData.city}, ${shippingData.postalCode}, ${shippingData.country}`;

      const order = await createOrder(formattedAddress, token);

      if (!order || order.error) {
        throw new Error(
          order?.error?.message || "Chyba pri vytváraní objednávky"
        );
      }

      try {
        await clearCart();
      } catch (cartError) {
        console.warn("Error clearing cart, but order was created:", cartError);
      }

      navigate("/orders", {
        state: {
          message: "Objednávka bola úspešne vytvorená!",
          orderId: order.id,
        },
      });
    } catch (err) {
      console.error("Error creating order:", err);
      setError(
        "Nastala chyba pri vytváraní objednávky: " +
          (err.message || "Neznáma chyba")
      );
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
          <Button variant="contained" onClick={() => navigate("/products")}>
            Pokračovať v nakupovaní
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box py={4}>
        <Typography variant="h4" mb={3}>
          Dokončenie objednávky
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Shipping Form */}
          <Grid item size={{ xs: 12, sm: 6 }}>
            <Card sx={{ width: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Dodacia adresa
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                  <Box display="flex" flexDirection="column" gap={3}>
                    <TextField
                      required
                      fullWidth
                      name="firstName"
                      label="Meno"
                      value={shippingData.firstName}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <TextField
                      required
                      fullWidth
                      name="lastName"
                      label="Priezvisko"
                      value={shippingData.lastName}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <TextField
                      required
                      fullWidth
                      name="address"
                      label="Adresa"
                      value={shippingData.address}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <TextField
                      required
                      fullWidth
                      name="city"
                      label="Mesto"
                      value={shippingData.city}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <TextField
                      required
                      fullWidth
                      name="postalCode"
                      label="PSČ"
                      value={shippingData.postalCode}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <TextField
                      required
                      fullWidth
                      name="country"
                      label="Krajina"
                      value={shippingData.country}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Box>{" "}
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ mt: 3 }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                        Spracováva sa...
                      </>
                    ) : (
                      "Dokončiť objednávku"
                    )}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          {/* Order Summary */}
          <Grid item size={{ xs: 12, sm: 6 }}>
            <Card sx={{ width: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Súhrn objednávky
                </Typography>

                <List>
                  {cartItems.map((item) => (
                    <ListItem key={item.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={item.name}
                        secondary={`${item.quantity}x €${item.price.toFixed(
                          2
                        )}`}
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
