import { supabase } from "@/integrations/supabase/client";
import { normalizeCnpj } from "@/lib/cnpj";

export interface BrasilApiCompany {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  descricao_situacao_cadastral: string;
  situacao_cadastral: number;
}

export interface CompanyRegistrationPayload {
  cnpj: string;
  password: string;
  company: BrasilApiCompany;
}

export function buildCompanyAddress(company: BrasilApiCompany) {
  return [
    company.logradouro,
    company.numero,
    company.complemento,
    company.bairro,
  ].filter(Boolean).join(", ");
}

export async function fetchCompanyByCnpj(cnpj: string) {
  const normalizedCnpj = normalizeCnpj(cnpj);
  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${normalizedCnpj}`);

  if (response.status === 404) {
    throw new Error("CNPJ nao encontrado na Receita.");
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel consultar o CNPJ agora.");
  }

  return (await response.json()) as BrasilApiCompany;
}

export async function registerCompany({ cnpj, password, company }: CompanyRegistrationPayload) {
  const { data, error } = await supabase.rpc("registrar_cliente_empresa", {
    p_cidade: company.municipio || "",
    p_cnpj: normalizeCnpj(cnpj),
    p_endereco: buildCompanyAddress(company),
    p_nome_fantasia: company.nome_fantasia || "",
    p_razao_social: company.razao_social,
    p_senha: password,
    p_situacao_cadastral: company.descricao_situacao_cadastral || "",
    p_uf: company.uf || "",
  });

  if (error) {
    if (error.message.toLowerCase().includes("duplicate") || error.message.toLowerCase().includes("ja cadastrado")) {
      throw new Error("Este CNPJ ja esta cadastrado.");
    }
    throw new Error(error.message || "Nao foi possivel cadastrar a empresa.");
  }

  return data as string;
}
