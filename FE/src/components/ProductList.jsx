import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  CircularProgress
} from '@mui/material';
import { AddShoppingCart, Visibility } from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const ProductList = ({ products = [], loading = false }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (products.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary">
          Žiadne produkty neboli nájdené
        </Typography>
      </Box>
    );
  }

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const handleViewProduct = (productId) => {
    navigate(`/products/${productId}`);
  };

  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3
              }
            }}
          >
            <CardMedia
              component="img"
              height="200"
              image={product.image || '/api/placeholder/300/200'}
              alt={product.name}
              sx={{ objectFit: 'cover' }}
            />
            
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h2" gutterBottom noWrap>
                {product.name}
              </Typography>
              
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  mb: 2
                }}
              >
                {product.description}
              </Typography>
              
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" color="primary">
                  €{product.price?.toFixed(2)}
                </Typography>
                
                <Chip
                  label={product.inventory > 0 ? `Skladom: ${product.inventory}` : 'Vypredané'}
                  color={product.inventory > 0 ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </CardContent>
            
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Visibility />}
                onClick={() => handleViewProduct(product.id)}
                sx={{ mr: 1 }}
              >
                Zobraziť
              </Button>
              
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddShoppingCart />}
                onClick={() => handleAddToCart(product)}
                disabled={product.inventory <= 0}
              >
                Do košíka
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductList;
