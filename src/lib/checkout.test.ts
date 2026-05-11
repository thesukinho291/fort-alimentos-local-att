import { describe, expect, it } from "vitest";
import type { CartItem } from "@/context/cartState";
import { buildOrderMessage } from "@/lib/checkout";

const normalizeSpaces = (value: string) => value.replace(/\u00a0/g, " ");

const items: CartItem[] = [
  {
    id: "1",
    name: "Arroz",
    image: "",
    category: "Mercearia",
    price: 41,
    quantity: 2,
  },
  {
    id: "2",
    name: "Feijão",
    image: "",
    category: "Mercearia",
    price: 47.6,
    quantity: 5,
  },
];

describe("buildOrderMessage", () => {
  it("includes customer, CNPJ, products, payment, total and notes", () => {
    const message = buildOrderMessage(items, 320, {
      customerName: "Mercado União",
      cnpj: "12.345.678/0001-99",
      paymentMethod: "PIX",
      notes: "Entregar no estoque lateral",
    });

    const normalized = normalizeSpaces(message);

    expect(normalized).toContain("Pedido realizado por Mercado União");
    expect(normalized).toContain("CNPJ: 12.345.678/0001-99");
    expect(normalized).toContain("* Arroz x2 - R$ 82,00");
    expect(normalized).toContain("* Feijão x5 - R$ 238,00");
    expect(normalized).toContain("Forma de pagamento: PIX");
    expect(normalized).toContain("Total: R$ 320,00");
    expect(normalized).toContain("Entregar no estoque lateral");
  });

  it("includes cash change only for cash payments", () => {
    const message = buildOrderMessage(items.slice(0, 1), 82, {
      customerName: "Mercado União",
      cnpj: "12.345.678/0001-99",
      paymentMethod: "Dinheiro",
      cashChangeFor: 100,
    });

    const normalized = normalizeSpaces(message);

    expect(normalized).toContain("Forma de pagamento: Dinheiro");
    expect(normalized).toContain("Troco para: R$ 100,00");
  });
});
