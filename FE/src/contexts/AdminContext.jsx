import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  getAllUsers, 
  createUser as createUserAPI,
  updateUserRole, 
  updateUserStatus,
  updateUser as updateUserAPI,
  updateUserPassword as updateUserPasswordAPI,
  deleteUser as deleteUserAPI,
  getAllProducts,
  createProduct,
  updateProduct as updateProductAPI,
  deleteProduct as deleteProductAPI,
  getAllOrders,
  updateOrderStatus as updateOrderStatusAPI,
  deleteOrder as deleteOrderAPI
} from "../api/admin.js";
import { loginUser } from "../api/users.js";

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState(
    localStorage.getItem("adminToken")
  );
  // Load data when component mounts
  useEffect(() => {
    if (authToken) {
      setIsAuthenticated(true);
      console.log('Admin token found, loading data...');
      loadAllData();
    } else {
      console.log('No admin token found');
      setIsAuthenticated(false);
    }
  }, [authToken]);
  const loadAllData = async () => {
    try {
      console.log('Loading admin data...');
      await Promise.all([loadUsers(), loadOrders(), loadProducts()]);
      console.log('Admin data loaded successfully');
    } catch (error) {
      console.error("Error loading admin data:", error);
    }
  };
  const loadUsers = async () => {
    try {
      console.log('Loading users with token:', authToken ? 'present' : 'missing');
      const usersData = await getAllUsers(authToken);
      console.log('Users loaded:', usersData?.length || 0);
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };
  const loadOrders = async () => {
    try {
      console.log('Loading orders with token:', authToken ? 'present' : 'missing');
      const ordersData = await getAllOrders(authToken);
      console.log('Orders loaded:', ordersData?.length || 0);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const loadProducts = async () => {
    try {
      console.log('Loading products with token:', authToken ? 'present' : 'missing');
      const productsData = await getAllProducts(authToken);
      console.log('Products loaded:', productsData?.length || 0);
      setProducts(productsData);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  // Dashboard stats
  const getDashboardStats = () => {
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalUsers = users.filter((user) => user.role === "customer").length;
    const totalRevenue = orders
      .filter((order) => order.status === "Completed")
      .reduce((sum, order) => sum + order.total, 0);

    const pendingOrders = orders.filter(
      (order) => order.status === "Pending"
    ).length;
    const lowStockProducts = products.filter(
      (product) => product.stock < 10
    ).length;

    return {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
    };
  };

  // Mock fetch function for dashboard
  const fetchDashboardData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const dashboardData = getDashboardStats();  // Product CRUD operations
  const addProduct = async (product) => {
    try {
      const newProduct = await createProduct(product, authToken);
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  };

  const updateProduct = async (id, updatedProduct) => {
    try {
      const product = await updateProductAPI(id, updatedProduct, authToken);
      setProducts((prev) => prev.map((p) => (p.id === id ? product : p)));
      return product;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await deleteProductAPI(id, authToken);
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };
  // Order operations
  const updateOrderStatus = async (orderId, status) => {
    try {
      const updatedOrder = await updateOrderStatusAPI(orderId, status, authToken);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order))
      );
      return updatedOrder;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  };
  const deleteOrder = async (orderId) => {
    try {
      await deleteOrderAPI(orderId, authToken);
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  };
  // User operations
  const updateUser = async (id, updatedUser) => {
    try {
      const user = await updateUserAPI(id, updatedUser, authToken);
      setUsers((prev) => prev.map((u) => (u.id === id ? user : u)));
      return user;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const updateUserPassword = async (userId, password) => {
    try {
      const user = await updateUserPasswordAPI(userId, password, authToken);
      return user;
    } catch (error) {
      console.error("Error updating user password:", error);
      throw error;
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      const updatedUser = await updateUserStatus(userId, !user.active, authToken);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
      return updatedUser;
    } catch (error) {
      console.error("Error toggling user status:", error);
      throw error;
    }
  };
  const deleteUser = async (id) => {
    try {
      await deleteUserAPI(id, authToken);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };
  const addUser = async (userData) => {
    try {
      const newUser = await createUserAPI(userData, authToken);
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };// Authentication
  const login = async (username, password) => {
    try {
      const response = await loginUser({ username, password });

      // Check if the user has admin role
      if (response.user.role !== 'admin') {
        console.error('Access denied: Admin privileges required');
        return false;
      }

      if (response.token) {
        setAuthToken(response.token);
        localStorage.setItem("adminToken", response.token);
        setIsAuthenticated(true);
        await loadAllData();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setAuthToken(null);
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    setUsers([]);
    setOrders([]);
    setProducts([]);
  };
  const value = {
    // Data
    products,
    orders,
    users,
    isAuthenticated,
    dashboardData,
    loading,

    // Product operations
    addProduct,
    updateProduct,
    deleteProduct,

    // Order operations
    updateOrderStatus,
    deleteOrder,

    // User operations
    updateUser,
    updateUserPassword,
    toggleUserStatus,
    deleteUser,
    addUser,

    // Auth operations
    login,
    logout,

    // Dashboard
    getDashboardStats,
    fetchDashboardData: loadAllData,

    // Reload functions
    loadUsers,
    loadOrders,
    loadProducts,

    // Mock notifications for dashboard
    notifications: [],
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export { AdminContext };
export default AdminProvider;
