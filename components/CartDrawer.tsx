"use client";

import { useState } from "react";
import type { CartItem } from "@/lib/types";
import { getDeliveryFee } from "@/lib/delivery";
import { useStoreOpen } from "@/components/StoreStatusProvider";

function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type CheckoutResult = {
  orderId: string;
  total: number;
  qrCode: string;
  qrCodeBase64: string;
};

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

  const storeOpen = useStoreOpen();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = getDeliveryFee(neighborhood);
  const total = subtotal + (items.length > 0 ? deliveryFee : 0);

  async function handleCepBlur() {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setCepLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
        signal: controller.signal,
      });
      const data = await response.json();
      if (!data.erro) {
        setStreet(data.logradouro || "");
        setNeighborhood(data.bairro || "");
      }
    } catch {
      // CEP inválido, timeout ou serviço indisponível: usuário preenche manualmente
    } finally {
      clearTimeout(timeout);
      setCepLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (items.length === 0 || submitting) return;
    setError("");
    setSubmitting(true);

    const address = `${street}, ${number}${complement ? ` - ${complement}` : ""} - ${neighborhood}`;

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          cep,
          neighborhood,
          address,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Não foi possível gerar o pagamento.");
      }

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

            <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Taxa de entrega</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
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
                onChange={(event) => setCustomerName(event.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-base md:text-sm text-foreground placeholder:text-muted"
              />
              <input
                required
                placeholder="WhatsApp (com DDD)"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-base md:text-sm text-foreground placeholder:text-muted"
              />
              <div className="flex gap-2">
                <input
                  required
                  placeholder="CEP"
                  value={cep}
                  onChange={(event) => setCep(event.target.value)}
                  onBlur={handleCepBlur}
                  className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-base md:text-sm text-foreground placeholder:text-muted"
                />
                {cepLoading && <span className="self-center text-xs text-muted">buscando...</span>}
              </div>
              <input
                required
                placeholder="Rua"
                value={street}
                onChange={(event) => setStreet(event.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-base md:text-sm text-foreground placeholder:text-muted"
              />
              <div className="flex gap-2">
                <input
                  required
                  placeholder="Número"
                  value={number}
                  onChange={(event) => setNumber(event.target.value)}
                  className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-base md:text-sm text-foreground placeholder:text-muted"
                />
                <input
                  required
                  placeholder="Bairro"
                  value={neighborhood}
                  onChange={(event) => setNeighborhood(event.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-base md:text-sm text-foreground placeholder:text-muted"
                />
              </div>
              <input
                placeholder="Complemento (opcional)"
                value={complement}
                onChange={(event) => setComplement(event.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-base md:text-sm text-foreground placeholder:text-muted"
              />

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
                {submitting ? "Gerando Pix..." : "Confirmar e Pagar com Pix"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
