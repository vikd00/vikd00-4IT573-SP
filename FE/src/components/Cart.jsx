import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  IconButton,
  Divider,
} from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
  } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated()) {
      navigate("/login", {
        state: {
          from: { pathname: "/checkout" },
          message:
            "Pre dokončenie objednávky sa musíte prihlásiť alebo zaregistrovať",
        },
      });
    } else {
      navigate("/checkout");
    }
  };

  if (cartItems.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h5" gutterBottom>
          Váš košík je prázdny
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Pridajte si nejaké produkty do košíka
        </Typography>
        <Button variant="contained" href="/products">
          Nakupovať
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Nákupný košík ({getCartItemsCount()} položiek)
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {cartItems.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    component="img"
                    src={item.image || "/api/placeholder/100/100"}
                    alt={item.name}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />

                  <Box flexGrow={1}>
                    <Typography variant="h6" gutterBottom>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      €{item.price?.toFixed(2)} za kus
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                    >
                      <Remove />
                    </IconButton>

                    <Typography
                      variant="body1"
                      sx={{ minWidth: 30, textAlign: "center" }}
                    >
                      {item.quantity}
                    </Typography>

                    <IconButton
                      size="small"
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                    >
                      <Add />
                    </IconButton>
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{ minWidth: 80, textAlign: "right" }}
                  >
                    €{(item.price * item.quantity).toFixed(2)}
                  </Typography>

                  <IconButton
                    color="error"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}

          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => clearCart()}
            >
              Vyprázdniť košík
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Súhrn objednávky
              </Typography>
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
              <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography variant="h6">Celkom:</Typography>
                <Typography variant="h6">
                  €{(getCartTotal() + 5).toFixed(2)}
                </Typography>
              </Box>{" "}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleCheckout}
              >
                Pokračovať k objednávke
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Cart;
