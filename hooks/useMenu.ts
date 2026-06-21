import { useCallback, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  rating: number;
};

type UseMenuResult = {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useMenu(): UseMenuResult {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMenuItems(
        (data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.category,
          description: item.description || "",
          image: item.image_url || "",
          rating: item.rating || 0,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return { menuItems, loading, error, refresh: fetchMenu };
}
