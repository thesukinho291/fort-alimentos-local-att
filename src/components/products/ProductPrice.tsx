import type { Product } from "@/store/siteStore";

interface ProductPriceProps {
  product: Product;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const ProductPrice = ({ product, size = "md", showLabel = false }: ProductPriceProps) => {
  const hasPrice = product.price != null || product.promo_price != null;
  if (!hasPrice) return null;

  const valueClass = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-4xl",
  }[size];

  return (
    <div className={showLabel ? "bg-muted/50 rounded-xl p-5 border border-border" : "mt-3 flex items-center gap-2"}>
      {showLabel && (
        <span className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
          Preco
        </span>
      )}
      <div className="flex flex-wrap items-baseline gap-2">
        {product.is_promotion && product.price != null && (
          <span className="text-sm text-muted-foreground line-through">
            {currency.format(product.price)}
          </span>
        )}
        {product.promo_price != null && product.is_promotion ? (
          <span className={`${valueClass} font-heading font-bold text-primary`}>
            {currency.format(product.promo_price)}
          </span>
        ) : product.price != null ? (
          <span className={`${valueClass} font-heading font-bold text-foreground`}>
            {currency.format(product.price)}
          </span>
        ) : null}
      </div>
      {showLabel && product.is_promotion && (
        <span className="inline-block mt-2 text-xs font-heading font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
          Oferta por tempo limitado
        </span>
      )}
    </div>
  );
};

export default ProductPrice;
