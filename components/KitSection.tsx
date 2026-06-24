"use client";

import { useEffect, useState } from "react";
import type { Kit, CartItem } from "@/lib/types";

function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function KitSection({ onAddKit }: { onAddKit: (items: CartItem[]) => void }) {
  const [kits, setKits] = useState<Kit[]>([]);
  const [added, setAdded] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/kits")
      .then((r) => r.json())
      .then(setKits)
      .catch(() => {});
  }, []);

  if (kits.length === 0) return null;

  function handleAdd(kit: Kit) {
    onAddKit(
      kit.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }))
    );
    setAdded(kit.id);
    setTimeout(() => setAdded(null), 2000);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-4 md:px-8">
      <h3 className="font-display text-xl font-black uppercase italic tracking-tight text-slate-800 underline decoration-orange-400 underline-offset-4">
        Kits para a Ocasião
      </h3>
      <p className="mt-1 text-xs text-slate-400">Tudo de uma vez, sem esquecer nada.</p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kits.map((kit) => (
          <div
            key={kit.id}
            className="flex flex-col justify-between rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"
          >
            <div>
              <div className="text-4xl">{kit.emoji}</div>
              <h4 className="mt-2 font-bold text-slate-800">{kit.name}</h4>
              {kit.description && <p className="mt-1 text-xs text-slate-400">{kit.description}</p>}
              <ul className="mt-2 space-y-0.5">
                {kit.items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-1 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{item.quantity}×</span>
                    <span className="truncate">{item.name.split("—")[0].trim()}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-base font-black text-orange-600">{formatPrice(kit.total)}</span>
              <button
                onClick={() => handleAdd(kit)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                  added === kit.id
                    ? "bg-green-500 text-white"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                {added === kit.id ? "✓ Adicionado!" : "+ Adicionar kit"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
