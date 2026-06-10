import { supabase } from "./supabaseClient";
import { cache } from "./cache";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  rating: number;
  stock_quantity?: number;
};

const mapRow = (item: any): MenuItem => ({
  id: item.id,
  name: item.name,
  price: item.price,
  image: item.image_url || "",
  category: item.category,
  description: item.description || "",
  rating: item.rating || 0,
  stock_quantity: item.stock_quantity,
});

export async function getMenuItems(page = 1, pageSize = 50): Promise<MenuItem[]> {
  const cacheKey = `menu:${page}:${pageSize}`;
  return cache.withCache(cacheKey, async () => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("created_at", { ascending: true })
      .range(from, to);

    if (error) {
      console.error("Failed to fetch menu items:", error);
      return [];
    }

    return (data || []).map(mapRow);
  });
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  return cache.withCache(`menu:item:${id}`, async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return mapRow(data);
  });
}
