import { useState, useEffect } from 'react';
import { 
  Snackbar, 
  Alert, 
  Box, 
  Typography, 
  Chip 
} from '@mui/material';
import { 
  Wifi, 
  WifiOff 
} from '@mui/icons-material';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../contexts/AuthContext';

const WebSocketNotification = () => {
  const { token } = useAuth();
  const { connected, messages, reconnectAttempts } = useWebSocket('ws://localhost:3001', token);
  
  const [notifications, setNotifications] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      
      // Process different types of WebSocket messages
      switch (latestMessage.type) {
        case 'order.status':
          setCurrentNotification({
            severity: 'info',
            message: `Stav objednávky #${latestMessage.orderId} bol zmenený na: ${latestMessage.status}`
          });
          break;
          
        case 'inventory.update':
          setCurrentNotification({
            severity: 'warning',
            message: `Produkt "${latestMessage.productName}" má už len ${latestMessage.stock} kusov skladom`
          });
          break;
          
        case 'cart.sync':
          setCurrentNotification({
            severity: 'success',
            message: 'Košík bol synchronizovaný'
          });
          break;
          
        case 'admin.notification':
          setCurrentNotification({
            severity: 'info',
            message: latestMessage.message
          });
          break;
          
        default:
          setCurrentNotification({
            severity: 'info',
            message: latestMessage.message || 'Nová notifikácia'
          });
      }
      
      setOpenSnackbar(true);
      setNotifications(prev => [...prev, latestMessage]);
    }
  }, [messages]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box>
      {/* WebSocket Connection Status */}
      <Box 
        position="fixed" 
        top={80} 
        right={16} 
        zIndex={1300}
      >
        <Chip
          icon={connected ? <Wifi /> : <WifiOff />}
          label={
            connected ? 'Online' : 
            reconnectAttempts > 0 ? `Pripájam... (${reconnectAttempts}/5)` : 
            'Offline'
          }
          color={connected ? 'success' : 'error'}
          size="small"
          variant="outlined"
          sx={{ 
            backgroundColor: 'background.paper',
            opacity: 0.9
          }}
        />
      </Box>

      {/* Notification Snackbar */}
      <Snackbar
        open={openSnackbar && currentNotification}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 8 }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={currentNotification?.severity || 'info'}
          variant="filled"
        >
          {currentNotification?.message}
        </Alert>
      </Snackbar>

      {/* Recent Notifications Panel - for development/debugging */}
      {process.env.NODE_ENV === 'development' && notifications.length > 0 && (
        <Box 
          position="fixed" 
          bottom={16} 
          right={16} 
          width={300}
          maxHeight={200}
          overflow="auto"
          bgcolor="background.paper"
          border={1}
          borderColor="grey.300"
          borderRadius={1}
          p={1}
          zIndex={1200}
          sx={{ display: 'none' }} // Hidden by default, can be shown for debugging
        >
          <Typography variant="caption" display="block" gutterBottom>
            Recent WebSocket Messages:
          </Typography>
          {notifications.slice(-5).map((notification, index) => (
            <Typography key={index} variant="caption" display="block">
              {notification.type}: {notification.message}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default WebSocketNotification;
