import React from "react";
import { Box, Container } from "@mui/material";
import Header from "./Header";
import WebSocketNotification from "./WebSocketNotification";

const Layout = ({ children }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Header />
      <WebSocketNotification />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
        }}
      >
        {children && (
          <Container maxWidth="lg">
            {children}
          </Container>
        )}
      </Box>
    </Box>
  );
};

export default Layout;
