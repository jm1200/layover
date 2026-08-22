# Feature: Playbooks

**Phase:** 2  
**Status:** Implemented in app — requires Supabase migrations 002 (+ seed 003)  
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

## UI copy (shipped 2026-08-21; homepage series + Buy 2026-08-22)

- [x] Customer name for the object: **layover plan**. Do not say “playbook” on city, dashboard, or forms. Do not say “full package adventure.” Do not say **guide** as a product noun.
- [x] City chip / section label: **Full layover** — **keep**. Job: complete crew layover vs one Eat/Do/Buy rec. Section heading: **Full layovers**.
- **Homepage `/` (this cut):** do not hero “Steal the whole layover.” Plans live in subsection **The perfect layover**, series line “The perfect layover does not exist… {City} edition.” Organic only — never an ad name.
- **Not the city chip:** The perfect layover (homepage series only), Plan (object / add-flow only), Itineraries (optional later sentence copy, not the tab), Guides, Ideas / Layover ideas, Play, tour, adventure, Full (alone), Full package, crew recs / crew staples (those names are the whole organic rail).
- Internal table/routes may stay `playbooks` this cut (no rename migration).
- [x] Add chooser offers **Full layover** next to Eat / Do / Buy (those three are places).
- [x] City page: layover-plan list stays first, then Eat/Do/Buy groups. Jump chip **Full layover** with count. No separate `/plans` IA this cut. No photo grid this cut.  
