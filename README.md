# ForgeKit

**MIT core** — open-source AI SaaS starter: Next.js 15 (App Router, TypeScript), Tailwind CSS + shadcn/ui, Clerk auth, Postgres + Drizzle ORM, flat-rate Stripe billing, and streaming AI chat via the Vercel AI SDK (OpenAI/Anthropic).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdextersrobot%2Fforgekit&env=NEXT_PUBLIC_APP_URL,NEXT_PUBLIC_FEATURES,NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,CLERK_WEBHOOK_SECRET,DATABASE_URL,STRIPE_SECRET_KEY,STRIPE_WEBHOOK_SECRET,STRIPE_PRICE_ID_PRO,AI_PROVIDER,OPENAI_API_KEY,ANTHROPIC_API_KEY,RESEND_API_KEY,EMAIL_FROM,USAGE_ALERT_THRESHOLD&envDescription=API%20keys%20and%20configuration%20for%20ForgeKit&envLink=https%3A%2F%2Fgithub.com%2Fdextersrobot%2Fforgekit%23setup)

## Stack

| Concern | Tech |
| --- | --- |
| Framework | Next.js 15, App Router, TypeScript, React 19 |
| UI | Tailwind CSS, shadcn/ui-style components, lucide-react |
| Auth | Clerk (users) |
| Database | Postgres + Drizzle ORM |
| Billing | Stripe (flat-rate Pro plan, customer portal, webhooks) |
| AI | Vercel AI SDK — `AI_PROVIDER=openai` or `anthropic`, streaming |
| Email | Resend (welcome, subscription changed, usage threshold) |

## Core vs Pro

This public repo is the **MIT core** (`NEXT_PUBLIC_FEATURES=""`): Clerk auth, streaming AI chat, flat-rate Stripe billing, dashboard shell.

**ForgeKit Pro** (commercial, private) adds multi-tenancy, RAG + pgvector, agents, metered billing, and usage analytics. Contact the maintainer for a commercial license — Pro source is not published here.

## Setup

### 1. Install

```bash
git clone https://github.com/dextersrobot/forgekit && cd forgekit
npm install
cp .env.example .env.local
```

### 2. Database (Postgres)

```bash
npm run db:push   # or db:generate + db:migrate for versioned migrations
```

### 3. Clerk

1. Create an application at [dashboard.clerk.com](https://dashboard.clerk.com).
2. Copy the publishable + secret keys into `.env.local`.
3. Add a webhook endpoint `https://YOUR_DOMAIN/api/webhooks/clerk` subscribed to `user.*`; copy its signing secret to `CLERK_WEBHOOK_SECRET`.

### 4. Stripe

1. Create a **flat-rate monthly** price (`STRIPE_PRICE_ID_PRO`).
2. Enable the **customer portal** (Settings → Billing → Customer portal).
3. Add a webhook endpoint `https://YOUR_DOMAIN/api/webhooks/stripe` for `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. Locally: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.

### 5. AI providers

Set `AI_PROVIDER=openai` or `anthropic` (override the model with `AI_MODEL`).

### 6. Resend

Create an API key at [resend.com](https://resend.com), verify your sending domain, and set `RESEND_API_KEY` + `EMAIL_FROM`. Without a key, emails are logged and skipped — safe for local dev.

### 7. Run

```bash
npm run dev
```

## Scripts

`dev` · `build` · `start` · `typecheck` · `db:generate` · `db:migrate` · `db:push` · `db:studio`

## License

[MIT](./LICENSE)
