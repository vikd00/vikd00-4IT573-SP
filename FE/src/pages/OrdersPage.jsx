import { useState, useEffect } from 'react';
import { Container, Box } from '@mui/material';
import OrderHistory from '../components/OrderHistory';
import { useApi } from '../hooks/useApi';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const { loading, get } = useApi();

  // Mock orders data for now
  useEffect(() => {
    const fetchOrders = async () => {
      // TODO: Replace with actual API call
      // const { data } = await get('/orders');
      
      // Mock data for development
      const mockOrders = [
        {
          id: 'ORD-001',
          createdAt: '2024-01-15T10:30:00Z',
          status: 'delivered',
          total: 1299.99,
          shippingAddress: 'Bratislava, Slovensko',
          items: [
            { productName: 'iPhone 14 Pro', quantity: 1, price: 1199.99 },
            { productName: 'Ochranné sklo', quantity: 1, price: 29.99 },
            { productName: 'Doprava', quantity: 1, price: 5.00 }
          ]
        },
        {
          id: 'ORD-002',
          createdAt: '2024-01-20T14:15:00Z',
          status: 'processing',
          total: 649.99,
          shippingAddress: 'Praha, Česká republika',
          items: [
            { productName: 'iPad Air', quantity: 1, price: 649.99 }
          ]
        },
        {
          id: 'ORD-003',
          createdAt: '2024-01-25T09:45:00Z',
          status: 'pending',
          total: 284.99,
          shippingAddress: 'Košice, Slovensko',
          items: [
            { productName: 'AirPods Pro', quantity: 1, price: 279.99 },
            { productName: 'Doprava', quantity: 1, price: 5.00 }
          ]
        }
      ];
      
      setOrders(mockOrders);
    };

    fetchOrders();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <OrderHistory orders={orders} loading={loading} />
      </Box>
    </Container>
  );
};

export default OrdersPage;
