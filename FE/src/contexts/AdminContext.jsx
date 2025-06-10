import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getAllUsers,
  createUser as createUserAPI,
  updateUserStatus,
  updateUser as updateUserAPI,
  updateUserPassword as updateUserPasswordAPI,
  deleteUser as deleteUserAPI,
  getAllProducts,
  createProduct,
  updateProduct as updateProductAPI,
  deleteProduct as deleteProductAPI,
  getAllOrders,
  getDashboardMetrics as getDashboardMetricsAPI,
  updateOrderStatus as updateOrderStatusAPI,
  deleteOrder as deleteOrderAPI,
} from "../api/admin.js";
import { useAuth } from "./AuthContext";

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
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  const { token, isAdmin, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated() && isAdmin() && token) {
      loadAllData();
    }
  }, [token, isAuthenticated, isAdmin]);
  const loadAllData = async () => {
    try {
      setLoading(true);
      console.log("Loading admin data...");
      await Promise.all([loadUsers(), loadOrders(), loadProducts(), loadDashboardMetrics()]);
      console.log("Admin data loaded successfully");
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      console.log("Loading users with token:", token ? "present" : "missing");
      const usersData = await getAllUsers(token);
      console.log("Users loaded:", usersData?.length || 0);
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadOrders = async () => {
    try {
      console.log("Loading orders with token:", token ? "present" : "missing");
      const ordersData = await getAllOrders(token);
      console.log("Orders loaded:", ordersData?.length || 0);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };  const loadProducts = async () => {
    try {
      console.log(
        "Loading products with token:",
        token ? "present" : "missing"
      );
      const productsData = await getAllProducts(token);
      console.log("Products loaded:", productsData?.length || 0);
      setProducts(productsData);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadDashboardMetrics = async () => {
    try {
      console.log(
        "Loading dashboard metrics with token:",
        token ? "present" : "missing"
      );
      const metrics = await getDashboardMetricsAPI(token);
      console.log("Dashboard metrics loaded:", metrics);
      setDashboardMetrics(metrics);
    } catch (error) {
      console.error("Error loading dashboard metrics:", error);
      // Fallback to computed metrics if API fails
      setDashboardMetrics(getComputedDashboardStats());
    }
  };
  const getComputedDashboardStats = () => {
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

  const getDashboardStats = () => {
    // Return API data if available, otherwise return computed stats
    return dashboardMetrics || getComputedDashboardStats();
  };

  const addProduct = async (product) => {
    try {
      const newProduct = await createProduct(product, token);
      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  };

  const updateProduct = async (id, updatedProduct) => {
    try {
      const product = await updateProductAPI(id, updatedProduct, token);
      setProducts((prev) => prev.map((p) => (p.id === id ? product : p)));
      return product;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await deleteProductAPI(id, token);
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const updatedOrder = await updateOrderStatusAPI(orderId, status, token);
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
      await deleteOrderAPI(orderId, token);
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  };

  const updateUser = async (id, updatedUser) => {
    try {
      const user = await updateUserAPI(id, updatedUser, token);
      setUsers((prev) => prev.map((u) => (u.id === id ? user : u)));
      return user;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const updateUserPassword = async (userId, password) => {
    try {
      const user = await updateUserPasswordAPI(userId, password, token);
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

      const updatedUser = await updateUserStatus(userId, !user.active, token);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
      return updatedUser;
    } catch (error) {
      console.error("Error toggling user status:", error);
      throw error;
    }
  };

  const deleteUser = async (id) => {
    try {
      await deleteUserAPI(id, token);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  const addUser = async (userData) => {
    try {
      const newUser = await createUserAPI(userData, token);
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };
  const value = {
    // Data
    products,
    orders,
    users,
    dashboardMetrics,
    loading,

    // Product operations
    addProduct,
    updateProduct,
    deleteProduct,

    // Order operations
    updateOrderStatus,
    deleteOrder, // User operations
    updateUser,
    updateUserPassword,
    toggleUserStatus,
    deleteUser,
    addUser,

    // Dashboard
    getDashboardStats,

    // Reload functions
    loadUsers,
    loadOrders,
    loadProducts,
    loadDashboardMetrics,

    // Mock notifications for dashboard
    notifications: [],
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export { AdminContext };
export default AdminProvider;
