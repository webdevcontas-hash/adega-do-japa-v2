"use client";

import { useState } from "react";
import type { ProductModel } from "@/app/generated/prisma/models";

function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProductDetail({
  product,
  onAdd,
  onClose,
}: {
  product: ProductModel;
  onAdd: (product: ProductModel, quantity: number) => void;
  onClose: () => void;
}) {
  const [quantity, setQuantity] = useState(1);

  function handleAdd() {
    onAdd(product, quantity);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background text-foreground">
      <div className="relative flex aspect-[4/3] w-full items-center justify-center bg-accent-light text-7xl">
        🍾
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-base text-foreground shadow-md transition hover:bg-white/90"
        >
          ✕
        </button>
      </div>

      <div className="px-4 pt-4 pb-28">
        <span className="inline-block rounded-full border border-accent px-3 py-1 text-xs font-semibold text-accent-dark">
          {product.category}
        </span>

        <h1 className="mt-3 text-xl font-bold text-foreground">{product.name}</h1>

        {product.description && (
          <p className="mt-2 text-sm leading-relaxed text-muted">{product.description}</p>
        )}

        <p className="mt-3 text-2xl font-bold text-accent-dark">{formatPrice(product.price)}</p>
      </div>

      <div className="fixed inset-x-0 bottom-0 flex items-center gap-3 border-t border-border bg-card p-4">
        <div className="flex items-center gap-3 rounded-full bg-accent-light px-3 py-2">
          <button
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            aria-label="Diminuir quantidade"
            className="flex h-7 w-7 items-center justify-center rounded-full text-accent-dark hover:bg-white"
          >
            −
          </button>
          <span className="w-5 text-center text-sm font-semibold text-foreground">{quantity}</span>
          <button
            onClick={() => setQuantity((value) => value + 1)}
            aria-label="Aumentar quantidade"
            className="flex h-7 w-7 items-center justify-center rounded-full text-accent-dark hover:bg-white"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAdd}
          className="flex-1 rounded-full bg-accent py-3 text-sm font-semibold text-white transition hover:bg-accent-dark"
        >
          Adicionar — {formatPrice(product.price * quantity)}
        </button>
      </div>
    </div>
  );
}
