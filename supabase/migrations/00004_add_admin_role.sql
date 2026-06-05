-- Add admin role to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- Admin can read all users
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Admin can read all orders
DROP POLICY IF EXISTS "Admins can read all orders" ON public.orders;
CREATE POLICY "Admins can read all orders"
  ON public.orders FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Admin can update any order
DROP POLICY IF EXISTS "Admins can update any order" ON public.orders;
CREATE POLICY "Admins can update any order"
  ON public.orders FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Admin can manage menu items
DROP POLICY IF EXISTS "Admins can manage menu items" ON public.menu_items;
CREATE POLICY "Admins can manage menu items"
  ON public.menu_items FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));
