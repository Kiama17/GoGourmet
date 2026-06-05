-- Add optional apartment details and delivery instructions to addresses
ALTER TABLE public.addresses
  ADD COLUMN IF NOT EXISTS apartment TEXT,
  ADD COLUMN IF NOT EXISTS instructions TEXT;
