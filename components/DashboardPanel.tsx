"use client";

import { useEffect, useRef, useState } from "react";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product: { name: string };
};

type Order = {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  total: number;
  status: "PENDING" | "PAID" | "DELIVERED";
  accepted: boolean;
  items: OrderItem[];
};

function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function playBeep(audioContext: AudioContext) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "square";
  oscillator.frequency.value = 880;
  gain.gain.value = 0.15;
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.15);
}

export default function DashboardPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      if (document.hidden) return; // não consulta com a aba em segundo plano
      try {
        const response = await fetch("/api/orders");
        if (response.ok && active) setOrders(await response.json());
      } catch {
        // mantém a lista atual em caso de falha de rede
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 4000);
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const pendingAlarm = orders.some((order) => order.status === "PAID" && !order.accepted);

  useEffect(() => {
    if (pendingAlarm && !alarmIntervalRef.current) {
      audioContextRef.current ??= new AudioContext();
      const ctx = audioContextRef.current;
      playBeep(ctx);
      alarmIntervalRef.current = setInterval(() => playBeep(ctx), 900);
    } else if (!pendingAlarm && alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  }, [pendingAlarm]);

  useEffect(() => {
    return () => {
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    };
  }, []);

  async function acceptOrder(id: string) {
    await fetch(`/api/orders/${id}/accept`, { method: "POST" });
    setOrders((current) => current.map((order) => (order.id === id ? { ...order, accepted: true } : order)));
  }

  return (
    <div className="min-h-screen bg-background p-4 text-foreground">
      <h1 className="text-xl font-extrabold tracking-tight">Painel de Pedidos</h1>

      <ul className="mt-4 flex flex-col gap-3">
        {orders.map((order) => {
          const needsAttention = order.status === "PAID" && !order.accepted;
          return (
            <li
              key={order.id}
              className={`rounded-xl border p-4 shadow-sm ${
                needsAttention ? "animate-pulse border-accent bg-accent-light" : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">#{order.id.slice(-6).toUpperCase()}</span>
                <span className="text-sm text-muted">{order.status}</span>
              </div>
              <p className="mt-1 text-sm text-foreground">
                {order.customerName} — {order.phone}
              </p>
              <p className="text-sm text-muted">{order.address}</p>
              <ul className="mt-2 text-sm text-muted">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}x {item.product.name}
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-bold text-accent-dark">{formatPrice(order.total)}</p>

              {needsAttention && (
                <button
                  onClick={() => acceptOrder(order.id)}
                  className="mt-3 w-full rounded-lg bg-accent py-2 font-semibold text-white transition hover:bg-accent-dark"
                >
                  Aceitar Pedido
                </button>
              )}
            </li>
          );
        })}
        {loading && orders.length === 0 && (
          <>
            <li className="h-24 animate-pulse rounded-xl border border-border bg-card" />
            <li className="h-24 animate-pulse rounded-xl border border-border bg-card" />
          </>
        )}
        {!loading && orders.length === 0 && <p className="text-muted">Nenhum pedido ainda.</p>}
      </ul>
    </div>
  );
}
