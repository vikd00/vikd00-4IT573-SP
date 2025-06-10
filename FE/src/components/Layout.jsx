import React from "react";
import { Box, Container } from "@mui/material";
import Header from "./Header";

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

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pb: 3,
        }}
      >
        {children && (
          <Container
            maxWidth="lg"
          >
            {children}
          </Container>
        )}
      </Box>
    </Box>
  );
};

export default Layout;
