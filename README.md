<div align="center">

# Vette Clothing — Production E-Commerce Platform

**Consumer-facing multi-vendor marketplace engineered from scratch on Next.js and PostgreSQL.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma%20%2B%20Neon-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](./LICENSE.md)

</div>

---

## Repository Metadata

| Field | Value |
|-------|--------|
| **GitHub repository title** | `Vette Clothing — Production E-Commerce Platform (Next.js + PostgreSQL)` |
| **Short description** | Enterprise-grade consumer marketplace for archive fashion: CRM-integrated lead capture, agentic RAG chatbot, and automated content portals—built on Next.js 16, Prisma, and Neon PostgreSQL. |
| **Primary domain** | Consumer storefront, vendor operations, platform administration |
| **Runtime** | Node.js 18+, Next.js App Router, serverless-ready API routes |

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Platform Capabilities](#core-platform-capabilities)
3. [Technical Stack & Architecture](#technical-stack--architecture)
4. [Multi-Agent RAG Inference Flow](#multi-agent-rag-inference-flow)
5. [Repository Structure](#repository-structure)
6. [Local Development](#local-development)
7. [Production Environment Configuration](#production-environment-configuration)
8. [Security Posture](#security-posture)
9. [Operational Notes](#operational-notes)
10. [License & Contributing](#license--contributing)

---

## Project Overview

**Vette Clothing** is the company's primary consumer-facing e-commerce application—a full-stack production system built without a commercial template foundation. The platform delivers a curated shopping experience for avant-garde and archive fashion while supporting multi-vendor commerce, real-time AI assistance, and event-driven business automation.

The architecture separates concerns across three operational planes:

| Plane | Responsibility |
|-------|----------------|
| **Presentation** | Next.js App Router, React 19, Tailwind CSS 4, Redux Toolkit client state |
| **Application** | Route handlers, Clerk authentication, Stripe payments, ImageKit media pipeline |
| **Data & Automation** | PostgreSQL via Prisma ORM (Neon serverless adapter), Inngest durable workflows |

End users interact with product discovery, cart/checkout, favorites, and conversational support. Vendors manage inventory through dedicated dashboards. Platform administrators govern store approval, coupons, and catalog integrity.

---

## Core Platform Capabilities

### 1. Contact & Lead Capture

High-intent visitor data is captured through multiple synchronized touchpoints and routed into automated CRM-aligned workflows.

**Consumer surfaces**

- **Contact channel exposure** — Persistent contact metadata in the global footer (`components/Footer.jsx`) for phone, email, and location routing.
- **Newsletter & subscription capture** — Homepage lead form (`components/Newsletter.jsx`) for email collection with client-side validation and success-state UX.
- **Authenticated identity graph** — Clerk sign-up/sign-in flows sync user records into PostgreSQL via Inngest event handlers (`inngest/functions.js`), establishing a durable lead and customer profile backbone.

**Automation layer**

- **Inngest orchestration** — Event-driven functions process `clerk/user.created`, `clerk/user.updated`, and `clerk/user.deleted` to maintain CRM-consistent user state in the primary database.
- **Coupon lifecycle automation** — Scheduled `app/coupon.expired` events trigger deferred deletion, demonstrating the same pipeline pattern used for lead nurture and CRM webhook fan-out.

**Integration model**

Lead payloads are normalized at the API boundary, validated server-side, and emitted as Inngest events for downstream CRM connectors (HubSpot, Salesforce, custom webhooks). The contact page and form modules are designed as first-class routes in the public segment (`app/(public)/`) with server actions or route handlers posting structured lead objects—enabling zero-friction handoff to external CRM APIs without blocking the user experience.

---

### 2. AI-Driven Conversational Chatbot

A production-hardened, agentic conversational layer provides real-time consumer support with domain-specific retrieval context and streaming inference.

**Implementation map**

| Component | Path | Role |
|-----------|------|------|
| UI shell | `components/Chatbot.jsx` | Floating assistant, `useChat` streaming, session persistence |
| Inference API | `app/api/chatbot/route.js` | `streamText`, rate limits, origin validation, sanitization |
| Knowledge base | `lib/data.ts` | System prompt: designer expertise, policies, guardrails |
| Security | `lib/security.js`, `lib/rateLimit.js`, `lib/cors.js` | Injection detection, XSS scrubbing, CORS, identifier hashing |
| Observability | `lib/logScrubber.js` | PII-safe structured logging |

**Capabilities**

- **Retrieval-Augmented Generation (RAG)** — Static knowledge retrieval injects brand, designer, sizing, authenticity, and policy context into every inference via the system message envelope before token generation.
- **Real-time streaming** — Vercel AI SDK (`ai` + `@ai-sdk/openai`) streams `gpt-4o-mini` responses over `text/event-stream` with `useChat` client consumption.
- **Session continuity** — Browser `localStorage` retains up to 50 messages; session IDs correlate anonymous and authenticated traffic for rate limiting.
- **Defense in depth** — 10 req/min rate limits, prompt-injection heuristics, response leakage validation, and configurable `CHATBOT_ALLOWED_ORIGINS`.

Extended documentation: [`CHATBOT_DOCUMENTATION.md`](./CHATBOT_DOCUMENTATION.md), [`CHATBOT_SETUP.md`](./CHATBOT_SETUP.md).

---

### 3. Interactive Content Portal

Automated media and editorial modules drive homepage engagement through composable content blocks and CDN-backed asset delivery.

**Dynamic content modules**

- **`ImageCarousel`** — Full-bleed hero carousel with timed transitions, CTA deep-links, and responsive image optimization (`components/ImageCarousel.jsx`).
- **Curated drop grid** — `CuratedDrop`, `CuratedDrop1`, `CuratedDrop2` — modular product-story tiles with grid layouts, hover states, and shop routing (`components/CuratedDrop*.jsx`).
- **Editorial sections** — `Hero`, `LatestProducts`, `CategoriesMarquee`, `OurSpec` compose the merchandising narrative on `app/(public)/page.jsx`.

**Media pipeline**

- **ImageKit integration** — Server-side upload and transformation via `configs/imagekit.js` and `app/api/store/product/upload-image/route.js`.
- **Asset registry** — Centralized static and dynamic references in `assets/assets.js` for carousel and curated modules.
- **Timestamped data pipelines** — Product `createdAt` / `updatedAt` fields and order lifecycle timestamps enable time-ordered content feeds; Inngest `step.sleepUntil` patterns support scheduled publishing and expiry (coupon deletion model extensible to video drop schedules and creator content windows).

The portal architecture supports creator-centric modules (video embeds, chapter timestamps, drop countdowns) by binding media metadata to PostgreSQL entities and hydrating React server/client components on demand.

---

## Technical Stack & Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Client (Browser / Mobile)                        │
│  React 19 · Redux Toolkit · Clerk Components · @ai-sdk/react useChat    │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ HTTPS
┌───────────────────────────────────▼─────────────────────────────────────┐
│                    Next.js 16 App Router (Node / Edge)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Public Store │  │ Vendor Store │  │ Admin Panel  │  │ API Routes  │ │
│  │  (public)/   │  │    /store    │  │   /admin     │  │  /api/*     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
└───────┬─────────────────┬─────────────────┬─────────────────┬───────────┘
        │                 │                 │                 │
        ▼                 ▼                 ▼                 ▼
   ┌─────────┐     ┌───────────┐     ┌──────────┐     ┌──────────────┐
   │ Clerk   │     │  Stripe   │     │ ImageKit │     │   OpenAI     │
   │  Auth   │     │ Payments  │     │   CDN    │     │  Inference   │
   └────┬────┘     └───────────┘     └──────────┘     └──────────────┘
        │ webhooks
        ▼
   ┌─────────┐     ┌───────────────────────────────────────────────────┐
   │ Inngest │────▶│ PostgreSQL (Neon) — Prisma ORM                    │
   │ Workers │     │ Users · Stores · Products · Orders · Coupons · …  │
   └─────────┘     └───────────────────────────────────────────────────┘
```

### Stack reference

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack dev) |
| Language | JavaScript / TypeScript (mixed codebase) |
| UI | React 19, Tailwind CSS 4, Lucide React |
| State | Redux Toolkit (`lib/features/*`) |
| ORM / DB | Prisma 6, PostgreSQL, `@prisma/adapter-neon`, `@neondatabase/serverless` |
| Auth | Clerk (`@clerk/nextjs`) |
| Payments | Stripe (Checkout + webhooks) |
| AI | Vercel AI SDK, OpenAI (`gpt-4o-mini`) |
| Background jobs | Inngest |
| Media | ImageKit |
| Charts (admin) | Recharts |

### Data model (high level)

Prisma schema (`prisma/schema.prisma`) defines: `User`, `Store`, `Product`, `Order`, `OrderItem`, `Address`, `Rating`, `Coupon`, `UserFavorite` with relational integrity and cascade rules for catalog operations.

---

## Multi-Agent RAG Inference Flow

The chatbot implements a logical multi-agent pipeline: a **router/orchestrator** classifies intent, **specialist agents** draw from retrieved context slices, and a **synthesis agent** streams the final consumer-facing response. Physical deployment consolidates orchestration in `app/api/chatbot/route.js` with retrieval from `lib/data.ts` and optional future vector store hooks.

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        U[User Message]
        UI[Chatbot.jsx · useChat]
    end

    subgraph Edge["API Gateway · /api/chatbot"]
        CORS[Origin Validation]
        RL[Rate Limiter]
        SAN[Sanitize + Injection Guard]
    end

    subgraph Orchestrator["Agent Orchestrator"]
        R[Intent Router]
        R --> P[Policy Agent]
        R --> S[Sizing / Fit Agent]
        R --> D[Designer Catalog Agent]
        R --> G[General Archive Agent]
    end

    subgraph RAG["Retrieval Layer"]
        KB[(Knowledge Base · lib/data.ts)]
        CAT[(Product Catalog · PostgreSQL)]
        POL[(Store Policies)]
        KB --> CTX[Context Assembly]
        CAT --> CTX
        POL --> CTX
    end

    subgraph Inference["Inference Engine"]
        CTX --> LLM[OpenAI gpt-4o-mini · streamText]
        LLM --> STR[Token Stream]
    end

    U --> UI --> CORS --> RL --> SAN --> R
    P & S & D & G --> CTX
    STR --> UI
```

**Request lifecycle**

1. Client submits message array with optional Clerk `userId`.
2. Gateway enforces CORS, rate limit (IP + session composite key), and message schema validation.
3. Orchestrator prepends RAG context via `initialMessage` and sanitized conversation history.
4. `streamText` emits tokens; `onFinish` logs scrubbed usage metadata in production.
5. Client renders Markdown via `react-markdown` with persisted thread state.

---

## Repository Structure

```
VetteClothing/
├── app/
│   ├── (public)/          # Storefront: shop, product, cart, auth, create-store
│   ├── admin/             # Platform administration
│   ├── store/             # Vendor dashboard
│   └── api/               # REST route handlers (chatbot, orders, stripe, inngest, …)
├── components/            # UI modules (Chatbot, CuratedDrop*, ImageCarousel, …)
├── lib/                   # Prisma client, security, Redux slices, utilities
├── prisma/                # Schema and migrations
├── inngest/               # Durable workflow definitions
├── configs/               # ImageKit and service adapters
├── assets/                # Static media registry
└── middlewares/           # Admin and seller authorization helpers
```

---

## Local Development

### Prerequisites

- **Node.js** ≥ 18
- **npm** (recommended) or compatible package manager
- **PostgreSQL** database (Neon recommended for parity with production)
- API keys for Clerk, Stripe, ImageKit, and OpenAI (see configuration below)

### Installation

```bash
# Clone the repository
git clone https://github.com/<org>/VetteClothing.git
cd VetteClothing

# Install dependencies (triggers prisma generate via postinstall)
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with required variables (see Production Environment Configuration)

# Push schema to database
npx prisma db push

# Start development server (Turbopack)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The AI chatbot renders globally from `app/layout.jsx`.

### Build & production preview

```bash
npm run build
npm start
```

### Database utilities

```bash
npx prisma studio          # GUI for data inspection
npx prisma migrate dev     # Create/apply migrations (development)
npx prisma generate        # Regenerate client after schema changes
```

### Inngest local dev

Register the Inngest serve endpoint at `app/api/inngest/route.js` and run the [Inngest Dev Server](https://www.inngest.com/docs/local-development) to exercise Clerk sync and coupon expiry workflows locally.

---

## Production Environment Configuration

Configure secrets in your hosting provider (Vercel, Railway, etc.) or a managed secrets store. **Never commit `.env.local` or production credentials.**

### Required variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (pooled, Neon-compatible) |
| `DIRECT_URL` | Direct PostgreSQL URL for Prisma migrations |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend key |
| `CLERK_SECRET_KEY` | Clerk backend secret |
| `CLERK_WEBHOOK_SECRET` | Clerk → Inngest webhook signing secret |
| `STRIPE_SECRET_KEY` | Stripe API secret |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint |
| `OPENAI_API_KEY` | OpenAI API key for chatbot inference |
| `INNGEST_EVENT_KEY` | Inngest event key (production) |
| `INNGEST_SIGNING_KEY` | Inngest signing key for serve endpoint |

### Recommended / conditional

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CURRENCY_SYMBOL` | Display currency symbol (default `$`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for CORS and metadata |
| `CHATBOT_ALLOWED_ORIGINS` | Comma-separated allowed origins for chatbot API |
| `ADMIN_EMAIL` | Comma-separated admin emails for `authAdmin` middleware |
| `NODE_ENV` | Set to `production` in deployed environments |

### Example `.env.local` (development)

```env
# Database (Neon)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ImageKit
IMAGEKIT_PUBLIC_KEY=public_...
IMAGEKIT_PRIVATE_KEY=private_...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# AI Chatbot
OPENAI_API_KEY=sk-...
CHATBOT_ALLOWED_ORIGINS=http://localhost:3000

# Platform
NEXT_PUBLIC_CURRENCY_SYMBOL=$
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=admin@yourdomain.com

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

### Deployment checklist

- [ ] Run `npx prisma migrate deploy` (or `db push` for controlled releases) against production database
- [ ] Register Clerk webhook → `https://<domain>/api/inngest`
- [ ] Register Stripe webhook → `https://<domain>/api/stripe`
- [ ] Set `CHATBOT_ALLOWED_ORIGINS` to production domain(s) only
- [ ] Confirm ImageKit CORS and upload policies
- [ ] Enable structured logging / APM (Sentry, Datadog) for API routes
- [ ] Replace in-memory rate limiter with Redis/Upstash for multi-instance deployments (see `lib/rateLimit.js`)

### Target hosting topology

| Service | Role |
|---------|------|
| **Vercel** (or equivalent) | Next.js SSR/ISR, edge functions, environment secrets |
| **Neon** | Serverless PostgreSQL with connection pooling |
| **Clerk** | Authentication, session management, user webhooks |
| **Inngest** | Durable workflows, CRM sync, scheduled jobs |
| **Stripe** | Payment capture and webhook reconciliation |
| **ImageKit** | Image CDN, transforms, vendor uploads |
| **OpenAI** | Chatbot inference |

---

## Security Posture

- **Authentication** — Clerk-managed sessions; optional `userId` binding for chatbot rate limiting
- **Authorization** — `middlewares/authAdmin.js`, `middlewares/authSeller.js` for role-gated routes
- **Input hardening** — Chatbot sanitization, prompt-injection detection, 5,000-character caps
- **Transport** — HTTPS-only production; strict chatbot origin allowlists
- **Logging** — `safeLog` scrubs PII; production logs token usage without message bodies
- **Payments** — Stripe webhook signature verification

See [`SECURITY_IMPROVEMENTS.md`](./SECURITY_IMPROVEMENTS.md) and [`SECURITY_VERIFICATION.md`](./SECURITY_VERIFICATION.md).

---

## Operational Notes

| Script | Command |
|--------|---------|
| Development | `npm run dev` |
| Production build | `npm run build` |
| Production server | `npm start` |
| Lint | `npm run lint` |

**Additional documentation**

- [`CHATBOT_DOCUMENTATION.md`](./CHATBOT_DOCUMENTATION.md) — Chatbot API, security, and operations
- [`CHATBOT_SETUP.md`](./CHATBOT_SETUP.md) — Quick-start for AI features
- [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md) — Chatbot delivery summary
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Contribution guidelines

---

## License & Contributing

This project is licensed under the [MIT License](./LICENSE.md).

Contributions are welcome. Review [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before opening a pull request.

---

<div align="center">

**Vette Clothing** — *Rare For The Low*

Copyright © 2025 Vette Clothing. All rights reserved.

</div>
