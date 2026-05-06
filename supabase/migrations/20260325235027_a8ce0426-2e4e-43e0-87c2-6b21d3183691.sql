-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  is_promotion BOOLEAN NOT NULL DEFAULT false,
  price NUMERIC(10,2),
  promo_price NUMERIC(10,2),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create site_content table (single row for site settings)
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'Fort Alimentos',
  banner_title TEXT NOT NULL DEFAULT 'Distribuição de Alimentos no Atacado',
  banner_subtitle TEXT NOT NULL DEFAULT 'Qualidade e variedade para o seu negócio.',
  about_text TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  logo_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Storage policies
CREATE POLICY "Images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Anyone can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');
CREATE POLICY "Anyone can update images" ON storage.objects FOR UPDATE USING (bucket_id = 'images');
CREATE POLICY "Anyone can delete images" ON storage.objects FOR DELETE USING (bucket_id = 'images');

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Site content is publicly readable" ON public.site_content FOR SELECT USING (true);

-- Public write access (admin auth is handled in-app)
CREATE POLICY "Anyone can insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Anyone can insert site content" ON public.site_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update site content" ON public.site_content FOR UPDATE USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site content
INSERT INTO public.site_content (company_name, banner_title, banner_subtitle, about_text, phone, address)
VALUES (
  'Fort Alimentos',
  'Distribuição de Alimentos no Atacado',
  'Qualidade e variedade para o seu negócio. Os melhores produtos com os melhores preços.',
  'A Fort Alimentos é uma distribuidora de alimentos no atacado, comprometida em oferecer produtos de alta qualidade com preços competitivos. Com anos de experiência no mercado, atendemos restaurantes, mercados, padarias e estabelecimentos comerciais em toda a região. Nossa missão é ser a parceira ideal do seu negócio, garantindo pontualidade nas entregas e excelência no atendimento.',
  '(15) 99113-8912',
  'Sorocaba - SP'
);

-- Insert default products
INSERT INTO public.products (name, description, image, category, is_promotion, sort_order) VALUES
  ('Presunto Cozido', 'Presunto cozido fatiado de alta qualidade, ideal para sanduíches e pratos frios.', '', 'Frios', false, 1),
  ('Queijo Mussarela', 'Queijo mussarela fatiado, perfeito para pizzas e lanches.', '', 'Laticínios', false, 2),
  ('Suco de Laranja 1L', 'Suco de laranja natural em embalagem de 1 litro.', '', 'Bebidas', false, 3),
  ('Molho de Tomate 340g', 'Molho de tomate tradicional, ideal para massas e pizzas.', '', 'Condimentos', false, 4),
  ('Hambúrguer Bovino', 'Hambúrguer bovino congelado, pacote com 12 unidades.', '', 'Congelados', false, 5),
  ('Mortadela Defumada', 'Mortadela defumada de qualidade premium para atacado.', '', 'Frios', false, 6),
  ('Requeijão Cremoso', 'Requeijão cremoso 200g, textura suave e sabor marcante.', '', 'Laticínios', false, 7),
  ('Refrigerante Cola 2L', 'Refrigerante sabor cola em garrafa PET de 2 litros.', '', 'Bebidas', false, 8),
  ('Catchup 400g', 'Catchup tradicional, ideal para acompanhamentos.', '', 'Condimentos', false, 9),
  ('Pizza Congelada', 'Pizza congelada sabor mussarela, pronta em 25 minutos.', '', 'Congelados', false, 10);