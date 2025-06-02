import { Container, Box } from "@mui/material";
import ProductList from "../components/ProductList";

const ProductsPage = () => {
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <ProductList title="Produkty" showSearch={true} showFilters={true} />
      </Box>
    </Container>
  );
};

export default ProductsPage;
