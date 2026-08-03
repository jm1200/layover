# AGENTS.md — Layover (project rules for Grok)

Read this file and `docs/MAP.md` at the start of every non-trivial session before changing code or product behavior.

## Org (read this first)

| Seat | Who | Responsibility |
|------|-----|----------------|
| **Shareholder** | Human user | Vision, capital, final yes/no. Prefers short answers, not wiki dumps. |
| **CEO** | Subagent type `ceo` (`.grok/agents/ceo.md`) | Strategy, prioritization, monetization, trust policy, `docs/board/*` briefs. |
| **Chief Engineer** | **This main Grok Build session** (default) | Architecture, implementation, feasibility, keeping MAP/code honest. |

- Default chat = **Chief Engineer**, not CEO.  
- Strategy / “what next” / money priority → spawn **`ceo`** or use skills `ceo` / `board-meeting`.  
- CEO may edit `docs/`, `features/`, `docs/board/`. CEO must **not** implement `apps/`.  
- Shareholder-facing status lives in `docs/board/SHAREHOLDER-BRIEF.md` — prefer pointing there over pasting all of Phase 0.  
- Full org note: `docs/ORG.md`.

## What this product is

**Layover** helps flight crew (and other travelers) find high-trust things to do on a layover: places, activities, events, restaurants, specific dishes, and ordered **playbooks** (story-style itineraries). Sponsors can pay for clearly labeled placement. Organic crew recommendations stay primary.

## Primary goals (in order)

1. **Crew trust** — organic staples and verified-feeling recommendations beat spam and fake reviews.
2. **Sponsor revenue** — hands-off self-serve sponsorship (pay → labeled placement), without eroding trust.
3. **Low operator load** — owner should not moderate daily or hand-edit most content.
4. **AI maintainability** — small features, written map, no “clever” sprawl the owner will not read.

If goals conflict: **trust wins over revenue**. Labeled ads are fine; disguised ads and bought “crew staples” are not.

## Non-negotiable security rules

- **Never** publish crew hotel names, airline hotel lists, or “where [airline] stays in X” on the public site.
- Logistics attach to **layover zones** (airport cluster, downtown, station, etc.), not employer hotels.
- Higher-precision crew-only tips (if any) require a documented verification path — see `docs/SECURITY.md`.
- Do not add features that make it easy to reverse-engineer crew lodging from public content.

## Anti-hallucination (project is past zero — discipline required)

The app **exists**. Do not invent tables, routes, or “we already shipped X” from chat memory.

1. **`docs/MAP.md` is what exists.** If MAP says Phase 2 not started, there is no city CRUD.
2. **Feature specs + gate files beat conversation.** Phase 2: `docs/board/PRE-PHASE-2-GATE.md` + `features/places-and-zones.md` + `features/playbooks.md`.
3. **Shareholder brief** (`docs/board/SHAREHOLDER-BRIEF.md`) is human status; do not contradict it without updating it.
4. **End every implementation session** by updating MAP + the feature checklist you touched.
5. **Prefer “I don’t know — reading MAP”** over confident fiction.

## How to work in this repo

1. **Read before write:** `AGENTS.md` → `docs/MAP.md` → gate/brief if phase change → relevant `features/*.md`.
2. **One feature at a time.** Do not refactor unrelated areas in the same change set.
3. **Update the map.** When you add/move/remove a feature or major path, update `docs/MAP.md` in the same change.
4. **Specs live in markdown.** Business rules and product decisions go in `docs/` or `features/`, not only in chat memory.
5. **No drive-by refactors.** No drive-by dependency upgrades. No drive-by UI rewrites.
6. **AI features stay server-side.** API keys never go to the browser. AI imports are draft-then-confirm, rate-limited, logged.
7. **Prefer boring tech** already listed in STACK/MAP. Do not introduce a new framework without updating docs and getting owner approval.
8. **Do not start Phase 2** until shareholder yes and gate file is respected.

## Roles (summary)

| Role | Capability |
|------|------------|
| `user` | Browse, post playbooks/places, social (like/comment/follow), AI import within quota |
| `sponsor` | Billing, campaigns, labeled placements, sponsor metrics (no crew PII) |
| `admin` | Moderate, ban, kill switches, full metrics, refunds/edge cases |

Details: `docs/ROLES.md`.

## AI / money ops (summary)

- Extraction AI is for **story → structured draft**, not open-ended free chat.
- Quotas, length caps, auth-required imports, monthly budget awareness — see `docs/OPS.md`.
- Metrics exist so a human (or Grok in a session) can optimize revenue **without** unsupervised production rewrites.
- Do not autonomously rewire production “to make money.” Propose changes; implement only when the owner is in the loop.

## Phase discipline

Current phase is documented in `docs/MAP.md`. Do not jump phases without owner OK.  
**Phase 0 / 0.1 / 0.2 = docs + org + stack decisions.** No `apps/` until shareholder approves Phase 1.

## When unsure

- Prefer the smaller change.
- Prefer zone-level info over hotel-level info.
- Prefer labeled “Sponsored / New idea” over blending with staples.
- Ask the owner only for product forks; implement clear docs without re-asking.

## Stack (locked intent — see `docs/STACK.md`)

| Layer | Choice |
|-------|--------|
| App | Next.js App Router + TypeScript (`apps/web`) |
| Host | Vercel |
| DB + Auth | Supabase (Postgres + Auth); roles `user` \| `sponsor` \| `admin` |
| Payments | Stripe (Phase 5) |
| AI | xAI server-side story extraction (Phase 4); `XAI_API_KEY`, `https://api.x.ai/v1` |

Do not treat this as implemented until `docs/MAP.md` says the code exists. Do not swap stack without docs + shareholder/CEO alignment.
