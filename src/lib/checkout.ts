import type { CartItem } from "@/context/cartState";
import { formatCurrency } from "@/lib/formatCurrency";

export type PaymentMethod = "Dinheiro" | "PIX" | "Cartão Débito" | "Cartão Crédito";

export interface CheckoutData {
  customerName: string;
  cnpj: string;
  paymentMethod: PaymentMethod;
  cashChangeFor?: number | null;
  notes?: string;
}

export const paymentMethods: PaymentMethod[] = ["Dinheiro", "PIX", "Cartão Débito", "Cartão Crédito"];

export function buildOrderMessage(items: CartItem[], total: number, data: CheckoutData) {
  const productLines = items.map((item) => {
    const subtotal = item.price * item.quantity;
    return `* ${item.name} x${item.quantity} - ${formatCurrency(subtotal)}`;
  });

  const changeLine =
    data.paymentMethod === "Dinheiro" && data.cashChangeFor
      ? [`Troco para: ${formatCurrency(data.cashChangeFor)}`]
      : [];

  return [
    `Pedido realizado por ${data.customerName.trim()}`,
    `CNPJ: ${data.cnpj.trim()}`,
    "",
    "Itens:",
    ...productLines,
    "",
    `Forma de pagamento: ${data.paymentMethod}`,
    ...changeLine,
    "",
    `Total: ${formatCurrency(total)}`,
    "",
    "Observações:",
    data.notes?.trim() || "Sem observações.",
  ].join("\n");
}
