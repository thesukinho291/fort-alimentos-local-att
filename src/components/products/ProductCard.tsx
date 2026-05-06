import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Product } from "@/store/siteStore";
import ProductBadge from "@/components/products/ProductBadge";
import ProductPrice from "@/components/products/ProductPrice";

interface ProductCardProps {
  product: Product;
  index?: number;
  compact?: boolean;
}

const ProductCard = ({ product, index = 0, compact = false }: ProductCardProps) => {
  const disabled = product.is_unavailable;
  const card = (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.2) }}
      className={`bg-card rounded-xl overflow-hidden shadow-card transition-all group relative h-full ${
        disabled ? "opacity-70 grayscale cursor-not-allowed" : "hover:shadow-elevated hover:-translate-y-1 cursor-pointer"
      } ${product.is_promotion && !disabled ? "ring-2 ring-secondary" : ""} ${
        product.is_new_release && !disabled ? "ring-2 ring-green-500" : ""
      }`}
    >
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        <ProductBadge product={product} compact={compact} />
      </div>
      <div className={compact ? "aspect-square overflow-hidden" : "aspect-[4/3] overflow-hidden"}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          sizes={compact ? "(max-width: 768px) 50vw, 25vw" : "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"}
          className={`w-full h-full object-cover transition-transform duration-500 ${disabled ? "" : "group-hover:scale-105"}`}
        />
      </div>
      <div className={compact ? "p-3" : "p-5"}>
        <span className="text-xs font-heading font-bold uppercase tracking-wider text-primary">
          {product.category}
        </span>
        <h3 className={`font-heading font-bold text-foreground mt-1 ${compact ? "text-sm line-clamp-2" : "text-lg mb-2"}`}>
          {product.name}
        </h3>
        {!compact && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {product.description}
          </p>
        )}
        <ProductPrice product={product} size={compact ? "sm" : "md"} />
      </div>
    </motion.article>
  );

  if (disabled) return card;

  return (
    <Link to={`/produto/${product.id}`} className="block h-full" aria-label={`Ver produto ${product.name}`}>
      {card}
    </Link>
  );
};

export default ProductCard;
