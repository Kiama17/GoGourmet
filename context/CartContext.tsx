import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (food: CartItem) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;
  clearError: () => void;
};

const CART_STORAGE_KEY = "gogourment_cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // LOAD CART FROM STORAGE ON STARTUP
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (stored) setCartItems(JSON.parse(stored));
      } catch (err) {
        setError("Failed to load your cart. Please restart the app.");
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, []);

  // SAVE CART TO STORAGE WHENEVER IT CHANGES
  useEffect(() => {
    if (loading) return;
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (err) {
        setError("Failed to save your cart. Changes may not persist.");
      }
    };
    saveCart();
  }, [cartItems]);

  const addToCart = (food: CartItem) => {
    try {
      setCartItems((prev) => {
        const existingItem = prev.find((item) => item.id === food.id);
        if (existingItem) {
          return prev.map((item) =>
            item.id === food.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        }
        return [...prev, { ...food, quantity: 1 }];
      });
    } catch (err) {
      setError("Failed to add item to cart.");
    }
  };

  const increaseQuantity = (id: string) => {
    try {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );
    } catch (err) {
      setError("Failed to update quantity.");
    }
  };

  const decreaseQuantity = (id: string) => {
    try {
      setCartItems((prev) =>
        prev
          .map((item) =>
            item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
          )
          .filter((item) => item.quantity > 0),
      );
    } catch (err) {
      setError("Failed to update quantity.");
    }
  };

  const clearCart = async () => {
    try {
      setCartItems([]);
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
    } catch (err) {
      setError("Failed to clear cart.");
    }
  };

  const clearError = () => setError(null);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      totalItems,
      totalPrice,
      loading,
      error,
      clearError,
    }),
    [
      cartItems,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      totalItems,
      totalPrice,
      loading,
      error,
      clearError,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
};
