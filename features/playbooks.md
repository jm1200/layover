# Feature: Playbooks

**Phase:** 2  
**Status:** Phase 2 **done** in app — requires Supabase migrations 002–004 (+ seed 003; stop timing 007)  
**Code:** `apps/web/src/features/playbooks/`  
**Gate:** `docs/board/PRE-PHASE-2-GATE.md`

## Goal

Ordered layover stories (the product quality bar).

## Acceptance criteria (this cut)

- [x] Create playbook: title, city, hours available (optional), narrative, ordered stops
- [x] Stop model: optional `place_id` + free-text note
- [x] Draft vs publish: published = public; draft = author only
- [x] Public playbook page
- [x] City page lists published playbooks
- [x] Author can edit own meta; admin can hide
- [x] Forms warn zones not hotels
- [x] Seed SQL Zurich + Delhi (003) — run on Supabase

## Out of scope (Phase 2)

- Events as first-class stops  
- Separate Activity table  
- Social / AI / Sponsored rails  
- Full stop re-edit after create (meta edit only for now)

## Phase 4 (not this cut — see `features/ai-import.md`)

A **full layover** is a combo of places. When Lumen drafts a plan from a story, she also drafts each stop as an Eat/Do/Buy place (or links an existing same-city place) and the user confirms the bundle. Plan pages reuse place stills — no extra itinerary gallery. Max 4 stops (same as the form).

**Dedup (locked 2026-08-26):** match by **stop set** (same city, same places). Do not ship a twin because she titled it differently. **Narrative** is filled from the dump on the review card; empty blurb cannot publish.

**Edit day (locked 2026-08-26):** **one Save** — persists drop/reorder, keeps the day live, redirects to the public layover. No second Publish / Save order / Back. **Delete day must work**; recs stay.

- [x] Playwright E2E: publish a day, then take it off (`apps/web/e2e/layover.spec.ts`).

## UI copy (shipped 2026-08-21; homepage series + Buy 2026-08-22)

- [x] Customer name for the object: **layover plan**. Do not say “playbook” on city, dashboard, or forms. Do not say “full package adventure.” Do not say **guide** as a product noun.
- [x] City chip / section label: **Full layover** — **keep**. Job: complete crew layover vs one Eat/Do/Buy rec. Section heading: **Full layovers**.
- **Homepage `/`:** **Layover Intel — For Crew, By Crew.** Collage + tappable Eat/Do/Buy cards + city search. Series line “The perfect layover does not exist…” is **not** on `/` (city / plan pages). Organic only — never an ad name.
- **Not the city chip:** The perfect layover (homepage series only), Plan (object / add-flow only), Itineraries (optional later sentence copy, not the tab), Guides, Ideas / Layover ideas, Play, tour, adventure, Full (alone), Full package, crew recs / crew staples (those names are the whole organic rail).
- Internal table/routes may stay `playbooks` this cut (no rename migration).
- [x] Add chooser offers **Full layover** next to Eat / Do / Buy (those three are places).
- [x] City page: layover-plan list stays first, then Eat/Do/Buy groups. Jump chip **Full layover** with count. No separate `/plans` IA this cut. No photo grid this cut.

## UI copy (locked 2026-08-26 — Sofia)

**Dashboard** (`/dashboard`): title **Yours**. Lists **Your Eat, Do & Buy** and **Your layovers**. This user’s **published** rows only — seed and other people are not yours. **No** `(draft)` / `(published)`. Never say **rec** on the site.

**Edit layover** (`/dashboard/playbooks/[id]/edit`): **one button.** Label **Save**. Persists title + story + stop drop/reorder, keeps the day live, then **lands on the layover** (`/playbooks/[id]`). Kill **Publish — live on the city** here. Kill **Save stop order**. New layover create still uses **Publish**.  
