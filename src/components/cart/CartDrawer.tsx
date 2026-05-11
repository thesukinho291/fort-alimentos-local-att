import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { formatCnpj, normalizePhone } from "@/lib/cnpj";
import { formatCurrency } from "@/lib/formatCurrency";
import CheckoutForm from "@/components/cart/CheckoutForm";

const CartDrawer = () => {
  const {
    items,
    isOpen,
    closeCart,
    removeProduct,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    total,
  } = useCart();
  const { customer, openLogin } = useCustomerAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const hasItems = items.length > 0;
  const checkoutMessage = customer
    ? [
        `Pedido realizado por ${customer.razao_social}`,
        `CNPJ: ${formatCnpj(customer.cnpj)}`,
        "",
        `Vendedor responsavel: ${customer.vendedor_nome}`,
        "",
        "Itens:",
        ...items.map((item) => `- ${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}`),
        "",
        `Total: ${formatCurrency(total)}`,
      ].join("\n")
    : "";
  const sellerPhone = customer ? normalizePhone(customer.vendedor_telefone) : "";

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsCheckingOut(false);
      closeCart();
    }
  };

  const handleOrderSent = () => {
    clearCart();
    setIsCheckingOut(false);
    closeCart();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        {isCheckingOut && hasItems ? (
          <CheckoutForm items={items} total={total} onBack={() => setIsCheckingOut(false)} onOrderSent={handleOrderSent} />
        ) : (
          <>
            <SheetHeader className="border-b border-border px-5 py-5 text-left">
              <SheetTitle className="font-heading text-xl font-bold">Carrinho</SheetTitle>
              <SheetDescription>Revise seu pedido antes de finalizar pelo WhatsApp.</SheetDescription>
            </SheetHeader>

            {!hasItems ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <span className="font-heading text-2xl font-bold text-muted-foreground">0</span>
                </div>
                <p className="font-heading text-lg font-bold text-foreground">Seu carrinho está vazio</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Abra um produto e escolha a quantidade para adicioná-lo ao pedido.
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="rounded-xl border border-border/50 bg-card p-3 shadow-sm">
                        <div className="flex gap-3">
                          <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-heading text-sm font-bold text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} cada</p>
                            <p className="mt-1 text-sm font-heading font-bold text-primary">
                              Subtotal: {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProduct(item.id)}
                            className="h-8 w-8 rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Remover ${item.name}`}
                          >
                            <Trash2 size={16} className="mx-auto" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-border bg-background">
                            <button
                              type="button"
                              onClick={() => decreaseQuantity(item.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-l-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              aria-label={`Diminuir quantidade de ${item.name}`}
                            >
                              <Minus size={15} />
                            </button>
                            <span className="w-10 text-center font-heading text-sm font-bold text-foreground">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => increaseQuantity(item.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-r-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              aria-label={`Aumentar quantidade de ${item.name}`}
                            >
                              <Plus size={15} />
                            </button>
                          </div>
                          <span className="text-xs font-heading font-semibold uppercase tracking-wider text-muted-foreground">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border bg-card px-5 py-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-heading text-sm font-semibold text-muted-foreground">Total</span>
                    <span className="font-heading text-2xl font-bold text-foreground">{formatCurrency(total)}</span>
                  </div>
                  <div className="grid gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCheckingOut(true)}
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-fort px-5 py-3 font-heading text-sm font-bold text-primary-foreground shadow-card transition-opacity hover:opacity-90"
                    >
                      Fechar pedido
                    </button>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 font-heading text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      Limpar carrinho
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
