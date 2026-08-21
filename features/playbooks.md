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

## UI copy (chip + object **locked** — do not build until shareholder yes)

- Customer name for the object: **layover plan**. Do not say “playbook” on city, dashboard, or forms. Do not say “full package adventure.” Do not say **guide** as a product noun.
- Chip / section label: **Full layover**. Job: stealable full crew layover (whole shebang / copy-paste / look no further) — ordered complete layover vs one Eat/Do/Shop rec. Count on the chip is fine; section heading may pluralize as **Full layovers**.
- **Not the chip:** Plan (object / add-flow only), Itineraries (optional later sentence copy, not the tab), Guides, Ideas / Layover ideas, Play, tour, adventure, Full (alone), Full package, crew recs / crew staples (those names are the whole organic rail).
- Internal table/routes may stay `playbooks` this cut (no rename migration).
- Add chooser offers **Add a layover plan** next to Eat / Do / Shop (those three are places).
- City page: layover-plan list stays first (destination-first plans), then Eat/Do/Shop groups from the places spec. Jump chip **Full layover** with count. No separate `/plans` IA this cut.
- **Do not ship** chips until shareholder says **yes** to **Full layover · Eat · Do · Shop**.  
