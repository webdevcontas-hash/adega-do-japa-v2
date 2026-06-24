"use client";

import { useEffect, useState } from "react";

export type ToastItem = { id: number; message: string };

export default function Toast({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed right-4 top-4 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onRemove }: { toast: ToastItem; onRemove: (id: number) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // mount → slide in
    const show = requestAnimationFrame(() => setVisible(true));
    // slide out antes de remover
    const hide = setTimeout(() => setVisible(false), 2200);
    const remove = setTimeout(() => onRemove(toast.id), 2500);
    return () => {
      cancelAnimationFrame(show);
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, [toast.id, onRemove]);

  return (
    <div
      className={`flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-3 shadow-xl transition-all duration-300 pointer-events-auto ${
        visible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
      }`}
    >
      <span className="text-lg">🛒</span>
      <p className="text-sm font-semibold text-white max-w-[220px] truncate">{toast.message}</p>
    </div>
  );
}
