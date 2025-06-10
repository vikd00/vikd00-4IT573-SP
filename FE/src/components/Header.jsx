import { useState, useEffect } from "react";
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Divider,
} from "@mui/material";
import {
  ShoppingCart,
  AccountCircle,
  Store,
  AdminPanelSettings,
  Notifications,
  Wifi,
  WifiOff,
  Warning,
  Info,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import useWsStatus from "../hooks/useWsStatus";
import useAdminNotifications from "../hooks/useAdminNotifications";
import useOrderStatus from "../hooks/useOrderStatus";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getCartItemsCount } = useCart();

  // WebSocket and Notifications
  const connected = useWsStatus();
  const rawAdminNotifications = useAdminNotifications();
  const orderStatusHook = useOrderStatus();

  const adminNotifications = Array.isArray(rawAdminNotifications)
    ? rawAdminNotifications
    : [];
  const orderStatusChanges = Array.isArray(orderStatusHook?.statusChanges)
    ? orderStatusHook.statusChanges
    : [];
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [adminAnchorEl, setAdminAnchorEl] = useState(null);
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleAdminMenuOpen = (event) => {
    setAdminAnchorEl(event.currentTarget);
  };

  const handleAdminMenuClose = () => {
    setAdminAnchorEl(null);
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
    handleAdminMenuClose();
  };
  const handleAdminOrders = () => {
    navigate("/admin/orders");
    handleAdminMenuClose();
  };
  const handleAdminProducts = () => {
    navigate("/admin/products");
    handleAdminMenuClose();
  };
  const handleAdminUsers = () => {
    navigate("/admin/users");
    handleAdminMenuClose();
  };

  const unreadCount = isAuthenticated()
    ? adminNotifications.length + orderStatusChanges.length
    : 0;

  const getConnectionStatus = () => {
    if (!connected) {
      return {
        label: "Odpojené",
        color: "error",
        icon: <WifiOff fontSize="small" />,
      };
    } else {
      return {
        label: "Pripojené",
        color: "success",
        icon: <Wifi fontSize="small" />,
      };
    }
  };

  const connectionDisplay = getConnectionStatus();

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
          aria-label="domov"
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
          {isAuthenticated() && isAdmin() && (
            <Chip
              icon={<AdminPanelSettings />}
              label="Admin"
              size="small"
              color="secondary"
              onClick={handleAdminMenuOpen}
              sx={{ cursor: "pointer" }}
            />
          )}
          <IconButton color="inherit" onClick={handleNotificationOpen}>
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          {isAuthenticated() ? (
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <AccountCircle />
            </IconButton>
          ) : (
            <Button color="inherit" onClick={handleLogin}>
              Prihlásiť sa
            </Button>
          )}
          {/* User Menu */}
          {isAuthenticated() && (
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              sx={{ mt: 1 }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={handleProfile}>Profil</MenuItem>
              <MenuItem onClick={handleOrders}>Objednávky</MenuItem>
              <MenuItem onClick={handleLogout}>Odhlásiť sa</MenuItem>
            </Menu>
          )}
          {/* Admin Menu */}
          {isAuthenticated() && isAdmin() && (
            <Menu
              anchorEl={adminAnchorEl}
              open={Boolean(adminAnchorEl)}
              onClose={handleAdminMenuClose}
              sx={{ mt: 2 }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={handleAdminPanel}>Dashboard</MenuItem>
              <MenuItem onClick={handleAdminOrders}>Admin Objednávky</MenuItem>
              <MenuItem onClick={handleAdminProducts}>Admin Produkty</MenuItem>
              <MenuItem onClick={handleAdminUsers}>Admin Používatelia</MenuItem>
            </Menu>
          )}
          {/* Notification Menu */}
          <Menu
            anchorEl={notificationAnchorEl}
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            slotProps={{
              paper: () => ({
                sx: {
                  minWidth: 350,
                  maxHeight: 400,
                  mt: 1,
                },
              }),
            }}
          >
            {/* Connection Status */}
            <Box px={2} py={1}>
              <Chip
                icon={connectionDisplay.icon}
                label={connectionDisplay.label}
                color={connectionDisplay.color}
                size="small"
                variant="outlined"
              />
            </Box>

            {/* Notifications List */}
            {isAuthenticated() && (
              <>
                <Divider />
                <Box>
                  <Typography variant="h6" sx={{ px: 2, py: 1 }}>
                    Notifikácie ({unreadCount})
                  </Typography>

                  {!isAuthenticated() ||
                  (adminNotifications.length === 0 &&
                    orderStatusChanges.length === 0) ? (
                    <MenuItem>
                      <Typography variant="body2" color="text.secondary">
                        Žiadne notifikácie
                      </Typography>
                    </MenuItem>
                  ) : (
                    <Box sx={{ maxHeight: 250, overflow: "auto" }}>
                      {adminNotifications.map((notification, index) => (
                        <MenuItem
                          key={`admin-${index}`}
                          sx={{ alignItems: "flex-start" }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Warning color="warning" fontSize="small" />
                          </ListItemIcon>
                          <Box>
                            <Typography variant="body2">
                              {notification.message || notification.type}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {new Date(
                                notification.timestamp
                              ).toLocaleString()}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                      {orderStatusChanges.map((change, index) => (
                        <MenuItem
                          key={`order-${index}`}
                          sx={{ alignItems: "flex-start" }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Info color="info" fontSize="small" />
                          </ListItemIcon>
                          <Box>
                            <Typography variant="body2">
                              Objednávka #{change.orderId}: {change.status}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {new Date(change.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
