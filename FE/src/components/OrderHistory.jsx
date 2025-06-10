import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Grid,
  Divider,
} from "@mui/material";
import { format } from "date-fns";
import { sk } from "date-fns/locale";
import { getStatusText, getStatusColor } from "../utils/orderStatus";

const OrderHistory = ({ orders = [] }) => {  if (orders.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary">
          Nemáte žiadne objednávky
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom mb={3}>
        História objednávok
      </Typography>

      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item size={{ xs: 12, xl: 4, lg: 6 }} key={order.id}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={2}
                >
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Objednávka #{order.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.createdAt
                        ? format(
                            new Date(order.createdAt),
                            "dd.MM.yyyy HH:mm",
                            { locale: sk }
                          )
                        : "Neznámy dátum"}
                    </Typography>
                  </Box>

                  <Box textAlign="right">
                    <Chip
                      label={getStatusText(order.status)}
                      color={getStatusColor(order.status)}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="h6">
                      €{order.total?.toFixed(2) || "0.00"}
                    </Typography>
                  </Box>
                </Box>

                {order.shippingAddress && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Dodacia adresa:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.shippingAddress}
                    </Typography>
                  </Box>
                )}

                {order.items && order.items.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Položky objednávky:
                    </Typography>
                    <Divider sx={{ mb: 1 }} />

                    {order.items.map((item, index) => (
                      <Box
                        key={index}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        py={1}
                      >
                        <Box>
                          <Typography variant="body2">
                            {item.productName || item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Množstvo: {item.quantity}
                          </Typography>
                        </Box>

                        <Typography variant="body2">
                          €{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OrderHistory;
