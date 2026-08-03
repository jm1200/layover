# Pre–Phase 2 gate (agent-facing)

**Purpose:** Stop hallucination and scope inventing before content code starts.  
**Audience:** Chief Engineer + any agent. Shareholder reads `SHAREHOLDER-BRIEF.md` only.

## Hard rules

1. **Do not start Phase 2 code** until shareholder has said **yes** to Phase 2 (check `docs/board/SHAREHOLDER-BRIEF.md` + latest `CEO-LOG.md`).
2. **One primary feature cut** — cities/zones/places/dishes/playbooks only. No social, AI, Stripe, metrics depth, crew-only.
3. **MAP is truth for “what exists.”** If code and MAP disagree, fix MAP or flag — do not invent a shipped product.
4. **Specs beat chat memory.** Implement from `features/places-and-zones.md` + `features/playbooks.md` + this gate + Board #2 locks below.
5. **SECURITY non-negotiable:** zones only on public web; no crew hotel fields; seed copy zone-safe (`docs/SECURITY.md`).

## What must already be true (Phase 1)

| Check | Source of truth |
|-------|-----------------|
| Auth + roles live; admin works | `docs/MAP.md` Phase 1 = Complete; `features/auth.md` |
| Auth fix pack + second review cleanups shipped | `docs/board/CEO-LOG.md` 2026-08-04 |
| Stack locked | `docs/STACK.md` — Next.js + Supabase + Vercel later + Stripe P5 + xAI P4 |
| No Phase 2 tables/routes claimed done unless MAP says so | `docs/MAP.md` |

## Board Meeting #2 locks (Phase 2 scope — do not reopen in code)

| Decision | Locked |
|----------|--------|
| Milestone | **Phase 2 only** |
| Schema | Thin tables; playbook stop = optional `place_id` + free-text note/activity |
| **Activity entity** | **No** separate table unless free later |
| **Dishes** | **In** (simple child of place) |
| **Events** | **Out** this cut (nice-to-have later) |
| Draft/publish | Published = public; draft = author only |
| RLS | Public read published; auth write own; admin all — **test matrix required** |
| Seed | **Zurich + Delhi**, 1–2 playbooks each (after CRUD) |
| Social / AI / Stripe | **No** |
| Vercel | Not required for Phase 2 done |
| Theme/design polish | Discuss at start of Phase 2 (real content UI), not a standalone art phase |

## What MAP must say before / during Phase 2

Before coding starts:

- [ ] Phase 2 status: **In progress** (only after shareholder yes) or remains **Not started**
- [ ] Feature index still points at `features/places-and-zones.md` and `features/playbooks.md`
- [ ] “What exists on disk” does not claim content tables until they exist

When Phase 2 ships a slice, same session:

- [ ] MAP phase notes updated (schema migrations, routes, seed)
- [ ] Feature acceptance checkboxes match reality
- [ ] Routes table updated if public paths land

## Session discipline (agents)

1. Read `AGENTS.md` → `docs/MAP.md` → this file → the **one** feature spec you touch.
2. Touch **one** vertical slice per change set (`places/` or `playbooks/`, plus migrations if needed).
3. Do **not** add Activity/Event tables, social, AI, or Stripe “while you’re in there.”
4. Do **not** invent hotel name fields or airline lodging lists.
5. End of session: MAP + feature spec reflect what you built.

## Definition of Phase 2 done (acceptance intent)

- Cities (slug), zones per city, places, dishes, playbooks + ordered stops
- Public browse for published content; authors edit own drafts/published; admin can moderate
- RLS tested (public / author / admin)
- Seed Zurich + Delhi with 1–2 zone-safe playbooks each
- Auth fix pack already in (pre-content gate — **done** as of 2026-08-04)

## Explicit non-goals (this cut)

- Like/comment/follow  
- AI story import  
- Stripe / sponsor campaigns  
- Full metrics product  
- Events entity  
- Separate Activity entity  
- Crew-only / hotel precision  
- Production hard launch requirements beyond local (+ optional Vercel later)

## If unsure

Prefer the **smaller** change. Prefer **zone** over hotel. Prefer **labeled Sponsored** later over blending. Ask shareholder only for product forks; do not invent scope from product north-star examples that exceed this cut.
