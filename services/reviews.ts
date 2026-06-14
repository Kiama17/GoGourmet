import { supabase } from "./supabaseClient";

export type Review = {
  id: string;
  user_id: string;
  menu_item_id: string;
  order_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type ItemRating = {
  average: number;
  count: number;
};

export async function submitReview(params: {
  menuItemId: string;
  orderId?: string;
  rating: number;
  comment?: string;
}): Promise<void> {
  const { error } = await supabase.from("reviews").insert({
    menu_item_id: params.menuItemId,
    order_id: params.orderId || null,
    rating: params.rating,
    comment: params.comment?.trim() || null,
  });
  if (error) throw error;
}

export async function getItemRating(menuItemId: string): Promise<ItemRating> {
  const { data, error } = await supabase.rpc("get_item_rating", { p_item_id: menuItemId });
  if (error || !data || data.length === 0) return { average: 0, count: 0 };
  return data[0] as ItemRating;
}

export async function getUserReviewForOrder(orderId: string): Promise<Review | null> {
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("order_id", orderId)
    .single();
  return data as Review | null;
}
