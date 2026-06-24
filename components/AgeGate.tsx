"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "adega_do_japa_age_confirmed";
const EVENT_NAME = "age-gate-change";

function subscribe(callback: () => void) {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

function isConfirmed() {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function getServerSnapshot() {
  // No SSR assumimos NÃO confirmado: o portão 18+ é renderizado já no HTML inicial,
  // evitando o flash da loja de bebidas antes da verificação de idade.
  return false;
}

export default function AgeGate() {
  const confirmed = useSyncExternalStore(subscribe, isConfirmed, getServerSnapshot);

  if (confirmed) return null;

  function confirmAge() {
    localStorage.setItem(STORAGE_KEY, "true");
    window.dispatchEvent(new Event(EVENT_NAME));
  }

  function reject() {
    window.location.href = "https://www.gov.br/pt-br";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/95 p-4 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 text-center text-foreground shadow-2xl">
        <h2 className="text-xl font-extrabold tracking-tight">Você é maior de 18 anos?</h2>
        <p className="mt-2 text-sm text-muted">
          Este site vende bebidas alcoólicas. O consumo de álcool é proibido para menores de 18 anos.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={confirmAge}
            className="rounded-lg bg-accent py-3 font-semibold text-white transition hover:bg-accent-dark"
          >
            Sim, sou maior de idade
          </button>
          <button
            onClick={reject}
            className="rounded-lg border border-border py-3 font-semibold text-muted transition hover:bg-accent-light"
          >
            Não sou maior de idade
          </button>
        </div>
      </div>
    </div>
  );
}
