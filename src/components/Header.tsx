import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import type { SiteContent } from "@/store/siteStore";
import { LogOut, Menu, UserRound, X } from "lucide-react";
import CartButton from "@/components/cart/CartButton";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

interface Props {
  siteContent: SiteContent;
}

const Header = ({ siteContent }: Props) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { customer, openLogin, logout } = useCustomerAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { label: "Início", href: "#inicio" },
    { label: "Sobre", href: "#sobre" },
    { label: "Produtos", href: "#produtos" },
    { label: "Lançamentos", href: "/?categoria=Lancamentos#produtos" },
    { label: "Contato", href: "#contato" },
  ];

  const logoSrc = siteContent.logo_url || logo;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-card/95 backdrop-blur-md shadow-elevated" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        <a href="#inicio" className="flex items-center gap-3 min-w-0" aria-label="Fort Alimentos">
          <img src={logoSrc} alt={siteContent.company_name} className="h-11 md:h-14 w-auto" width={160} height={64} decoding="async" />
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-heading font-semibold text-sm uppercase tracking-wider text-foreground hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {customer ? (
            <div className="hidden items-center gap-2 rounded-xl border border-border/50 bg-card/80 px-2.5 py-1.5 md:flex">
              <a href="/minha-conta" className="max-w-36 truncate text-xs font-heading font-bold text-foreground">
                {customer.razao_social}
              </a>
              <button
                type="button"
                onClick={logout}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Sair"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openLogin}
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-heading font-semibold text-foreground transition-colors hover:bg-muted md:inline-flex"
            >
              <UserRound size={17} />
              Entrar
            </button>
          )}
          <CartButton />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-foreground p-2 rounded-lg hover:bg-muted"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-card shadow-elevated border-t border-border max-h-[calc(100vh-4rem)] overflow-y-auto"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block px-6 py-4 font-heading font-semibold text-sm uppercase tracking-wider text-foreground hover:bg-muted transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="border-t border-border px-6 py-4">
            {customer ? (
              <div className="grid gap-2">
                <a href="/minha-conta" onClick={() => setMobileOpen(false)} className="font-heading text-sm font-bold text-foreground">
                  {customer.razao_social}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="inline-flex items-center gap-2 text-sm font-heading font-semibold text-muted-foreground"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  openLogin();
                  setMobileOpen(false);
                }}
                className="inline-flex items-center gap-2 font-heading text-sm font-bold text-primary"
              >
                <UserRound size={16} />
                Entrar
              </button>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;
