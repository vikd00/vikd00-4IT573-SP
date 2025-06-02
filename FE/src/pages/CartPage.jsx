import { Container, Box } from '@mui/material';
import Cart from '../components/Cart';

const CartPage = () => {
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Cart />
      </Box>
    </Container>
  );
};

export default CartPage;
