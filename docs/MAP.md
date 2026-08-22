# MAP.md — Feature map and repo layout

**Purpose:** Single map of the territory so agents do not invent structure or forget where things live.  
**Update this file** whenever features, folders, or phase status change.

## Current phase

| Phase | Status | Notes |
|-------|--------|--------|
| **0 — Baseline docs** | **Complete** | Product brain in `docs/` + `features/` |
| **0.1 — Org / CEO** | **Complete** | Shareholder → CEO agent → Chief Engineer; see `docs/ORG.md`, `.grok/agents/ceo.md` |
| **0.2 — Stack lock** | **Approved** | Next.js + Supabase + Vercel + Stripe later + xAI later — `docs/STACK.md` |
| **1 — Auth + roles** | **Complete + hardened** | Live signup/login + roles; fix pack + second review cleanups |
| **1.1 — Pre–Phase 2 gate** | **Complete** | Docs/MAP honesty + `PRE-PHASE-2-GATE.md`; code re-reviewed |
| **2 — Cities, zones, places, playbooks** | **Code + Important fixes** | Harden pack in app; run migrations 002–**004** |
| **2.1 — Verify + harden** | **Code done; city IA shipped; smoke pending** | Fixes shipped; RLS smoke: `docs/board/RLS-SMOKE.md`. City page: **Full layover · Eat · Do · Buy**. Object: **layover plan**. Homepage: intel + Eat/Do/Buy cards + **The perfect layover** subsection. |
| 3 — Social | Not started | after 2.1 green; like, comment, follow |
| 4 — AI story import | Not started | draft + quotas |
| 5 — Sponsorship + Stripe | Not started | self-serve labeled ads |
| 6 — Metrics + admin moderation | Not started | money/trust dashboard |
| 7 — Crew-only precision | Not started | optional; after verification story |

**Before Phase 2 code:** read `docs/board/PRE-PHASE-2-GATE.md`. Do not invent scope beyond Board #2 locks.

## Target repository layout

```text
layover/
  AGENTS.md
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
| Places & zones | `features/places-and-zones.md` | `apps/web/src/features/places/` | Auth (for write) | 2 **code** |
| Playbooks | `features/playbooks.md` | `apps/web/src/features/playbooks/` | Places, Auth | 2 **code** |
| Social | `features/social.md` | `.../social/` | Auth, content | 3 |
| AI import | `features/ai-import.md` | `.../ai-import/` | Playbooks, Auth, OPS quotas | 4 |
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
| `/` | Public | Eat/Do/Buy photo ideas + “Where are you headed?” city search | Phase 2 |
| `/login` | Public | Auth | Phase 1 |
| `/dashboard` | User | Profile, drafts, following | Phase 1 stub |
| `/sponsor` | Sponsor | Campaigns, billing, creatives | Phase 1 stub |
| `/admin` | Admin | Moderation, metrics, kill switches | Phase 1 stub |
| `/cities` | Public | City list | Phase 2 |
| `/cities/[slug]` | Public | **Full layover · Eat · Do · Buy** (text lists; photo grid parked) | Phase 2 |
| `/playbooks/[id]` | Public | Playbook detail | Phase 2 |
| `/places/[id]` | Public | Place + dishes | Phase 2 |
| `/dashboard/places/new` | Auth | Create place | Phase 2 |
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
- [x] `.grok/agents/ceo.md`, skills `ceo` / `board-meeting`
- [x] Application code — `apps/web` Phase 1 auth shell + fix pack
- [x] Migration — `001_profiles.sql` (shareholder runs in Supabase)
- [x] Phase 2 app code — places + playbooks features, public routes, forms
- [x] Migrations `002`, `003`, `004_phase2_harden.sql` (shareholder runs in Supabase)
- [x] Phase 2.1 Important fix pack (zone/city, stop city, admin city insert, partial writes)
- [ ] Deployed site — optional Vercel later

## Session checklist for agents

1. Read `AGENTS.md` + this file (+ `docs/STACK.md` before infra/auth work).
2. Confirm current phase with owner if doing implementation. Phase 2 → also `docs/board/PRE-PHASE-2-GATE.md` + shareholder yes.
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
