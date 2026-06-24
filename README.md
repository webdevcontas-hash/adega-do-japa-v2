# Adega do Japa — Delivery

MVP de delivery mobile-first para adega/tabacaria, com catálogo, carrinho, pagamento via Pix (Mercado Pago) e notificação automática por WhatsApp.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma ORM + SQLite
- SDK do Mercado Pago (Pix)

## Rodar localmente

1. Instalar dependências: `npm install`
2. Copiar `.env.example` para `.env` e preencher as variáveis (token do Mercado Pago etc.)
3. Aplicar migrations: `npx prisma migrate dev`
4. Popular produtos de exemplo: `npm run db:seed`
5. Rodar o app: `npm run dev`

Documentação detalhada do projeto em [`CONTEXTO-IA.md`](./CONTEXTO-IA.md), histórico de sessões em [`PROGRESSO.md`](./PROGRESSO.md) e repasse entre responsáveis em [`HANDOFF.md`](./HANDOFF.md).
