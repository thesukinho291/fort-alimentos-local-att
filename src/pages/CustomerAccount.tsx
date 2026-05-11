import { Link } from "react-router-dom";
import { Building2, LogOut, UserRound } from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { formatCnpj } from "@/lib/cnpj";

const CustomerAccount = () => {
  const { customer, logout } = useCustomerAuth();

  if (!customer) return null;

  return (
    <main className="min-h-screen bg-background px-4 py-24">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="text-sm font-heading font-semibold text-primary hover:underline">
          Voltar para a loja
        </Link>
        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 size={22} />
              </div>
              <div>
                <h1 className="font-heading text-xl font-bold text-foreground">{customer.razao_social}</h1>
                <p className="text-sm text-muted-foreground">CNPJ: {formatCnpj(customer.cnpj)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-heading font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>

          <div className="mt-6 rounded-xl border border-border/50 bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <UserRound size={18} />
              <span className="font-heading text-sm font-bold">Vendedor responsavel</span>
            </div>
            <p className="font-heading text-lg font-bold text-foreground">{customer.vendedor_nome}</p>
            <p className="text-sm text-muted-foreground">{customer.vendedor_telefone}</p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default CustomerAccount;
