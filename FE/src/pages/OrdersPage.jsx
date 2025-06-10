import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Container, Box, Alert, CircularProgress } from "@mui/material";
import OrderHistory from "../components/OrderHistory";
import { useAuth } from "../contexts/AuthContext";
import { getUserOrders } from "../api/orders";
import useWsSubscription from "../hooks/useWsSubscription";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const location = useLocation();
  const message = location.state?.message;

  const fetchOrders = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const ordersWithDetails = await getUserOrders(token);

      if (!ordersWithDetails || !Array.isArray(ordersWithDetails)) {
        throw new Error("Nepodarilo sa načítať objednávky");
      }

      const formattedOrders = ordersWithDetails.map((order) => {
        const items = Array.isArray(order.items) ? order.items : [];

        return {
          id: order.id,
          createdAt: order.createdAt,
          status: order.status || "pending",
          total: order.totalPrice ? order.totalPrice / 100 : 0,
          shippingAddress: order.shippingAddress,
          items: items.map((item) => ({
            productName: item.name || "Produkt",
            quantity: item.quantity || 1,
            price: item.price / 100,
          })),
        };
      });

      setOrders(formattedOrders);
      console.log(formattedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Chyba pri načítaní objednávok");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleOrderStatusUpdate = useCallback(
    (message) => {
      if (message.data) {
        console.log(
          "OrdersPage: Received order status update, refetching orders",
          message.data
        );
        fetchOrders();
      }
    },
    [fetchOrders]
  );

  useWsSubscription("orderStatus", handleOrderStatusUpdate);
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        {" "}
        {message && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <OrderHistory orders={orders} loading={false} />
        )}
      </Box>
    </Container>
  );
};

export default OrdersPage;
