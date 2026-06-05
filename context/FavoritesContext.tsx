import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

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

  const clearError = () => setError(null);

  // LOAD FROM STORAGE ON STARTUP
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
      setFavorites((prev) => [...prev, item]);
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
      isFavorite(item.id) ? removeFavorite(item.id) : addFavorite(item);
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