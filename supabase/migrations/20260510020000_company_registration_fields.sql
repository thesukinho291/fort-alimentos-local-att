ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS nome_fantasia text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS endereco text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cidade text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS uf text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS situacao_cadastral text NOT NULL DEFAULT 'ATIVA';

CREATE OR REPLACE FUNCTION public.is_valid_cnpj(p_cnpj text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  cnpj text := public.normalize_digits(p_cnpj);
  sum_digits integer;
  digit integer;
  i integer;
  weights_first integer[] := ARRAY[5,4,3,2,9,8,7,6,5,4,3,2];
  weights_second integer[] := ARRAY[6,5,4,3,2,9,8,7,6,5,4,3,2];
BEGIN
  IF length(cnpj) <> 14 OR cnpj ~ '^(\d)\1+$' THEN
    RETURN false;
  END IF;

  sum_digits := 0;
  FOR i IN 1..12 LOOP
    sum_digits := sum_digits + substring(cnpj, i, 1)::integer * weights_first[i];
  END LOOP;
  digit := CASE WHEN sum_digits % 11 < 2 THEN 0 ELSE 11 - (sum_digits % 11) END;
  IF digit <> substring(cnpj, 13, 1)::integer THEN
    RETURN false;
  END IF;

  sum_digits := 0;
  FOR i IN 1..13 LOOP
    sum_digits := sum_digits + substring(cnpj, i, 1)::integer * weights_second[i];
  END LOOP;
  digit := CASE WHEN sum_digits % 11 < 2 THEN 0 ELSE 11 - (sum_digits % 11) END;

  RETURN digit = substring(cnpj, 14, 1)::integer;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_upsert_cliente(
  p_id uuid,
  p_razao_social text,
  p_cnpj text,
  p_senha text,
  p_vendedor_id uuid,
  p_nome_fantasia text DEFAULT '',
  p_endereco text DEFAULT '',
  p_cidade text DEFAULT '',
  p_uf text DEFAULT '',
  p_situacao_cadastral text DEFAULT 'ATIVA'
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

  IF NOT public.is_valid_cnpj(normalized_cnpj) THEN
    RAISE EXCEPTION 'CNPJ invalido.';
  END IF;

  IF upper(coalesce(p_situacao_cadastral, '')) <> 'ATIVA' THEN
    RAISE EXCEPTION 'Somente empresas ATIVAS podem ser cadastradas.';
  END IF;

  IF p_id IS NULL AND coalesce(p_senha, '') = '' THEN
    RAISE EXCEPTION 'Senha obrigatoria para novo cliente.';
  END IF;

  IF p_id IS NULL THEN
    INSERT INTO public.clientes (
      razao_social,
      nome_fantasia,
      cnpj,
      senha_hash,
      vendedor_id,
      endereco,
      cidade,
      uf,
      situacao_cadastral
    )
    VALUES (
      trim(p_razao_social),
      trim(coalesce(p_nome_fantasia, '')),
      normalized_cnpj,
      extensions.crypt(p_senha, extensions.gen_salt('bf')),
      p_vendedor_id,
      trim(coalesce(p_endereco, '')),
      trim(coalesce(p_cidade, '')),
      upper(trim(coalesce(p_uf, ''))),
      upper(trim(coalesce(p_situacao_cadastral, 'ATIVA')))
    )
    RETURNING id INTO saved_id;
  ELSE
    UPDATE public.clientes
    SET
      razao_social = trim(p_razao_social),
      nome_fantasia = trim(coalesce(p_nome_fantasia, '')),
      cnpj = normalized_cnpj,
      vendedor_id = p_vendedor_id,
      endereco = trim(coalesce(p_endereco, '')),
      cidade = trim(coalesce(p_cidade, '')),
      uf = upper(trim(coalesce(p_uf, ''))),
      situacao_cadastral = upper(trim(coalesce(p_situacao_cadastral, 'ATIVA'))),
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

CREATE OR REPLACE FUNCTION public.registrar_cliente_empresa(
  p_razao_social text,
  p_nome_fantasia text,
  p_cnpj text,
  p_senha text,
  p_endereco text,
  p_cidade text,
  p_uf text,
  p_situacao_cadastral text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_cnpj text := public.normalize_digits(p_cnpj);
  selected_vendedor_id uuid;
  saved_id uuid;
BEGIN
  IF NOT public.is_valid_cnpj(normalized_cnpj) THEN
    RAISE EXCEPTION 'CNPJ invalido.';
  END IF;

  IF upper(coalesce(p_situacao_cadastral, '')) <> 'ATIVA' THEN
    RAISE EXCEPTION 'Somente empresas ATIVAS podem se cadastrar.';
  END IF;

  IF coalesce(p_senha, '') = '' OR length(p_senha) < 6 THEN
    RAISE EXCEPTION 'A senha deve ter pelo menos 6 caracteres.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.clientes WHERE cnpj = normalized_cnpj) THEN
    RAISE EXCEPTION 'CNPJ ja cadastrado.';
  END IF;

  SELECT id
  INTO selected_vendedor_id
  FROM public.vendedores
  ORDER BY created_at, nome
  LIMIT 1;

  IF selected_vendedor_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum vendedor cadastrado para vincular a empresa.';
  END IF;

  INSERT INTO public.clientes (
    razao_social,
    nome_fantasia,
    cnpj,
    senha_hash,
    vendedor_id,
    endereco,
    cidade,
    uf,
    situacao_cadastral
  )
  VALUES (
    trim(p_razao_social),
    trim(coalesce(p_nome_fantasia, '')),
    normalized_cnpj,
    extensions.crypt(p_senha, extensions.gen_salt('bf')),
    selected_vendedor_id,
    trim(coalesce(p_endereco, '')),
    trim(coalesce(p_cidade, '')),
    upper(trim(coalesce(p_uf, ''))),
    'ATIVA'
  )
  RETURNING id INTO saved_id;

  RETURN saved_id;
END;
$$;
