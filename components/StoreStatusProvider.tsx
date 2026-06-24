"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type StoreStatus = { open: boolean; openingHour: number; closingHour: number };

const DEFAULT_STATUS: StoreStatus = { open: true, openingHour: 18, closingHour: 3 };

const StoreStatusContext = createContext<StoreStatus>(DEFAULT_STATUS);

/**
 * Fonte única de status da loja. Um único fetch + intervalo para toda a árvore,
 * evitando que cada componente (header, aviso, carrinho) crie seu próprio poller
 * para /api/store-status — economia de rede/bateria no mobile.
 */
export function StoreStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<StoreStatus>(DEFAULT_STATUS);

  useEffect(() => {
    let active = true;

    async function check() {
      if (document.hidden) return; // não consulta com a aba em segundo plano
      try {
        const response = await fetch("/api/store-status");
        if (response.ok && active) setStatus(await response.json());
      } catch {
        // mantém o último status conhecido em caso de falha de rede
      }
    }

    check();
    const interval = setInterval(check, 60_000);
    const onVisible = () => {
      if (!document.hidden) check();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return <StoreStatusContext.Provider value={status}>{children}</StoreStatusContext.Provider>;
}

export function useStoreStatus(): StoreStatus {
  return useContext(StoreStatusContext);
}

export function useStoreOpen(): boolean {
  return useStoreStatus().open;
}
