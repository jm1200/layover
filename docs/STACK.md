# STACK.md — Locked technology choices

**Status:** **Locked** — shareholder approved Phase 1 + stack (2026-08-04). Live on Supabase + local Next.js.  
Do not swap this stack without updating this file, `docs/MAP.md`, `AGENTS.md`, and `docs/board/*`.

## Locked stack (Phase 1–5)

| Layer | Choice | Notes |
|-------|--------|--------|
| App | **Next.js** (App Router) + **TypeScript** | `apps/web/` |
| Host | **Vercel** | Easiest Next.js deploy; Hobby free for personal/prototype; Pro (~$20/seat) for commercial production |
| Database | **Supabase Postgres** | Real PostgreSQL |
| Auth | **Supabase Auth** | Same project as DB; roles in app `profiles` / `users` keyed to `auth.uid` |
| Payments | **Stripe** | Phase 5 only — self-serve sponsorship |
| AI | **xAI** (`XAI_API_KEY`, `https://api.x.ai/v1`) | Phase 4 — story → draft, server-side. Product extract: `grok-4.3`. Stills: `grok-imagine-image`. **No production calls without John’s yes.** Quotas in `docs/OPS.md`. |
| Files | **Supabase Storage** | Phase 4 with Lumen — user photos (compress on upload). Not a new vendor. |
| Repo layout | Monorepo intent | `apps/web` + `docs/` + `features/` |

## Why this stack

- **One DB+auth vendor** (Supabase) reduces glue and operator load.  
- **Vercel** minimizes Next.js deploy friction for a solo shareholder + AI engineer.  
- **Not optimizing cloud bill at zero users** — free tiers first; ~$45/mo (Supabase Pro + Vercel Pro) is the usual “real site” floor.  
- Portable enough later: Postgres can leave Supabase; Next.js can leave Vercel. Do not pre-optimize.

## Explicitly deferred / rejected for now

| Option | Status |
|--------|--------|
| Auth.js + Neon | Backup if shareholder rejects Supabase |
| Clerk + separate DB | Two vendors; more cost/glue |
| Non-Vercel host (Fly, Railway, Cloudflare, VPS) | Revisit only if Vercel invoice hurts |
| Self-hosted Docker day one | Wrong for hands-off operator |

## Cost model (rough)

| Stage | Supabase | Vercel | Total vibe |
|-------|----------|--------|------------|
| Prototype / Phase 1 local | Free $0 | Local or Hobby $0 | **$0** |
| Soft commercial launch | Pro ~$25 (no pause, backups) | Pro ~$20/seat | **~$45/mo** |
| Growth | + usage | + usage | Watch bandwidth / serverless |

Also later: domain, Stripe fees (% of revenue), xAI tokens (quota-gated). **John authorizes every paid line** — see `docs/OPS.md` spend lock.

## Human-only setup (shareholder)

AI cannot create your accounts. You must:

1. Create **Supabase** account + project; put URL + keys in `.env` (never commit).  
2. Create **Vercel** account when you want a public URL; connect GitHub; set same env vars.  
3. Later: **Stripe** account (Phase 5). **xAI** key is Phase 4 (already in).  
4. **Google OAuth this cut:** create a Google Cloud OAuth **web** client; paste into Supabase Auth. Apple / others parked. See `docs/board/HUMAN-SETUP.md`.

See also: free-tier pause on Supabase Free; Vercel Hobby non-commercial policy — upgrade when the product is a real business.

## Engineer implementation notes

- Server-side role checks always; never trust client role claims.  
- `service_role` key only on server.  
- Document env var names in `features/auth.md` when scaffolding.  
- Update `docs/MAP.md` when `apps/web` exists.
