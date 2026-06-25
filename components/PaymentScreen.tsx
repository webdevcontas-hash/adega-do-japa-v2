"use client";

import { useEffect, useState } from "react";
import type { DeliveryStatus } from "@/lib/types";
import type { PaymentMethod } from "@/lib/useCart";

const PAYMENT_WINDOW_SECONDS = 10 * 60;

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type OrderStatus = "PENDING" | "PAID" | "DELIVERED";

const DELIVERY_STEPS: { key: DeliveryStatus; label: string; emoji: string }[] = [
  { key: "WAITING", label: "Pedido recebido", emoji: "📋" },
  { key: "PREPARING", label: "Preparando", emoji: "🔧" },
  { key: "OUT_FOR_DELIVERY", label: "Saiu para entrega", emoji: "🛵" },
  { key: "DELIVERED", label: "Entregue!", emoji: "✅" },
];

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function PaymentScreen({
  orderId,
  qrCode,
  qrCodeBase64,
  total,
  paymentMethod = "pix",
  changeFor,
  onClose,
}: {
  orderId: string;
  qrCode?: string;
  qrCodeBase64?: string;
  total: number;
  paymentMethod?: PaymentMethod;
  changeFor?: number;
  onClose: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(PAYMENT_WINDOW_SECONDS);
  const [status, setStatus] = useState<OrderStatus>("PENDING");
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>("WAITING");
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  useEffect(() => {
    const countdown = setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  useEffect(() => {
    if (status === "PAID" && deliveryStatus === "DELIVERED") return;

    async function tick() {
      if (document.hidden) return;
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) return;
        const data = await response.json();
        if (data.status === "PAID" || data.status === "DELIVERED") {
          setStatus(data.status);
        }
        if (data.deliveryStatus) {
          setDeliveryStatus(data.deliveryStatus as DeliveryStatus);
        }
      } catch {
        // tenta no próximo ciclo
      }
    }

    const poll = setInterval(tick, 4000);
    const onVisible = () => { if (!document.hidden) tick(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [orderId, status, deliveryStatus]);

  async function copyCode() {
    setCopyFailed(false);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(qrCode ?? "");
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = qrCode ?? "";
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const ok = document.execCommand("copy");
        textarea.remove();
        if (!ok) throw new Error("execCommand falhou");
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyFailed(true);
    }
  }

  const currentStepIndex = DELIVERY_STEPS.findIndex((step) => step.key === deliveryStatus);

  // Pagamento na entrega: pedido já confirmado, sem QR Code. Mostra recibo + rastreamento.
  if (paymentMethod !== "pix") {
    const isDelivered = deliveryStatus === "DELIVERED";
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-card p-6 text-foreground shadow-2xl">
          <div className="text-center">
            <div className="text-5xl">{isDelivered ? "✅" : "🎉"}</div>
            <h2 className="mt-3 text-xl font-bold">Pedido confirmado!</h2>
            <p className="mt-2 text-sm font-semibold text-accent-dark">
              {paymentMethod === "cash" ? "💵 Pague em dinheiro na entrega" : "💳 Pague no cartão na entrega"}
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">{formatBRL(total)}</p>
            {paymentMethod === "cash" && changeFor && changeFor > total && (
              <p className="mt-1 text-xs text-muted">
                Troco para {formatBRL(changeFor)} (levaremos {formatBRL(changeFor - total)})
              </p>
            )}
          </div>

          <div className="mt-6 space-y-3">
            {DELIVERY_STEPS.map((step, index) => {
              const isDone = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg transition-all ${
                      isDone ? "bg-accent text-white shadow-md" : "bg-slate-100 text-slate-400"
                    } ${isCurrent ? "ring-2 ring-accent ring-offset-2" : ""}`}
                  >
                    {step.emoji}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${isDone ? "text-foreground" : "text-muted"}`}>{step.label}</p>
                    {isCurrent && !isDelivered && <p className="text-xs text-accent-dark">Em andamento...</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {isDelivered ? (
            <button onClick={onClose} className="mt-6 w-full rounded-lg bg-accent py-3 font-semibold text-white hover:bg-accent-dark">
              Fechar
            </button>
          ) : (
            <>
              <p className="mt-5 text-center text-xs text-muted">
                Esta tela atualiza automaticamente. Pode minimizar o app. 😊
              </p>
              <button onClick={onClose} className="mt-3 w-full py-2 text-sm text-muted hover:text-foreground">
                Fechar
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (status === "PAID" || status === "DELIVERED") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-card p-6 text-foreground shadow-2xl">
          <div className="text-center">
            <div className="text-5xl">✅</div>
            <h2 className="mt-3 text-xl font-bold">Pagamento confirmado!</h2>
            <p className="mt-2 text-sm text-muted">Acompanhe o seu pedido em tempo real abaixo.</p>
          </div>

          {/* Rastreamento de entrega */}
          <div className="mt-6 space-y-3">
            {DELIVERY_STEPS.map((step, index) => {
              const isDone = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg transition-all ${
                      isDone
                        ? "bg-accent text-white shadow-md"
                        : "bg-slate-100 text-slate-400"
                    } ${isCurrent ? "ring-2 ring-accent ring-offset-2" : ""}`}
                  >
                    {step.emoji}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${isDone ? "text-foreground" : "text-muted"}`}>
                      {step.label}
                    </p>
                    {isCurrent && deliveryStatus !== "DELIVERED" && (
                      <p className="text-xs text-accent-dark">Em andamento...</p>
                    )}
                  </div>
                  {isDone && index < currentStepIndex && (
                    <span className="text-xs font-bold text-green-600">✓</span>
                  )}
                </div>
              );
            })}
          </div>

          {deliveryStatus === "DELIVERED" ? (
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-lg bg-accent py-3 font-semibold text-white hover:bg-accent-dark"
            >
              Fechar
            </button>
          ) : (
            <p className="mt-5 text-center text-xs text-muted">
              Esta tela atualiza automaticamente. Pode minimizar o app. 😊
            </p>
          )}
        </div>
      </div>
    );
  }

  const expired = secondsLeft === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 text-center text-foreground shadow-2xl">
        <h2 className="text-lg font-bold">Pague com Pix para confirmar</h2>
        <p className="mt-1 text-2xl font-bold text-accent-dark">
          {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>

        {expired ? (
          <p className="mt-4 text-sm text-red-600">
            O tempo para pagamento expirou. Volte ao carrinho e finalize o pedido novamente.
          </p>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${qrCodeBase64}`}
              alt="QR Code Pix"
              className="mx-auto mt-4 h-56 w-56 rounded-lg border border-border bg-white p-2"
            />
            <p className="mt-3 text-sm text-muted">Expira em {formatTime(secondsLeft)}</p>

            <button
              onClick={copyCode}
              className="mt-4 w-full truncate rounded-lg border border-border px-3 py-3 text-xs text-foreground hover:bg-accent-light"
              title={qrCode}
            >
              {copied ? "Código copiado! ✅" : "Copiar código Pix"}
            </button>

            {copyFailed && (
              <div className="mt-3 text-left">
                <p className="text-xs text-muted">
                  Não foi possível copiar automaticamente. Selecione e copie o código abaixo:
                </p>
                <textarea
                  readOnly
                  value={qrCode ?? ""}
                  onFocus={(e) => e.currentTarget.select()}
                  className="mt-1 h-20 w-full resize-none rounded-lg border border-border bg-background p-2 text-[11px] text-foreground"
                />
              </div>
            )}
          </>
        )}

        <button onClick={onClose} className="mt-3 w-full py-2 text-sm text-muted hover:text-foreground">
          Cancelar
        </button>
      </div>
    </div>
  );
}
