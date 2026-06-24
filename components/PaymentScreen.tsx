"use client";

import { useEffect, useState } from "react";

const PAYMENT_WINDOW_SECONDS = 10 * 60;

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
  onClose,
}: {
  orderId: string;
  qrCode: string;
  qrCodeBase64: string;
  total: number;
  onClose: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(PAYMENT_WINDOW_SECONDS);
  const [status, setStatus] = useState<"PENDING" | "PAID" | "DELIVERED">("PENDING");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const countdown = setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  useEffect(() => {
    if (status === "PAID") return;

    const poll = setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) return;
        const data = await response.json();
        if (data.status === "PAID" || data.status === "DELIVERED") {
          setStatus(data.status);
        }
      } catch {
        // tenta novamente no próximo ciclo
      }
    }, 4000);

    return () => clearInterval(poll);
  }, [orderId, status]);

  async function copyCode() {
    await navigator.clipboard.writeText(qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (status === "PAID" || status === "DELIVERED") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-card p-6 text-center text-foreground shadow-2xl">
          <div className="text-5xl">✅</div>
          <h2 className="mt-3 text-xl font-bold">Pagamento confirmado!</h2>
          <p className="mt-2 text-sm text-muted">
            Seu pedido foi pago e já está sendo preparado. Em breve chega até você.
          </p>
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-lg bg-accent py-3 font-semibold text-white hover:bg-accent-dark"
          >
            Fechar
          </button>
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
              {copied ? "Código copiado!" : "Copiar código Pix"}
            </button>
          </>
        )}

        <button onClick={onClose} className="mt-3 w-full py-2 text-sm text-muted hover:text-foreground">
          Cancelar
        </button>
      </div>
    </div>
  );
}
