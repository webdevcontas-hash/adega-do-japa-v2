# Adega do Japa V2 — Progresso do Desenvolvimento

> Última atualização: 24/06/2026 08:20 · Renan Notebook Gordon

---

# SESSÃO — 24/06/2026 08:20 · Renan Notebook Gordon

## O que foi feito

Sessão grande, 3 frentes (todas commitadas e no GitHub, branch `main`):

### 1. Revisão técnica mobile-first (commit `00d08ff`)
- **Segurança:** sessão do dashboard não grava mais a senha em texto puro no cookie — agora HMAC-SHA256 (`SESSION_SECRET`), comparação constant-time, `secure` em produção. `request.json()` com try/catch (400 em vez de 500) e validação reforçada no Zod.
- **Mobile/UX:** inputs em 16px no mobile (evita zoom do iOS no checkout), touch targets ~44px nos +/-, `prefers-reduced-motion`, safe-area (viewport-fit=cover) no drawer e botão flutuante, AgeGate renderizado já no SSR (sem flash da loja).
- **Performance/dados:** `StoreStatusProvider` único (1 poller no lugar de 3+), catálogo passou a **ISR (`revalidate=60`)**, polling de pagamento/painel pausa com a aba em segundo plano.
- **Resiliência:** `app/error.tsx` + `app/global-error.tsx`, cópia do Pix com fallback (execCommand) + tratamento de erro, timeout/abort de 5s no ViaCEP, webhook do MP com try/catch (responde 200), `accept` retorna 404 se o pedido não existe.
- **Limpeza:** removido o `ProductDetail.tsx` morto (depois ressuscitado em V2, ver abaixo).

### 2. Modal de detalhes do produto (commit `ebcc2f8`)
- Novo `components/v2/ProductDetailV2.tsx`: clicar no card abre detalhes (emoji grande na cor da categoria, descrição completa com fallback, preço, +/- ligado ao carrinho).
- Card virou clicável (role/tabIndex/teclado); botões +/- usam `stopPropagation`. Fecha no X/fundo/Esc, trava scroll, bottom-sheet no mobile.

### 3. Conta do cliente (commit `d6360c0`)
- **Conta leve no dispositivo** (funciona já, sem config): `CustomerProvider` salva nome/telefone/endereço no localStorage; checkout faz prefill e salva no envio; `AccountDrawer` com "Meus pedidos" e "Pedir novamente" (repõe itens no carrinho com preço atual).
- **Login com Google** (OAuth manual, ativa ao configurar credenciais): rotas `/api/auth/google|callback|session|logout`, sessão assinada por HMAC (cookie httpOnly 30d), botão só aparece quando `GOOGLE_CLIENT_ID/SECRET` existem.
- **Dados:** `Order` ganhou `email` opcional + índices em phone/email (migration `20260624105604`). `/api/my-orders` busca por email (sessão) e/ou telefone.

## Pendências
- **Google:** preencher `GOOGLE_CLIENT_ID/SECRET` no `.env` para ativar (ver HANDOFF.md).
- Herdadas: Mercado Pago real + teste de Pix, trocar `DASHBOARD_PASSWORD`, WhatsApp real, deploy, taxas de entrega.
- `Float`→centavos (`Int`) como tarefa dedicada com teste de Pix.
- Privacidade do "Meus pedidos" por telefone (ver HANDOFF.md).

---

# SESSÃO — 23/06/2026 22:30 · Notebook Renan

## O que foi feito

- Criado este repositório `adega-do-japa-v2` como **projeto separado** (fork local de `adega-do-japa`) contendo a **versão visual V2** (tema laranja/slate), para o cliente comparar com a V1 (repo `adega-do-japa`, tema vermelho) e decidir qual usar.
- Loja principal (`/`) renderiza `StorefrontV2`: hub de "departamentos" (cards grandes coloridos), header com busca, cards de produto com +/- inline, rodapé com status da loja em tempo real, carrinho flutuante mobile.
- Hub adaptado às 4 categorias reais (Cervejas, Destilados, Tabacaria, Combos/Gelo); fontes Plus Jakarta Sans + Space Grotesk; ícones lucide-react.
- Paleta laranja no `:root`; modais e dashboard adotam o tema via tokens semânticos.
- V1 removida deste repo (`components/v1`, `app/v2`). Build/lint/tsc limpos.

## Pendências

- Mesmas da V1 (backend idêntico): Mercado Pago real + teste de Pix, trocar `DASHBOARD_PASSWORD`, WhatsApp real, deploy, taxas de entrega por bairro.
- Avaliar fotos reais dos produtos (hoje emoji por categoria como placeholder).
- Se a V2 for escolhida: portar cupom de desconto e tela de acompanhamento de pedido do mockup original.

---

# ROADMAP

| # | Item | Prioridade | Estado |
|---|------|------------|--------|
| 1 | Decisão do cliente: V1 (vermelho) x V2 (laranja) | 🔴 Alta | Pendente |
| 2 | Conta Mercado Pago real + teste de Pix | 🔴 Alta | Pendente |
| 3 | Deploy (VPS/Vercel) | 🔴 Alta | Pendente |
| 4 | Configurar credenciais OAuth do Google (ativa o login) | 🟡 Média | Pendente |
| 5 | Integração real de WhatsApp | 🟡 Média | Pendente |
| 6 | Trocar senha padrão do dashboard | 🔴 Alta | Pendente |
| 7 | Migrar dinheiro Float → centavos (Int) | 🟢 Baixa | Pendente |

---

# HISTÓRICO DE SESSÕES

| Sessão | Data | Máquina | Resumo |
|--------|------|---------|--------|
| 1 | 23/06/2026 | Notebook Renan | Criação do projeto V2 separado (tema laranja) a partir da V1 |
| 2 | 24/06/2026 | Renan Notebook Gordon | Revisão mobile-first (segurança/UX/resiliência), modal de detalhes do produto e sistema de conta do cliente (Google + conta leve) |
