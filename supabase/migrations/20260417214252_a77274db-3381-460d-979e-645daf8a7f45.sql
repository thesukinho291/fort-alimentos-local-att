ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_new_release boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_unavailable boolean NOT NULL DEFAULT false;