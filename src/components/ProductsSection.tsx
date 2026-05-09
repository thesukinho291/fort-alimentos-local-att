import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { defaultCategories, type Product } from "@/store/siteStore";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import ProductCard from "@/components/products/ProductCard";

interface Props {
  products: Product[];
  categories?: string[];
  isLoading?: boolean;
}

type SortMode = "featured" | "name" | "category";

const categoryLabel = (category: string) => {
  if (category === "Promocoes") return "Promoções";
  if (category === "Lancamentos") return "Lançamentos";
  return category;
};

const normalizeText = (value: string) =>
  value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const sortProducts = (items: Product[], sortMode: SortMode) => {
  const priority = (product: Product) => {
    if (product.is_unavailable) return 4;
    if (product.is_promotion) return 0;
    if (product.is_new_release) return 1;
    return 2;
  };

  return [...items].sort((a, b) => {
    if (sortMode === "name") return a.name.localeCompare(b.name, "pt-BR");
    if (sortMode === "category") return a.category.localeCompare(b.category, "pt-BR") || priority(a) - priority(b);
    return priority(a) - priority(b) || a.name.localeCompare(b.name, "pt-BR");
  });
};

const ProductsSection = ({ products, categories, isLoading }: Props) => {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const cat = searchParams.get("categoria");
    if (cat === "Promocoes") {
      setActiveCategory("Promocoes");
    } else if (cat === "Lancamentos") {
      setActiveCategory("Lancamentos");
    }
  }, [searchParams]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(searchTimeout.current);
    if (value.trim().length >= 2) {
      searchTimeout.current = setTimeout(() => {
        trackEvent("product_search", { term: value.trim() });
      }, 1000);
    }
  }, []);

  const cats = categories && categories.length > 0 ? categories : defaultCategories;
  const allCategories = ["Todos", "Promocoes", "Lancamentos", ...cats];
  const normalizedSearch = normalizeText(search.trim());

  const filtered = useMemo(() => {
    const byCategory = products.filter((product) => {
      if (activeCategory === "Todos") return true;
      if (activeCategory === "Promocoes") return product.is_promotion;
      if (activeCategory === "Lancamentos") return product.is_new_release;
      return product.category === activeCategory;
    });

    const bySearch = byCategory.filter((product) => {
      if (!normalizedSearch) return true;
      return normalizeText(`${product.name} ${product.description}`).includes(normalizedSearch);
    });

    return sortProducts(bySearch, sortMode);
  }, [activeCategory, normalizedSearch, products, sortMode]);

  return (
    <section id="produtos" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-12"
        >
          <h2 className="font-heading font-bold text-3xl md:text-5xl text-foreground mb-2">
            Nossos <span className="text-gradient">Produtos</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-fort mx-auto mt-4 mb-8 rounded-full" />
        </motion.div>

        <div className="flex flex-col items-center gap-4 mb-10 md:mb-12">
          <div className="grid w-full max-w-3xl gap-3 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Buscar por nome ou descrição..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-full border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => handleSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Limpar pesquisa"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <label className="relative flex items-center">
              <SlidersHorizontal className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="w-full sm:w-52 appearance-none rounded-full border border-border bg-card py-3 pl-10 pr-4 text-sm font-heading font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="featured">Destaques</option>
                <option value="name">Nome (A-Z)</option>
                <option value="category">Categoria</option>
              </select>
            </label>
          </div>

          <div className="flex w-full justify-start gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:gap-3">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-heading font-semibold text-sm px-5 py-2.5 rounded-full transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? cat === "Promocoes"
                      ? "bg-gradient-yellow text-accent-foreground shadow-card font-bold"
                      : cat === "Lancamentos"
                        ? "bg-green-600 text-white shadow-card font-bold"
                        : "bg-gradient-fort text-primary-foreground shadow-card"
                    : "bg-card text-muted-foreground hover:bg-muted border border-border"
                }`}
              >
                {categoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden shadow-card animate-pulse">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-5 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-2/3 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCategory}-${sortMode}-${normalizedSearch}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6"
              >
                {filtered.map((product, index) => (
                  <ProductCard product={product} index={index} key={product.id} />
                ))}
              </motion.div>
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="mx-auto max-w-md text-center py-14">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <Search className="text-muted-foreground" size={24} />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground">Nenhum produto encontrado</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Tente buscar outro termo, remover filtros ou falar com a Fort Alimentos para consultar disponibilidade.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
