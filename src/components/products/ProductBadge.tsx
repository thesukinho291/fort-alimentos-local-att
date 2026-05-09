import { Badge } from "@/components/ui/badge";
import type { Product } from "@/store/siteStore";

interface ProductBadgeProps {
  product: Product;
  compact?: boolean;
}

const ProductBadge = ({ product, compact = false }: ProductBadgeProps) => {
  const sizeClass = compact ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1";

  if (product.is_unavailable) {
    return (
      <Badge className={`bg-destructive text-destructive-foreground font-heading font-bold shadow-card border-0 ${sizeClass}`}>
        Indisponível
      </Badge>
    );
  }

  if (product.is_new_release) {
    return (
      <Badge className={`bg-green-600 hover:bg-green-600 text-white font-heading font-bold shadow-card border-0 ${sizeClass}`}>
        Lançamento
      </Badge>
    );
  }

  if (product.is_promotion) {
    return (
      <Badge className={`bg-gradient-yellow text-accent-foreground font-heading font-bold shadow-card border-0 ${sizeClass}`}>
        Promoção
      </Badge>
    );
  }

  return null;
};

export default ProductBadge;
