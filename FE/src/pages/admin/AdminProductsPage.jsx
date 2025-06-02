import { useState, useContext } from 'react';
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
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { AdminContext } from '../../contexts/AdminContext';

const AdminProductsPage = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useContext(AdminContext);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: ''
  });
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Other'];

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      image: ''
    });
    setOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image: product.image || ''
    });
    setOpen(true);
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
      setAlert({
        show: true,
        message: 'Product deleted successfully',
        severity: 'success'
      });
      setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 3000);
    }
  };

  const handleSubmit = () => {
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock)
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      setAlert({
        show: true,
        message: 'Product updated successfully',
        severity: 'success'
      });
    } else {
      addProduct(productData);
      setAlert({
        show: true,
        message: 'Product added successfully',
        severity: 'success'
      });
    }

    setOpen(false);
    setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 3000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStockColor = (stock) => {
    if (stock === 0) return 'error';
    if (stock < 10) return 'warning';
    return 'success';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Product Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Product
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="center">Stock</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Box
                    component="img"
                    sx={{
                      width: 50,
                      height: 50,
                      objectFit: 'cover',
                      borderRadius: 1
                    }}
                    src={product.image || '/api/placeholder/50/50'}
                    alt={product.name}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {product.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={product.category} size="small" />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6">
                    ${product.price.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={product.stock}
                    color={getStockColor(product.stock)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(product)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(product.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Product Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Product Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              fullWidth
              multiline
              rows={3}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                required
                sx={{ flex: 1 }}
              />
              <TextField
                label="Stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                inputProps={{ min: 0 }}
                required
                sx={{ flex: 1 }}
              />
            </Box>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Image URL"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              fullWidth
              placeholder="https://example.com/image.jpg"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name || !formData.description || !formData.price || !formData.category || !formData.stock}
          >
            {editingProduct ? 'Update' : 'Add'} Product
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminProductsPage;
