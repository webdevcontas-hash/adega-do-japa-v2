# HANDOFF — Renan Notebook Gordon → próximo agente

> Atualizado: 24/06/2026 08:20 · Renan Notebook Gordon
> **Regra:** quem lê este arquivo apaga o conteúdo anterior e escreve a sua seção ao terminar.

---

## O que é este repositório

`adega-do-japa-v2` é a **versão visual V2** (tema **laranja/slate**) do projeto Adega do Japa, criada como **projeto separado** para o cliente comparar com a V1 (repo `adega-do-japa`, tema vermelho) e decidir qual usar. As duas versões têm o **mesmo backend** (catálogo, carrinho, checkout Pix via Mercado Pago, dashboard).

## O que foi feito nesta sessão (24/06/2026)

Sessão grande, 3 frentes — tudo commitado e no GitHub (branch `main`):

1. **Revisão técnica mobile-first** (commit `00d08ff`): correção de segurança (sessão do dashboard deixou de gravar a senha em texto puro → HMAC), inputs em 16px no mobile (evita zoom iOS), touch targets ~44px, `prefers-reduced-motion`, `error.tsx`/`global-error.tsx`, cópia do Pix com fallback, timeout no ViaCEP, webhook com try/catch, catálogo virou **ISR (`revalidate=60`)**, polling pausa em background, safe-area. Detalhes no PROGRESSO.md.
2. **Modal de detalhes do produto** (commit `ebcc2f8`): clicar no card abre `ProductDetailV2` (emoji grande, descrição completa, preço, +/- ligado ao carrinho). Botões +/- usam `stopPropagation`.
3. **Conta do cliente** (commit `d6360c0`): Google (OAuth manual) **+** conta leve no dispositivo (localStorage). Ver CONTEXTO-IA.md (seções "Conta do cliente" e "Variáveis").

## ⚠️ Pendência crítica para o Google funcionar

O login com Google está **100% implementado mas inativo** até preencher no `.env`:
- `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` (criar em https://console.cloud.google.com/apis/credentials, App Web)
- Redirect URI autorizado: `http://localhost:3501/api/auth/google/callback` (e a URL de produção depois)
- `SESSION_SECRET` já está preenchido no `.env` local (e documentado no `.env.example`).

Enquanto não configurar, o botão "Continuar com Google" fica escondido e a rota responde 503 — **a conta leve no dispositivo funciona normalmente**.

## Outras pendências (herdadas, backend é igual ao da V1)

1. Configurar `MERCADOPAGO_ACCESS_TOKEN` real e testar um Pix ponta a ponta (sem ele o checkout dá 502 controlado — esperado).
2. Trocar `DASHBOARD_PASSWORD` antes de produção.
3. Integração real de WhatsApp (`lib/whatsapp.ts` hoje só loga).
4. Definir hospedagem/deploy.
5. Taxas de entrega por bairro reais (`lib/delivery.ts`).
6. **Privacidade**: "Meus pedidos" da conta leve busca por telefone — quem digitar o número no mesmo aparelho vê os pedidos. Aceitável p/ MVP; se quiser blindar, exigir login (Google) para ver histórico.
7. **Dinheiro como `Float`** (não aplicado de propósito): migrar para centavos (`Int`) exige migração + teste de Pix real. Fazer como tarefa dedicada.
8. Decisão do cliente: V1 (vermelho) × V2 (laranja).

## Como rodar

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev -- --port 3501
```

`.env` local já existe (gitignored, com SESSION_SECRET). Servidor de dev costuma ficar na porta 3501; se der `EADDRINUSE`, mate o processo node que está na porta antes de subir de novo.
