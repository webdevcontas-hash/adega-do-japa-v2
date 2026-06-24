"use client";

import { useEffect } from "react";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Em produção, plugar aqui um serviço de monitoramento (Sentry, etc.)
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center text-foreground">
      <span className="text-5xl">🍻</span>
      <h1 className="mt-4 text-xl font-extrabold tracking-tight">Tivemos um probleminha</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Não foi possível carregar a loja agora. Verifique sua conexão e tente novamente.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-dark"
      >
        Tentar novamente
      </button>
    </div>
  );
}
