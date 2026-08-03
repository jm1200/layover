# CEO log

Append-only decisions and board outcomes. Newest first.

---

## 2026-08-04 — Important fix pack implemented (Phase 2.1 code)

Shareholder: “fix important items.”

| # | Fix | How |
|---|-----|-----|
| 1 | Zone ∈ city | UI filters zones by city; server `assertZoneInCity` |
| 2 | Stop place ∈ city | UI filters places; server `assertPlaceInCity` |
| 3 | City/zone insert admin-only | Migration **004** drops open insert policies |
| 4 | RLS matrix | Checklist `docs/board/RLS-SMOKE.md` (human runs) |
| 5 | Partial writes | Dish/stop failure deletes parent create |
| 6 | Free-text hotels | Unchanged residual (accepted) |

Also: non-admin cannot set `hidden` via RLS WITH CHECK; stop slots aligned to 4.

**Human:** run **004** (and 002/003 if missing).

---

## 2026-08-04 — Board Meeting #3 CLOSED

**Proposal:** Phase 2.1 verify + harden first; Phase 3 Social only after green; no Phase 4/5 yet.

**Code review #2 (Phase 2):** **Ship with fixes.** No clear Critical. Important (must before Phase 2 “done” / Phase 3):

1. Zone must belong to selected city (UI filter + server validate)  
2. Playbook stop `place_id` must match playbook city  
3. `cities` / `zones` insert: **admin only**  
4. RLS matrix documented as run (ops / live Supabase smoke)  
5. Partial writes (dish fail silent; playbook stops fail leaves orphan)  
6. Free-text hotel residual accepted (forms warn only)

**Scope check:** No Phase 3–5 creep. Seed zone-safe. Hotel fields: pass.

**Engineer feasibility:** Phase 2.1 **FEASIBLE** (S–M for code Important 1–3 + 5; RLS matrix = human/eng smoke). Phase 3 after 2.1 green: FEASIBLE. Money-now **rejected** — no inventory density.

### Decisions locked

| Item | Decision |
|------|----------|
| Milestone | **Phase 2.1 — verify + harden** |
| Phase 3 / 4 / 5 | **Closed** until 2.1 green |
| Next build after green | **Phase 3 Social** (not Stripe first) |
| Stretch | Seed polish ZRH/DEL only if green — not new cities |
| Hotel free-text | Residual accepted; warn UX only this cut |

**Shareholder ask:** Yes on Phase 2.1; run SQL 002→003 if needed; smoke Zurich/Delhi.

**Status:** Board closed. Engineering implements fix pack; no Social until ship + RLS smoke green.

---

## 2026-08-04 — Phase 2 approved and implemented (code)

**Shareholder:** Yes on Phase 2.

**Shipped in app:** cities/zones/places/dishes/playbooks schema (002), Zurich+Delhi seed (003), public browse, auth create/edit, zone warnings on forms. No social/AI/Stripe/Events.

**Human remaining:** run 002 + 003 in Supabase SQL Editor; then verify `/cities`.

---

## 2026-08-04 — Second code review + cleanup (pre–Phase 2)

**Verdict:** Prior 5 review holes remain fixed. Residual Important items cleaned by engineer: middleware fail-closed without env; cookies forwarded on login redirect; safer `safeNextPath`; remove dead `getSessionUser`; `asRole` in callback; signup/login suspended alignment.

**Phase 1:** Ship complete. **Phase 2:** still blocked on shareholder yes. Org gate + anti-hallucination rules in AGENTS/MAP stand.

---

## 2026-08-04 — Pre–Phase 2 organization gate

**Ask:** Project is getting significant; hallucinations/forgetfulness risk rising. Org + on-target check **before** Phase 2 code.

### Assessment: are docs still single source of truth?

**Mostly yes for product intent; partly no for phase reality.** Control plane still works: MAP → docs → features → board. Vision (trust, zones-not-hotels, labeled sponsors, phase order) is coherent across PRODUCT / SECURITY / ROLES / OPS / AGENTS.

**Drift found (would make agents invent wrong world):**

| Doc | Problem |
|-----|---------|
| `README.md` | Still said Phase 0 / no app |
| `docs/board/CEO-VISION-DIGEST.md` | Still “Nothing is live / Phase 1 blocked” |
| `docs/STACK.md` | Header still “gates Phase 1 if not yet given” |
| `docs/MAP.md` | Layout notes “to be created in Phase 1”; Activity/Event listed without Board #2 cut |
| `features/places-and-zones.md` | Acceptance still required activities + events |
| `features/playbooks.md` | Stops still referenced activity/event entities |
| `SHAREHOLDER-BRIEF.md` (pre-this entry) | Still listed auth fix pack as next engineering step after pack shipped |

**Not drift (OK):** PRODUCT north-star still describes Activity/Event as product concepts for later; SECURITY/ROLES/OPS trust rules solid. Feature stubs for Phases 3–6 intentionally thin.

### Decision / action

1. **Gate before Phase 2 code:** `docs/board/PRE-PHASE-2-GATE.md` — agent-facing: shareholder yes required, Board #2 locks, MAP honesty, one feature at a time, non-goals.  
2. Align Phase 2 feature specs + MAP + STACK status + vision digest + brief with **Phase 1 hardened, Phase 2 pending yes**.  
3. **Do not start `apps/` Phase 2** until shareholder yes.

### Recommendation to shareholder

Approve Phase 2 only after (or with) this org gate closed. Scope unchanged from Board #2. Auth fix pack already shipped — not a re-gate.

**Status:** Org gate written; brief updated; Phase 2 still **blocked on shareholder yes**.

---

## 2026-08-04 — Phase 1 auth fix pack shipped

Shareholder asked to plug review holes before Phase 2. Shipped: safe callback `next`, fail-closed `getProfile` on DB error, suspended panel + sign-out, stable login error codes, middleware gate on `/dashboard` `/sponsor` `/admin`. Theme/design: discuss at start of Phase 2 (real content UI), not a standalone pre-content art phase.

---

## 2026-08-04 — Board Meeting #2 CLOSED (pending shareholder yes/no)

**Proposal:** Phase 2 — cities, zones, places, dishes, playbooks + seed Zurich & Delhi. No social / AI / Stripe.

**Engineer feasibility:** FEASIBLE. Tight scope accepted.

| Decision | Locked |
|----------|--------|
| Milestone | **Phase 2 only** |
| Schema | Thin tables; stop = optional `place_id` + free-text note/activity (no separate Activity entity unless free) |
| Dishes | **In** (simple child of place) |
| Events | **Out** (nice-to-have later) |
| Draft/publish | Published = public; draft = author only |
| RLS | Public read published; auth write own; admin all — test matrix required |
| Seed | Zurich + Delhi, 1–2 playbooks each (SQL or seed script after CRUD) |
| Effort | **M** — prefer 2 sessions: (1) schema+RLS+browse (2) forms+seed |
| Social / AI / Stripe | **No** this cut |
| Vercel | Not required for Phase 2 done |

**Code review (Phase 1):** Verdict **ship with fixes**. Pre-Phase-2 / first-PR fix pack is a **gate** before content-rich public:

1. CRITICAL — sanitize `next` on auth callback (open redirect)  
2. IMPORTANT — getProfile fail-closed on DB error  
3. IMPORTANT — sign-out on suspended screens  
4. IMPORTANT — stable error codes on callback (no raw Supabase msgs in URL)  
5. Shared layout/middleware guards for auth routes  

**Security reminder:** Zones only; no public hotel fields; seed copy zone-safe.

**Shareholder ask:** Yes/no on Phase 2 + fix pack as above.

**Status:** Proposal final. **Implementation blocked until shareholder approves.** Board brief updated.

---

## 2026-08-04 — Phase 1 complete (live)

Shareholder confirmed admin login works on local app + Supabase. Phase 1 acceptance closed. Optional later: Vercel public URL, service_role key, re-enable email confirm for production. Next build = Phase 2 (cities/zones/playbooks) when shareholder says go.

---

## 2026-08-04 — Shareholder approved Phase 1 + stack

**Decisions:**

1. **Yes** — Phase 1 (app shell + auth + three roles + stub dashboards)  
2. **Yes** — Stack: Next.js + Supabase + Vercel + Stripe (Phase 5) + xAI (Phase 4)

**Next:** Chief Engineer implements Phase 1. Shareholder: `docs/board/HUMAN-SETUP.md`.

---

## 2026-08-04 — Vision re-read complete

**Task:** Full CEO re-ingest of PRODUCT, SECURITY, ROLES, OPS, STACK, ORG, MAP, board, AGENTS, all `features/*`, `.grok/agents/ceo.md`.

**Answers for shareholder:**

1. **Did Phase 0 need updates after discussions?** Yes — already done in the earlier “Phase 0 sync” pass (`STACK.md`, MAP 0.2, auth/ROLES/OPS/PRODUCT/AGENTS alignment). This session **verified** that pass; no further Phase 0 rewrites required for strategy.
2. **Does CEO understand the vision?** Yes. Written proof: `docs/board/CEO-VISION-DIGEST.md` (product, trust rails, zones, roles, money, AI limits, stack, org, phase order).

**Remaining gaps (non-blocking):**

- Feature specs for Phases 2–6 stay intentionally thin until those phases open — OK.
- Cold-start seeding (which cities / how many stories) not a formal product section — soft gap for later content planning, not Phase 1.
- Placement caps and AI quota **numbers** deferred to Phase 4–5 implement — correct.
- No material contradictions between docs after the sync pass.

**Blocked on:** Shareholder yes/no for **Phase 1 + stack**.

**Status:** Phase 0 closed for vision/docs. Implementation still not started.

---

## 2026-08-04 — Phase 0 sync (docs catch-up)

**Issue:** Stack/org decisions lived in board brief + chat, but Phase 0 core files still said “Postgres TBD / Auth TBD.”

**Fix (Chief Engineer, CEO to re-verify vision):**

- Added `docs/STACK.md` (Next.js, Supabase, Vercel, Stripe, xAI, cost, human setup)
- Updated `AGENTS.md`, `docs/MAP.md` (phase 0.2), `features/auth.md`, `docs/ROLES.md`, `docs/PRODUCT.md`, `docs/OPS.md`, `README.md`, CEO agent read list
- CEO tasked with full vision re-read + gap report for shareholder

**Status:** Phase 0 documentation aligned with discussion. Phase 1 still needs shareholder yes.

---

## 2026-08-04 — Stack recommendation (money + operator load)

**Ask:** Supabase + Next.js confirmed useful; is Vercel easiest? Expensive convenience? Full Phase 1–5 stack pass.

| Layer | Decision | Rationale |
|-------|----------|-----------|
| Host | **Vercel** | Best solo DX for Next.js; free Hobby until real traffic |
| DB + Auth | **Supabase** | Matches Board #1; one vendor vs Auth.js + Neon glue |
| Payments | **Stripe** (Phase 5) | Self-serve; no card storage |
| AI | **xAI** server-side (Phase 4) | Extraction only + quotas |
| App | Next.js App Router + TS | Unchanged |

**Optimize for:** speed to working product + hands-off ops. **Not** cheapest infra at zero users.

**Overpaying for convenience?** **No** at this stage. Vercel/Supabase free tiers cover Phase 1–5 pre-revenue. Convenience tax becomes real only with high serverless/bandwidth or paid Pro without revenue — then consider Fly/Railway/self-host Postgres. Do **not** optimize that now.

**Leave free tiers when:** sponsors pay and/or free limits hurt reliability; enable paid Supabase/Vercel only when needed. Stripe % is cost of revenue. AI: hard monthly cap when Phase 4 ships.

**Shareholder ask:** Yes/no on this stack + existing Phase 1 yes/no. Engineer may push feasibility after.

**Status:** CEO recommendation locked in brief. Implementation still blocked until shareholder approves Phase 1 (+ stack).

---

## 2026-08-04 — Board Meeting #1 CLOSED (pending shareholder yes/no)

**Outcome (CEO + Chief Engineer aligned):**

| Item | Decision |
|------|----------|
| Milestone | **Phase 1 only** — app shell + auth + three roles |
| Combine Phase 1+2? | **No** |
| AI / Stripe / content CRUD | **Out of scope** this cut |
| Auth/DB default | **Supabase Auth + Supabase Postgres** (role on app `users` / `profiles` synced from `auth.uid`) |
| Alt if shareholder objects | Auth.js + Neon |
| Effort | S–M: ~1 focused session; 2 if provider friction |
| Stretch allowed | Admin role-switcher for testing |
| Stretch rejected for Phase 1 | Static city page → start of Phase 2, not Phase 1 |

**Must-haves unchanged:** Next.js `apps/web`, signup/login/logout, server-enforced `user` \| `sponsor` \| `admin`, stubs `/dashboard` `/sponsor` `/admin`, public `/`, document provider in `features/auth.md`, secrets in `.env` only.

**Engineer risks to watch:** commit hygiene for secrets; lock provider choice in feature spec when implementing.

**Shareholder ask:** Yes/no on Phase 1; optional Supabase (default) vs Auth.js + Neon.

**Status:** Proposal final. **Implementation blocked until shareholder approves.**

---

## 2026-08-04 — Board Meeting #1: next milestone = Phase 1 auth

**Recommendation (pending shareholder approve + engineer feasibility):**  
**Phase 1 — App shell + auth + roles only.** Single primary milestone. No Stripe, no AI, no full content product in this cut.

**Sequencing call:**

| Order | Why |
|-------|-----|
| 1. Auth + roles | Every write path, sponsor dashboard, admin, AI quota, and metrics need identity and server-side roles |
| 2. Content (cities/zones/playbooks) | Something real to browse and seed; inventory for later ads |
| 3. Social | Amplifies trust signals once content exists |
| 4. AI import | Contribution unlock; costs money; needs auth + draft targets |
| 5. Stripe sponsorship | Needs pages + density; labeled only |
| 6. Metrics/admin depth | Optimize after loop exists |
| 7. Crew-only precision | After verification story; never public hotels |

**Must-haves (Phase 1):** Next.js `apps/web`, Postgres, signup/login, role on user, server enforcement, stub dashboards (`/dashboard`, `/sponsor`, `/admin`), public home, role model documented in `features/auth.md`.

**Non-goals (Phase 1):** Places/playbooks CRUD, social, AI, Stripe, production hard launch, crew verification.

**Money / trust:** No revenue this milestone; builds the only honest path to hands-off sponsor revenue later without fake endorsements or hotel leaks.

**Ask of shareholder:** Approve Phase 1 as next build; engineer debates stack choices (Auth.js / Clerk / Supabase) within boring constraints.

**Ask of Chief Engineer:** Feasibility pushback on provider, schema, and definition of done; do not broaden into Phase 2 unless stretch explicitly approved.

---

## 2026-08-04 — Org established

**Decision:** Shareholder (human) → CEO agent (`.grok/agents/ceo.md`) → Chief Engineer (main Grok Build).  

**Rationale:** Owner will not read full wiki; coding agent should not also own pure strategy. Board skills: `ceo`, `board-meeting`.  

**Ask of shareholder:** Confirm this org; run first board meeting on next milestone.  
