import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getUserProfile } from '../api/users.js';

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
    const checkAuth = async () => {
      if (token) {
        try {
          const userData = await getUserProfile(token);
          setUser(userData);
        } catch (error) {
          console.error('Token validation failed:', error);
          // Token is invalid, remove it
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);
  const login = async (username, password) => {
    try {
      const result = await loginUser({ username, password });
      
      setUser(result.user);
      setToken(result.token);
      localStorage.setItem('token', result.token);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };
  const loginAdmin = async (username, password) => {
    try {
      const result = await loginUser({ username, password });
      
      // Check if the user has admin role
      if (result.user.role !== 'admin') {
        return { success: false, error: 'Access denied. Admin privileges required.' };
      }
      
      setUser(result.user);
      setToken(result.token);
      localStorage.setItem('token', result.token);
      
      return { success: true };
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: error.message };
    }
  };const register = async (username, password) => {
    try {
      const user = await registerUser({ username, password });
      
      // Registration successful, but user needs to login to get a token
      // For better UX, let's automatically log them in
      return await login(username, password);
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

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
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
    updateUser,
    isAdmin,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
