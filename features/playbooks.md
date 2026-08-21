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

## UI copy (locked 2026-08-21 — build only after shareholder yes)

- Customer name: **layover plan** (section: **Full layovers**). Do not say “playbook” on city, dashboard, or forms.
- Internal table/routes may stay `playbooks` this cut (no rename migration).
- Add chooser offers **Add a layover plan** next to Eat / Do / Shop (those three are places).
- City page: Full layover list stays first (destination-first plans), then Eat/Do/Shop groups from the places spec. Jump chip with count. No separate `/plans` IA this cut.  
