# Feature: Auth & roles

**Phase:** 1  
**Status:** Complete. Second review 2026-08-04: prior holes fixed; residual cleanups applied (middleware fail-closed + cookie forward, path hardening, dead code removed).  
**Code:** `apps/web/src/features/auth/`  
**Stack:** Supabase Auth + Supabase Postgres — see `docs/STACK.md`

## Goal

Single login for `user`, `sponsor`, and `admin`. Server-enforced roles.

## Provider (locked)

| Item | Choice |
|------|--------|
| Auth | **Supabase Auth** |
| DB | **Supabase Postgres** |
| Role storage | App table `profiles` (or `users`) with `id = auth.uid()`, `role`, `status` |
| Sponsor | `role = sponsor` + optional `SponsorProfile` row later (stub OK in Phase 1) |
| Host (deploy) | **Vercel** when public; local first OK |

**Backup if shareholder rejects Supabase:** Auth.js + Neon (document and change `docs/STACK.md` first).

## Acceptance criteria

- [x] User can sign up / log in / log out (email + password)
- [x] Role stored in DB and checked **server-side** on protected routes
- [x] Post-login redirect: user → `/dashboard`; sponsor → `/sponsor`; admin → `/admin`
- [x] Suspended users blocked from role dashboards (message shown)
- [x] No role elevation from client alone (no client update policy on role)
- [x] Env vars documented (`.env.local.example`); secrets gitignored
- [x] Migration SQL: `apps/web/supabase/migrations/001_profiles.sql`
- [x] Live verification with shareholder Supabase project (admin working)

## Env vars (intent)

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server only
```

## Human setup required

Shareholder creates Supabase project and provides keys (see `docs/STACK.md`). Engineer cannot create the cloud account.

## Out of scope (Phase 1)

- Airline SSO
- Biometric verification
- Cities / playbooks / Stripe / AI
