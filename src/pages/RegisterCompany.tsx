import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, CheckCircle2, Loader2, Lock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { formatCnpj, isValidCnpj, normalizeCnpj } from "@/lib/cnpj";
import {
  buildCompanyAddress,
  fetchCompanyByCnpj,
  registerCompany,
  type BrasilApiCompany,
} from "@/services/companyRegistrationService";

const RegisterCompany = () => {
  const navigate = useNavigate();
  const { login } = useCustomerAuth();
  const [cnpj, setCnpj] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [company, setCompany] = useState<BrasilApiCompany | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const normalizedCnpj = normalizeCnpj(cnpj);
  const isActive = company?.descricao_situacao_cadastral?.toUpperCase() === "ATIVA" || company?.situacao_cadastral === 2;

  useEffect(() => {
    setCompany(null);
    setLookupError("");

    if (normalizedCnpj.length !== 14) return;
    if (!isValidCnpj(normalizedCnpj)) {
      setLookupError("CNPJ invalido. Verifique os digitos.");
      return;
    }

    const timeout = window.setTimeout(() => {
      setLookupLoading(true);
      fetchCompanyByCnpj(normalizedCnpj)
        .then((data) => {
          if (!(data.descricao_situacao_cadastral?.toUpperCase() === "ATIVA" || data.situacao_cadastral === 2)) {
            setLookupError("Somente empresas com situacao ATIVA podem se cadastrar.");
            return;
          }
          setCompany(data);
        })
        .catch((error) => {
          setLookupError(error instanceof Error ? error.message : "CNPJ nao encontrado.");
        })
        .finally(() => setLookupLoading(false));
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [normalizedCnpj]);

  const canSubmit = useMemo(
    () => Boolean(company && isActive && password.length >= 6 && password === confirmPassword && !saving),
    [company, confirmPassword, isActive, password, saving],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!company) {
      toast.error("Consulte um CNPJ valido antes de continuar.");
      return;
    }
    if (!isActive) {
      toast.error("Somente empresas ATIVAS podem se cadastrar.");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas nao conferem.");
      return;
    }

    setSaving(true);
    try {
      await registerCompany({ cnpj, password, company });
      await login(cnpj, password);
      toast.success("Empresa cadastrada com sucesso.");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel concluir o cadastro.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:py-16">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="flex flex-col justify-center">
          <Link to="/" className="mb-8 text-sm font-heading font-semibold text-primary hover:underline">
            Voltar para a loja
          </Link>
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 size={26} />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Cadastro corporativo</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Informe o CNPJ para validarmos os dados da Receita automaticamente. Apenas empresas ativas podem finalizar o cadastro.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
          <div className="grid gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-heading font-semibold text-muted-foreground">CNPJ</span>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={cnpj}
                  onChange={(event) => setCnpj(formatCnpj(event.target.value))}
                  placeholder="00.000.000/0000-00"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-11 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-primary"
                  required
                />
                {lookupLoading && <Loader2 size={18} className="absolute right-4 top-3.5 animate-spin text-primary" />}
                {company && !lookupLoading && <CheckCircle2 size={18} className="absolute right-4 top-3.5 text-green-600" />}
              </div>
              {lookupError && <p className="mt-2 text-xs font-semibold text-destructive">{lookupError}</p>}
            </label>

            {company && (
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-700">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-bold text-foreground">{company.razao_social}</p>
                    {company.nome_fantasia && <p className="text-xs text-muted-foreground">{company.nome_fantasia}</p>}
                    <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                      <MapPin size={14} className="mt-0.5 shrink-0" />
                      <span>{buildCompanyAddress(company)} - {company.municipio}/{company.uf}</span>
                    </div>
                    <span className="mt-3 inline-flex rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-heading font-bold text-green-700">
                      {company.descricao_situacao_cadastral}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <label className="block">
              <span className="mb-1 block text-xs font-heading font-semibold text-muted-foreground">Senha</span>
              <div className="flex items-center rounded-xl border border-border bg-background px-4 focus-within:ring-2 focus-within:ring-primary">
                <Lock size={16} className="text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimo 6 caracteres"
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-foreground outline-none"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-heading font-semibold text-muted-foreground">Confirmar senha</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repita a senha"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-primary"
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-fort px-5 py-3 font-heading text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Criar cadastro
          </button>
        </form>
      </div>
    </main>
  );
};

export default RegisterCompany;
