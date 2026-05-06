import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Product } from "@/store/siteStore";
import { CartContext, type CartItem } from "@/context/cartState";
import { formatCurrency } from "@/lib/formatCurrency";

const CART_STORAGE_KEY = "fort-alimentos-cart";

const getProductPrice = (product: Product) => {
  if (product.is_promotion && product.promo_price != null) return product.promo_price;
  return product.price ?? 0;
};

const readStoredCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === "string" && Number.isFinite(item.quantity));
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(readStoredCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addProduct = useCallback((product: Product, quantity = 1) => {
    const safeQuantity = Math.max(1, Math.floor(quantity));
    const price = getProductPrice(product);

    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + safeQuantity, price } : item,
        );
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          image: product.image,
          category: product.category,
          price,
          quantity: safeQuantity,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.id !== productId));
  }, []);

  const increaseQuantity = useCallback((productId: string) => {
    setItems((current) =>
      current.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item)),
    );
  }, []);

  const decreaseQuantity = useCallback((productId: string) => {
    setItems((current) =>
      current
        .map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const checkoutMessage = useMemo(() => {
    const lines = items.map((item) => {
      const suffix = item.quantity > 1 ? " cada" : "";
      return `${item.quantity}x ${item.name} — ${formatCurrency(item.price)}${suffix}`;
    });

    return [
      "Olá! Gostaria de fazer um pedido:",
      "",
      ...lines,
      "",
      `Total: ${formatCurrency(total)}`,
      "",
      "Aguardo o atendimento.",
    ].join("\n");
  }, [items, total]);

  const value = useMemo(
    () => ({
      items,
      isOpen,
      addProduct,
      removeProduct,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      openCart,
      closeCart,
      total,
      itemCount,
      checkoutMessage,
    }),
    [
      addProduct,
      checkoutMessage,
      clearCart,
      closeCart,
      decreaseQuantity,
      increaseQuantity,
      isOpen,
      itemCount,
      items,
      openCart,
      removeProduct,
      total,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
