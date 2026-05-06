import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";

const CartButton = ({ className = "" }: { className?: string }) => {
  const { itemCount, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted ${className}`}
      aria-label={`Abrir carrinho com ${itemCount} item${itemCount === 1 ? "" : "s"}`}
    >
      <ShoppingCart size={21} />
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-heading font-bold text-primary-foreground shadow-card">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
};

export default CartButton;
