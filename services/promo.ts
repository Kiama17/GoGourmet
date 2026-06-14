import { supabase } from "./supabaseClient";

export async function validatePromoCode(code: string, orderTotal: number): Promise<{
  valid: boolean;
  discountPercent: number;
  message: string;
}> {
  const { data, error } = await supabase.rpc("apply_promo_code", {
    p_code: code.trim(),
    p_order_total: orderTotal,
  });

  if (error || !data || data.length === 0) {
    return { valid: false, discountPercent: 0, message: "Invalid promo code" };
  }

  const row = data[0] as { valid: boolean; discount_percent: number; message: string };
  return {
    valid: row.valid,
    discountPercent: row.discount_percent,
    message: row.message,
  };
}

export async function incrementPromoUsage(code: string): Promise<void> {
  await supabase.rpc("increment_promo_usage", { p_code: code });
}

export function calculateDiscountedTotal(total: number, discountPercent: number): number {
  return Math.round(total * (1 - discountPercent / 100) * 100) / 100;
}
