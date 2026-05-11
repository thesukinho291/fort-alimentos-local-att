import { createContext } from "react";
import type { CustomerSession } from "@/services/customerAuthService";

export interface CustomerAuthContextValue {
  customer: CustomerSession | null;
  loading: boolean;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  login: (cnpj: string, password: string) => Promise<void>;
  logout: () => void;
}

export const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);
