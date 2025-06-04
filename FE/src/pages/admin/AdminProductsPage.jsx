import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Switch,
  Avatar,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  VisibilityOff as DisableIcon,
  Visibility as EnableIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { AdminContext } from "../../contexts/AdminContext";

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    isAuthenticated,
    loadProducts,
  } = useContext(AdminContext);

  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    } else {
      // Load products when component mounts and user is authenticated
      loadProducts();
    }
  }, [isAuthenticated, navigate]); // Remove loadProducts from dependencies to avoid circular calls

  // Don't render the page if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    inventory: "",
    imageUrl: "",
  });
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "success",
  });

  const showAlert = (message, severity = "success") => {
    setAlert({ show: true, message, severity });
    setTimeout(
      () => setAlert({ show: false, message: "", severity: "success" }),
      3000
    );
  };
  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      inventory: "",
      imageUrl: "",
    });
    setOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: (product.price / 100).toString(), // Convert from cents
      inventory: product.inventory.toString(),
      imageUrl: product.imageUrl || "",
    });
    setOpen(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Naozaj chcete vymazať tento produkt?")) {
      try {
        await deleteProduct(productId);
        showAlert("Produkt bol úspešne vymazaný");
      } catch (error) {
        showAlert("Chyba pri mazaní produktu", "error");
      }
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await updateProduct(product.id, {
        ...product,
        active: !product.active,
        price: product.price, // Keep price in cents for backend
      });
      showAlert(
        `Produkt bol ${!product.active ? "aktivovaný" : "deaktivovaný"}`
      );
    } catch (error) {
      showAlert("Chyba pri zmene stavu produktu", "error");
    }
  };

  const handleSubmit = async () => {
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
        inventory: parseInt(formData.inventory),
        imageUrl: formData.imageUrl,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        showAlert("Produkt bol úspešne aktualizovaný");
      } else {
        await addProduct(productData);
        showAlert("Produkt bol úspešne pridaný");
      }

      setOpen(false);
    } catch (error) {
      showAlert(
        `Chyba pri ${editingProduct ? "aktualizácii" : "pridávaní"} produktu`,
        "error"
      );
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getStockColor = (stock) => {
    if (stock === 0) return "error";
    if (stock < 10) return "warning";
    return "success";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("sk-SK", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Správa produktov
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Pridať produkt
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Obrázok</TableCell>
              <TableCell>Názov</TableCell>
              <TableCell>Popis</TableCell>
              <TableCell align="right">Cena (€)</TableCell>
              <TableCell align="center">Sklad</TableCell>
              <TableCell align="center">Aktívny</TableCell>
              <TableCell>Vytvorené</TableCell>
              <TableCell align="center">Akcie</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    #{product.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  {product.imageUrl ? (
                    <Avatar
                      src={product.imageUrl}
                      alt={product.name}
                      sx={{ width: 50, height: 50 }}
                      variant="rounded"
                    />
                  ) : (
                    <Avatar
                      sx={{ width: 50, height: 50, bgcolor: "grey.300" }}
                      variant="rounded"
                    >
                      <ImageIcon />
                    </Avatar>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {product.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {product.description}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6">
                    {(product.price / 100).toFixed(2)} €
                  </Typography>
                </TableCell>{" "}
                <TableCell align="center">
                  <Chip
                    label={product.inventory}
                    color={getStockColor(product.inventory)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={product.active ? "Aktívny" : "Neaktívny"}
                    color={product.active ? "success" : "error"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(product.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1}>
                    {" "}
                    <Tooltip title="Upraviť">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(product)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={product.active ? "Deaktivovať" : "Aktivovať"}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleToggleActive(product)}
                        color={product.active ? "warning" : "success"}
                      >
                        {product.active ? <DisableIcon /> : <EnableIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Vymazať">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(product.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>{" "}
      {/* Add/Edit Product Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingProduct ? "Upraviť produkt" : "Pridať nový produkt"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Názov produktu"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Popis"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              fullWidth
              multiline
              rows={3}
              required
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Cena (€)"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                required
                sx={{ flex: 1 }}
              />
              <TextField
                label="Počet kusov na sklade"
                type="number"
                value={formData.inventory}
                onChange={(e) => handleInputChange("inventory", e.target.value)}
                inputProps={{ min: 0 }}
                required
                sx={{ flex: 1 }}
              />
            </Box>
            <TextField
              label="URL obrázka"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange("imageUrl", e.target.value)}
              fullWidth
              placeholder="https://example.com/obrazok.jpg"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Zrušiť</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.name ||
              !formData.description ||
              !formData.price ||
              !formData.inventory
            }
          >
            {editingProduct ? "Aktualizovať" : "Pridať"} produkt
          </Button>{" "}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminProductsPage;
