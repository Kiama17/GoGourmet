ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 50;
UPDATE public.menu_items SET stock_quantity = 50 WHERE stock_quantity IS NULL;
