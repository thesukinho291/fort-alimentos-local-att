import { supabase } from "@/integrations/supabase/client";
import { normalizeCnpj } from "@/lib/cnpj";

export interface CustomerSession {
  id: string;
  razao_social: string;
  cnpj: string;
  vendedor_id: string;
  vendedor_nome: string;
  vendedor_telefone: string;
  session_token: string;
  expires_at: string;
}

export async function loginCustomer(cnpj: string, password: string) {
  const { data, error } = await supabase.rpc("login_cliente", {
    p_cnpj: normalizeCnpj(cnpj),
    p_senha: password,
  });

  if (error) {
    if (error.code === "PGRST202" || error.message.toLowerCase().includes("login_cliente")) {
      throw new Error("Banco de dados ainda nao atualizado. Aplique a migration de login por CNPJ no Supabase.");
    }
    throw error;
  }
  const customer = Array.isArray(data) ? data[0] : null;
  if (!customer) throw new Error("CNPJ ou senha invalidos.");

  return customer as CustomerSession;
}

export async function validateCustomerSession(sessionToken: string) {
  const { data, error } = await supabase.rpc("validar_sessao_cliente", {
    p_session_token: sessionToken,
  });

  if (error) {
    if (error.code === "PGRST202" || error.message.toLowerCase().includes("validar_sessao_cliente")) {
      throw new Error("Banco de dados ainda nao atualizado. Aplique a migration de login por CNPJ no Supabase.");
    }
    throw error;
  }
  const customer = Array.isArray(data) ? data[0] : null;
  return (customer || null) as CustomerSession | null;
}

export async function logoutCustomer(sessionToken: string) {
  await supabase.rpc("logout_cliente", {
    p_session_token: sessionToken,
  });
}
