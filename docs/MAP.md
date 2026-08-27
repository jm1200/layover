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
| **2 — Cities, zones, places, playbooks** | **Complete** | Content model + public browse + forms. Migrations 002–004 (+ seeds 003, 005, 006; stop timing 007). Gate in `PRE-PHASE-2-GATE.md` is met. |
| **2.1 — Verify + harden** | **Complete** | Homepage + city/place/plan UI in (heroes, Eat/Do/Buy, full layover). RLS smoke: `docs/board/RLS-SMOKE.md`. **Parked (not blockers):** admin city form (SQL), Vercel deploy, photo upload (Phase 4). |
| 3 — Social | Not started | **Waits until after Lumen** (supply first). Not skipped, not started. Thin cut later: like + comment + byline. Follow-notifications / completion / QR **out**. |
| 4 — AI story import | **In progress — close it** | Founder test **filed** (7 items, 2026-08-26). Product re-locked in the brief. Not passed. Freeze dump/edit/photos after the fix pack + retest. Do not start Phase 3/5. |
| 5 — Sponsorship + Stripe | Not started | self-serve labeled ads |
| 6 — Metrics + admin moderation | Not started | money/trust dashboard |
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
| Social | `features/social.md` | `.../social/` | Auth, content | 3 — **after Phase 4**; not started |
| AI import | `features/ai-import.md` | `apps/web/src/features/ai-import/` | Playbooks, Auth, OPS quotas | 4 **in progress** |
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
Like / Comment / Follow                      — Phase 3
SponsorProfile / Campaign / Placement        — Phase 5
AiImportLog                                  — Phase 4
ModerationAction / MetricSnapshot            — Phase 6
```

## Routes

| Path | Audience | Purpose | Status |
|------|----------|---------|--------|
| `/` | Public | Layover Intel; collage + tappable Eat/Do/Buy + city search | Phase 2 |
| `/login` | Public | Email + Google. | Phase 1 |
| `/dashboard` | User | **Yours** — this user’s published recs and days. Header is the same as the rest of the site. | Phase 4 |
| `/sponsor` | Sponsor | Campaigns, billing, creatives | Phase 1 stub |
| `/admin` | Admin | Kill switch + Lumen log (last 50). Full queue is Phase 6 | Phase 4 slice |
| `/cities` | Public | City list | Phase 2 |
| `/cities/[slug]` | Public | Dark hero · Eat/Do/Buy preview (top 3) · full layover below | Phase 2 |
| `/cities/[slug]/eat` `/do` `/buy` | Public | Full list for one verb | Phase 2 |
| `/cities/[slug]/layovers` | Public | All sequenced days | Phase 2 |
| `/playbooks/[id]` | Public | Playbook detail | Phase 2 |
| `/places/[id]` | Public | Place + dishes | Phase 2 |
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
- [x] Homepage + city/place/plan UI (2.1)
- [ ] Deployed site — optional Vercel later
- [ ] Admin city form — parked (SQL)
- [x] Phase 4 dump → draft (`/share`, `features/ai-import/`) — needs key + SQL 008
- [x] Lumen may open a city (SQL **009** `lumen_ensure_city`) — name + IATA, default zones
- [x] Review: places first, then plan; upload or skip → still on publish (SQL **010**, bucket `place-stills`)
- [x] Publish layover also publishes its recs; city layover cards use rec stills
- [x] **Dedup itineraries** — code matches title or stop set. **Lock 2026-08-26:** stop set is the match.
- [ ] Phase 4 founder test pass — filed 7 items 2026-08-26; retest after pack (`docs/board/FOUNDER-TEST.md`)
- [x] Theo/Milo review of `features/ai-import/` (team meeting 2026-08-25) + follow-up pack
- [ ] Restore daily 3-draft cap (`DAILY_EXTRACT_CAP`) — parked 2026-08-25, later phase
- [x] BCN city hero (`public/landing/hero-barcelona.jpg` + `CITY_HERO.barcelona`)
- [x] `/cities` as hero cards (not a phone book); search hint lists live IATA codes
- [x] Lumen live baseline (`agents/lumen.md` + `.grok/agents/lumen.md`)
- [x] `/admin` shows Lumen’s log (last 50 + month spend). Not Phase 6.
- [x] User photo upload: compress (no 2 MB cap as homework); 4:5 card preview; no silent AI reframe
- [x] Up to 3 plate photos per Eat/Buy rec (SQL **012**). City cards stay one still.
- [x] Sample plates on Zurich raclette rec (`plate-zurich-*.jpg`, SQL **013**). Edit rec can add/replace plates after publish.
- [x] Raclette rec blurb stands alone (SQL **014**) — transit stays on the plan.
- [x] Rec page shows all photos; edit rec hero + delete rec; layover stop reorder/drop + delete day (recs stay)
- [x] Rec photos: up to **3** of the rec (anything). Tap hero = city tile + rec top. No pic → Lumen still. Get this = names only.
- [x] Edit rec: Save at the bottom (city/name/blurb) then back to the rec. Photos and Get this plates save as you go. Rename or X a plate.
- [x] SQL **011** — global $20 RPC, city-hero column, generate-on-publish flag, city-open quota. **Live** (spend RPC probed 2026-08-26).
- [x] SQL **016** `place_photos` — **live**. Dump/AI still now write the album too.
- [x] Founder-test pack (2026-08-26): labeled place vs dish; no drafts on dashboard; mine-only Edit; stop-set + place-id dedup; day blurb from dump; city-open copy only when new; one Save on edit day + redirect; Google button (needs John’s OAuth client). Retest `FOUNDER-TEST.md`.
- [x] One site chrome (Lumen 2026-08-26): Layover · Share your intel · Cities · You · Sign out. Dashboard is **Yours**. Manual forms are a quiet line. Admin under You.

## Session checklist for agents

1. Read `AGENTS.md` + this file (+ `docs/STACK.md` before infra/auth work).
2. Confirm current phase with owner if doing implementation. Phase 2 is **done**. Phase 4 is in progress.
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
