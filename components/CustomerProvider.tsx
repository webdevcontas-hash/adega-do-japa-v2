"use client";

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from "react";
import type { CustomerProfile, CustomerSessionUser } from "@/lib/types";

const STORAGE_KEY = "adega_customer_profile";

/* ---------------------------------------------------------------------------
   Store externo do perfil (localStorage), lido via useSyncExternalStore.
   Evita setState dentro de efeito e é seguro no SSR (snapshot do servidor = null).
--------------------------------------------------------------------------- */
let cachedProfile: CustomerProfile | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function readFromStorage(): CustomerProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CustomerProfile) : null;
  } catch {
    return null;
  }
}

function getProfileSnapshot(): CustomerProfile | null {
  if (!hydrated) {
    cachedProfile = readFromStorage();
    hydrated = true;
  }
  return cachedProfile; // referência estável entre chamadas (exigência do hook)
}

function getServerProfileSnapshot(): CustomerProfile | null {
  return null;
}

function subscribeProfile(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function writeProfile(next: CustomerProfile | null) {
  cachedProfile = next;
  hydrated = true;
  try {
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // armazenamento indisponível (modo privado): mantém só em memória
  }
  listeners.forEach((listener) => listener());
}

type CustomerContextValue = {
  profile: CustomerProfile | null;
  saveProfile: (profile: CustomerProfile) => void;
  clearProfile: () => void;
  session: CustomerSessionUser | null;
  googleEnabled: boolean;
  logout: () => Promise<void>;
  loading: boolean;
};

const CustomerContext = createContext<CustomerContextValue>({
  profile: null,
  saveProfile: () => {},
  clearProfile: () => {},
  session: null,
  googleEnabled: false,
  logout: async () => {},
  loading: true,
});

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const profile = useSyncExternalStore(subscribeProfile, getProfileSnapshot, getServerProfileSnapshot);

  const [session, setSession] = useState<CustomerSessionUser | null>(null);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Busca a sessão do servidor (login com Google) — setState ocorre só no callback assíncrono.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok && active) {
          const data = await res.json();
          setGoogleEnabled(!!data.googleEnabled);
          setSession(data.user ?? null);
        }
      } catch {
        // sem sessão / falha de rede: segue só com a conta leve
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const saveProfile = useCallback((next: CustomerProfile) => writeProfile(next), []);
  const clearProfile = useCallback(() => writeProfile(null), []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* noop */
    }
    setSession(null);
  }, []);

  return (
    <CustomerContext.Provider
      value={{ profile, saveProfile, clearProfile, session, googleEnabled, logout, loading }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer(): CustomerContextValue {
  return useContext(CustomerContext);
}
