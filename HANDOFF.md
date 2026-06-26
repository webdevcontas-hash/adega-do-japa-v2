# HANDOFF — sessão IA → próximo agente

> Atualizado: 26/06/2026 · sessão IA
> **Regra:** quem lê este arquivo apaga o conteúdo anterior e escreve a sua seção ao terminar.

---

## O que é este repositório

`adega-malte` — MVP de delivery mobile-first para a tabacaria/adega **Malte & Tabaco**.
Stack: Next.js 16 + TypeScript + Tailwind v4 + Prisma 7 + SQLite + Mercado Pago (Pix).

## O que foi feito nesta sessão (26/06/2026)

1. **Corrigido HANDOFF/PROGRESSO desatualizados**: o `git log` já tinha 2 commits (25/06 manhã) não refletidos nos docs — **M2 (relatório de vendas no admin)** e **pagamento na entrega (dinheiro/cartão)** já estavam feitos e funcionando, só não documentados.
2. **M3 — Controle de estoque** implementado:
   - `Product.stock` (Int?, null = ilimitado) — migration `20260626104253_add_product_stock`.
   - Admin → Produtos: campo "Estoque" no formulário + badge (Estoque: N / Esgotado) na listagem.
   - Checkout valida estoque disponível antes de criar o pedido (rejeita com "Estoque insuficiente de ...").
   - `lib/stock.ts` → `decrementStock()`: decrementa só uma vez por pedido — no webhook Pix (PENDING→PAID) ou na rota de status quando vira DELIVERED e ainda não tinha contado como venda (pagamento na entrega).
   - Vitrine (`app/page.tsx`) esconde produtos com `stock === 0`, igual já fazia com `isAvailable: false`.
3. **Ícones do admin/dashboard unificados**: trocados os emojis de navegação (abas, títulos de seção) por ícones FA6 sólidos, mesma família já usada em categorias/produtos/kits na vitrine. Emojis de forma de pagamento (⚡💳💵) ficaram como estavam — já espelhavam o CartDrawer/PaymentScreen.
4. **M4 — Foto/ícone do produto no admin** implementado:
   - `Product.image` (String?, URL externa ou `/uploads/...`) e `Product.icon` (String?, chave manual) — migration `20260626111042_add_product_icon`.
   - `POST /api/admin/upload`: recebe multipart, valida tipo (PNG/JPG/WEBP/GIF) e tamanho (≤5MB), salva em `public/uploads/` (gitignored, dado local).
   - Admin → Produtos → Editar: upload de arquivo OU colar URL, com preview; seletor de ícone (grid com os mesmos ícones já usados na vitrine) só aparece quando não há imagem.
   - `ProductCardV2`/`ProductDetailV2`: mostram a foto (via `<img>`, não `next/image` — de propósito, URLs arbitrárias coladas pelo admin tornariam inviável manter o allowlist de domínios) quando existe; senão, ícone manual ou detecção automática por nome (comportamento de antes).
   - Lista do admin agora mostra uma miniatura (foto ou ícone) por produto.

Tudo testado ponta a ponta via curl + Playwright local (upload, validações, decremento de estoque, idempotência, renderização). Dados de teste sempre revertidos do `dev.db` depois.

## Acessos

| Painel | URL local | Senha |
|--------|-----------|-------|
| Loja | http://localhost:3501 | — |
| Atendente | http://localhost:3501/dashboard | `adega123` |
| Admin | http://localhost:3501/admin | `adega123` |

⚠️ Trocar `DASHBOARD_PASSWORD` no `.env` antes de produção.

## Pendências críticas

1. **Mercado Pago**: preencher `MERCADOPAGO_ACCESS_TOKEN` real e testar Pix ponta a ponta.
2. **Deploy**: definir hospedagem (VPS ou Vercel) e fazer o primeiro deploy. Se for Vercel (serverless), o upload de imagem em `public/uploads/` **não vai persistir** — precisa trocar para storage externo (S3/Cloudinary) antes.
3. **Google OAuth**: preencher `GOOGLE_CLIENT_ID/SECRET` no `.env` para ativar login Google.
4. **WhatsApp real**: `lib/whatsapp.ts` ainda só loga no console. Decisão de provedor foi adiada (opções: whatsapp-web.js, Evolution API, API oficial Meta) — retomar quando o dono quiser priorizar.
5. **Trocar senha** do dashboard antes de produção.
6. **Taxas de entrega reais**: ajustar bairros e valores no painel Admin → Taxas.
7. **Horário real**: ajustar abertura/fechamento no painel Admin → Configurações.
8. **Float → centavos** (migração de preços para Int): tarefa dedicada com teste de Pix real.
9. **Fotos reais dos 51 produtos**: a funcionalidade de upload já existe (item 4 acima); falta o dono efetivamente subir as fotos.

## 🎯 Próxima sessão — roadmap (ver PROGRESSO.md)

M2, M3, M4 e pagamento na entrega: ✅ feitos.

Itens restantes, por impacto (ver tabela completa em PROGRESSO.md):
1. **M1 — WhatsApp real** (decisão de provedor pendente).
2. M5 — Fidelidade/cashback · M6 — Avaliação pós-entrega · M7 — Float→Int · M8 — Rate limiting.
3. Itens de infra/pré-produção (Mercado Pago real, deploy, senha, OAuth) seguem pendentes — ver lista acima.

## Como rodar na nova máquina

```bash
git clone https://github.com/webdevcontas-hash/adega-malte.git
cd adega-malte
npm install
# Copiar o .env da máquina anterior ou criar novo com as variáveis
npx prisma migrate deploy
npm run db:seed
npm run dev -- --port 3501
```

O `.env` contém: `DATABASE_URL`, `SESSION_SECRET`, `DASHBOARD_PASSWORD` e demais vars.
O banco SQLite (`dev.db`) **não é versionado** — rodar o seed sempre que clonar.
Fotos enviadas via admin ficam em `public/uploads/` (também não versionado) — não viajam entre máquinas.
