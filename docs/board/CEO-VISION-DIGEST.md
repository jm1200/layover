# CEO vision digest

*For CEO sessions. Not the shareholder primary read — use `SHAREHOLDER-BRIEF.md` for that.*  
*Last full re-read: 2026-08-04 · Status pass: pre–Phase 2 org gate*

## Product

**Layover** = high-trust layover playbooks for flight crew (travelers secondary). Core unit is an ordered **playbook** (story itinerary: places, dishes, free-text activities in stops, transit/gear). City pages show two rails: **organic crew staples** (primary) and **fresh/sponsored ideas** (clearly labeled — Phase 5). Quality bar: Zurich 22h float → climb → specific menu items, zone-safe logistics.

Non-goals near term: native apps, crew-hotel maps, open-ended AI travel chat, unsupervised site rewrites, DMs/heavy gamification.

## Trust rails (priority #1)

Trust beats revenue. Organic staples never for sale. Sponsored must look sponsored (“New idea…” OK; fake crew reviews not). Caps so pages are not billboards.

## Security (non-negotiable)

Public web: **zones only** — `airport_strip`, `downtown`, `station`, `other`. Never crew hotel names, airline hotel lists, or “out the door of [hotel].” Forms/AI have no public hotel field; hotel mentions → rewrite to zone + warn. Crew-only precision = Phase 7 only, light verification, no biometrics. Sponsors cannot target by crew hotel/airline lodging.

## Roles

One auth: **`user` | `sponsor` | `admin`**. Server-enforced. Sponsor self-serve path is the hands-off money path. Admin = moderate, metrics, kill switches, refunds — not hand-placing every ad or staple.

## Money path

Content density (cities + playbooks) → self-serve Stripe campaigns (city new-ideas rail, caps, aggregate metrics only) → low operator load. Cold start = seed real crew stories in staple cities (Zurich + Delhi first). AI is a **contribution unlock**, not first revenue.

## AI limits

xAI server-side only (`XAI_API_KEY`, `api.x.ai`). Story → structured **draft** → user confirms. Auth required, length cap, daily quota, one-shot extract, `AiImportLog`, admin kill switch, monthly budget awareness. No client keys, no auto-publish, no unbounded chat billed to owner. **Phase 4 only.**

## Stack (locked)

Next.js App Router + TS (`apps/web`) · Vercel (when public) · Supabase (Postgres + Auth) · Stripe Phase 5 · xAI Phase 4. Free tiers first. Shareholder owns cloud accounts.

## Org

Shareholder (veto) → **CEO agent** (strategy/docs/board) → **Chief Engineer** (code/feasibility). CEO never implements `apps/`. Default chat = engineer.

## Phase order (do not jump)

| Phase | What | Status |
|-------|------|--------|
| 0 / 0.1 / 0.2 | Docs, org, stack documented | **Done** |
| **1** | Auth + roles + stub dashboards + fix pack | **Done / live** |
| **2** | Cities, zones, places, dishes, playbooks + seed | **Pending shareholder yes** |
| 3 | Social | Not started |
| 4 | AI import | Not started |
| 5 | Sponsorship + Stripe | Not started |
| 6 | Metrics + admin depth | Not started |
| 7 | Crew-only precision (optional) | Not started |

**Phase 2 gate:** `docs/board/PRE-PHASE-2-GATE.md`. Events entity and separate Activity table are **out** of Phase 2.

## Goals (priority)

1. Crew trust  
2. Hands-off labeled sponsor revenue  
3. Crew utility (playbooks / staples / zone logistics)  
4. Low operator load  
5. Manageable engineering (small phases, MAP honest)
