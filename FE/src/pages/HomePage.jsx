import { useState, useEffect } from "react";
import { Box, Typography, Button, Container, Grid, Card, CardContent } from "@mui/material";
import { Store, ShoppingCart, Security } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ProductList from "../components/ProductList";

const HomePage = () => {
	const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      {/* Hero sekcia */}
      <Box
        sx={{
          background: "linear-gradient(to right, #2b5876, #4e4376);",
          color: "white",
          py: 8,
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom>
            Vitajte v našom E-Shope
          </Typography>

          <Typography variant="h6" paragraph sx={{ opacity: 0.9 }}>
            Objavte najnovšie produkty za skvelé ceny. Kvalita a spoľahlivosť na
            prvom mieste.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/products")}
            sx={{
              mt: 2,
              mr: 2,
              backgroundColor: "white",
              color: "primary.main",
              "&:hover": {
                backgroundColor: "grey.100",
              },
            }}
          >
            Nakupovať teraz
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/cart")}
            sx={{
              mt: 2,
              borderColor: "white",
              color: "white",
              "&:hover": {
                borderColor: "white",
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Zobraziť košík
          </Button>
        </Container>
      </Box>

      {/* Výhody sekcia */}
      <Box sx={{ py: 6, backgroundColor: "grey.50" }}>
        <Container maxWidth="lg">
          <Typography variant="h4" textAlign="center" gutterBottom>
            Prečo si vybrať nás?
          </Typography>

          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: "center", height: "100%" }}>
                <CardContent>
                  <Store color="primary" sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Široký výber
                  </Typography>
                  <Typography color="text.secondary">
                    Tisíce produktov z rôznych kategórií pre všetky vaše potreby
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: "center", height: "100%" }}>
                <CardContent>
                  <ShoppingCart color="primary" sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Rýchle doručenie
                  </Typography>
                  <Typography color="text.secondary">
                    Doručenie do 24 hodín pre produkty na sklade
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: "center", height: "100%" }}>
                <CardContent>
                  <Security color="primary" sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Bezpečné platby
                  </Typography>
                  <Typography color="text.secondary">
                    Všetky transakcie sú zabezpečené najnovšími technológiami
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Produkty sekcia */}
      <Box sx={{ py: 6 }}>
        <ProductList title="Produkty" showSearch={true} showFilters={true} />
      </Box>
    </Box>
  );
};

export default HomePage;
