import React from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';
import WebSocketNotification from './WebSocketNotification';

const Layout = ({ children, fullWidth = false, hideWebSocket = false }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      {!hideWebSocket && <WebSocketNotification />}
      
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        {fullWidth ? (
          <Box sx={{ width: '100%' }}>
            {children}
          </Box>
        ) : (
          <Container maxWidth="lg">
            {children}
          </Container>
        )}
      </Box>
    </Box>
  );
};

export default Layout;
