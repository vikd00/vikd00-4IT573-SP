import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import useWsSubscription from "../hooks/useWsSubscription";
import {
  getCart,
  addToCart as addToCartAPI,
  updateCartItem as updateCartItemAPI,
  removeFromCart as removeFromCartAPI,
  clearCart as clearCartAPI,
} from "../api/cart";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const formatCartItems = (items) => {
    return (
      items?.map((item) => ({
        id: item.productId,
        name: item.name,
        price: item.price / 100,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        cartItemId: item.id,
      })) || []
    );
  };

  const loadLocalStorageCart = () => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        return Array.isArray(parsedCart) ? parsedCart : [];
      }
      return [];
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      localStorage.removeItem("cart"); // Remove corrupted cart data
      return [];
    }
  };

  const migrateLocalCartToBackend = async (localCart, token) => {
    if (localCart.length === 0) return;

    console.log("Migrating localStorage cart to backend:", localCart);
    for (const item of localCart) {
      try {
        await addToCartAPI(item.id, item.quantity, token);
      } catch (error) {
        console.error("Error migrating cart item:", error);
      }
    }
    localStorage.removeItem("cart");
  };

  useEffect(() => {
    const handleAuthStateChange = async () => {
      console.log(
        "CartContext: Auth state change. Authenticated:",
        isAuthenticated(),
        "Token:",
        !!token,
        "Initialized:",
        initialized
      );

      if (isAuthenticated() && token) {
        try {
          setLoading(true);
          setError(null);

          const localCart = loadLocalStorageCart();
          console.log("LocalStorage cart before migration:", localCart);

          const cartData = await getCart(token);
          const backendItems = formatCartItems(cartData.items);
          console.log("Backend cart loaded:", backendItems);

          if (localCart.length > 0) {
            console.log("Migrating localStorage cart to backend:", localCart);
            await migrateLocalCartToBackend(localCart, token);

            const updatedCartData = await getCart(token);
            const finalItems = formatCartItems(updatedCartData.items);
            console.log("Final cart after migration:", finalItems);
            setCartItems(finalItems);
          } else {
            console.log(
              "No localStorage items, using backend cart:",
              backendItems
            );
            setCartItems(backendItems);
          }
        } catch (err) {
          console.error("Error loading cart from backend:", err);
          setError("Chyba pri načítavaní košíka");
          setCartItems(loadLocalStorageCart());
        } finally {
          setLoading(false);
        }
      } else {
        console.log("User not authenticated, loading from localStorage");
        const localCart = loadLocalStorageCart();
        console.log("Loading localStorage cart:", localCart);
        setCartItems(localCart);
        setError(null);
        setLoading(false);
      }

      if (!initialized) {
        setInitialized(true);
      }
    };

    handleAuthStateChange();
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (
      initialized &&
      !loading &&
      !isAuthenticated() &&
      cartItems.length >= 0
    ) {
      console.log("Saving cart to localStorage:", cartItems);
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, loading, isAuthenticated, initialized]);

  useWsSubscription("cartSync", (message) => {
    if (!isAuthenticated() || !token) {
      console.log("CartContext: Ignoring cart sync for unauthenticated user");
      return;
    }

    if (message.data) {
      console.log("CartContext: Received cart sync", message.data);
      const formattedItems = formatCartItems(message.data.items);
      setCartItems(formattedItems);
    }
  });

  const addToCart = async (product, quantity = 1) => {
    try {
      setError(null);

      if (isAuthenticated() && token) {
        setLoading(true);
        const cartData = await addToCartAPI(product.id, quantity, token);
        setCartItems(formatCartItems(cartData.items));
      } else {
        setCartItems((prevItems) => {
          const existingItem = prevItems.find((item) => item.id === product.id);

          if (existingItem) {
            return prevItems.map((item) =>
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
      console.error("Error adding to cart:", err);
      setError("Chyba pri pridávaní do košíka");
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setError(null);

      if (isAuthenticated() && token) {
        const cartItem = cartItems.find((item) => item.id === productId);
        if (cartItem && cartItem.cartItemId) {
          setLoading(true);
          await removeFromCartAPI(cartItem.cartItemId, token);
        }
      }

      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== productId)
      );
    } catch (err) {
      console.error("Error removing from cart:", err);
      setError("Chyba pri odstraňovaní z košíka");
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
        const cartItem = cartItems.find((item) => item.id === productId);
        if (cartItem && cartItem.cartItemId) {
          setLoading(true);
          const cartData = await updateCartItemAPI(
            cartItem.cartItemId,
            quantity,
            token
          );
          setCartItems(formatCartItems(cartData.items));
        }
      } else {
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          )
        );
      }
    } catch (err) {
      console.error("Error updating cart quantity:", err);
      setError("Chyba pri aktualizácii množstva");
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async (skipApi = false) => {
    console.log("[clearCart FE] Initiating clear cart. skipApi:", skipApi);

    try {
      setError(null);

      if (isAuthenticated() && token && !skipApi) {
        setLoading(true);
        await clearCartAPI(token);
      }

      setCartItems([]);

      if (!isAuthenticated() || skipApi) {
        localStorage.removeItem("cart");
      }

      return true;
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError("Chyba pri vyprázdňovaní košíka");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };
  const syncCart = async () => {
    if (!isAuthenticated() || !token) {
      console.log("User not authenticated, skipping cart sync");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const cartData = await getCart(token);
      setCartItems(formatCartItems(cartData.items));
    } catch (err) {
      console.error("Error syncing cart:", err);
      setError("Chyba pri synchronizácii košíka");
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
    syncCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
