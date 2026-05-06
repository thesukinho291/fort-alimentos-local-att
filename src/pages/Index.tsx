import { useEffect } from "react";
import { useSiteData } from "@/hooks/useSiteData";
import { trackPageView } from "@/lib/analytics";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import AboutSection from "@/components/AboutSection";
import ProductsSection from "@/components/ProductsSection";
import ContactSection from "@/components/ContactSection";
import FloatingButtons from "@/components/FloatingButtons";

const Index = () => {
  const { products, siteContent, loading, error, refresh } = useSiteData();

  useEffect(() => {
    trackPageView();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gradient-fort rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground font-heading">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !siteContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="font-heading text-2xl font-bold text-foreground">Não foi possível abrir o site</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {error || "O conteúdo principal não pôde ser carregado agora."}
          </p>
          <button
            type="button"
            onClick={refresh}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 font-heading font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {siteContent.promo_banner_text && (
        <a
          href="/?categoria=Promocoes#produtos"
          className="block bg-primary text-primary-foreground text-center text-sm font-heading font-semibold py-2 hover:opacity-90 transition-opacity"
        >
          🔥 {siteContent.promo_banner_text}
        </a>
      )}
      <Header siteContent={siteContent} />
      <HeroBanner siteContent={siteContent} />
      <AboutSection siteContent={siteContent} />
      <ProductsSection products={products} categories={siteContent.categories} isLoading={loading} />
      <ContactSection siteContent={siteContent} />
      <FloatingButtons siteContent={siteContent} />
    </div>
  );
};

export default Index;
