import { useState, useContext, useEffect } from "react";
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
  Divider,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { AdminContext } from "../../contexts/AdminContext";
import { format } from "date-fns";

const AdminOrdersPage = () => {
  const {
    orders,
    updateOrderStatus,
    deleteOrder,
    loadOrders,
  } = useContext(AdminContext);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    order: null,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    order: null,
  });
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "success",
  });

  const statusOptions = [
    { value: "pending", label: "Pending", color: "warning" },
    { value: "processing", label: "Processing", color: "info" },
    { value: "shipped", label: "Shipped", color: "primary" },
    { value: "delivered", label: "Delivered", color: "success" },
    { value: "cancelled", label: "Cancelled", color: "error" },
  ];

  const handleExpandClick = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };
  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    setAlert({
      show: true,
      message: `Order status updated to ${newStatus}`,
      severity: "success",
    });
    setTimeout(
      () => setAlert({ show: false, message: "", severity: "success" }),
      3000
    );
  };

  const handleDeleteClick = (order) => {
    if (order.status !== "cancelled") {
      setAlert({
        show: true,
        message: "Order must be cancelled before it can be deleted",
        severity: "error",
      });
      setTimeout(
        () => setAlert({ show: false, message: "", severity: "success" }),
        3000
      );
      return;
    }
    setDeleteDialog({ open: true, order });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteOrder(deleteDialog.order.id);
      setAlert({
        show: true,
        message: "Order deleted successfully",
        severity: "success",
      });
      setDeleteDialog({ open: false, order: null });
    } catch (error) {
      setAlert({
        show: true,
        message: error.message || "Failed to delete order",
        severity: "error",
      });
    }
    setTimeout(
      () => setAlert({ show: false, message: "", severity: "success" }),
      3000
    );
  };

  const formatCustomerName = (order) => {
    if (order.firstName && order.lastName) {
      return `${order.firstName} ${order.lastName}`;
    } else if (order.username) {
      return order.username;
    }
    return "Unknown Customer";
  };
  const calculateOrderTotal = (items) => {
    return (
      items.reduce((total, item) => total + item.price * item.quantity, 0) / 100
    ); 
  }; 
  useEffect(() => {
    loadOrders();
  }, []);

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
                  </TableCell>{" "}
                  <TableCell>
                    <Typography variant="body2">
                      {formatCustomerName(order)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.email || "No email"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.createdAt
                        ? format(new Date(order.createdAt), "MMM dd, yyyy")
                        : "N/A"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.createdAt
                        ? format(new Date(order.createdAt), "HH:mm")
                        : ""}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6">
                      ${calculateOrderTotal(order.items).toFixed(2)}
                    </Typography>
                  </TableCell>{" "}
                  <TableCell align="center">
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        displayEmpty
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {order.items.length} item(s)
                    </Typography>
                  </TableCell>{" "}
                  <TableCell align="center">
                    <Box
                      sx={{ display: "flex", gap: 1, justifyContent: "center" }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleExpandClick(order.id)}
                        color="primary"
                        title="View Details"
                      >
                        {expandedOrder === order.id ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(order)}
                        color="error"
                        disabled={order.status !== "cancelled"}
                        title={
                          order.status !== "cancelled"
                            ? "Order must be cancelled to delete"
                            : "Delete Order"
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={7}
                  >
                    <Collapse
                      in={expandedOrder === order.id}
                      timeout="auto"
                      unmountOnExit
                    >
                      <Box sx={{ margin: 2 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          Order Details
                        </Typography>
                        <Box sx={{ display: "flex", gap: 4, mb: 2 }}>
                          {" "}
                          <Box>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Shipping Address:
                            </Typography>
                            <Typography variant="body2">
                              {order.shippingAddress || "No address provided"}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Payment Method:
                            </Typography>
                            <Typography variant="body2">
                              {order.paymentMethod || "Credit Card"}
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
                                secondary={`Quantity: ${item.quantity} × $${(
                                  item.price / 100
                                ).toFixed(2)}`}
                              />
                              <Typography variant="body2" fontWeight="medium">
                                $
                                {((item.quantity * item.price) / 100).toFixed(
                                  2
                                )}
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
      </TableContainer>{" "}
      {/* Status Update Dialog */}
      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, order: null })}
      >
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Order #{statusDialog.order?.id}
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusDialog.order?.status || ""}
              label="Status"
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, order: null })}
      >
        <DialogTitle>Delete Order</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete order #{deleteDialog.order?.id}?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. The order will be permanently removed
            from the system.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, order: null })}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminOrdersPage;
