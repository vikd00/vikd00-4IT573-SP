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
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { AdminContext } from "../../contexts/AdminContext";
import { format } from "date-fns";

const AdminOrdersPage = () => {
  const { orders, updateOrderStatus, deleteOrder, loadOrders } =
    useContext(AdminContext);
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
    { value: "pending", label: "Čaká na spracovanie", color: "warning" },
    { value: "processing", label: "Spracováva sa", color: "info" },
    { value: "shipped", label: "Odoslané", color: "primary" },
    { value: "delivered", label: "Doručené", color: "success" },
    { value: "cancelled", label: "Zrušené", color: "error" },
  ];

  const handleExpandClick = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };
  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    setAlert({
      show: true,
      message: `Stav objednávky bol zmenený na ${newStatus}`,
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
        message: "Objednávka musí byť zrušená pred vymazaním",
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
        message: "Objednávka bola úspešne vymazaná",
        severity: "success",
      });
      setDeleteDialog({ open: false, order: null });
    } catch (error) {
      setAlert({
        show: true,
        message: error.message || "Nepodarilo sa vymazať objednávku",
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
    return "Neznámy zákazník";
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
      )}{" "}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Správa objednávok
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Spravujte objednávky zákazníkov a aktualizujte ich stav
        </Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          {" "}
          <TableHead>
            <TableRow>
              <TableCell>ID objednávky</TableCell>
              <TableCell>Zákazník</TableCell>
              <TableCell>Dátum</TableCell>
              <TableCell align="right">Celkom</TableCell>
              <TableCell align="center">Stav</TableCell>
              <TableCell align="center">Položky</TableCell>
              <TableCell align="center">Akcie</TableCell>
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
                    </Typography>{" "}
                    <Typography variant="caption" color="text.secondary">
                      {order.email || "Žiadny email"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.createdAt
                        ? format(new Date(order.createdAt), "MMM dd, yyyy")
                        : "Nie je k dispozícii"}
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
                    <FormControl size="small" fullWidth>
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
                    {" "}
                    <Typography variant="body2">
                      {order.items.length} položka(y)
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
                        title="Zobraziť detaily"
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
                            ? "Objednávka musí byť zrušená pred vymazaním"
                            : "Vymazať objednávku"
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
                      {" "}
                      <Box sx={{ margin: 2 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          Detaily objednávky
                        </Typography>
                        <Box sx={{ display: "flex", gap: 4, mb: 2 }}>
                          {" "}
                          <Box>
                            {" "}
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Dodacia adresa:
                            </Typography>
                            <Typography variant="body2">
                              {order.shippingAddress || "Adresa nie je uvedená"}
                            </Typography>
                          </Box>
                          <Box>
                            {" "}
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Spôsob platby:
                            </Typography>
                            <Typography variant="body2">
                              {order.paymentMethod || "Kreditná karta"}
                            </Typography>
                          </Box>
                        </Box>{" "}
                        <Typography variant="subtitle2" gutterBottom>
                          Položky:
                        </Typography>
                        <List dense>
                          {order.items.map((item, index) => (
                            <ListItem key={index} divider>
                              <ListItemText
                                primary={item.name}
                                secondary={`Množstvo: ${item.quantity} × €${(
                                  item.price / 100
                                ).toFixed(2)}`}
                              />{" "}
                              <Typography variant="body2" fontWeight="medium">
                                €
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
        <DialogTitle>Aktualizovať stav objednávky</DialogTitle>
        <DialogContent>
          {" "}
          <Typography variant="body2" sx={{ mb: 2 }}>
            Objednávka #{statusDialog.order?.id}
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Stav</InputLabel>
            <Select
              value={statusDialog.order?.status || ""}
              label="Stav"
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
          {" "}
          <Button onClick={() => setStatusDialog({ open: false, order: null })}>
            Zrušiť
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, order: null })}
      >
        <DialogTitle>Vymazať objednávku</DialogTitle>
        <DialogContent>
          {" "}
          <Typography variant="body1" sx={{ mb: 2 }}>
            Naozaj chcete vymazať objednávku #{deleteDialog.order?.id}?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Táto akcia sa nedá vrátiť späť. Objednávka bude natrvalo odstránená
            zo systému.
          </Typography>
        </DialogContent>
        <DialogActions>
          {" "}
          <Button onClick={() => setDeleteDialog({ open: false, order: null })}>
            Zrušiť
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Vymazať
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminOrdersPage;
