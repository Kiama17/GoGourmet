import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_KEY);
        if (stored) setFavorites(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to load favorites:", error);
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, []);

  useEffect(() => {
    if (loading) return;
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error("Failed to save favorites:", error);
      }
    };
    saveFavorites();
  }, [favorites, loading]);

  const addFavorite = useCallback((item: FoodItem) => {
    setFavorites((prev) => [...prev, item]);
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.some((item) => item.id === id),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (item: FoodItem) => {
      isFavorite(item.id) ? removeFavorite(item.id) : addFavorite(item);
    },
    [isFavorite, addFavorite, removeFavorite],
  );

  const value = useMemo(
    () => ({
      favorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      loading,
    }),
    [
      favorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      loading,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>
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
