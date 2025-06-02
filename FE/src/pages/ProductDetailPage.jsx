import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Card,
  CardMedia,
  Chip,
  TextField,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link
} from '@mui/material';
import { 
  AddShoppingCart, 
  ArrowBack, 
  Home,
  ShoppingBag 
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useApi } from '../hooks/useApi';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { loading, get } = useApi();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      // TODO: Replace with actual API call
      // const { data } = await get(`/products/${id}`);
      
      // Mock data for development
      const mockProducts = {
        1: {
          id: 1,
          name: 'iPhone 14 Pro',
          description: 'Najnovší iPhone s pokročilými funkciami a skvelou kamerou. Obsahuje A16 Bionic čip, trojitú kameru s 48MP hlavným senzorom a Dynamic Island.',
          price: 1199.99,
          inventory: 15,
          image: null,
          category: 'Elektronika',
          features: [
            'A16 Bionic čip',
            '48MP hlavná kamera',
            'Dynamic Island',
            'ProRes video',
            '6.1" Super Retina XDR displej'
          ]
        },
        2: {
          id: 2,
          name: 'Samsung Galaxy S23',
          description: 'Výkonný Android telefón s dlhou výdržou batérie a skvelým fotoaparátom.',
          price: 899.99,
          inventory: 8,
          image: null,
          category: 'Elektronika',
          features: [
            'Snapdragon 8 Gen 2',
            '50MP kamera',
            '3900 mAh batéria',
            '6.1" Dynamic AMOLED displej'
          ]
        }
      };
      
      const foundProduct = mockProducts[id];
      if (foundProduct) {
        setProduct(foundProduct);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      addToCart(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.inventory) {
      setQuantity(value);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg">
        <Box textAlign="center" py={8}>
          <Typography variant="h5" gutterBottom>
            Produkt nebol nájdený
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/products')}
          >
            Späť na produkty
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/')}
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <Home sx={{ mr: 0.5 }} />
            Domov
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/products')}
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <ShoppingBag sx={{ mr: 0.5 }} />
            Produkty
          </Link>
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>

        {addedToCart && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Produkt bol pridaný do košíka!
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Product Image */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="500"
                image={product.image || '/api/placeholder/500/500'}
                alt={product.name}
                sx={{ objectFit: 'cover' }}
              />
            </Card>
          </Grid>

          {/* Product Details */}
          <Grid item xs={12} md={6}>
            <Box>
              <Chip 
                label={product.category} 
                color="primary" 
                size="small" 
                sx={{ mb: 2 }} 
              />
              
              <Typography variant="h4" gutterBottom>
                {product.name}
              </Typography>

              <Typography variant="h5" color="primary" gutterBottom>
                €{product.price?.toFixed(2)}
              </Typography>

              <Chip
                label={product.inventory > 0 ? `Skladom: ${product.inventory} kusov` : 'Vypredané'}
                color={product.inventory > 0 ? 'success' : 'error'}
                sx={{ mb: 3 }}
              />

              <Typography variant="body1" paragraph>
                {product.description}
              </Typography>

              {product.features && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>
                    Kľúčové vlastnosti:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {product.features.map((feature, index) => (
                      <Typography component="li" key={index} variant="body2" sx={{ mb: 0.5 }}>
                        {feature}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Add to Cart Section */}
              <Box sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <TextField
                      type="number"
                      label="Množstvo"
                      value={quantity}
                      onChange={handleQuantityChange}
                      inputProps={{
                        min: 1,
                        max: product.inventory
                      }}
                      fullWidth
                      size="small"
                      disabled={product.inventory <= 0}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={8}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<AddShoppingCart />}
                      onClick={handleAddToCart}
                      disabled={product.inventory <= 0}
                    >
                      {product.inventory > 0 ? 'Pridať do košíka' : 'Vypredané'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ProductDetailPage;
