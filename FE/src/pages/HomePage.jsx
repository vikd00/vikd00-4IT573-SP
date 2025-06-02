import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  CardActions,
  Chip,
  ButtonGroup,
  Container
} from '@mui/material';
import { Store, ShoppingCart, Security } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

// Mock produkty pre HomePage
const mockProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    description: 'Najnovší iPhone s A17 Pro čipom',
    price: 999,
    category: 'Elektronika',
    image: 'https://via.placeholder.com/300x200?text=iPhone+15+Pro',
  },
  {
    id: 2,
    name: 'MacBook Air M2',
    description: 'Výkonný a efektívny laptop',
    price: 1199,
    category: 'Elektronika',
    image: 'https://via.placeholder.com/300x200?text=MacBook+Air+M2',
  },
  {
    id: 3,
    name: 'Nike Air Max',
    description: 'Pohodlné bežecké topánky',
    price: 120,
    category: 'Šport',
    image: 'https://via.placeholder.com/300x200?text=Nike+Air+Max',
  },
  {
    id: 4,
    name: 'Samsung Galaxy S24',
    description: 'Prémiový Android telefón',
    price: 899,
    category: 'Elektronika',
    image: 'https://via.placeholder.com/300x200?text=Samsung+Galaxy+S24',
  },
  {
    id: 5,
    name: 'Adidas Ultraboost',
    description: 'Prémiové bežecké topánky',
    price: 180,
    category: 'Šport',
    image: 'https://via.placeholder.com/300x200?text=Adidas+Ultraboost',
  },
  {
    id: 6,
    name: 'Sony WH-1000XM5',
    description: 'Bezdrôtové slúchadlá s potlačením hluku',
    price: 349,
    category: 'Elektronika',
    image: 'https://via.placeholder.com/300x200?text=Sony+WH-1000XM5',
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('Všetko');

  const categories = ['Všetko', 'Elektronika', 'Šport'];

  const filteredProducts = selectedCategory === 'Všetko' 
    ? mockProducts 
    : mockProducts.filter(product => product.category === selectedCategory);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Hero sekcia */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom>
            Vitajte v našom E-Shope
          </Typography>
          
          <Typography variant="h6" paragraph sx={{ opacity: 0.9 }}>
            Objavte najnovšie produkty za skvelé ceny. Kvalita a spoľahlivosť na prvom mieste.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/products')}
            sx={{ 
              mt: 2, 
              mr: 2,
              backgroundColor: 'white',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'grey.100'
              }
            }}
          >
            Nakupovať teraz
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/cart')}
            sx={{ 
              mt: 2,
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Zobraziť košík
          </Button>
        </Container>
      </Box>

      {/* Výhody sekcia */}
      <Box sx={{ py: 6, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" textAlign="center" gutterBottom>
            Prečo si vybrať nás?
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <Store color="primary" sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Široký výber
                  </Typography>
                  <Typography color="text.secondary">
                    Tisíce produktov z rôznych kategórií pre všetky vaše potreby
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <ShoppingCart color="primary" sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Rýchle doručenie
                  </Typography>
                  <Typography color="text.secondary">
                    Doručenie do 24 hodín pre produkty na sklade
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <Security color="primary" sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Bezpečné platby
                  </Typography>
                  <Typography color="text.secondary">
                    Všetky transakcie sú zabezpečené najnovšími technológiami
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Produkty sekcia */}
      <Box sx={{ py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" textAlign="center" gutterBottom>
            Odporúčané produkty
          </Typography>
          
          <Typography variant="body1" textAlign="center" color="text.secondary" paragraph>
            Vyberte si z našej starostlivo kurátorskej kolekcie
          </Typography>

          {/* Kategórie filter */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <ButtonGroup variant="outlined" color="primary">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'contained' : 'outlined'}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </ButtonGroup>
          </Box>

          {/* Produkty grid */}
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
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
                    image={product.image}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="h6" component="h3">
                        {product.name}
                      </Typography>
                      <Chip label={product.category} size="small" color="primary" variant="outlined" />
                    </Box>
                    <Typography color="text.secondary" paragraph>
                      {product.description}
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      €{product.price}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleAddToCart(product)}
                    >
                      Pridať do košíka
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      Detail
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/products')}
            >
              Zobraziť všetky produkty
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
