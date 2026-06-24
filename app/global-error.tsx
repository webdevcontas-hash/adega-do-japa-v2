"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          textAlign: "center",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "#fff7ed",
          color: "#1e293b",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Tivemos um probleminha</h1>
        <p style={{ marginTop: "0.5rem", maxWidth: "24rem", fontSize: "0.875rem", color: "#94a3b8" }}>
          Não foi possível carregar a loja agora. Tente novamente em instantes.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "1.5rem",
            borderRadius: "0.5rem",
            background: "#f97316",
            color: "#fff",
            border: "none",
            padding: "0.75rem 1.5rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
