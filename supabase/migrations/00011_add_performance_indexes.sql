-- Performance indexes for common query patterns

-- Orders: filter by user and sort by date
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);

-- Payments: look up by order
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments (order_id);

-- Favorites: look up by user or menu item
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_menu_item_id ON public.favorites (menu_item_id);

-- Addresses: filter by user
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses (user_id);

-- Reviews: filter by menu item for average rating
CREATE INDEX IF NOT EXISTS idx_reviews_menu_item_id ON public.reviews (menu_item_id);

-- Notification tokens: look up by user
CREATE INDEX IF NOT EXISTS idx_notification_tokens_user_id ON public.notification_tokens (user_id);

-- Notification preferences: look up by user
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences (user_id);

-- Promo codes: look up by code
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes (code);
