"use client";

import { useEffect, useState } from "react";
import type { CartItem } from "@/lib/types";
import type { CheckoutResult, PaymentMethod } from "@/lib/useCart";
import { getDeliveryFee } from "@/lib/delivery";
import { useStoreStatus } from "@/components/StoreStatusProvider";
import { useCustomer } from "@/components/CustomerProvider";

function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; hint: string; icon: string }[] = [
  { id: "pix", label: "Pix", hint: "Pague agora pelo QR Code", icon: "⚡" },
  { id: "card", label: "Cartão na entrega", hint: "Maquininha no recebimento", icon: "💳" },
  { id: "cash", label: "Dinheiro", hint: "Pague em espécie na entrega", icon: "💵" },
];

export default function CartDrawer({
  isOpen,
  items,
  onClose,
  onChangeQuantity,
  onCheckoutSuccess,
}: {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onChangeQuantity: (productId: string, quantity: number) => void;
  onCheckoutSuccess: (result: CheckoutResult) => void;
}) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [complement, setComplement] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Forma de pagamento
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [changeFor, setChangeFor] = useState("");

  // Cupom
  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const { profile, saveProfile, session } = useCustomer();
  const { open: storeOpen, deliveryTime } = useStoreStatus();

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (profile) {
      setCustomerName((value) => value || profile.name || "");
      setPhone((value) => value || profile.phone || "");
      setCep((value) => value || profile.cep || "");
      setStreet((value) => value || profile.street || "");
      setNumber((value) => value || profile.number || "");
      setNeighborhood((value) => value || profile.neighborhood || "");
      setComplement((value) => value || profile.complement || "");
    } else if (session?.name) {
      setCustomerName((value) => value || session.name);
    }
  }, [profile, session]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = getDeliveryFee(neighborhood);
  const total = items.length > 0 ? Math.max(0, subtotal + deliveryFee - couponDiscount) : 0;

  async function handleCepBlur() {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setCepLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, { signal: controller.signal });
      const data = await response.json();
      if (!data.erro) {
        setStreet(data.logradouro || "");
        setNeighborhood(data.bairro || "");
      }
    } catch {
      // CEP inválido ou timeout: usuário preenche manualmente
    } finally {
      clearTimeout(timeout);
      setCepLoading(false);
    }
  }

  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponMessage("");
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, orderTotal: subtotal + deliveryFee }),
      });
      const data = await response.json();
      if (data.valid) {
        setCouponCode(code);
        setCouponDiscount(data.discount);
        setCouponMessage(`✅ ${data.message} (−${formatPrice(data.discount)})`);
      } else {
        setCouponCode("");
        setCouponDiscount(0);
        setCouponMessage(`❌ ${data.message}`);
      }
    } catch {
      setCouponMessage("❌ Erro ao validar cupom.");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setCouponInput("");
    setCouponCode("");
    setCouponDiscount(0);
    setCouponMessage("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (items.length === 0 || submitting) return;
    setError("");
    setSubmitting(true);

    const changeForValue = paymentMethod === "cash" && changeFor.trim() ? Number(changeFor.replace(",", ".")) : undefined;
    if (changeForValue !== undefined && (Number.isNaN(changeForValue) || changeForValue < total)) {
      setError(`O troco deve ser maior ou igual ao total (${formatPrice(total)}).`);
      setSubmitting(false);
      return;
    }

    const address = `${street}, ${number}${complement ? ` - ${complement}` : ""} - ${neighborhood}`;
    saveProfile({ name: customerName, phone, cep, street, number, neighborhood, complement });

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          email: session?.email,
          cep,
          neighborhood,
          address,
          couponCode: couponCode || undefined,
          paymentMethod,
          changeFor: changeForValue,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível gerar o pagamento.");

      onCheckoutSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-40 transition ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-foreground/50 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl transition-transform ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-border" />
        <h2 className="text-lg font-bold text-foreground">Seu carrinho</h2>

        {deliveryTime && (
          <p className="mt-1 text-sm font-medium text-accent-dark">🕐 Tempo estimado: {deliveryTime}</p>
        )}

        {items.length === 0 ? (
          <p className="mt-6 text-center text-muted">Seu carrinho está vazio.</p>
        ) : (
          <>
            <ul className="mt-4 flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onChangeQuantity(item.productId, item.quantity - 1)}
                      className="h-9 w-9 rounded-full bg-accent-light text-accent-dark hover:bg-accent/20 md:h-7 md:w-7"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm text-foreground">{item.quantity}</span>
                    <button
                      onClick={() => onChangeQuantity(item.productId, item.quantity + 1)}
                      className="h-9 w-9 rounded-full bg-accent-light text-accent-dark hover:bg-accent/20 md:h-7 md:w-7"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Cupom de desconto */}
            <div className="mt-4 flex gap-2">
              {couponCode ? (
                <div className="flex flex-1 items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                  <span className="text-sm font-medium text-green-700">{couponCode}</span>
                  <button onClick={removeCoupon} className="text-xs text-red-500 hover:underline">
                    Remover
                  </button>
                </div>
              ) : (
                <>
                  <input
                    placeholder="Cupom de desconto"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-base uppercase placeholder:normal-case placeholder:text-muted md:text-sm"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="rounded-lg border border-accent px-3 py-2 text-sm font-semibold text-accent-dark transition hover:bg-accent-light disabled:opacity-50"
                  >
                    {couponLoading ? "…" : "Aplicar"}
                  </button>
                </>
              )}
            </div>
            {couponMessage && (
              <p className={`mt-1 text-xs ${couponMessage.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
                {couponMessage}
              </p>
            )}

            <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Taxa de entrega</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto ({couponCode})</span>
                  <span>−{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-foreground">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
              <input
                required
                placeholder="Seu nome"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-base md:text-sm text-foreground placeholder:text-muted"
              />
              <input
                required
                placeholder="WhatsApp (com DDD)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-base md:text-sm text-foreground placeholder:text-muted"
              />
              <div className="flex gap-2">
                <input
                  required
                  placeholder="CEP"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  onBlur={handleCepBlur}
                  className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-base md:text-sm text-foreground placeholder:text-muted"
                />
                {cepLoading && <span className="self-center text-xs text-muted">buscando...</span>}
              </div>
              <input
                required
                placeholder="Rua"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-base md:text-sm text-foreground placeholder:text-muted"
              />
              <div className="flex gap-2">
                <input
                  required
                  placeholder="Número"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-base md:text-sm text-foreground placeholder:text-muted"
                />
                <input
                  required
                  placeholder="Bairro"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-base md:text-sm text-foreground placeholder:text-muted"
                />
              </div>
              <input
                placeholder="Complemento (opcional)"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-base md:text-sm text-foreground placeholder:text-muted"
              />

              {/* Forma de pagamento */}
              <div className="mt-1">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Forma de pagamento</p>
                <div className="flex flex-col gap-2">
                  {PAYMENT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPaymentMethod(option.id)}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
                        paymentMethod === option.id
                          ? "border-accent bg-accent-light"
                          : "border-border bg-background hover:border-accent/50"
                      }`}
                    >
                      <span className="text-xl">{option.icon}</span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold text-foreground">{option.label}</span>
                        <span className="block text-xs text-muted">{option.hint}</span>
                      </span>
                      <span
                        className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                          paymentMethod === option.id ? "border-accent bg-accent" : "border-border"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {paymentMethod === "cash" && (
                  <div className="mt-2">
                    <input
                      inputMode="decimal"
                      placeholder="Precisa de troco? Troco para quanto? (opcional)"
                      value={changeFor}
                      onChange={(e) => setChangeFor(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base md:text-sm text-foreground placeholder:text-muted"
                    />
                  </div>
                )}
              </div>

              {!storeOpen && (
                <p className="text-center text-sm text-red-600">
                  Estamos fora do horário de funcionamento. Volte mais tarde para finalizar o pedido.
                </p>
              )}
              {error && <p className="text-center text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting || !storeOpen}
                className="mt-2 rounded-lg bg-accent py-3 font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? (paymentMethod === "pix" ? "Gerando Pix..." : "Confirmando...")
                  : paymentMethod === "pix"
                  ? "Confirmar e Pagar com Pix"
                  : "Confirmar pedido"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
