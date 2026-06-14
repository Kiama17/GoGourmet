-- Promo codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  max_uses INTEGER NOT NULL DEFAULT 0,
  used_count INTEGER NOT NULL DEFAULT 0,
  min_order_amount REAL NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active promo codes"
  ON public.promo_codes FOR SELECT
  USING (is_active = true);

-- Function to validate and apply promo code
CREATE OR REPLACE FUNCTION public.apply_promo_code(p_code TEXT, p_order_total REAL)
RETURNS TABLE(valid BOOLEAN, discount_percent INTEGER, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_promo public.promo_codes;
BEGIN
  SELECT * INTO v_promo FROM public.promo_codes WHERE code = UPPER(p_code);

  IF v_promo.id IS NULL THEN
    RETURN QUERY SELECT false, 0, 'Invalid promo code'::TEXT;
    RETURN;
  END IF;

  IF v_promo.is_active = false THEN
    RETURN QUERY SELECT false, 0, 'This promo code is no longer active'::TEXT;
    RETURN;
  END IF;

  IF v_promo.expires_at IS NOT NULL AND v_promo.expires_at < now() THEN
    RETURN QUERY SELECT false, 0, 'This promo code has expired'::TEXT;
    RETURN;
  END IF;

  IF v_promo.max_uses > 0 AND v_promo.used_count >= v_promo.max_uses THEN
    RETURN QUERY SELECT false, 0, 'This promo code has reached its usage limit'::TEXT;
    RETURN;
  END IF;

  IF p_order_total < v_promo.min_order_amount THEN
    RETURN QUERY SELECT false, 0, format('Minimum order amount of KES %s required', v_promo.min_order_amount::TEXT)::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT true, v_promo.discount_percent, ''::TEXT;
END;
$$;

-- Function to increment promo code usage
CREATE OR REPLACE FUNCTION public.increment_promo_usage(p_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.promo_codes SET used_count = used_count + 1 WHERE code = UPPER(p_code);
END;
$$;

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, menu_item_id, order_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to get average rating for a menu item
CREATE OR REPLACE FUNCTION public.get_item_rating(p_item_id UUID)
RETURNS TABLE(average REAL, count INTEGER)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(AVG(rating), 0)::REAL, COUNT(*)::INTEGER
  FROM public.reviews
  WHERE menu_item_id = p_item_id;
END;
$$;

-- Seed promo codes
INSERT INTO public.promo_codes (code, discount_percent, max_uses, min_order_amount, expires_at) VALUES
  ('WELCOME10', 10, 100, 500, now() + INTERVAL '90 days'),
  ('FREEDEL20', 20, 50, 1000, now() + INTERVAL '60 days'),
  ('HALF50', 50, 20, 2000, now() + INTERVAL '30 days')
ON CONFLICT (code) DO NOTHING;
