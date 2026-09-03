# MAP.md — Feature map and repo layout

**Purpose:** Single map of the territory so agents do not invent structure or forget where things live.  
**Update this file** whenever features, folders, or phase status change.

## Current phase

| Phase | Status | Notes |
|-------|--------|--------|
| **0 — Baseline docs** | **Complete** | Product brain in `docs/` + `features/` |
| **0.1 — Org / CEO** | **Complete** | Founder John → Maya (CEO) + Theo / Milo / Sofia; see `docs/ORG.md`, `agents/`, `.grok/agents/` |
| **0.2 — Stack lock** | **Approved** | Next.js + Supabase + Vercel + Stripe later + xAI later — `docs/STACK.md` |
| **1 — Auth + roles** | **Complete + hardened** | Live signup/login + roles; fix pack + second review cleanups |
| **1.1 — Pre–Phase 2 gate** | **Complete** | Docs/MAP honesty + `PRE-PHASE-2-GATE.md`; code re-reviewed |
| **2 — Cities, zones, places, playbooks** | **Complete** | Content model + public browse + forms. Migrations 002–004 (+ seeds 003, 005, 006; stop timing 007). Gate in `PRE-PHASE-2-GATE.md` is met. Demo recs wiped by **021** (paste once) — do not re-run 003/005/006. |
| **2.1 — Verify + harden** | **Complete** | Homepage + city/place/plan UI in (heroes, Eat/Do/Buy, full layover). RLS smoke: `docs/board/RLS-SMOKE.md`. **Parked (not blockers):** admin city form (SQL), Vercel deploy, photo upload (Phase 4). |
| 3 — Social | **Complete** | Like + comment + byline + author page. SQL **018**–**020**. Follow **out**. Likes = count. Lumen reads notes. Dump / rec edit / rec photos stay as they are. |
| 4 — AI story import | **Complete** | Dump → she writes it up → you publish. Feel pass 2026-08-27. Dump / rec edit / rec photos stay as they are. |
| 5 — Sponsorship + Stripe | Not started | self-serve labeled ads. **Skip until people use the site** (board rec 2026-08-31). |
| 6 — Metrics + admin moderation | Not started | reports / hide-delete / ban + metrics. Not a go-live blocker. `/admin` already has kill switch + Lumen log. |
| 7 — Crew-only precision | Not started | optional; after verification story |

**Before Phase 2 code:** read `docs/board/PRE-PHASE-2-GATE.md`. Do not invent scope beyond Board #2 locks.

## Target repository layout

```text
layover/
  AGENTS.md              # company charter (auto-loaded)
  COMPANY_LOG.md         # durable decisions
  agents/                # Maya, Theo, Milo, Sofia (personalities)
  .grok/agents/          # spawnable copies (ceo, senior-engineer, …)
  README.md
  docs/
    PRODUCT.md
    MAP.md              ← you are here
    STACK.md            # locked tech choices
    SECURITY.md
    ROLES.md
    OPS.md
    ORG.md
    board/              # shareholder brief + CEO log + gates
  features/             # short specs per feature (product + acceptance)
    auth.md
    playbooks.md
    places-and-zones.md
    social.md
    ai-import.md
    sponsorship.md
    admin-and-metrics.md
  apps/
    web/                # Next.js App Router (Phase 1 exists)
      src/
        app/            # routes only (thin)
        features/       # vertical slices matching features/*.md
          auth/         # Phase 1 — exists
          playbooks/    # Phase 2
          places/       # Phase 2
          social/
          sponsorship/
          ai-import/
          admin/
          metrics/
        components/ui/
        lib/            # db, stripe, ai, auth helpers
      supabase/migrations/
```

## Feature index

| Feature | Spec | Code (when exists) | Depends on | Phase |
|---------|------|--------------------|------------|-------|
| Auth & roles | `features/auth.md` | `apps/web/src/features/auth/` | — | 1 **done** |
| Places & zones | `features/places-and-zones.md` | `apps/web/src/features/places/` | Auth (for write) | 2 **done** |
| Playbooks | `features/playbooks.md` | `apps/web/src/features/playbooks/` | Places, Auth | 2 **done** |
| Social | `features/social.md` | `apps/web/src/features/social/` | Auth, content | 3 **done** |
| AI import | `features/ai-import.md` | `apps/web/src/features/ai-import/` | Playbooks, Auth, OPS quotas | 4 **done** |
| Sponsorship | `features/sponsorship.md` | `.../sponsorship/` | Auth sponsor, Stripe, cities | 5 |
| Admin & metrics | `features/admin-and-metrics.md` | `.../admin/`, `.../metrics/` | All of the above | 6 |
| Crew-only fields | (extend SECURITY + places) | TBD | Verification | 7 |

## Domain entities (logical)

```text
User (role: user | sponsor | admin)          — Phase 1
City                                         — Phase 2
Zone (belongs to City; type: airport_strip | downtown | station | other)  — Phase 2
Place (City, optional Zone)                  — Phase 2
Dish (belongs to Place)                      — Phase 2
Playbook + PlaybookStop                      — Phase 2
  # Stop: optional place_id + free-text note/activity (no Activity table this cut)
# Deferred (not Phase 2):
#   Activity (separate entity) — later if needed
#   Event (dates; can expire) — later
Like / Comment / Author page (Follow later)  — Phase 3
SponsorProfile / Campaign / Placement        — Phase 5
AiImportLog                                  — Phase 4
ModerationAction / MetricSnapshot            — Phase 6
```

## Routes

| Path | Audience | Purpose | Status |
|------|----------|---------|--------|
| `/` | Public | Layover Intel; Eat/Do/Buy cards use the rec’s own still (hide a kind if none published), name, city + country, + city search. Share card: hero + “For Crew, By Crew.” | Phase 2 |
| `/login` | Public | Email + Google. | Phase 1 |
| `/privacy` | Public | What we keep from Google sign-in. Needed for Google OAuth publish. | — |
| `/dashboard` | User (all roles land here) | **Your recommendations** — this user’s published recs and days. Cards, not a CMS. Header is the same as the rest of the site. | Phase 4 |
| `/sponsor` | Sponsor | Campaigns, billing, creatives | Phase 1 stub |
| `/admin` | Admin | Kill switch + Lumen log. Tab: Lumen. Full queue is Phase 6 | Phase 4 slice |
| `/admin/people` | Admin | People (last in, what they posted) + what’s new. SQL **022** | 022 |
| `/cities` | Public | City list. Share card: site hero | Phase 2 |
| `/cities/[slug]` | Public | Dark hero · Eat/Do/Buy preview (top 3) · full layover below. Share card: city hero + feel line | Phase 2 |
| `/cities/[slug]/eat` `/do` `/buy` | Public | Full list for one verb. Share card: city hero | Phase 2 |
| `/cities/[slug]/layovers` | Public | All sequenced days. Share card: city hero | Phase 2 |
| `/playbooks/[id]` | Public | Playbook detail. Share card: city hero + narrative | Phase 2 |
| `/places/[id]` | Public | Place + dishes. Share card: rec still + blurb | Phase 2 |
| `/u/[id]` | Public | Author page — their published recs and days. Share card: name, not the face | Phase 3 |
| `/u/[id]/edit` | Owner | Name and photo | Phase 3 |
| `/dashboard/places/new` | Auth | Create place | Phase 2 |
| `/dashboard/places/[id]/edit` | Author / admin | Edit rec (Save → rec page; photos/plates persist immediately) | Phase 4 |
| `/dashboard/playbooks/new` | Auth | Create playbook | Phase 2 |
| `/api/...` | Server | Mutations, AI extract, Stripe webhooks | as needed |

Exact paths may adjust; update this table when implementing.

## What exists on disk right now

- [x] `AGENTS.md` (org + stack intent)
- [x] `README.md`
- [x] `docs/*` product brain (PRODUCT, SECURITY, ROLES, OPS, STACK, ORG)
- [x] `docs/board/SHAREHOLDER-BRIEF.md` — **what the human should read**
- [x] `docs/board/CEO-LOG.md`
- [x] `docs/board/PRE-PHASE-2-GATE.md` — agent gate before Phase 2 code
- [x] `features/*.md` (auth complete; Phase 2 specs locked to Board #2)
- [x] `agents/*.md` + `.grok/agents/` (Maya, Theo, Milo, Sofia), skills `ceo` / `board-meeting`
- [x] `COMPANY_LOG.md`
- [x] Application code — `apps/web` Phase 1 auth shell + fix pack
- [x] Migration — `001_profiles.sql` (shareholder runs in Supabase)
- [x] Phase 2 app code — places + playbooks features, public routes, forms
- [x] Migrations `002`, `003`, `004_phase2_harden.sql` (shareholder runs in Supabase)
- [x] Migration `005_seed_santiago_munich.sql` (homepage Eat/Buy cards — run in SQL Editor)
- [x] Migration `006_zurich_density.sql` (extra Zurich recs — run in SQL Editor)
- [x] Phase 2.1 Important fix pack (zone/city, stop city, admin city insert, partial writes)
- [x] Migration `007_stop_timing.sql` (optional duration/cost on stops — run in SQL Editor)
- [x] Homepage + city/place/plan UI (2.1). Eat/Do/Buy cards use the rec’s still (same as city cards). Name + city, country under the still. No leftover Limmat/steak/mustard mood. Hide a kind if none published.
- [x] Deployed site — Vercel Hobby, root `apps/web` (live URL; same Supabase as local)
- [ ] Admin city form — parked (SQL)
- [x] Phase 4 dump → draft (`/share`, `features/ai-import/`) — needs key + SQL 008
- [x] Lumen may open a city (SQL **009** `lumen_ensure_city`) — name + IATA, default zones
- [x] Review: places first, then plan; upload or skip → still on publish (SQL **010**, bucket `place-stills`)
- [x] Publish layover also publishes its recs; city layover cards use rec stills
- [x] **Dedup itineraries** — code matches title or stop set. **Lock 2026-08-26:** stop set is the match.
- [x] Phase 4 founder test **pass** (feel 2026-08-27). Dump, Google, hotel, dashboard. Dump/edit/photos frozen.
- [x] Theo/Milo review of `features/ai-import/` (team meeting 2026-08-25) + follow-up pack
- [ ] Restore daily 3-draft cap (`DAILY_EXTRACT_CAP`) — parked 2026-08-25, later phase
- [x] BCN city hero (`public/landing/hero-barcelona.jpg` + `CITY_HERO.barcelona`)
- [x] `/cities` as hero cards (not a phone book); search hint lists live IATA codes
- [x] Lumen live baseline (`agents/lumen.md` + `.grok/agents/lumen.md`)
- [x] `/admin` Lumen log: one card per dump (stills + city hero grouped). Names link. Not Phase 6.
- [x] `/admin` People + What’s new (SQL **022**). Last sign-in from `auth.users` via `is_admin()` RPC. No `service_role` in Next. John pastes 022. **People tab** at `/admin/people` so her log stays its own page.
- [x] Header: **Log in** / **Log out**. Menu **Profile** → name and photo (`/u/[id]/edit`). Posted by still → `/u/[id]`.
- [x] Dump dedup is **stop set** (incl. one-stop). Title-first gone. Public rec Photos cap 3 (no extra hero unshift). City-open line does not promise a hero.
- [x] User photo upload: compress (no 2 MB cap as homework); 4:5 card preview; no silent AI reframe
- [x] Up to 3 plate photos per Eat/Buy rec (SQL **012**). City cards stay one still.
- [x] Sample plates on Zurich raclette rec (`plate-zurich-*.jpg`, SQL **013**). Edit rec can add/replace plates after publish.
- [x] Raclette rec blurb stands alone (SQL **014**) — transit stays on the plan.
- [x] Rec page shows all photos; edit rec hero + delete rec; layover stop reorder/drop + delete day (recs stay)
- [x] Rec photos: up to **3**. Picker: **Add photos (max 3)**, gallery multi-select. Same on notes. Tap hero = city tile + rec top. No pic → Lumen still. Get this = names only.
- [x] Edit rec: Save at the bottom (city/name/blurb) then back to the rec. Photos and Get this plates save as you go. Rename or X a plate.
- [x] SQL **011** — global $20 RPC, city-hero column, generate-on-publish flag, city-open quota. **Live** (spend RPC probed 2026-08-26).
- [x] SQL **016** `place_photos` — **live**. Dump/AI still now write the album too.
- [x] Founder-test pack (2026-08-26): labeled place vs dish; no drafts on dashboard; mine-only Edit; stop-set + place-id dedup; day blurb from dump; city-open copy only when new; one Save on edit day + redirect; Google button (needs John’s OAuth client). Retest `FOUNDER-TEST.md`.
- [x] Chrome + dashboard (Lumen/Sofia 2026-08-27): sign-in → `/dashboard` (not `/admin`). Header: Layover · Share your intel · Cities · **profile icon**. Dropdown: **Profile** (name/photo), **Your recs**, Admin if admin, Log out. Title **Your recommendations**. Cards: still, posted date, **city** bold. Full days vs Recs.
- [x] Playwright E2E (`apps/web/e2e`, `npm run test:e2e`) — **Milo owns.** Fake user clicks browse, login, rec photos/zoom, Save, delete rec, layover day. Does **not** call xAI. Google OAuth still human. Theo reviews.
- [x] Hygiene (2026-08-27): deleted `sellPlaceBlurb` + dead twins; album errors no longer swallowed; hotel gate on stop text; Playwright reorder Save + X photo. **SQL 017** locks `lumen_set_city_hero` (John pastes in SQL Editor).
- [x] Phase 3 start: like recs + days, comments on days, byline. Playwright `e2e/social.spec.ts`. **SQL 018** (John pastes).
- [x] Comments on recs too. Edit own note. Up to 3 photos. **SQL 019** (John pastes after 018). Dump/edit/photos still frozen.
- [x] Lumen reads notes + comment photos before they go live (`grok-4.3`, spend on the $20). Word filter first. Off/over cap → note does not go up.
- [x] Public author page `/u/[id]`. Name + photo. Posted by links. Likes = count. SQL **020**. Follow still out.
- [x] **Phase 3 complete** (2026-08-31). John clicked it. Theo/Milo review: ship with nits. Dump / rec edit / rec photos stay as they are.
- [x] SQL **021** wipe demo intel (recs/days/notes/likes/photos/dump logs). Keeps accounts, cities, zones, site_settings. John pastes once. Do not re-run 003/005/006/013–015 after. Playwright seed paths skip on 404.
- [x] Share cards (Open Graph + Twitter) on public pages — `lib/share-card.ts`. Homepage hero; city hero; rec still + blurb; layover narrative. Absolute image URLs via `NEXT_PUBLIC_SITE_URL`. Not a sitemap / Search Console.

## Session checklist for agents

1. Read `AGENTS.md` + this file (+ `docs/STACK.md` before infra/auth work).
2. Confirm current phase with owner if doing implementation. Phase 2, 3, and 4 are **done**. Dump / rec edit / rec photos stay as they are. Next rec is a **public URL** (parked Vercel), not Phase 5. Not Stripe until John says.
3. Touch only the feature folder + its spec + this map.
4. End of session: MAP and feature spec reflect reality. Prefer “unknown / not built” over inventing.

## Vision doc set (CEO must know)

| Doc | Topic |
|-----|--------|
| `docs/PRODUCT.md` | What / why / non-goals |
| `docs/SECURITY.md` | Zones not hotels |
| `docs/ROLES.md` | user / sponsor / admin |
| `docs/OPS.md` | Money, AI cost, metrics |
| `docs/STACK.md` | Tech + cost + human setup |
| `docs/ORG.md` | Shareholder / CEO / engineer |
| `features/*` | Per-feature acceptance |
| `docs/board/*` | Brief + decisions + gates |
