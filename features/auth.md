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
- [x] Post-login redirect: **everyone** (user, sponsor, admin) → `/dashboard` (honor `?next=`). Admin is a quiet profile-menu item, not a landing.
- [x] Suspended users blocked from role dashboards (message shown)
- [x] No role elevation from client alone (no client update policy on role)
- [x] Env vars documented (`.env.local.example`); secrets gitignored
- [x] Migration SQL: `apps/web/supabase/migrations/001_profiles.sql`
- [x] Live verification with shareholder Supabase project (admin working)
- [x] Playwright E2E logs in with email/password (`apps/web/e2e`). Google OAuth is not in the suite.

## Env vars (intent)

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server only
```

## Human setup required

Shareholder creates Supabase project and provides keys (see `docs/STACK.md`). Engineer cannot create the cloud account.

## Chrome (locked 2026-08-27 — Lumen)

One header on home, cities, rec, day, share, Your recommendations, admin, sponsor. Dark on heroes, light inside. Never `{email} · {role}`. Never **Dashboard** as the word. Never **You**. Never **Sign out** in the bar.

Logged-in: **Layover** · **Share your intel** · **Cities** · **profile icon**.  
Profile dropdown: **Your recs** → `/dashboard`. Admin (admin only) · Sponsor (sponsor/admin) · **Sign out**.  
Logged-out: Layover · Share your intel · Cities · Log in.

`/dashboard` title **Your recommendations**. Two stacks of cards: **Full days**, then **Recs**. Still, name, **city** (bold), quiet `{Mon D}` date. Recs may say rec here; public pages do not. Quiet line after: *or type it yourself* Eat · Do · Buy · Full layover. No Share card, no four CMS tiles, no Browse cities / Admin in the body.

Strings: `agents/lumen.md` **Copy (locked)**.

## Google (locked 2026-08-26 — this cut)

- **Continue with Google** is the button. Email + password stays. Not Apple / Facebook / Instagram. Instagram-as-content is not a login provider — parked (2026-08-26).
- Shareholder creates the Google Cloud OAuth **web** client and pastes Client ID + secret into Supabase Auth → Google. Recipe: `docs/board/HUMAN-SETUP.md`. Engineer cannot create the Google Cloud project.
- Sofia + Lumen restyle `/login` now. Restyle does **not** wait on the OAuth client. The Google button ships when the client exists.
- Post-login: **everyone** → `/dashboard`. Honor `?next=`. Never `/admin` as the Google landing.

## Out of scope (Phase 1)

- Airline SSO
- Biometric verification
- Apple / Facebook / Instagram / other OAuth
- Cities / playbooks / Stripe / AI

## UI copy (locked 2026-08-26 — Sofia / Lumen)

`/login` is Lumen’s door, not a CMS. Current page is a zinc void: **Log in** / *Crew, explorers, and sponsors*. Dead.

**Layout:** Google first. Email behind **Use email instead**. Full-bleed still behind the form if we ship one (a place you want to be — not a named city we don’t have). Never a black rectangle. Button ships after John pastes the Google OAuth client (`HUMAN-SETUP.md`). Restyle does not wait. No Apple this cut.

| Slot | Copy |
|------|------|
| Headline | **In from a trip?** |
| Sub | **Describe the layover. We’ll fill it in.** |
| Google | **Continue with Google** — official four-color G, white button (not a plain zinc pill) |
| Quiet | **Use email instead** |
| Email submit | **Log in** |
| Footer | **No account? Sign up** |

**`/signup`** (same screen family)

| Slot | Copy |
|------|------|
| Headline | **First time?** |
| Sub | **Describe the layover. We’ll fill it in.** |
| Google | **Continue with Google** |
| Email submit | **Sign up** |
| Footer | **Already in? Log in** |

**Never say on these pages:** Crew, explorers, and sponsors. Default role is user. Sponsors and admin are set separately. Welcome back. Join the community. Playbook. **Steal a day** / steal the layover. Hotel. Create account (as the headline). Google is the door.

### Dashboard `/dashboard` (locked 2026-08-27 — Sofia / Lumen)

Paste strings from `agents/lumen.md` **Copy (locked) → Dashboard**. Do not invent a CMS voice.

| Slot | Copy |
|------|------|
| Title | **Your recommendations** |
| Line | **What you put on the map.** |
| Days | **Your days** / empty **No days yet. Share one.** |
| Recs | **Eat, Do & Buy** / empty **Nothing here yet. Share one.** |
| Menu | **Your recs** |
| Posted | **Posted {D Mon}** |
| Manual | **or type it yourself** Eat · Do · Buy · Full layover |

**Feel:** city page is a magazine; this page is your camera roll of what you filed. Not a zinc list of underlines. Not `/admin`.
