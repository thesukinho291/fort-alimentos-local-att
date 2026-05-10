import { useState } from "react";
import { Building2, Loader2, Lock, X } from "lucide-react";
import { toast } from "sonner";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { formatCnpj, isValidCnpj } from "@/lib/cnpj";

const LoginModal = () => {
  const { loginOpen, closeLogin, login, loading } = useCustomerAuth();
  const [cnpj, setCnpj] = useState("");
  const [password, setPassword] = useState("");

  if (!loginOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidCnpj(cnpj)) {
      toast.error("Informe um CNPJ valido.");
      return;
    }

    try {
      await login(cnpj, password);
      setPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel entrar.");
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-fort-dark/70 px-4 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-float">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 size={22} />
            </div>
            <h2 className="font-heading text-lg font-bold text-foreground">Entrar como empresa</h2>
            <p className="mt-1 text-sm text-muted-foreground">Acesse com CNPJ e senha para finalizar pedidos.</p>
          </div>
          <button
            type="button"
            onClick={closeLogin}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Fechar login"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-heading font-semibold text-muted-foreground">CNPJ</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="username"
              value={cnpj}
              onChange={(event) => setCnpj(formatCnpj(event.target.value))}
              placeholder="00.000.000/0000-00"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-primary"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-heading font-semibold text-muted-foreground">Senha</span>
            <div className="flex items-center rounded-xl border border-border bg-background px-4 focus-within:ring-2 focus-within:ring-primary">
              <Lock size={16} className="text-muted-foreground" />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Sua senha"
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-foreground outline-none"
                required
              />
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-fort px-5 py-3 font-heading text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Entrar
        </button>
      </form>
    </div>
  );
};

export default LoginModal;
