ALTER TABLE public.site_content
  ADD COLUMN whatsapp_link text NOT NULL DEFAULT 'https://api.whatsapp.com/send/?phone=5515991138912&text&type=phone_number&app_absent=0',
  ADD COLUMN instagram_link text NOT NULL DEFAULT 'https://www.instagram.com/fort.alimentos/',
  ADD COLUMN location_link text NOT NULL DEFAULT 'https://maps.app.goo.gl/J5Uc6Fuh23KCHh7S8';