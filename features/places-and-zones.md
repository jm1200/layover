# Feature: Places & zones

**Phase:** 2  
**Status:** Implemented in app — requires Supabase migrations 002 (+ seed 003)  
**Code:** `apps/web/src/features/places/`  
**Gate:** `docs/board/PRE-PHASE-2-GATE.md`

## Goal

Cities, layover zones, places, and dishes — without crew hotel identity. Manual create + public browse.

## Acceptance criteria (this cut)

- [x] City list + city page by slug
- [x] Zones per city (`airport_strip`, `downtown`, `station`, `other`)
- [x] CRUD for places (auth write); public read of published content
- [x] Dishes linked to places (simple child on create)
- [x] No public “hotel name” field on place forms
- [x] Zone optional but encouraged for logistics tips
- [x] RLS: public read published; auth write own; admin all (policies in 002)

## Out of scope (Phase 2)

- Separate **Activity** entity/table
- **Events** entity
- Social, AI import, Stripe, sponsor placements
- Crew-only / hotel-level fields

## Security

Follow `docs/SECURITY.md`. Public copy uses zones and landmarks only.

## UI copy (shipped 2026-08-21 — Full layover · Eat · Do · Shop)

Not a schema change. Not Phase 3. Not four new routes.

- [x] Do **not** headline the city page **Places**. Group published places as **Eat · Do · Shop**.
- [x] Four jump chips on the **same** city page, with counts: **Full layover · Eat · Do · Shop**. Chip 1 is the playbooks feature (stealable full crew layover); this spec owns the three rec groups. **Shop stays first-class** even if a seed city looks thin — Delhi shopping is real; density is content, not extra routes.
- [x] Add flow: no generic “Add place.” Chooser → food / activity / shop (all insert `places` with a required category).
- [x] Category field: required select, not free-text. Persist `eat`/`do`/`shop`. Map legacy seed: restaurant/bar/cafe → Eat; activity → Do; grocery → Shop; unknown → Do (do not hide rows).
- [x] Optional child item: Eat = “signature dish”; Shop = “what to get”; Do = hide the dish fields.
- [x] Empty group: one line “None yet.” Do not build `/cities/[slug]/eat` style landings this cut.
- **Cities/zones:** users cannot insert (004). **No admin city form this cut** — SQL until we need city #3.

## Out of scope (this IA cut)

- Separate Activity / Event / Shop tables
- Admin city CRUD UI
- User “request a city”
- Enum migration / check constraint (optional later)
- Photos, social, Stripe
- In-app role switcher (shareholder tries guest / second user signup / current admin)
- Rx / pharma shopping policy (parked — see CEO-LOG 2026-08-21)
