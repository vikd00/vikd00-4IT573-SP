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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { AdminContext } from "../../contexts/AdminContext";
import { format } from "date-fns";
import { sk } from "date-fns/locale";

const AdminUsersPage = () => {
  const {
    users,
    addUser,
    updateUser,
    updateUserPassword,
    deleteUser,
    toggleUserStatus,
    loadUsers,
  } = useContext(AdminContext);

  // All useState hooks must come before any conditional returns
  const [open, setOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "user",
  });
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "success",
  });
  useEffect(() => {
    loadUsers();
  }, []);

  const roles = [
    { value: "user", label: "Používateľ" },
    { value: "admin", label: "Administrátor" },
  ];
  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "user",
    });
    setOpen(true);
  };
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username || "",
      password: "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      role: user.role || "user",
    });
    setOpen(true);
  };

  const handlePasswordChange = (user) => {
    setPasswordUser(user);
    setNewPassword("");
    setPasswordDialogOpen(true);
  };
  const handleDelete = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        setAlert({
          show: true,
          message: "Používateľ bol úspešne vymazaný",
          severity: "success",
        });
        setTimeout(
          () => setAlert({ show: false, message: "", severity: "success" }),
          3000
        );
      } catch (error) {
        setAlert({
          show: true,
          message: "Chyba pri vymazávaní používateľa",
          severity: "error",
        });
        setTimeout(
          () => setAlert({ show: false, message: "", severity: "error" }),
          3000
        );
      }
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleToggleStatus = (userId) => {
    toggleUserStatus(userId);
    setAlert({
      show: true,
      message: "Stav používateľa bol úspešne aktualizovaný",
      severity: "success",
    });
    setTimeout(
      () => setAlert({ show: false, message: "", severity: "success" }),
      3000
    );
  };
  const handleSubmit = async () => {
    const userData = {
      username: formData.username,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: formData.role,
    };

    if (!editingUser) {
      userData.password = formData.password;
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, userData);
        setAlert({
          show: true,
          message: "Používateľ bol úspešne aktualizovaný",
          severity: "success",
        });
      } else {
        await addUser(userData);
        setAlert({
          show: true,
          message: "Používateľ bol úspešne pridaný",
          severity: "success",
        });
      }

      setOpen(false);
      setTimeout(
        () => setAlert({ show: false, message: "", severity: "success" }),
        3000
      );
    } catch (error) {
      setAlert({
        show: true,
        message: error.message || "Nastala chyba",
        severity: "error",
      });
      setTimeout(
        () => setAlert({ show: false, message: "", severity: "success" }),
        3000
      );
    }
  };

  const handlePasswordSubmit = async () => {
    if (!newPassword || newPassword.length < 6) {
      setAlert({
        show: true,
        message: "Heslo musí mať aspoň 6 znakov",
        severity: "error",
      });
      return;
    }

    try {
      await updateUserPassword(passwordUser.id, newPassword);
      setAlert({
        show: true,
        message: "Heslo bolo úspešne zmenené",
        severity: "success",
      });
      setPasswordDialogOpen(false);
      setNewPassword("");
      setTimeout(
        () => setAlert({ show: false, message: "", severity: "success" }),
        3000
      );
    } catch (error) {
      setAlert({
        show: true,
        message: error.message || "Nastala chyba pri zmene hesla",
        severity: "error",
      });
      setTimeout(
        () => setAlert({ show: false, message: "", severity: "error" }),
        3000
      );
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "error";
      case "user":
        return "primary";
      default:
        return "default";
    }
  };

  const getInitials = (firstName, lastName) => {
    if (firstName || lastName) {
      const first = firstName ? firstName.charAt(0).toUpperCase() : "";
      const last = lastName ? lastName.charAt(0).toUpperCase() : "";
      return first + last;
    }
    return "??";
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        {" "}
        <Typography variant="h4" component="h1">
          Správa používateľov
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleAdd}
        >
          Pridať používateľa
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          {" "}
          <TableHead>
            <TableRow>
              <TableCell>Používateľ</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rola</TableCell>
              <TableCell>Dátum registrácie</TableCell>
              <TableCell align="center">Stav</TableCell>
              <TableCell align="center">Akcie</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                {" "}
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ width: 40, height: 40 }}>
                      {getInitials(user.firstName, user.lastName)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        @{user.username}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{user.email}</Typography>
                </TableCell>{" "}
                <TableCell>
                  <Chip
                    label={
                      user.role === "admin" ? "Administrátor" : "Používateľ"
                    }
                    color={getRoleColor(user.role)}
                    size="small"
                  />
                </TableCell>{" "}
                <TableCell>
                  <Typography variant="body2">
                    {user.createdAt
                      ? format(new Date(user.createdAt), "dd.MM.yyyy", {
                          locale: sk,
                        })
                      : "Neznámy"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.createdAt
                      ? format(new Date(user.createdAt), "HH:mm", {
                          locale: sk,
                        })
                      : ""}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    {" "}
                    {user.active ? (
                      <Chip
                        icon={<ActiveIcon />}
                        label="Aktívny"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<BlockIcon />}
                        label="Neaktívny"
                        color="error"
                        size="small"
                      />
                    )}
                  </Box>
                </TableCell>{" "}
                <TableCell align="center">
                  <Tooltip title="Upraviť používateľa">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(user)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Zmeniť heslo">
                    <IconButton
                      size="small"
                      onClick={() => handlePasswordChange(user)}
                      color="secondary"
                    >
                      <LockIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={user.active ? "Deaktivovať" : "Aktivovať"}>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleStatus(user.id)}
                      color={user.active ? "warning" : "success"}
                    >
                      {user.active ? <BlockIcon /> : <ActiveIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Vymazať používateľa">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(user)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>{" "}
      {/* Add/Edit User Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingUser ? "Upraviť používateľa" : "Pridať nového používateľa"}
        </DialogTitle>{" "}
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Používateľské meno"
              value={formData?.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              fullWidth
              required
              disabled={editingUser} // Disable for editing existing users
            />
            {!editingUser && (
              <TextField
                label="Heslo"
                type="password"
                value={formData?.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                fullWidth
                required
                helperText="Heslo musí mať aspoň 6 znakov"
              />
            )}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Meno"
                value={formData?.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                fullWidth
              />
              <TextField
                label="Priezvisko"
                value={formData?.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                fullWidth
              />
            </Box>
            <TextField
              label="Email"
              type="email"
              value={formData?.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>Rola</InputLabel>
              <Select
                value={formData.role}
                label="Rola"
                onChange={(e) => handleInputChange("role", e.target.value)}
              >
                {roles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Zrušiť</Button>{" "}
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.username ||
              formData.username.trim() === "" ||
              (!editingUser &&
                (!formData.password || formData.password.length < 6))
            }
          >
            {editingUser ? "Aktualizovať" : "Pridať"} používateľa
          </Button>
        </DialogActions>
      </Dialog>
      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Zmeniť heslo používateľa</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Mením heslo pre: {passwordUser?.firstName}{" "}
              {passwordUser?.lastName} ({passwordUser?.email})
            </Typography>
            <TextField
              label="Nové heslo"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              required
              helperText="Heslo musí mať aspoň 6 znakov"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Zrušiť</Button>
          <Button
            onClick={handlePasswordSubmit}
            variant="contained"
            disabled={!newPassword || newPassword.length < 6}
          >
            Zmeniť heslo
          </Button>
        </DialogActions>{" "}
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Potvrdenie vymazania používateľa
        </DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            Naozaj chcete vymazať používateľa{" "}
            <strong>
              {userToDelete?.firstName && userToDelete?.lastName
                ? `${userToDelete.firstName} ${userToDelete.lastName}`
                : userToDelete?.username || "Neznámy používateľ"}
            </strong>
            ? Táto akcia sa nedá vrátiť späť.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Zrušiť
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Vymazať
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsersPage;
