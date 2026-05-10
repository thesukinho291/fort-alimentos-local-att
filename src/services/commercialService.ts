import { supabase } from "@/integrations/supabase/client";
import { normalizeCnpj } from "@/lib/cnpj";

export interface Vendedor {
  id: string;
  nome: string;
  telefone: string;
}

export interface ClienteEmpresa {
  id: string;
  razao_social: string;
  cnpj: string;
  vendedor_id: string;
  vendedor?: Vendedor | null;
}

export interface ClienteEmpresaPayload {
  id?: string;
  razao_social: string;
  cnpj: string;
  senha?: string;
  vendedor_id: string;
}

export async function fetchVendedores() {
  const { data, error } = await supabase.from("vendedores").select("id, nome, telefone").order("nome");
  if (error) throw error;
  return (data || []) as Vendedor[];
}

export async function upsertVendedor(vendedor: Omit<Vendedor, "id"> & { id?: string }) {
  const payload = { nome: vendedor.nome.trim(), telefone: vendedor.telefone.trim() };
  const query = vendedor.id
    ? supabase.from("vendedores").update(payload).eq("id", vendedor.id)
    : supabase.from("vendedores").insert(payload);

  const { error } = await query;
  if (error) throw error;
}

export async function deleteVendedor(id: string) {
  const { error } = await supabase.from("vendedores").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchClientesEmpresas() {
  const { data, error } = await supabase
    .from("clientes")
    .select("id, razao_social, cnpj, vendedor_id, vendedores(id, nome, telefone)")
    .order("razao_social");

  if (error) throw error;

  return (data || []).map((cliente) => ({
    id: cliente.id,
    razao_social: cliente.razao_social,
    cnpj: cliente.cnpj,
    vendedor_id: cliente.vendedor_id,
    vendedor: Array.isArray(cliente.vendedores) ? cliente.vendedores[0] : cliente.vendedores,
  })) as ClienteEmpresa[];
}

export async function upsertClienteEmpresa(cliente: ClienteEmpresaPayload) {
  const { error } = await supabase.rpc("admin_upsert_cliente", {
    p_id: cliente.id || null,
    p_razao_social: cliente.razao_social.trim(),
    p_cnpj: normalizeCnpj(cliente.cnpj),
    p_senha: cliente.senha?.trim() || null,
    p_vendedor_id: cliente.vendedor_id,
  });

  if (error) throw error;
}

export async function deleteClienteEmpresa(id: string) {
  const { error } = await supabase.from("clientes").delete().eq("id", id);
  if (error) throw error;
}
