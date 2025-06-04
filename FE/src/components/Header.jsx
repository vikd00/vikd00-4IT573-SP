import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Chip,
} from "@mui/material";
import {
  ShoppingCart,
  AccountCircle,
  Store,
  AdminPanelSettings,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getCartItemsCount } = useCart();

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    handleMenuClose();
  };

  const handleLogin = () => {
    navigate("/login");
    handleMenuClose();
  };

  const handleProfile = () => {
    navigate("/profile");
    handleMenuClose();
  };

  const handleOrders = () => {
    navigate("/orders");
    handleMenuClose();
  };

  const handleAdminPanel = () => {
    navigate("/admin");
    handleMenuClose();
  };
  const handleAdminOrders = () => {
    navigate("/admin/orders");
    handleMenuClose();
  };
  const handleAdminProducts = () => {
    navigate("/admin/products");
    handleMenuClose();
  };
  const handleAdminUsers = () => {
    navigate("/admin/users");
    handleMenuClose();
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        background: "linear-gradient(to right, #2b5876, #4e4376);",
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="home"
          onClick={() => navigate("/")}
          sx={{ mr: 2 }}
        >
          <Store />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          E-Shop
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button color="inherit" onClick={() => navigate("/products")}>
            Produkty
          </Button>

          <IconButton color="inherit" onClick={() => navigate("/cart")}>
            <Badge badgeContent={getCartItemsCount()} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>

          {isAuthenticated() ? (
            <>
              {isAdmin() && (
                <Chip
                  icon={<AdminPanelSettings />}
                  label="Admin"
                  size="small"
                  color="warning"
                  onClick={handleAdminPanel}
                  sx={{ cursor: "pointer" }}
                />
              )}

              <IconButton color="inherit" onClick={handleMenuOpen}>
                <AccountCircle />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleProfile}>Profil</MenuItem>
                <MenuItem onClick={handleOrders}>Objednávky</MenuItem>
                {isAdmin() && [
                  <MenuItem key="admin-orders" onClick={handleAdminOrders}>
                    Admin Objednávky
                  </MenuItem>,
                  <MenuItem key="admin-products" onClick={handleAdminProducts}>
                    Admin Produkty
                  </MenuItem>,
                  <MenuItem key="admin-users" onClick={handleAdminUsers}>
                    Admin Používatelia
                  </MenuItem>,
                ]}
                <MenuItem onClick={handleLogout}>Odhlásiť sa</MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" onClick={handleLogin}>
              Prihlásiť sa
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
