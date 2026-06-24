"use client";

import { useEffect, useState } from "react";
import { LogOut, RotateCcw, User, Trash2 } from "lucide-react";
import type { CartItem } from "@/lib/types";
import { useCustomer } from "@/components/CustomerProvider";

type MyOrder = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: {
    quantity: number;
    product: { id: string; name: string; price: number; isAvailable: boolean };
  }[];
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pago",
  DELIVERED: "Entregue",
};

function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AccountDrawer({
  isOpen,
  onClose,
  onReorder,
}: {
  isOpen: boolean;
  onClose: () => void;
  onReorder: (items: CartItem[]) => void;
}) {
  const { profile, clearProfile, session, googleEnabled, logout } = useCustomer();
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Carrega "meus pedidos" ao abrir o painel (todo setState ocorre dentro do callback assíncrono).
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    (async () => {
      if (!session && !profile?.phone) {
        if (active) {
          setOrders([]);
          setLoadingOrders(false);
        }
        return;
      }
      if (active) setLoadingOrders(true);
      try {
        const query = profile?.phone ? `?phone=${encodeURIComponent(profile.phone)}` : "";
        const res = await fetch(`/api/my-orders${query}`);
        if (res.ok && active) {
          const data = await res.json();
          setOrders(data.orders ?? []);
        }
      } catch {
        // mantém a lista atual em caso de falha de rede
      } finally {
        if (active) setLoadingOrders(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isOpen, session, profile?.phone]);

  function handleReorder(order: MyOrder) {
    const items: CartItem[] = order.items
      .filter((item) => item.product.isAvailable)
      .map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      }));
    if (items.length === 0) return;
    onReorder(items);
    onClose();
  }

  const displayName = session?.name ?? profile?.name;

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
        className={`absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl transition-transform sm:inset-y-0 sm:left-auto sm:right-0 sm:max-w-sm sm:rounded-l-2xl sm:rounded-tr-none ${
          isOpen ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"
        }`}
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-border sm:hidden" />

        <div className="flex items-center gap-3">
          {session?.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.picture} alt="" className="h-12 w-12 rounded-full" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <User className="h-6 w-6" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-black text-slate-800">
              {displayName ? `Olá, ${displayName.split(" ")[0]}!` : "Minha conta"}
            </p>
            <p className="truncate text-xs text-slate-400">
              {session?.email ?? profile?.phone ?? "Entre para pedir mais rápido"}
            </p>
          </div>
        </div>

        {/* Login com Google */}
        {!session && googleEnabled && (
          <a
            href="/api/auth/google"
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <GoogleIcon />
            Continuar com Google
          </a>
        )}

        {session && (
          <button
            onClick={logout}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" /> Sair do Google
          </button>
        )}

        {/* Dados salvos no dispositivo */}
        {profile && (
          <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50/60 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-orange-600">Dados deste aparelho</p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {profile.name} · {profile.phone}
            </p>
            {profile.street && (
              <p className="text-xs text-slate-500">
                {profile.street}
                {profile.number ? `, ${profile.number}` : ""}
                {profile.neighborhood ? ` - ${profile.neighborhood}` : ""}
              </p>
            )}
            <button
              onClick={clearProfile}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" /> Limpar dados deste aparelho
            </button>
          </div>
        )}

        {/* Meus pedidos */}
        <div className="mt-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Meus pedidos</h3>

          {loadingOrders && orders.length === 0 && (
            <div className="mt-3 space-y-2">
              <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
            </div>
          )}

          {!loadingOrders && orders.length === 0 && (
            <p className="mt-3 text-sm text-slate-400">
              {session || profile?.phone
                ? "Você ainda não tem pedidos por aqui."
                : "Faça seu primeiro pedido para ele aparecer aqui."}
            </p>
          )}

          <ul className="mt-3 flex flex-col gap-3">
            {orders.map((order) => (
              <li key={order.id} className="rounded-xl border border-border bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    #{order.id.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {order.items.map((item) => `${item.quantity}x ${item.product.name}`).join(", ")}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-400">
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                    <span className="text-sm font-black text-accent-dark">{formatPrice(order.total)}</span>
                  </div>
                  <button
                    onClick={() => handleReorder(order)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-2 text-xs font-extrabold text-white transition hover:bg-accent-dark active:scale-95"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Pedir novamente
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <button onClick={onClose} className="mt-6 w-full py-2 text-sm text-muted hover:text-foreground">
          Fechar
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
