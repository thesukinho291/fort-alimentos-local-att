-- Restrict the public image bucket to the formats the admin panel supports.
UPDATE storage.buckets
SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'images';

DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;

CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images'
  AND lower(storage.extension(name)) = ANY (ARRAY['jpg', 'jpeg', 'png', 'webp'])
);

-- The site reads product and content data publicly, but admin writes require login.
DROP POLICY IF EXISTS "Anyone can insert products" ON public.products;
DROP POLICY IF EXISTS "Anyone can update products" ON public.products;
DROP POLICY IF EXISTS "Anyone can delete products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;

CREATE POLICY "Authenticated users can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Anyone can insert site content" ON public.site_content;
DROP POLICY IF EXISTS "Anyone can update site content" ON public.site_content;
DROP POLICY IF EXISTS "Authenticated users can insert site content" ON public.site_content;
DROP POLICY IF EXISTS "Authenticated users can update site content" ON public.site_content;

CREATE POLICY "Authenticated users can insert site content"
ON public.site_content
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update site content"
ON public.site_content
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Analytics events can still be created by visitors, but reading/deleting them is admin-only.
DROP POLICY IF EXISTS "Anyone can read events" ON public.analytics_events;
DROP POLICY IF EXISTS "Anyone can delete events" ON public.analytics_events;
DROP POLICY IF EXISTS "Authenticated users can read events" ON public.analytics_events;
DROP POLICY IF EXISTS "Authenticated users can delete events" ON public.analytics_events;

CREATE POLICY "Authenticated users can read events"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete events"
ON public.analytics_events
FOR DELETE
TO authenticated
USING (true);
