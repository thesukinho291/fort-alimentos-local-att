import { useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, MessageCircle, ShieldCheck } from "lucide-react";
import type { CartItem } from "@/context/cartState";
import { buildOrderMessage, paymentMethods, type CheckoutData, type PaymentMethod } from "@/lib/checkout";
import { formatCurrency } from "@/lib/formatCurrency";
import { createWhatsAppHref } from "@/lib/whatsapp";

interface CheckoutFormProps {
  items: CartItem[];
  total: number;
  onBack: () => void;
  onOrderSent: () => void;
}

const emptyCheckout: CheckoutData = {
  customerName: "",
  cnpj: "",
  paymentMethod: "PIX",
  cashChangeFor: null,
  notes: "",
};

const parseMoney = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

const CheckoutForm = ({ items, total, onBack, onOrderSent }: CheckoutFormProps) => {
  const [form, setForm] = useState<CheckoutData>(emptyCheckout);
  const [cashChangeInput, setCashChangeInput] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const cashChangeFor = useMemo(() => parseMoney(cashChangeInput), [cashChangeInput]);
  const checkoutData = useMemo(
    () => ({
      ...form,
      cashChangeFor: form.paymentMethod === "Dinheiro" ? cashChangeFor : null,
    }),
    [cashChangeFor, form],
  );

  const validate = () => {
    if (!form.customerName.trim()) return "Informe a empresa ou cliente do pedido.";
    if (!form.cnpj.trim()) return "Informe o CNPJ.";
    if (form.paymentMethod === "Dinheiro" && cashChangeInput.trim()) {
      if (cashChangeFor === null) return "Informe um valor válido para o troco.";
      if (cashChangeFor < total) return "O valor do troco precisa ser maior ou igual ao total.";
    }
    return "";
  };

  const handleReview = () => {
    const message = validate();
    setError(message);
    if (!message) setReviewing(true);
  };

  const handleSendOrder = () => {
    const message = validate();
    if (message) {
      setError(message);
      setReviewing(false);
      return;
    }

    setError("");
    setSubmitting(true);

    window.setTimeout(() => {
      const href = createWhatsAppHref(buildOrderMessage(items, total, checkoutData));
      const popup = window.open(href, "_blank", "noopener,noreferrer");

      setSubmitting(false);
      if (!popup) {
        setError("Não foi possível abrir o WhatsApp. Verifique o bloqueador de pop-ups e tente novamente.");
        return;
      }

      setSent(true);
      window.setTimeout(onOrderSent, 900);
    }, 450);
  };

  const updateField = <K extends keyof CheckoutData>(key: K, value: CheckoutData[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setReviewing(false);
    setError("");
  };

  if (sent) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-700">
          <CheckCircle2 size={30} />
        </div>
        <h3 className="font-heading text-xl font-bold text-foreground">Pedido enviado</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          O WhatsApp foi aberto com o resumo completo do pedido para a Fort Alimentos.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-2 text-sm font-heading font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Voltar ao carrinho
        </button>
        <h3 className="font-heading text-xl font-bold text-foreground">Fechamento do pedido</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Revise os itens, escolha o pagamento na entrega e envie para o WhatsApp oficial.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-4">
          <section className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="font-heading text-sm font-bold text-foreground">Resumo dos produtos</h4>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-heading font-semibold text-muted-foreground">
                {items.length} item{items.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_auto] gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-heading text-sm font-bold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                  </div>
                  <span className="font-heading text-sm font-bold text-foreground">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/40 px-3 py-3">
              <span className="font-heading text-sm font-semibold text-muted-foreground">Total final</span>
              <span className="font-heading text-2xl font-bold text-foreground">{formatCurrency(total)}</span>
            </div>
          </section>

          <section className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
            <h4 className="mb-3 font-heading text-sm font-bold text-foreground">Dados do cliente</h4>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-heading font-semibold text-muted-foreground">Empresa/cliente</span>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(event) => updateField("customerName", event.target.value)}
                  placeholder="Mercado União"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-primary"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-heading font-semibold text-muted-foreground">CNPJ</span>
                <input
                  type="text"
                  value={form.cnpj}
                  onChange={(event) => updateField("cnpj", event.target.value)}
                  placeholder="12.345.678/0001-99"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-primary"
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
            <h4 className="mb-3 font-heading text-sm font-bold text-foreground">Forma de pagamento</h4>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => updateField("paymentMethod", method as PaymentMethod)}
                  className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-heading font-bold transition-all ${
                    form.paymentMethod === method
                      ? "border-primary bg-primary text-primary-foreground shadow-card"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {form.paymentMethod === "Dinheiro" && (
              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-heading font-semibold text-muted-foreground">Troco para quanto?</span>
                <input
                  type="number"
                  min={total}
                  step="0.01"
                  value={cashChangeInput}
                  onChange={(event) => {
                    setCashChangeInput(event.target.value);
                    setReviewing(false);
                    setError("");
                  }}
                  placeholder={formatCurrency(total)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-primary"
                />
              </label>
            )}
          </section>

          <section className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
            <label className="block">
              <span className="mb-1 block text-xs font-heading font-semibold text-muted-foreground">Observações do pedido</span>
              <textarea
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                rows={4}
                placeholder="Ex.: Entregar no estoque lateral"
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-primary"
              />
            </label>
          </section>

          {error && (
            <div className="flex gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 shrink-0" size={16} />
              <span>{error}</span>
            </div>
          )}

          {reviewing && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <ShieldCheck size={18} />
                <h4 className="font-heading text-sm font-bold">Confirme antes de enviar</h4>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Cliente:</strong> {form.customerName}
                </p>
                <p>
                  <strong className="text-foreground">CNPJ:</strong> {form.cnpj}
                </p>
                <p>
                  <strong className="text-foreground">Pagamento:</strong> {form.paymentMethod}
                </p>
                {form.paymentMethod === "Dinheiro" && cashChangeFor && (
                  <p>
                    <strong className="text-foreground">Troco para:</strong> {formatCurrency(cashChangeFor)}
                  </p>
                )}
                <p>
                  <strong className="text-foreground">Total:</strong> {formatCurrency(total)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-card px-5 py-4">
        {!reviewing ? (
          <button
            type="button"
            onClick={handleReview}
            className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-fort px-5 py-3 font-heading text-sm font-bold text-primary-foreground shadow-card transition-opacity hover:opacity-90"
          >
            Revisar pedido
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSendOrder}
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-fort px-5 py-3 font-heading text-sm font-bold text-primary-foreground shadow-card transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? <Loader2 size={17} className="animate-spin" /> : <MessageCircle size={17} />}
            {submitting ? "Enviando..." : "Enviar pedido pelo WhatsApp"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CheckoutForm;
