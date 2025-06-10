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
} from "@mui/material";
import { PersonAdd } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";
  const redirectMessage = location.state?.message;

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

    if (formData.password !== formData.confirmPassword) {
      setError("Heslá sa nezhodujú");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Heslo musí mať aspoň 6 znakov");
      setLoading(false);
      return;
    }

    try {
      const result = await register(formData.username, formData.password);

      if (result.success) {
        navigate(from);
      } else {
        setError(result.error || "Registrácia zlyhala");
      }
    } catch (err) {
      setError("Nastala chyba pri registrácii");
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
            <PersonAdd sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Registrácia
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Vytvorte si nový účet
            </Typography>{" "}
          </Box>

          {redirectMessage && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {redirectMessage}
            </Alert>
          )}

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
              helperText="Minimálne 3 znaky"
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
              helperText="Minimálne 6 znakov"
            />
            <TextField
              fullWidth
              margin="normal"
              name="confirmPassword"
              label="Potvrdiť heslo"
              type="password"
              value={formData.confirmPassword}
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
              {loading ? "Registruje sa..." : "Zaregistrovať sa"}
            </Button>{" "}
            <Box textAlign="center">
              <Typography variant="body2">
                Už máte účet?{" "}
                <Link component={RouterLink} to="/login" state={location.state}>
                  Prihláste sa
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
