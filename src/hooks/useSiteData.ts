import { useState, useEffect, useCallback } from "react";
import { fetchProducts, fetchSiteContent, type Product, type SiteContent } from "@/store/siteStore";

const NETWORK_ERROR_MESSAGE = "Não foi possível carregar o site agora. Verifique sua conexão e tente novamente.";

export function useSiteData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [prods, content] = await Promise.all([fetchProducts(), fetchSiteContent()]);
      setProducts(prods);
      setSiteContent(content);
    } catch {
      setProducts([]);
      setSiteContent(null);
      setError(NETWORK_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { products, siteContent, loading, error, refresh };
}
