import { createContext } from "react";
import type { Product } from "@/store/siteStore";

export interface CartItem {
  id: string;
  name: string;
  image: string;
  category: string;
  price: number;
  quantity: number;
}

export interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  addProduct: (product: Product, quantity?: number) => void;
  removeProduct: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  total: number;
  itemCount: number;
  checkoutMessage: string;
}

export const CartContext = createContext<CartContextValue | null>(null);
