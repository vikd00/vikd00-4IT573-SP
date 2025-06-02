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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Avatar,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { AdminContext } from '../../contexts/AdminContext';
import { format } from 'date-fns';

const AdminUsersPage = () => {
  const { users, addUser, updateUser, deleteUser, toggleUserStatus } = useContext(AdminContext);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'customer',
    isActive: true
  });
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  const roles = [
    { value: 'customer', label: 'Customer' },
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' }
  ];

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'customer',
      isActive: true
    });
    setOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    setOpen(true);
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
      setAlert({
        show: true,
        message: 'User deleted successfully',
        severity: 'success'
      });
      setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 3000);
    }
  };

  const handleToggleStatus = (userId) => {
    toggleUserStatus(userId);
    setAlert({
      show: true,
      message: 'User status updated successfully',
      severity: 'success'
    });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 3000);
  };

  const handleSubmit = () => {
    const userData = {
      ...formData,
      joinDate: editingUser ? editingUser.joinDate : new Date().toISOString()
    };

    if (editingUser) {
      updateUser(editingUser.id, userData);
      setAlert({
        show: true,
        message: 'User updated successfully',
        severity: 'success'
      });
    } else {
      addUser(userData);
      setAlert({
        show: true,
        message: 'User added successfully',
        severity: 'success'
      });
    }

    setOpen(false);
    setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 3000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'customer': return 'primary';
      default: return 'default';
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleAdd}
        >
          Add User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Join Date</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 40, height: 40 }}>
                      {getInitials(user.firstName, user.lastName)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {user.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {user.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    color={getRoleColor(user.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {format(new Date(user.joinDate), 'MMM dd, yyyy')}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    {user.isActive ? (
                      <Chip
                        icon={<ActiveIcon />}
                        label="Active"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<BlockIcon />}
                        label="Inactive"
                        color="error"
                        size="small"
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(user)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleStatus(user.id)}
                    color={user.isActive ? 'warning' : 'success'}
                  >
                    {user.isActive ? <BlockIcon /> : <ActiveIcon />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(user.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit User Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                fullWidth
                required
              />
            </Box>
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => handleInputChange('role', e.target.value)}
              >
                {roles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                />
              }
              label="Active User"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.firstName || !formData.lastName || !formData.email}
          >
            {editingUser ? 'Update' : 'Add'} User
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsersPage;
