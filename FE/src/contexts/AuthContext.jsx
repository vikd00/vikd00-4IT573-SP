import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Check if user is authenticated on app load
    if (token) {
      // TODO: Validate token with backend
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      // TODO: Call login API
      console.log('Login attempt:', { username, password });
      
      // Mock login for now
      const mockUser = { id: 1, username, role: 'user' };
      const mockToken = 'mock-jwt-token';
      
      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('token', mockToken);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const loginAdmin = async (username, password) => {
    try {
      // TODO: Call admin login API
      console.log('Admin login attempt:', { username, password });
      
      // Mock admin login for now
      const mockAdmin = { id: 1, username, role: 'admin' };
      const mockToken = 'mock-admin-jwt-token';
      
      setUser(mockAdmin);
      setToken(mockToken);
      localStorage.setItem('token', mockToken);
      
      return { success: true };
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (username, password) => {
    try {
      // TODO: Call register API
      console.log('Register attempt:', { username, password });
      
      // Mock registration for now
      const mockUser = { id: 2, username, role: 'user' };
      const mockToken = 'mock-jwt-token-new';
      
      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('token', mockToken);
      
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  const value = {
    user,
    token,
    loading,
    login,
    loginAdmin,
    register,
    logout,
    isAdmin,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
