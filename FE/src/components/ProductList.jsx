import { useState, useEffect, useMemo } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Alert,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Search,
  TrendingUp,
  TrendingDown,
  AddShoppingCart,
  Visibility,
} from "@mui/icons-material";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../api/products";
import useProductUpdates from "../hooks/useProductUpdates";

const normalizeSearchText = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .trim();
};

const ProductList = ({
  showSearch = true,
  showFilters = true,
  title = null,
  maxResults = null,
}) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const {
    getUpdatedProduct,
    productUpdates,
    newProducts,
    isProductDeleted,
    isProductDeactivated,
  } = useProductUpdates();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const productsData = await getProducts();

        const productsWithFormattedPrice = productsData.map((product) => ({
          ...product,
          price: product.price / 100, // Convert cents to euros
        }));

        setProducts(productsWithFormattedPrice);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Chyba pri načítavaní produktov. Skúste to znovu.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const processedProducts = useMemo(() => {
    let allProducts = products
      .map((product) => {
        const updatedProduct = getUpdatedProduct(product.id);
        if (updatedProduct) {
          return updatedProduct;
        }
        return product;
      })
      .filter((product) => {
        if (isProductDeleted(product.id)) {
          return false;
        }
        if (isProductDeactivated(product.id)) {
          return false;
        }
        return true;
      });
    const existingProductIds = new Set(allProducts.map((p) => p.id));
    const filteredNewProducts = newProducts.filter(
      (p) => !existingProductIds.has(p.id) && p.active === true
    );
    allProducts = [...allProducts, ...filteredNewProducts];

    const activatedProducts = productUpdates.filter(
      (p) =>
        !existingProductIds.has(p.id) &&
        p.active === true &&
        !isProductDeleted(p.id)
    );
    allProducts = [...allProducts, ...activatedProducts];

    let filtered = allProducts;
    if (searchTerm.trim()) {
      const normalizedSearch = normalizeSearchText(searchTerm);
      filtered = allProducts.filter((product) => {
        const normalizedName = normalizeSearchText(product.name || "");
        const normalizedDesc = normalizeSearchText(product.description || "");
        return (
          normalizedName.includes(normalizedSearch) ||
          normalizedDesc.includes(normalizedSearch)
        );
      });
    }

    if (sortOrder) {
      filtered = [...filtered].sort((a, b) => {
        if (sortOrder === "price-asc") {
          return (a.price || 0) - (b.price || 0);
        }
        if (sortOrder === "price-desc") {
          return (b.price || 0) - (a.price || 0);
        }
        return 0;
      });
    }

    if (maxResults && filtered.length > maxResults) {
      filtered = filtered.slice(0, maxResults);
    }

    return filtered;
  }, [
    products,
    searchTerm,
    sortOrder,
    maxResults,
    getUpdatedProduct,
    productUpdates,
    newProducts,
    isProductDeleted,
    isProductDeactivated,
  ]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleSortChange = (event, newSortOrder) => {
    setSortOrder(newSortOrder);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const handleViewProduct = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Title */}
      {title && (
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          {title}
        </Typography>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Controls */}
      {(showSearch || showFilters) && (
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search Bar */}
            {showSearch && (
              <Grid item size={{ xs: 12, md: showFilters ? 8 : 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Hľadať produkty..."
                  value={searchTerm}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <Button size="small" onClick={clearSearch}>
                          Vymazať
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}

            {/* Sort Filters */}
            {showFilters && (
              <Grid item size={{ xs: 12, md: showSearch ? 4 : 12 }}>
                <Box display="flex" justifyContent="flex-end">
                  <ToggleButtonGroup
                    value={sortOrder}
                    exclusive
                    onChange={handleSortChange}
                    size="small"
                    aria-label="zoradiť produkty"
                  >
                    <ToggleButton value="price-asc" aria-label="cena vzostupne">
                      <TrendingUp sx={{ mr: 0.5 }} />
                      Cena ↑
                    </ToggleButton>
                    <ToggleButton value="price-desc" aria-label="cena zostupne">
                      <TrendingDown sx={{ mr: 0.5 }} />
                      Cena ↓
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Grid>
            )}
          </Grid>

          {/* Results Info */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {searchTerm
              ? `Nájdených ${processedProducts.length} produktov pre "${searchTerm}"`
              : `Zobrazených ${processedProducts.length} produktov`}
          </Typography>
        </Box>
      )}

      {/* Products Grid */}
      {processedProducts.length === 0 && !loading ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm
              ? "Žiadne produkty neboli nájdené pre zadané kritériá"
              : "Žiadne produkty nie sú k dispozícii"}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {processedProducts.map((product) => (
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 3,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={product.imageUrl || "https://placehold.jp/30/3d4070/ffffff/200x150.png?text=placeholder"}
                  alt={product.name}
                  sx={{ objectFit: "scale-down", p: 1 }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom noWrap>
                    {product.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      mb: 2,
                    }}
                  >
                    {product.description}
                  </Typography>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="h6" color="primary">
                      €{product.price?.toFixed(2)}
                    </Typography>

                    <Chip
                      label={
                        product.inventory > 0
                          ? `Skladom: ${product.inventory}`
                          : "Vypredané"
                      }
                      color={product.inventory > 0 ? "success" : "error"}
                      size="small"
                    />
                  </Box>
                </CardContent>
                <Box
                  sx={{ p: 2, pt: 0, display: "flex", flexDirection: "column" }}
                >
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => handleViewProduct(product.id)}
                  >
                    Zobraziť
                  </Button>

                  <Button
                    fullWidth
                    sx={{ mt: 1 }}
                    variant="contained"
                    startIcon={<AddShoppingCart />}
                    onClick={() => handleAddToCart(product)}
                    disabled={product.inventory <= 0}
                  >
                    Do košíka
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ProductList;
