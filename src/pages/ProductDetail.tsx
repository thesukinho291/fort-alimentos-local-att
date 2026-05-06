import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Minus, Plus, ShoppingCart, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getFallbackImage, type Product } from "@/store/siteStore";
import { useSiteData } from "@/hooks/useSiteData";
import { trackEvent } from "@/lib/analytics";
import { useCart } from "@/hooks/useCart";
import ProductBadge from "@/components/products/ProductBadge";
import ProductCard from "@/components/products/ProductCard";
import ProductPrice from "@/components/products/ProductPrice";

const productSelect = "id, name, description, image, category, is_promotion, price, promo_price, is_new_release, is_unavailable";

const normalizeProduct = (product: Product): Product => ({
  ...product,
  image: product.image || getFallbackImage(product.category),
  is_new_release: product.is_new_release ?? false,
  is_unavailable: product.is_unavailable ?? false,
});

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { siteContent } = useSiteData();
  const { addProduct } = useCart();

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setLoading(true);

    const loadProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(productSelect)
        .eq("id", id)
        .single();

      if (error || !data || !isMounted) {
        setProduct(null);
        setLoading(false);
        return;
      }

      const nextProduct = normalizeProduct(data);
      setProduct(nextProduct);
      trackEvent("product_click", { product_id: data.id, product_name: data.name });

      const { data: relatedData } = await supabase
        .from("products")
        .select(productSelect)
        .eq("category", data.category)
        .neq("id", data.id)
        .limit(4);

      if (isMounted) {
        setRelated((relatedData || []).map(normalizeProduct));
        setLoading(false);
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

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

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6 px-4 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
          <ShoppingCart className="text-muted-foreground" size={32} />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Produto nao encontrado</h1>
          <p className="mt-2 text-sm text-muted-foreground">Ele pode ter sido removido ou estar temporariamente indisponivel.</p>
        </div>
        <Link
          to="/#produtos"
          className="bg-gradient-fort text-primary-foreground font-heading font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
        >
          Voltar aos produtos
        </Link>
      </div>
    );
  }

  const whatsappHref = siteContent?.whatsapp_link
    ? `${siteContent.whatsapp_link}${siteContent.whatsapp_link.includes("?") ? "&" : "?"}text=${encodeURIComponent(`Ola! Tenho interesse no produto: ${product.name}`)}`
    : "";
  const canAddToCart = !product.is_unavailable;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-fort">
        <div className="container mx-auto px-4 py-5">
          <Link
            to="/#produtos"
            className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground font-heading font-semibold transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Voltar aos produtos
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-2xl shadow-elevated overflow-hidden"
        >
          <div className="grid md:grid-cols-2">
            <div className={`relative bg-muted ${product.is_unavailable ? "grayscale" : ""}`}>
              <div className="absolute top-4 left-4 md:top-5 md:left-5 z-10 flex flex-col gap-2 items-start">
                <ProductBadge product={product} />
              </div>
              <motion.img
                initial={{ scale: 1.05, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                src={product.image}
                alt={product.name}
                loading="eager"
                decoding="async"
                className="w-full aspect-square object-cover"
              />
            </div>

            <div className="p-6 md:p-10 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={14} className="text-primary" />
                  <span className="text-xs font-heading font-bold uppercase tracking-[0.15em] text-primary">
                    {product.category}
                  </span>
                </div>

                <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-5 leading-tight">
                  {product.name}
                </h1>

                <div className="w-16 h-1 bg-gradient-fort rounded-full mb-5" />

                <p className="text-muted-foreground leading-relaxed text-base mb-8">
                  {product.description || "Produto de alta qualidade selecionado especialmente para o seu negocio."}
                </p>

                <ProductPrice product={product} size="lg" showLabel />

                {canAddToCart && (
                  <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
                    <span className="mb-3 block text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground">
                      Quantidade
                    </span>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="inline-flex w-full items-center justify-between rounded-full border border-border bg-background sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                          className="flex h-11 w-12 items-center justify-center rounded-l-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="min-w-12 text-center font-heading text-base font-bold text-foreground">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity((current) => current + 1)}
                          className="flex h-11 w-12 items-center justify-center rounded-r-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => addProduct(product, quantity)}
                        className="inline-flex w-full flex-1 items-center justify-center gap-2 rounded-full bg-gradient-fort px-6 py-3 font-heading font-bold text-primary-foreground shadow-card transition-opacity hover:opacity-90"
                      >
                        <ShoppingCart size={18} />
                        Adicionar ao carrinho
                      </button>
                    </div>
                  </div>
                )}

                {whatsappHref && !product.is_unavailable && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("button_click", { button: "whatsapp_product", product_name: product.name })}
                    className="mt-3 inline-flex w-full sm:w-auto items-center justify-center gap-3 px-6 py-3 rounded-full font-heading font-bold text-white shadow-card hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "#25D366" }}
                  >
                    Pedir pelo WhatsApp
                  </a>
                )}

                {product.is_unavailable && (
                  <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 rounded-full font-heading font-bold text-destructive bg-destructive/10 border border-destructive/30">
                    Produto indisponivel no momento
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {related.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <h2 className="font-heading font-bold text-2xl text-foreground mb-6">
              Produtos semelhantes
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((item, index) => (
                <ProductCard product={item} compact index={index} key={item.id} />
              ))}
            </div>
          </motion.section>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-10"
        >
          <Link
            to="/#produtos"
            className="inline-flex items-center gap-2 bg-gradient-fort text-primary-foreground font-heading font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity shadow-card"
          >
            <ArrowLeft size={16} />
            Ver todos os produtos
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
