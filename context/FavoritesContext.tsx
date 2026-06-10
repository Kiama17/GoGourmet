import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { analytics } from "../services/analytics";

type FoodItem = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type FavoritesContextType = {
  favorites: FoodItem[];
  addFavorite: (item: FoodItem) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (item: FoodItem) => Promise<void>;
  isFavorite: (id: string) => boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
};

const FAVORITES_KEY = "gogourment_favorites";

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export const FavoritesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [favorites, setFavorites] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevUserRef = useRef<any>(undefined);
  const { user } = useAuth();

  const clearError = () => setError(null);

  // CLEAR FAVORITES ON LOGOUT
  useEffect(() => {
    if (prevUserRef.current !== undefined && !user) {
      setFavorites([]);
      AsyncStorage.removeItem(FAVORITES_KEY);
    }
    prevUserRef.current = user;
  }, [user]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_KEY);
        if (stored) setFavorites(JSON.parse(stored));
      } catch (err) {
        setError("Failed to load favorites. Please restart the app.");
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, []);

  // SAVE TO STORAGE ON CHANGE
  useEffect(() => {
    if (loading) return;
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      } catch (err) {
        setError("Failed to save favorites. Changes may not persist.");
      }
    };
    saveFavorites();
  }, [favorites]);

  const addFavorite = (item: FoodItem) => {
    try {
      setFavorites((prev) => {
        if (prev.some((f) => f.id === item.id)) return prev;
        return [...prev, item];
      });
    } catch (err) {
      setError("Failed to add to favorites.");
    }
  };

  const removeFavorite = (id: string) => {
    try {
      setFavorites((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError("Failed to remove from favorites.");
    }
  };

  const isFavorite = (id: string) => {
    return favorites.some((item) => item.id === id);
  };

  const toggleFavorite = async (item: FoodItem) => {
    try {
      setError(null);
      if (isFavorite(item.id)) {
        removeFavorite(item.id);
        analytics.track("item_unfavorited", { item_id: item.id });
      } else {
        addFavorite(item);
        analytics.track("item_favorited", { item_id: item.id });
      }
    } catch (err) {
      setError("Failed to update favorites. Please try again.");
      throw err;
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        loading,
        error,
        clearError,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
};