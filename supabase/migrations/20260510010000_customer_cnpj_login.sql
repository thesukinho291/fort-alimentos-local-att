CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.vendedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  telefone text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social text NOT NULL,
  cnpj text NOT NULL UNIQUE,
  senha_hash text NOT NULL,
  vendedor_id uuid NOT NULL REFERENCES public.vendedores(id) ON DELETE RESTRICT,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT clientes_cnpj_digits_check CHECK (cnpj ~ '^\d{14}$')
);

CREATE TABLE IF NOT EXISTS public.cliente_sessoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_seen_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cliente_sessoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read vendedores" ON public.vendedores;
DROP POLICY IF EXISTS "Authenticated users can insert vendedores" ON public.vendedores;
DROP POLICY IF EXISTS "Authenticated users can update vendedores" ON public.vendedores;
DROP POLICY IF EXISTS "Authenticated users can delete vendedores" ON public.vendedores;

CREATE POLICY "Authenticated users can read vendedores" ON public.vendedores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert vendedores" ON public.vendedores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update vendedores" ON public.vendedores FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete vendedores" ON public.vendedores FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can read clientes" ON public.clientes;
DROP POLICY IF EXISTS "Authenticated users can delete clientes" ON public.clientes;

CREATE POLICY "Authenticated users can read clientes" ON public.clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete clientes" ON public.clientes FOR DELETE TO authenticated USING (true);

DROP TRIGGER IF EXISTS update_vendedores_updated_at ON public.vendedores;
DROP TRIGGER IF EXISTS update_clientes_updated_at ON public.clientes;

CREATE TRIGGER update_vendedores_updated_at
BEFORE UPDATE ON public.vendedores
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
BEFORE UPDATE ON public.clientes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.normalize_digits(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT regexp_replace(coalesce(value, ''), '\D', '', 'g');
$$;

CREATE OR REPLACE FUNCTION public.login_cliente(p_cnpj text, p_senha text)
RETURNS TABLE (
  id uuid,
  razao_social text,
  cnpj text,
  vendedor_id uuid,
  vendedor_nome text,
  vendedor_telefone text,
  session_token text,
  expires_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  generated_token text;
  matched_cliente_id uuid;
BEGIN
  generated_token := encode(extensions.gen_random_bytes(32), 'hex');

  SELECT c.id
  INTO matched_cliente_id
  FROM public.clientes c
  WHERE c.cnpj = public.normalize_digits(p_cnpj)
    AND c.senha_hash = extensions.crypt(p_senha, c.senha_hash)
  LIMIT 1;

  IF matched_cliente_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.cliente_sessoes (cliente_id, token_hash, expires_at)
  VALUES (matched_cliente_id, encode(extensions.digest(generated_token, 'sha256'), 'hex'), now() + interval '30 days');

  RETURN QUERY
  SELECT
    c.id,
    c.razao_social,
    c.cnpj,
    v.id AS vendedor_id,
    v.nome AS vendedor_nome,
    v.telefone AS vendedor_telefone,
    generated_token AS session_token,
    (now() + interval '30 days') AS expires_at
  FROM public.clientes c
  JOIN public.vendedores v ON v.id = c.vendedor_id
  WHERE c.id = matched_cliente_id
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.validar_sessao_cliente(p_session_token text)
RETURNS TABLE (
  id uuid,
  razao_social text,
  cnpj text,
  vendedor_id uuid,
  vendedor_nome text,
  vendedor_telefone text,
  session_token text,
  expires_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hashed_token text := encode(extensions.digest(coalesce(p_session_token, ''), 'sha256'), 'hex');
BEGIN
  UPDATE public.cliente_sessoes
  SET last_seen_at = now()
  WHERE token_hash = hashed_token
    AND expires_at > now();

  RETURN QUERY
  SELECT
    c.id,
    c.razao_social,
    c.cnpj,
    v.id AS vendedor_id,
    v.nome AS vendedor_nome,
    v.telefone AS vendedor_telefone,
    p_session_token AS session_token,
    s.expires_at
  FROM public.cliente_sessoes s
  JOIN public.clientes c ON c.id = s.cliente_id
  JOIN public.vendedores v ON v.id = c.vendedor_id
  WHERE s.token_hash = hashed_token
    AND s.expires_at > now()
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.logout_cliente(p_session_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.cliente_sessoes
  WHERE token_hash = encode(extensions.digest(coalesce(p_session_token, ''), 'sha256'), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_upsert_cliente(
  p_id uuid,
  p_razao_social text,
  p_cnpj text,
  p_senha text,
  p_vendedor_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_cnpj text := public.normalize_digits(p_cnpj);
  saved_id uuid;
BEGIN
  IF auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Apenas administradores autenticados podem salvar clientes.';
  END IF;

  IF length(normalized_cnpj) <> 14 THEN
    RAISE EXCEPTION 'CNPJ invalido.';
  END IF;

  IF p_id IS NULL AND coalesce(p_senha, '') = '' THEN
    RAISE EXCEPTION 'Senha obrigatoria para novo cliente.';
  END IF;

  IF p_id IS NULL THEN
    INSERT INTO public.clientes (razao_social, cnpj, senha_hash, vendedor_id)
    VALUES (
      trim(p_razao_social),
      normalized_cnpj,
      extensions.crypt(p_senha, extensions.gen_salt('bf')),
      p_vendedor_id
    )
    RETURNING id INTO saved_id;
  ELSE
    UPDATE public.clientes
    SET
      razao_social = trim(p_razao_social),
      cnpj = normalized_cnpj,
      vendedor_id = p_vendedor_id,
      senha_hash = CASE
        WHEN coalesce(p_senha, '') = '' THEN senha_hash
        ELSE extensions.crypt(p_senha, extensions.gen_salt('bf'))
      END
    WHERE id = p_id
    RETURNING id INTO saved_id;
  END IF;

  RETURN saved_id;
END;
$$;

WITH vendedor_teste AS (
  INSERT INTO public.vendedores (nome, telefone)
  SELECT 'Vendedor Teste', '5515991138912'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.vendedores WHERE telefone = '5515991138912'
  )
  RETURNING id
),
vendedor_padrao AS (
  SELECT id FROM vendedor_teste
  UNION ALL
  SELECT id FROM public.vendedores WHERE telefone = '5515991138912'
  LIMIT 1
)
INSERT INTO public.clientes (razao_social, cnpj, senha_hash, vendedor_id)
SELECT
  'Empresa Teste',
  '12345678000195',
  extensions.crypt('teste123', extensions.gen_salt('bf')),
  vendedor_padrao.id
FROM vendedor_padrao
WHERE NOT EXISTS (
  SELECT 1 FROM public.clientes WHERE cnpj = '12345678000195'
);

