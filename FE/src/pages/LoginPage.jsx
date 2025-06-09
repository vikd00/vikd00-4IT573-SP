import { useState } from "react";
import { useNavigate, Link as RouterLink, useLocation } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  Divider,
} from "@mui/material";
import { Login as LoginIcon } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(formData.username, formData.password);

      if (result.success) {
        if (result.user.role === "admin" && from.startsWith("/admin")) {
          navigate(from);
        } else if (result.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate(from === "/admin" ? "/" : from);
        }
      } else {
        setError(result.error || "Prihlásenie zlyhalo");
      }
    } catch (err) {
      setError("Nastala chyba pri prihlasovaní");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="80vh"
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Box textAlign="center" mb={3}>
            <LoginIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Prihlásenie
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Prihláste sa do svojho účtu
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              name="username"
              label="Používateľské meno"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              margin="normal"
              name="password"
              label="Heslo"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? "Prihlasuje sa..." : "Prihlásiť sa"}
            </Button>
            <Divider sx={{ my: 2 }} />{" "}
            <Box textAlign="center">
              <Typography variant="body2">
                Nemáte účet?{" "}
                <Link component={RouterLink} to="/register">
                  Zaregistrujte sa
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
