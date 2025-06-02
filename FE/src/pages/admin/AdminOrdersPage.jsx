import { useState, useContext } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { AdminContext } from '../../contexts/AdminContext';
import { format } from 'date-fns';

const AdminOrdersPage = () => {
  const { orders, updateOrderStatus } = useContext(AdminContext);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusDialog, setStatusDialog] = useState({ open: false, order: null });
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'processing', label: 'Processing', color: 'info' },
    { value: 'shipped', label: 'Shipped', color: 'primary' },
    { value: 'delivered', label: 'Delivered', color: 'success' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' }
  ];

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : 'default';
  };

  const handleExpandClick = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleStatusUpdate = (order) => {
    setStatusDialog({ open: true, order });
  };

  const handleStatusChange = (newStatus) => {
    if (statusDialog.order) {
      updateOrderStatus(statusDialog.order.id, newStatus);
      setAlert({
        show: true,
        message: `Order status updated to ${newStatus}`,
        severity: 'success'
      });
      setStatusDialog({ open: false, order: null });
      setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 3000);
    }
  };

  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Order Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Manage customer orders and update their status
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Items</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <>
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="medium">
                      #{order.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.customerName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.customerEmail}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(order.date), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(order.date), 'HH:mm')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6">
                      ${calculateOrderTotal(order.items).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {order.items.length} item(s)
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleExpandClick(order.id)}
                      color="primary"
                    >
                      {expandedOrder === order.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleStatusUpdate(order)}
                      color="secondary"
                    >
                      <ShippingIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={expandedOrder === order.id} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 2 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          Order Details
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Shipping Address:
                            </Typography>
                            <Typography variant="body2">
                              {order.shippingAddress?.street}<br />
                              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Payment Method:
                            </Typography>
                            <Typography variant="body2">
                              {order.paymentMethod || 'Credit Card'}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Items:
                        </Typography>
                        <List dense>
                          {order.items.map((item, index) => (
                            <ListItem key={index} divider>
                              <ListItemText
                                primary={item.name}
                                secondary={`Quantity: ${item.quantity} × $${item.price.toFixed(2)}`}
                              />
                              <Typography variant="body2" fontWeight="medium">
                                ${(item.quantity * item.price).toFixed(2)}
                              </Typography>
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Status Update Dialog */}
      <Dialog 
        open={statusDialog.open} 
        onClose={() => setStatusDialog({ open: false, order: null })}
      >
        <DialogTitle>
          Update Order Status
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Order #{statusDialog.order?.id}
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusDialog.order?.status || ''}
              label="Status"
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={option.label} 
                      color={option.color} 
                      size="small" 
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, order: null })}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminOrdersPage;
