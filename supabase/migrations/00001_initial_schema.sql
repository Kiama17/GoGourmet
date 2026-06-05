-- GoGourmet Supabase Schema Migration

-- Users table (synced with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  photo_url TEXT,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own data" ON public.users;
CREATE POLICY "Users can read own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
CREATE POLICY "Users can insert own data"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Menu items table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price REAL NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  rating REAL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Menu items are publicly readable" ON public.menu_items;
CREATE POLICY "Menu items are publicly readable"
  ON public.menu_items FOR SELECT
  USING (true);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  total REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'Preparing',
  delivery_address TEXT,
  phone TEXT,
  date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
CREATE POLICY "Users can read own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  amount REAL NOT NULL,
  phone TEXT,
  receipt_number TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own payments" ON public.payments;
CREATE POLICY "Users can read own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM public.orders WHERE id = order_id
  ));

DROP POLICY IF EXISTS "Service role can manage payments" ON public.payments;
CREATE POLICY "Service role can manage payments"
  ON public.payments FOR ALL
  USING (true)
  WITH CHECK (true);

-- Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, menu_item_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorites;
CREATE POLICY "Users can manage own favorites"
  ON public.favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, display_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed menu items
INSERT INTO public.menu_items (id, name, price, category, description, image_url, rating) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Burger Deluxe', 850, 'Burger', 'Juicy beef burger with cheese, lettuce and fries.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', 4.8),
  ('00000000-0000-0000-0000-000000000002', 'Pepperoni Pizza', 1200, 'Pizza', 'Classic pepperoni pizza with mozzarella cheese.', 'https://images.unsplash.com/photo-1548365328-9f547fb0953b', 4.7),
  ('00000000-0000-0000-0000-000000000003', 'Chicken Wrap', 650, 'Wraps', 'Grilled chicken wrap with fresh vegetables.', 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7', 4.5),
  ('00000000-0000-0000-0000-000000000004', 'Loaded Fries', 500, 'Fries', 'Crispy fries topped with cheese and beef sauce.', 'https://images.unsplash.com/photo-1576107232684-1279f390859f', 4.6),
  ('00000000-0000-0000-0000-000000000005', 'Milkshake', 400, 'Drinks', 'Vanilla milkshake with whipped cream.', 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc', 4.4),
  ('00000000-0000-0000-0000-000000000006', 'Nyama Choma', 1500, 'Local', 'Grilled beef served with kachumbari and ugali.', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1', 4.9),
  ('00000000-0000-0000-0000-000000000007', 'Pilau', 600, 'Local', 'Spiced rice with beef chunks and aromatic herbs.', 'https://images.unsplash.com/photo-1603073163308-9654c3fb70b5', 4.7),
  ('00000000-0000-0000-0000-000000000008', 'Ugali & Fish', 800, 'Local', 'Soft ugali served with fried tilapia and vegetables.', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7', 4.8),
  ('00000000-0000-0000-0000-000000000009', 'Chapati & Beans', 450, 'Local', 'Flaky layered chapati served with stewed beans.', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7', 4.5),
  ('00000000-0000-0000-0000-000000000010', 'Samosas (6 pcs)', 300, 'Local', 'Crispy beef samosas served with kachumbari.', 'https://images.unsplash.com/photo-1601050690597-df0568f70950', 4.6),
  ('00000000-0000-0000-0000-000000000011', 'Mukimo', 500, 'Local', 'Mashed potatoes with pumpkin leaves, maize and beans.', 'https://images.unsplash.com/photo-1603073163308-9654c3fb70b5', 4.4),
  ('00000000-0000-0000-0000-000000000012', 'Mandazi (4 pcs)', 200, 'Local', 'Soft fried dough pastries, perfect with tea.', 'https://images.unsplash.com/photo-1509365465985-25d11c17e812', 4.3)
ON CONFLICT (id) DO NOTHING;
