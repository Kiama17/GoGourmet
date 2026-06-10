CREATE OR REPLACE FUNCTION public.decrement_stock(item_id UUID, qty INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.menu_items
  SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 50) - qty)
  WHERE id = item_id;
END;
$$;
