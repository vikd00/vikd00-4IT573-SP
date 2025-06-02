import React, { createContext, useContext, useState } from 'react';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

// Mock data
const initialProducts = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone with A17 Pro chip',
    price: 999,
    category: 'Electronics',
    stock: 50,
    image: 'https://via.placeholder.com/300x200?text=iPhone+15+Pro',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 2,
    name: 'MacBook Air M2',
    description: 'Powerful and efficient laptop',
    price: 1199,
    category: 'Electronics',
    stock: 30,
    image: 'https://via.placeholder.com/300x200?text=MacBook+Air+M2',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 3,
    name: 'Nike Air Max',
    description: 'Comfortable running shoes',
    price: 120,
    category: 'Sports',
    stock: 100,
    image: 'https://via.placeholder.com/300x200?text=Nike+Air+Max',
    createdAt: new Date('2024-01-20'),
  },
];

const initialOrders = [
  {
    id: 1,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    items: [
      { productId: 1, productName: 'iPhone 15 Pro', quantity: 1, price: 999 }
    ],
    total: 999,
    status: 'Pending',
    createdAt: new Date('2024-01-25'),
  },
  {
    id: 2,
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    items: [
      { productId: 2, productName: 'MacBook Air M2', quantity: 1, price: 1199 },
      { productId: 3, productName: 'Nike Air Max', quantity: 2, price: 120 }
    ],
    total: 1439,
    status: 'Completed',
    createdAt: new Date('2024-01-22'),
  },
  {
    id: 3,
    customerName: 'Bob Johnson',
    customerEmail: 'bob@example.com',
    items: [
      { productId: 3, productName: 'Nike Air Max', quantity: 1, price: 120 }
    ],
    total: 120,
    status: 'Shipped',
    createdAt: new Date('2024-01-20'),
  },
];

const initialUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'customer',
    registeredAt: new Date('2024-01-15'),
    orders: 1,
    totalSpent: 999,
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'customer',
    registeredAt: new Date('2024-01-10'),
    orders: 1,
    totalSpent: 1439,
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'customer',
    registeredAt: new Date('2024-01-08'),
    orders: 1,
    totalSpent: 120,
  },
  {
    id: 4,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    registeredAt: new Date('2023-12-01'),
    orders: 0,
    totalSpent: 0,
  },
];

export const AdminProvider = ({ children }) => {
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [users, setUsers] = useState(initialUsers);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dashboard stats
  const getDashboardStats = () => {
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalUsers = users.filter(user => user.role === 'customer').length;
    const totalRevenue = orders
      .filter(order => order.status === 'Completed')
      .reduce((sum, order) => sum + order.total, 0);

    const pendingOrders = orders.filter(order => order.status === 'Pending').length;
    const lowStockProducts = products.filter(product => product.stock < 10).length;

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

  const dashboardData = getDashboardStats();

  // Product CRUD operations
  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now(),
      createdAt: new Date(),
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = (id, updatedProduct) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === id ? { ...product, ...updatedProduct } : product
      )
    );
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  // Order operations
  const updateOrderStatus = (orderId, status) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  const deleteOrder = (id) => {
    setOrders(prev => prev.filter(order => order.id !== id));
  };

  // User operations
  const updateUser = (id, updatedUser) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === id ? { ...user, ...updatedUser } : user
      )
    );
  };

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };
  // Authentication
  const login = (email, password) => {
    // Mock authentication - in real app, this would call an API
    if (email === 'admin@example.com' && password === 'admin123') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
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
    deleteUser,
    
    // Auth operations
    login,
    logout,
    
    // Dashboard
    getDashboardStats,
    fetchDashboardData,
    
    // Mock notifications for dashboard
    notifications: [],
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export { AdminContext };
export default AdminProvider;
