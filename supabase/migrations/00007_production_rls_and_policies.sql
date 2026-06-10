-- Production-grade RLS policies and helper functions

-- Efficient admin check function (avoids recursive subquery in policies)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Drop old admin policies that use inefficient subquery
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Admins can read all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update any order" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage menu items" ON public.menu_items;

-- Recreate admin policies using is_admin() helper
CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can read all orders"
  ON public.orders FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update any order"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can manage menu items"
  ON public.menu_items FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update menu items"
  ON public.menu_items FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete menu items"
  ON public.menu_items FOR DELETE
  USING (public.is_admin());

-- Fix orders INSERT to use auth.uid() instead of trusting client-provided user_id
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can insert orders on behalf of users (e.g., phone orders)
CREATE POLICY "Admins can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (public.is_admin());

-- Admin can delete orders
CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE
  USING (public.is_admin());

-- Payments: users can read own, service role handles management
DROP POLICY IF EXISTS "Service role can manage payments" ON public.payments;
CREATE POLICY "Service role can manage payments"
  ON public.payments FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Users cannot insert/update/delete payments directly
DROP POLICY IF EXISTS "Users can read own payments" ON public.payments;
CREATE POLICY "Users can read own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM public.orders WHERE id = order_id
  ));

-- Notification tokens table
CREATE TABLE IF NOT EXISTS public.notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'expo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.notification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification token"
  ON public.notification_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage notification tokens"
  ON public.notification_tokens FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_updates BOOLEAN NOT NULL DEFAULT true,
  promotions BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification preferences"
  ON public.notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to upsert push token
CREATE OR REPLACE FUNCTION public.upsert_push_token(p_token TEXT, p_platform TEXT DEFAULT 'expo')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.notification_tokens (user_id, token, platform, updated_at)
  VALUES (auth.uid(), p_token, p_platform, now())
  ON CONFLICT (user_id)
  DO UPDATE SET token = p_token, platform = p_platform, updated_at = now();
END;
$$;
