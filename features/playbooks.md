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
