import { useState, useEffect } from "react";
import {
  Snackbar,
  Alert,
  Box,
  Typography,
  Chip,
  IconButton,
  Badge,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
} from "@mui/material";
import {
  Wifi,
  WifiOff,
  Notifications,
  NotificationsOff,
  Close,
  ExpandLess,
  ExpandMore,
  CheckCircle,
  Warning,
  Info,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import useWsStatus from "../hooks/useWsStatus";
import useAdminNotifications from "../hooks/useAdminNotifications";
import useOrderStatus from "../hooks/useOrderStatus";

const WebSocketNotification = () => {
  const { user } = useAuth();
  const connected = useWsStatus();
  const rawAdminNotifications = useAdminNotifications();
  const orderStatusHook = useOrderStatus();

  const adminNotifications = Array.isArray(rawAdminNotifications)
    ? rawAdminNotifications
    : [];
  const orderStatusChanges = Array.isArray(orderStatusHook?.statusChanges)
    ? orderStatusHook.statusChanges
    : [];

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [notificationsPaused, setNotificationsPaused] = useState(false);
  const [showNotificationList, setShowNotificationList] = useState(false);

  const unreadCount = adminNotifications.length + orderStatusChanges.length;

  useEffect(() => {
    if (adminNotifications.length > 0 && !notificationsPaused) {
      const latest = adminNotifications[0];
      setCurrentNotification({
        message: latest.message || `${latest.type} notification`,
        severity: latest.type === "lowStock" ? "warning" : "info",
      });
      setOpenSnackbar(true);
    }
  }, [adminNotifications.length, notificationsPaused]);

  useEffect(() => {
    if (
      orderStatusChanges.length > 0 &&
      !notificationsPaused &&
      user?.role !== "admin"
    ) {
      const latest = orderStatusChanges[0];
      setCurrentNotification({
        message: `Objednávka #${latest.orderId} - ${latest.status}`,
        severity: "info",
      });
      setOpenSnackbar(true);
    }
  }, [orderStatusChanges.length, notificationsPaused, user]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };
  const toggleNotificationsPause = () => {
    setNotificationsPaused((prev) => !prev);
  };

  const toggleNotificationList = () => {
    setShowNotificationList((prev) => !prev);
  };

  const markAllAsRead = () => {
    console.log("Mark all notifications as read");
  };

  const clearAllNotifications = () => {
    console.log("Clear all notifications");
  };

  const getConnectionStatus = () => {
    if (!connected) {
      return {
        label: "Odpojené",
        color: "error",
        icon: <WifiOff />,
      };
    } else {
      return {
        label: "Pripojené",
        color: "success",
        icon: <Wifi />,
      };
    }
  };

  const connectionDisplay = getConnectionStatus();

  return (
    <Box>
      <Box
        position="fixed"
        top={80}
        right={16}
        zIndex={1300}
        display="flex"
        gap={1}
        alignItems="center"
      >
        <Chip
          icon={connectionDisplay.icon}
          label={connectionDisplay.label}
          color={connectionDisplay.color}
          size="small"
          variant="outlined"
          sx={{
            backgroundColor: "background.paper",
            opacity: 0.9,
          }}
        />
        {connected && (
          <>
            <IconButton
              size="small"
              onClick={toggleNotificationsPause}
              sx={{
                backgroundColor: "background.paper",
                opacity: 0.9,
                "&:hover": { opacity: 1 },
              }}
            >
              {notificationsPaused ? <NotificationsOff /> : <Notifications />}
            </IconButton>

            <IconButton
              size="small"
              onClick={toggleNotificationList}
              sx={{
                backgroundColor: "background.paper",
                opacity: 0.9,
                "&:hover": { opacity: 1 },
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
                {showNotificationList ? <ExpandLess /> : <ExpandMore />}
              </Badge>
            </IconButton>
          </>
        )}
      </Box>
      <Collapse in={showNotificationList}>
        <Box
          position="fixed"
          top={120}
          right={16}
          width={350}
          maxHeight={400}
          zIndex={1200}
        >
          <Paper elevation={3} sx={{ overflow: "hidden" }}>
            <Box p={2} bgcolor="primary.main" color="primary.contrastText">
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">Notifikácie</Typography>
                <Box>
                  <IconButton
                    size="small"
                    onClick={markAllAsRead}
                    sx={{ color: "inherit", mr: 1 }}
                  >
                    <CheckCircle />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={clearAllNotifications}
                    sx={{ color: "inherit" }}
                  >
                    <Close />
                  </IconButton>
                </Box>
              </Box>
            </Box>
            <List sx={{ maxHeight: 300, overflow: "auto" }}>
              {adminNotifications.length === 0 &&
              orderStatusChanges.length === 0 ? (
                <ListItem>
                  <ListItemText primary="Žiadne notifikácie" />
                </ListItem>
              ) : (
                <>
                  {adminNotifications.map((notification, index) => (
                    <ListItem key={`admin-${index}`}>
                      <ListItemIcon>
                        <Warning color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary={notification.message || notification.type}
                        secondary={new Date(
                          notification.timestamp
                        ).toLocaleString()}
                      />
                    </ListItem>
                  ))}
                  {orderStatusChanges.map((change, index) => (
                    <ListItem key={`order-${index}`}>
                      <ListItemIcon>
                        <Info color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Objednávka #${change.orderId}: ${change.status}`}
                        secondary={new Date(change.timestamp).toLocaleString()}
                      />
                    </ListItem>
                  ))}
                </>
              )}
            </List>
          </Paper>
        </Box>
      </Collapse>
      <Snackbar
        open={openSnackbar && currentNotification && !notificationsPaused}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 8 }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={currentNotification?.severity || "info"}
          variant="filled"
          sx={{
            "& .MuiAlert-action": {
              alignItems: "center",
            },
          }}
        >
          {currentNotification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WebSocketNotification;
