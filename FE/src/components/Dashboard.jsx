import { useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  People,
  ShoppingCart,
  Inventory
} from '@mui/icons-material';
import { useAdmin } from '../contexts/AdminContext';

const Dashboard = () => {
  const { dashboardData, loading, fetchDashboardData, notifications } = useAdmin();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">
              {value}
            </Typography>
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Celkovo používateľov"
            value={dashboardData.totalUsers}
            icon={<People fontSize="large" />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Celkovo objednávok"
            value={dashboardData.totalOrders}
            icon={<ShoppingCart fontSize="large" />}
            color="success"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Produktov v ponuke"
            value={dashboardData.totalProducts}
            icon={<Inventory fontSize="large" />}
            color="info"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Aktívni používatelia"
            value={dashboardData.activeUsers}
            icon={<TrendingUp fontSize="large" />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Posledné objednávky
              </Typography>
              
              {dashboardData?.recentOrders?.length > 0 ? (
                <List>
                  {dashboardData.recentOrders.map((order) => (
                    <ListItem key={order.id} divider>
                      <ListItemText
                        primary={`Objednávka #${order.id} - ${order.customerName}`}
                        secondary={`€${order.total}`}
                      />
                      <Chip
                        label={order.status}
                        size="small"
                        color={order.status === 'pending' ? 'warning' : 'info'}
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
        </Grid>

        {/* Low Stock Products */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Produkty s nízkym stavom zásob
              </Typography>
              
              {dashboardData.lowStockProducts.length > 0 ? (
                <List>
                  {dashboardData.lowStockProducts.map((product) => (
                    <ListItem key={product.id} divider>
                      <ListItemText
                        primary={product.name}
                        secondary={`Zostáva: ${product.stock} kusov`}
                      />
                      <Chip
                        label="Nízky stav"
                        size="small"
                        color="error"
                      />
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

        {/* Real-time Notifications */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Posledné notifikácie
              </Typography>
              
              {notifications.length > 0 ? (
                <List>
                  {notifications.slice(0, 5).map((notification) => (
                    <ListItem key={notification.id} divider>
                      <ListItemText
                        primary={notification.message}
                        secondary={notification.timestamp?.toLocaleString()}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Žiadne nové notifikácie
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
