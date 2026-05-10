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
  nome_fantasia: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  uf: string;
  situacao_cadastral: string;
  vendedor_id: string;
  vendedor?: Vendedor | null;
}

export interface ClienteEmpresaPayload {
  id?: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  senha?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  situacao_cadastral?: string;
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
    .select("id, razao_social, nome_fantasia, cnpj, endereco, cidade, uf, situacao_cadastral, vendedor_id, vendedores(id, nome, telefone)")
    .order("razao_social");

  if (error) throw error;

  return (data || []).map((cliente) => ({
    id: cliente.id,
    razao_social: cliente.razao_social,
    nome_fantasia: cliente.nome_fantasia || "",
    cnpj: cliente.cnpj,
    endereco: cliente.endereco || "",
    cidade: cliente.cidade || "",
    uf: cliente.uf || "",
    situacao_cadastral: cliente.situacao_cadastral || "",
    vendedor_id: cliente.vendedor_id,
    vendedor: Array.isArray(cliente.vendedores) ? cliente.vendedores[0] : cliente.vendedores,
  })) as ClienteEmpresa[];
}

export async function upsertClienteEmpresa(cliente: ClienteEmpresaPayload) {
  const { error } = await supabase.rpc("admin_upsert_cliente", {
    p_id: cliente.id || null,
    p_cidade: cliente.cidade?.trim() || "",
    p_razao_social: cliente.razao_social.trim(),
    p_cnpj: normalizeCnpj(cliente.cnpj),
    p_endereco: cliente.endereco?.trim() || "",
    p_nome_fantasia: cliente.nome_fantasia?.trim() || "",
    p_senha: cliente.senha?.trim() || null,
    p_situacao_cadastral: cliente.situacao_cadastral?.trim() || "ATIVA",
    p_uf: cliente.uf?.trim().toUpperCase() || "",
    p_vendedor_id: cliente.vendedor_id,
  });

  if (error) throw error;
}

export async function deleteClienteEmpresa(id: string) {
  const { error } = await supabase.from("clientes").delete().eq("id", id);
  if (error) throw error;
}
