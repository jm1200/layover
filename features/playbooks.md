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

## UI copy (object name locked; chip label **open** — do not build until named)

- Customer name for the object: **layover plan**. Do not say “playbook” on city, dashboard, or forms. Do not say “full package adventure.”
- Chip / section label: **still open** between **Full layover** / **Full layovers** (CEO default) and **Plan**. Not Play (collides with Do). Not tour/adventure (oversell). Not “Full” alone (vague). **Not Ideas / Layover ideas** — Eat/Do/Shop are already ideas; sponsored rail is “New idea…”; “Layover ideas” is whole-page copy later, not this chip.
- Internal table/routes may stay `playbooks` this cut (no rename migration).
- Add chooser offers **Add a layover plan** next to Eat / Do / Shop (those three are places).
- City page: layover-plan list stays first (destination-first plans), then Eat/Do/Shop groups from the places spec. Jump chip with count. No separate `/plans` IA this cut.
- **Do not ship** chips until shareholder picks **Full layover** or **Plan** (or says “use CEO default”). Ideas / Layover ideas are rejected for this chip.  
