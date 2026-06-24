# Adega do Japa V2 — Contexto para IA

> Atualizado em: 24/06/2026 08:20 · Renan Notebook Gordon | Leia este arquivo antes de qualquer alteração no projeto.

---

## O que é este projeto

**Versão visual V2 (tema laranja/slate)** do MVP de delivery mobile-first da adega/tabacaria fictícia "Adega do Japa". É um **projeto separado** da V1 (repo `adega-do-japa`, tema vermelho), criado para o cliente comparar e escolher. Mesmo backend nas duas: catálogo, carrinho, checkout com Pix (Mercado Pago), dashboard. Só muda a camada visual da loja.

A loja principal (`/`) é a `StorefrontV2`: hub de "departamentos" (cards grandes coloridos por categoria), header com busca, cards de produto com controle de quantidade inline (lucide-react), rodapé com status da loja, carrinho flutuante mobile.

**Pasta local:** `C:\Github\publicados\adega-do-japa-v2\`
**Repositório:** `https://github.com/webdevcontas-hash/adega-do-japa-v2.git`
**Repo irmão (V1, vermelho):** `https://github.com/webdevcontas-hash/adega-do-japa.git`

---

## Stack e tecnologias

- **Frontend:** Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS v4 (`@import "tailwindcss"` em `app/globals.css`, sem `tailwind.config.js`)
- **Backend:** Route Handlers do Next.js (`app/api/**/route.ts`)
- **Banco de dados:** SQLite via Prisma ORM 7 com o novo generator `prisma-client` (cliente TS gerado em `app/generated/prisma`, **gitignored**, regenerado pelo script `postinstall`)
- **Pagamentos:** SDK oficial `mercadopago` v3 (Pix), com validação de assinatura de webhook (`WebhookSignatureValidator`)
- **WhatsApp:** `lib/whatsapp.ts` — hoje só loga a mensagem formatada; pronto para plugar `whatsapp-web.js` ou outro provedor
- **Infra/Deploy:** ainda não definido (ver PROGRESSO.md)

### Identidade visual (V2 — laranja/slate)

Referência: export "delivery-japa" (React/Vite do AI Studio). Tokens de cor em `app/globals.css` (`:root` + `@theme inline`):

| Token Tailwind | Valor / Uso |
|---|---|
| `bg-background` | `#fff7ed` (orange-50) — fundo da página |
| `text-foreground` | `#1e293b` (slate-800) — texto principal |
| `bg-card` | branco — cards, drawers, modais |
| `border-border` | `#ffedd5` (orange-100) |
| `text-muted` | `#94a3b8` (slate-400) |
| `bg-accent` / `text-accent-dark` | laranja `#f97316` / `#ea580c` — botões, destaques |
| `bg-accent-light` | `#ffedd5` |
| `font-sans` (corpo) | Plus Jakarta Sans (`--font-jakarta`) |
| `font-display` | Space Grotesk (`--font-grotesk`) — títulos e marca |

Os componentes da loja (`components/v2/*`) usam também cores Tailwind explícitas por categoria (amber/purple/slate/red) — ver `components/v2/theme.ts`. Ícones via `lucide-react`. Não há `tailwind.config.js` (Tailwind v4): tokens novos entram em `app/globals.css`.

---

## Dados do cliente / negócio

| Campo | Valor |
|-------|-------|
| Cliente | Fictício — "Adega do Japa" (projeto-modelo para venda a donos de adega reais) |
| Segmento | Adega / tabacaria com delivery |
| WhatsApp | Definido via `WHATSAPP_STORE_NUMBER` no `.env` |
| Instagram | — |
| Cidade/UF | — (taxas de entrega em `lib/delivery.ts` usam bairros de exemplo) |

---

## Estrutura de arquivos relevante

```
adega-do-japa/
├── PROGRESSO.md
├── CONTEXTO-IA.md
├── HANDOFF.md
├── prisma/
│   ├── schema.prisma        # Product, Order (com email? + índices phone/email), OrderItem (status como String — SQLite)
│   ├── seed.ts               # 28 produtos fictícios; idempotente (deleteMany antes de criar)
│   └── migrations/
├── app/
│   ├── page.tsx               # Server Component: busca produtos, renderiza <Storefront>
│   ├── dashboard/page.tsx    # Painel do atendente (protegido por senha)
│   ├── generated/prisma/    # Cliente Prisma gerado — NÃO versionado, NÃO editar
│   └── api/
│       ├── checkout/route.ts            # cria Order + gera Pix no Mercado Pago
│       ├── payment/webhook/route.ts     # recebe notificação MP, marca PAID, notifica WhatsApp
│       ├── orders/route.ts              # lista pedidos (dashboard, protegido)
│       ├── orders/[id]/route.ts         # status do pedido (polling da tela de pagamento)
│       ├── orders/[id]/accept/route.ts  # atendente aceita o pedido (protegido)
│       ├── dashboard/login/route.ts     # login simples do painel
│       └── store-status/route.ts        # horário de funcionamento (consumido no client)
├── components/                # Storefront, ProductCard, ProductDetail, CartDrawer, PaymentScreen, AgeGate, DashboardPanel, etc.
└── lib/                       # prisma.ts, mercadopago.ts, whatsapp.ts, business-hours.ts, delivery.ts, dashboard-auth.ts
```

---

## Módulos / Funcionalidades

| Módulo | Caminho/Arquivo | Descrição |
|--------|-----------------|-----------|
| Catálogo (loja V2) | `app/page.tsx`, `components/v2/StorefrontV2.tsx` | Hub de categorias + grid de produtos; gerencia carrinho (`lib/useCart.ts`). Envolve a árvore em `StoreStatusProvider` e `CustomerProvider` |
| Detalhe do produto (V2) | `components/v2/ProductCardV2.tsx`, `components/v2/ProductDetailV2.tsx` | Clicar no card (fora dos botões +/-) abre o modal `ProductDetailV2` com emoji grande, descrição completa, preço e +/- ligado ao carrinho. Fecha no X/fundo/Esc, trava scroll. Botões +/- usam `stopPropagation` |
| Conta do cliente | `components/CustomerProvider.tsx`, `components/AccountDrawer.tsx`, `app/api/my-orders/route.ts` | **Conta leve** (localStorage via `useSyncExternalStore`): prefill do checkout + "Meus pedidos" + "Pedir novamente" (repõe itens com preço atual). Identidade por telefone e/ou email |
| Login com Google | `app/api/auth/google/**`, `app/api/auth/session`, `app/api/auth/logout`, `lib/customer-auth.ts`, `lib/google-oauth.ts` | OAuth manual; sessão assinada por HMAC (cookie httpOnly 30d). Só ativa com `GOOGLE_CLIENT_ID/SECRET`; senão a rota dá 503 e o botão fica oculto |
| Filtro 18+ | `components/AgeGate.tsx` | Bloqueia tela até confirmar maioridade (localStorage). `getServerSnapshot` retorna `false` → gate já no SSR, sem flash da loja |
| Status da loja | `components/StoreStatusProvider.tsx`, `lib/business-hours.ts`, `app/api/store-status/route.ts` | **Provider único** (1 poller para toda a árvore); pausa com a aba em segundo plano. Server lê `BUSINESS_HOURS_OPEN/CLOSE`; client consome via API |
| Carrinho/Checkout | `components/CartDrawer.tsx`, `app/api/checkout/route.ts` | Form com autofill de CEP (ViaCEP) e taxa de entrega por bairro; servidor recalcula preços/total a partir do banco (nunca confia no valor do client) |
| Pix | `lib/mercadopago.ts`, `app/api/checkout/route.ts` | Cria pagamento Pix; expiração de 10 min |
| Tela de pagamento | `components/PaymentScreen.tsx` | QR code + copia-e-cola + cronômetro; faz polling em `/api/orders/[id]` |
| Webhook | `app/api/payment/webhook/route.ts` | Valida assinatura (se `MERCADOPAGO_WEBHOOK_SECRET` definido), busca pagamento real na API do MP, marca `PAID`, evita notificar duas vezes |
| WhatsApp | `lib/whatsapp.ts` | `notifyOrderPaid()` — troque o corpo de `sendWhatsAppMessage` para integrar de fato |
| Dashboard | `app/dashboard/`, `components/DashboardPanel.tsx`, `lib/dashboard-auth.ts` | Senha única (`DASHBOARD_PASSWORD`); o cookie guarda um **HMAC** da senha (não a senha), comparação constant-time. Alerta sonoro enquanto houver pedido `PAID` com `accepted: false`; polling pausa em background |

---

## Regras técnicas importantes

1. **Prisma 7 muda nomes**: os tipos de modelo gerados são `ProductModel`, `OrderModel`, `OrderItemModel` (não `Product`/`Order`/`OrderItem` como em versões antigas). Importar de `@/app/generated/prisma/models`.
2. **Driver adapter obrigatório**: o generator novo (`prisma-client`) não embute mais engine para SQLite — é preciso `@prisma/adapter-better-sqlite3` (ver `lib/prisma.ts` e `prisma/seed.ts`).
3. **`app/generated/prisma` é gerado e gitignored** — nunca editar à mão; é recriado pelo script `postinstall` (`prisma generate`) a cada `npm install`.
4. **Next.js 16**: `params` em Route Handlers é `Promise` (`const { id } = await params`). Confirmar qualquer API nova contra `node_modules/next/dist/docs/` antes de assumir comportamento de versões antigas.
5. **Env vars sem `NEXT_PUBLIC_` não existem no client.** Por isso o horário de funcionamento é lido no servidor e exposto via `/api/store-status` em vez de ser lido direto por componentes client.
6. **Cascade delete**: `OrderItem.order` tem `onDelete: Cascade` — sem isso, excluir um `Order` (ex.: rollback quando o Pix falha no checkout) quebra com `P2003` (violação de FK). Bug real encontrado e corrigido na sessão 1.
7. **Servidor sempre recalcula preços e total** no checkout a partir do banco — nunca confiar em `price`/`total` vindos do client.
8. **Catálogo usa ISR**: `app/page.tsx` exporta `export const revalidate = 60` (não mais `force-dynamic`). A lista é cacheada/revalidada a cada 60s (melhor TTFB no mobile). Alterações de catálogo aparecem em até 60s — usar `revalidatePath("/")` no fluxo de admin para refletir na hora. **`/dashboard` continua `force-dynamic`** (auth).
9. **Cuidado com `text-{size}` em containers com emoji grande**: em `ProductDetailV2.tsx` o hero usa emoji `text-8xl`; qualquer botão/elemento filho sem `text-{size}` próprio herda esse tamanho. O botão "X" tem `text-base` explícito. Sempre dar `text-*` explícito a elementos interativos dentro desses containers.
10. **Sessões via HMAC** (`lib/dashboard-auth.ts` e `lib/customer-auth.ts`): cookies guardam um HMAC-SHA256 (assinado com `SESSION_SECRET`), nunca o segredo cru. Comparação com `timingSafeEqual`. A sessão do cliente é um payload `{email,name,picture,exp}` assinado.
11. **Inputs em 16px no mobile** (`text-base md:text-sm`): evita o zoom automático do iOS ao focar campos. Manter esse padrão em qualquer input novo.
12. **`setState` em efeito é erro de lint** (`react-hooks/set-state-in-effect`): preferir `useSyncExternalStore` (ver `CustomerProvider`/`AgeGate`) ou colocar o `setState` dentro de callback assíncrono. O prefill do `CartDrawer` desliga a regra pontualmente (é hidratação de formulário SSR-safe).

---

## Ambientes e variáveis

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | String de conexão SQLite (`file:./dev.db`) |
| `NEXT_PUBLIC_BASE_URL` | URL pública do site, usada para montar a `notification_url` do webhook e o redirect do Google |
| `MERCADOPAGO_ACCESS_TOKEN` | Access token da conta Mercado Pago do cliente (Pix) |
| `MERCADOPAGO_WEBHOOK_SECRET` | Secret de assinatura do webhook (painel MP) — opcional, mas recomendado em produção |
| `WHATSAPP_STORE_NUMBER` | Número que recebe a notificação de pedido pago, formato `55DDDNUMERO` |
| `DASHBOARD_PASSWORD` | Senha de acesso ao painel `/dashboard` |
| `SESSION_SECRET` | **Segredo HMAC** que assina as sessões (dashboard + login do cliente). Obrigatório p/ auth. String aleatória longa. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Credenciais OAuth do Google (opcional). Sem elas, o login Google fica oculto e a conta leve continua funcionando. Redirect URI: `<BASE_URL>/api/auth/google/callback` |
| `BUSINESS_HOURS_OPEN` / `BUSINESS_HOURS_CLOSE` | Horário de funcionamento (0-23, pode cruzar a meia-noite) |

---

## Máquinas e responsáveis

| Máquina | Responsável | IA | Última sessão |
|---------|-------------|-----|---------------|
| Renan Desktop | Renan | Claude Code | 23/06/2026 |
| Renan Notebook Gordon (DELL) | Renan | Claude Code | 24/06/2026 |

---

## Como testar localmente

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev -- --port 3500   # porta 3000 pode estar ocupada por outro projeto na mesma máquina
```

Sem `MERCADOPAGO_ACCESS_TOKEN` configurado, o checkout cria o pedido e falha de forma controlada (502) ao tentar gerar o Pix — esperado em ambiente sem credencial real.
