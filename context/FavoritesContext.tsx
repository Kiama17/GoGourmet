import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabaseClient";
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

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const prevUserIdRef = useRef<string | undefined>(undefined);

  const clearError = () => setError(null);

  const fetchDbFavorites = useCallback(async (): Promise<FoodItem[]> => {
    if (!user) return [];
    const { data, error } = await supabase
      .from("favorites")
      .select("menu_item_id, menu_items(id, name, price, image_url)")
      .eq("user_id", user.id);
    if (error) throw error;
    return (data || []).map((fav: any) => ({
      id: fav.menu_item_id,
      name: fav.menu_items?.name || "",
      price: fav.menu_items?.price || 0,
      image: fav.menu_items?.image_url || "",
    }));
  }, [user]);

  const persistLocal = useCallback((items: FoodItem[]) => {
    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(items)).catch(() => {});
  }, []);

  // Load on mount & re-fetch when user changes (login/logout)
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const stored = await AsyncStorage.getItem(FAVORITES_KEY);
        let local: FoodItem[] = stored ? JSON.parse(stored) : [];

        if (user) {
          const dbItems = await fetchDbFavorites();
          if (!cancelled) {
            const merged = new Map<string, FoodItem>();
            for (const item of dbItems) merged.set(item.id, item);
            for (const item of local) if (!merged.has(item.id)) merged.set(item.id, item);
            local = Array.from(merged.values());
          }
        }

        if (!cancelled) {
          if (local.length > 0) setFavorites(local);
          persistLocal(local);
        }
      } catch {
        if (!cancelled) setError("Failed to load favorites.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Persist to AsyncStorage whenever favorites change
  useEffect(() => {
    if (loading) return;
    persistLocal(favorites);
  }, [favorites]);

  const syncToDb = async (itemId: string, add: boolean) => {
    if (!user) return;
    if (add) {
      await supabase.from("favorites").insert({ user_id: user.id, menu_item_id: itemId });
    } else {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("menu_item_id", itemId);
    }
  };

  const addFavorite = (item: FoodItem) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === item.id)) return prev;
      return [...prev, item];
    });
    syncToDb(item.id, true).catch(() => fetchDbFavorites().then((items) => { if (items) setFavorites(items); }));
  };

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
    syncToDb(id, false).catch(() => fetchDbFavorites().then((items) => { if (items) setFavorites(items); }));
  };

  const isFavorite = (id: string) => favorites.some((item) => item.id === id);

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
    } catch {
      setError("Failed to update favorites.");
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite, loading, error, clearError }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used within FavoritesProvider");
  return context;
};
