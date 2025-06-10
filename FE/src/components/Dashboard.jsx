import { useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  TrendingUp,
  People,
  ShoppingCart,
  Inventory,
} from "@mui/icons-material";
import { useAdmin } from "../contexts/AdminContext";
import { getStatusText, getStatusColor } from "../utils/orderStatus";
import useDashboardMetrics from "../hooks/useDashboardMetrics";
import useWsStatus from "../hooks/useWsStatus";

const Dashboard = () => {
  const { getDashboardStats, loadDashboardMetrics, loading } = useAdmin();

  const wsMetrics = useDashboardMetrics();
  const connected = useWsStatus();

  useEffect(() => {
    if (loadDashboardMetrics) {
      loadDashboardMetrics();
    }
  }, [loadDashboardMetrics]);

  const dashboardMetrics = wsMetrics || getDashboardStats();
  const lastMetricsUpdate = wsMetrics
    ? new Date().toLocaleString()
    : "Computed locally";

  useEffect(() => {
    console.log("Dashboard metrics updated:", dashboardMetrics);
  }, [dashboardMetrics]);

  useEffect(() => {
    console.log("WebSocket connected status:", connected);
  }, [connected]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  const metrics = dashboardMetrics || {
    activeUsers: 0,
    ordersToday: 0,
    revenue: 0,
    lowStockCount: 0,
    recentOrders: [],
    lowStockProducts: [],
  };

  const StatCard = ({ title, value, icon, color = "primary" }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Box>
          <Box color={`${color}.main`}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Admin Dashboard</Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Chip
            label={connected ? "Live" : "Offline"}
            color={connected ? "success" : "default"}
            size="small"
          />
          {lastMetricsUpdate && (
            <Typography variant="caption" color="text.secondary">
              Posledná aktualizácia: {lastMetricsUpdate}
            </Typography>
          )}
        </Box>
      </Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Aktívni používatelia"
            value={metrics.activeUsers || metrics.totalUsers || 0}
            icon={<People fontSize="large" />}
            color="primary"
          />
        </Grid>
        <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Dnešné objednávky"
            value={metrics.ordersToday || metrics.totalOrders || 0}
            icon={<ShoppingCart fontSize="large" />}
            color="success"
          />
        </Grid>
        <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Dnešný obrat"
            value={`€${(metrics.revenue || metrics.totalRevenue || 0).toFixed(
              2
            )}`}
            icon={<TrendingUp fontSize="large" />}
            color="info"
          />
        </Grid>
        <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Nízky sklad"
            value={metrics.lowStockCount || metrics.lowStockProducts || 0}
            icon={<Inventory fontSize="large" />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              {" "}
              <Typography variant="h6" gutterBottom>
                Posledné objednávky
              </Typography>
              {metrics?.recentOrders?.length > 0 ? (
                <List>
                  {metrics.recentOrders.map((order) => (
                    <ListItem key={order.id} divider>
                      <ListItemText
                        primary={`Objednávka #${order.id} - ${
                          order.username || order.email
                        }`}
                        secondary={`Status: ${getStatusText(
                          order.status
                        )} | ${new Date(order.createdAt).toLocaleDateString()}`}
                      />
                      <Chip
                        label={getStatusText(order.status)}
                        size="small"
                        color={getStatusColor(order.status)}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Žiadne nedávne objednávky
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>{" "}
        {/* Low Stock Products */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              {" "}
              <Typography variant="h6" gutterBottom>
                Produkty s nízkym stavom zásob
              </Typography>
              {metrics?.lowStockProducts?.length > 0 ? (
                <List>
                  {metrics.lowStockProducts.map((product) => (
                    <ListItem key={product.id} divider>
                      <ListItemText
                        primary={product.name}
                        secondary={`Zostáva: ${product.inventory} kusov`}
                      />
                      <Chip label="Nízky stav" size="small" color="error" />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Všetky produkty majú dostatočné zásoby
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
