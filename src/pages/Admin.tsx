import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import AdminPanel from "@/components/AdminPanel";
import { supabase } from "@/integrations/supabase/client";
import { useSiteData } from "@/hooks/useSiteData";

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { products, siteContent, loading, error, refresh } = useSiteData();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);

    if (loginError) {
      toast.error("Não foi possível entrar. Verifique o e-mail e a senha.");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.info("Sessão encerrada.");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Lock className="text-primary" size={24} />
            </div>
            <h1 className="font-heading text-xl font-bold text-foreground">Painel Administrativo</h1>
            <p className="mt-1 text-sm text-muted-foreground">Fort Alimentos</p>
          </div>
          <div className="space-y-3">
            <input
              type="email"
              autoComplete="email"
              placeholder="E-mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-primary"
              required
            />
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-primary"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-fort py-3 font-heading text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Entrar
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (loading || !siteContent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="font-heading text-sm text-muted-foreground">{error || "Carregando painel..."}</p>
        </div>
      </div>
    );
  }

  return <AdminPanel products={products} siteContent={siteContent} onSaved={refresh} onSignOut={handleSignOut} />;
};

export default Admin;
