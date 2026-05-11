import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import {
  loginCustomer,
  logoutCustomer,
  validateCustomerSession,
  type CustomerSession,
} from "@/services/customerAuthService";
import { CustomerAuthContext } from "@/context/customerAuthState";

const CUSTOMER_SESSION_KEY = "fort-alimentos-customer-session";

function readStoredCustomer() {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(CUSTOMER_SESSION_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as CustomerSession;
    if (!parsed?.id || !parsed?.cnpj || !parsed?.vendedor_telefone || !parsed?.session_token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export const CustomerAuthProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<CustomerSession | null>(readStoredCustomer);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const storedCustomer = readStoredCustomer();
    if (!storedCustomer?.session_token) {
      setLoading(false);
      return;
    }

    validateCustomerSession(storedCustomer.session_token)
      .then((validatedCustomer) => {
        setCustomer(validatedCustomer);
      })
      .catch(() => {
        setCustomer(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (customer) {
      window.localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(customer));
    } else {
      window.localStorage.removeItem(CUSTOMER_SESSION_KEY);
    }
  }, [customer]);

  const login = useCallback(async (cnpj: string, password: string) => {
    setLoading(true);
    try {
      const session = await loginCustomer(cnpj, password);
      setCustomer(session);
      setLoginOpen(false);
      toast.success(`Bem-vindo, ${session.razao_social}!`);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    if (customer?.session_token) {
      logoutCustomer(customer.session_token).catch(() => {});
    }
    setCustomer(null);
    toast.info("Sessao encerrada.");
  }, [customer?.session_token]);

  const value = useMemo(
    () => ({
      customer,
      loading,
      loginOpen,
      openLogin: () => setLoginOpen(true),
      closeLogin: () => setLoginOpen(false),
      login,
      logout,
    }),
    [customer, loading, login, loginOpen, logout],
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
};
