"use client";

import { useEffect, useState } from "react";

type StoreStatus = { open: boolean; openingHour: number; closingHour: number };

export function useStoreStatus() {
  const [status, setStatus] = useState<StoreStatus>({ open: true, openingHour: 18, closingHour: 3 });

  useEffect(() => {
    async function check() {
      try {
        const response = await fetch("/api/store-status");
        if (response.ok) {
          setStatus(await response.json());
        }
      } catch {
        // mantém o último status conhecido em caso de falha de rede
      }
    }
    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, []);

  return status;
}

export function useStoreOpen() {
  return useStoreStatus().open;
}

export default function BusinessHoursNotice() {
  const { open, openingHour, closingHour } = useStoreStatus();

  if (open) return null;

  return (
    <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm font-medium text-red-700">
      Estamos fechados agora. Atendemos das {openingHour}h às {closingHour}h. Você pode navegar, mas o pedido só
      pode ser finalizado dentro do horário de funcionamento.
    </div>
  );
}
