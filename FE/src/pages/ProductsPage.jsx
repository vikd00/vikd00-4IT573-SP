import { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Typography,
  InputAdornment,
  Grid
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import ProductList from '../components/ProductList';
import { useApi } from '../hooks/useApi';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const { loading, get } = useApi();

  // Mock products data for now
  useEffect(() => {
    const fetchProducts = async () => {
      // TODO: Replace with actual API call
      // const { data } = await get('/products');
      
      // Mock data for development
      const mockProducts = [
        {
          id: 1,
          name: 'iPhone 14 Pro',
          description: 'Najnovší iPhone s pokročilými funkciami a skvelou kamerou',
          price: 1199.99,
          inventory: 15,
          image: null
        },
        {
          id: 2,
          name: 'Samsung Galaxy S23',
          description: 'Výkonný Android telefón s dlhou výdržou batérie',
          price: 899.99,
          inventory: 8,
          image: null
        },
        {
          id: 3,
          name: 'MacBook Pro 16"',
          description: 'Profesionálny laptop pre náročných používateľov',
          price: 2499.99,
          inventory: 5,
          image: null
        },
        {
          id: 4,
          name: 'iPad Air',
          description: 'Univerzálny tablet pre prácu aj zábavu',
          price: 649.99,
          inventory: 12,
          image: null
        },
        {
          id: 5,
          name: 'AirPods Pro',
          description: 'Bezdrôtové slúchadlá s potlačením hluku',
          price: 279.99,
          inventory: 25,
          image: null
        },
        {
          id: 6,
          name: 'Dell XPS 13',
          description: 'Kompaktný a výkonný ultrabook',
          price: 1299.99,
          inventory: 0,
          image: null
        }
      ];
      
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
    };

    fetchProducts();
  }, []);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Produkty
        </Typography>

        {/* Search and Filter Bar */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Hľadať produkty..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  // TODO: Implement filter functionality
                  console.log('Filter clicked');
                }}
              >
                Filtre
              </Button>
              
              {searchTerm && (
                <Button
                  variant="text"
                  onClick={clearSearch}
                >
                  Vymazať
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Results Info */}
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {searchTerm ? 
            `Nájdených ${filteredProducts.length} produktov pre "${searchTerm}"` :
            `Zobrazených ${filteredProducts.length} produktov`
          }
        </Typography>

        {/* Products Grid */}
        <ProductList products={filteredProducts} loading={loading} />
      </Box>
    </Container>
  );
};

export default ProductsPage;
