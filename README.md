# ForgeKit

**MIT open-source AI SaaS starter** clone, configure, and ship a subscription chat product without rebuilding auth, billing, or AI streaming from scratch.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdextersrobot%2Fforgekit&env=NEXT_PUBLIC_APP_URL,NEXT_PUBLIC_FEATURES,NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,CLERK_WEBHOOK_SECRET,DATABASE_URL,STRIPE_SECRET_KEY,STRIPE_WEBHOOK_SECRET,STRIPE_PRICE_ID_PRO,AI_PROVIDER,OPENAI_API_KEY,ANTHROPIC_API_KEY,RESEND_API_KEY,EMAIL_FROM,USAGE_ALERT_THRESHOLD&envDescription=API%20keys%20and%20configuration%20for%20ForgeKit&envLink=https%3A%2F%2Fgithub.com%2Fdextersrobot%2Fforgekit%23setup)

## What is this?

ForgeKit is a **minimal, production-oriented template** for AI SaaS apps. This public repo is the **free MIT core** — the parts you need to launch a paid chat product:

- **Clerk authentication** — sign-up, sign-in, user profiles
- **Streaming AI chat** — Vercel AI SDK with OpenAI or Anthropic (`AI_PROVIDER` env var)
- **Stripe billing** — free tier + flat-rate Pro plan, checkout, customer portal, webhooks
- **Usage limits** — monthly caps on free/pro plans with threshold email alerts
- **Dashboard shell** — overview, chat, billing, and settings pages ready to customize

Need teams, document RAG, agents, metered billing, or analytics? That is **ForgeKit Pro** (commercial) — not included in this repo.

## Use cases

This repo is a good fit when you want to:

| Goal | How ForgeKit helps |
| --- | --- |
| **Launch a paid AI chat app fast** | Auth, Stripe checkout, and streaming chat are already integrated |
| **Learn AI SaaS architecture** | Readable Next.js 15 App Router code with real webhooks and DB schema |
| **Prototype a single-user copilot** | Skip org/RAG complexity; add your prompts and branding |
| **Fork and extend** | MIT license — build your product on top without vendor lock-in |
| **Upgrade later** | Same codebase family as ForgeKit Pro when you need RAG, teams, or metered billing |

## Core vs Pro

| | **ForgeKit (this repo)** | **ForgeKit Pro** |
| --- | --- | --- |
| License | MIT, public | Commercial, private |
| Auth | Users | Users + organizations |
| AI chat | Streaming | Streaming + tool-calling agents |
| Billing | Flat-rate Pro plan | Flat-rate + usage-based metered |
| Documents / RAG | — | Upload, embed, cite in chat |
| Analytics | — | Admin usage dashboard |

Pro source is not published here. Contact the maintainer for a commercial license.

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
