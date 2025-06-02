import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getCart, 
  addToCart as addToCartAPI, 
  updateCartItem as updateCartItemAPI, 
  removeFromCart as removeFromCartAPI, 
  clearCart as clearCartAPI 
} from '../api/cart';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Load cart from backend when user logs in, fallback to localStorage
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated() && token) {
        try {
          setLoading(true);
          setError(null);
          const cartData = await getCart(token);
            // Convert backend cart format to frontend format
          const formattedItems = cartData.items?.map(item => ({
            id: item.productId,
            name: item.name,
            price: item.price / 100, // Convert cents to euros
            quantity: item.quantity,
            imageUrl: item.imageUrl,
            cartItemId: item.id // Store the cart item ID for backend operations
          })) || [];
          
          setCartItems(formattedItems);
        } catch (err) {
          console.error('Error loading cart from backend:', err);
          setError('Chyba pri načítavaní košíka');
          // Fallback to localStorage
          loadCartFromLocalStorage();
        } finally {
          setLoading(false);
        }
      } else {
        // User not authenticated, load from localStorage
        loadCartFromLocalStorage();
      }
    };

    const loadCartFromLocalStorage = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
          setCartItems([]);
        }
      }
    };

    loadCart();
  }, [isAuthenticated, token]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  const addToCart = async (product, quantity = 1) => {
    try {
      setError(null);
      
      if (isAuthenticated() && token) {
        // Add to backend
        setLoading(true);
        const cartData = await addToCartAPI(product.id, quantity, token);
          // Update local state with backend response
        const formattedItems = cartData.items?.map(item => ({
          id: item.productId,
          name: item.name,
          price: item.price / 100,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
          cartItemId: item.id
        })) || [];
        
        setCartItems(formattedItems);
      } else {
        // Add to localStorage (fallback for non-authenticated users)
        setCartItems(prevItems => {
          const existingItem = prevItems.find(item => item.id === product.id);
          
          if (existingItem) {
            return prevItems.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            return [...prevItems, { ...product, quantity }];
          }
        });
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Chyba pri pridávaní do košíka');
    } finally {
      setLoading(false);
    }
  };
  const removeFromCart = async (productId) => {
    try {
      setError(null);
      
      if (isAuthenticated() && token) {
        // Find the cart item ID for this product
        const cartItem = cartItems.find(item => item.id === productId);
        if (cartItem && cartItem.cartItemId) {
          setLoading(true);
          await removeFromCartAPI(cartItem.cartItemId, token);
        }
      }
      
      // Update local state (works for both authenticated and non-authenticated)
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError('Chyba pri odstraňovaní z košíka');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    try {
      setError(null);
      
      if (isAuthenticated() && token) {
        const cartItem = cartItems.find(item => item.id === productId);
        if (cartItem && cartItem.cartItemId) {
          setLoading(true);
          const cartData = await updateCartItemAPI(cartItem.cartItemId, quantity, token);
          
          // Update local state with backend response
          const formattedItems = cartData.items?.map(item => ({
            id: item.productId,
            name: item.name,
            price: item.price / 100,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
            cartItemId: item.id
          })) || [];
          
          setCartItems(formattedItems);
        }
      } else {
        // Update localStorage cart
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.id === productId
              ? { ...item, quantity }
              : item
          )
        );
      }
    } catch (err) {
      console.error('Error updating cart quantity:', err);
      setError('Chyba pri aktualizácii množstva');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      
      if (isAuthenticated() && token) {
        setLoading(true);
        await clearCartAPI(token);
      }
      
      setCartItems([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Chyba pri vyprázdňovaní košíka');
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };
  const syncCart = async () => {
    if (!isAuthenticated() || !token) {
      console.log('User not authenticated, skipping cart sync');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const cartData = await getCart(token);
      
      const formattedItems = cartData.items?.map(item => ({
        id: item.productId,
        name: item.name,
        price: item.price / 100,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        cartItemId: item.id
      })) || [];
      
      setCartItems(formattedItems);
    } catch (err) {
      console.error('Error syncing cart:', err);
      setError('Chyba pri synchronizácii košíka');
    } finally {
      setLoading(false);
    }
  };
  const value = {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    syncCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
