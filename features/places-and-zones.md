# Feature: Places & zones

**Phase:** 2  
**Status:** Phase 2 **done** in app — requires Supabase migrations 002–004 (+ seeds 003, 005, 006)  
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

## UI copy (shipped 2026-08-21 — Full layover · Eat · Do · Shop; public verb **Buy** 2026-08-22)

Not a schema change. Not Phase 3. Not four new routes. Not a photo grid.

- [x] Do **not** headline the city page **Places**. Group published places as **Eat · Do · Buy**.
- [x] Four jump chips on the **same** city page, with counts: **Full layover · Eat · Do · Buy**. Chip 1 stays **Full layover** (playbooks); this spec owns the three rec groups. Public third verb is **Buy** (not Shop) — same word as homepage cards. **Buy stays first-class** even if a seed city looks thin — Delhi shopping is real; density is content, not extra routes.
- Homepage `/`: three cards **Eat / Do / Buy** first; layover plans are the **The perfect layover** subsection (playbooks spec). No “Steal the whole layover.”
- [x] Add flow: no generic “Add place.” Chooser → food / activity / buy (all insert `places` with a required category).
- [x] Category field: required select, not free-text. Persist `eat`/`do`/`shop`. Customer label for `shop` = **Buy**. Map legacy seed: restaurant/bar/cafe → Eat; activity → Do; grocery/shop → Buy; unknown → Do (do not hide rows).
- [x] Optional child item: Eat = “signature dish”; Buy = “what to get”; Do = hide the dish fields.
- [x] Empty group: one line “None yet.” Do not build `/cities/[slug]/eat` style landings this cut.
- **Cities/zones:** users cannot insert via a form (004). **Lumen may open a city** from a dump (name + 3-letter IATA) via `lumen_ensure_city` (009). No public city form. No city-hero spend on create.
- **Photos (locked 2026-08-24):** **1 still per place.** User upload first; if none, one cheap AI still on publish, stamped **AI**. City: **one hero**, refresh rarely (Lumen asks John before spending). Upload = Supabase Storage when Phase 4 ships. Seed cities still use static JPEGs in `public/landing/` until then.

## Out of scope (this IA cut)

- Separate Activity / Event / Shop tables
- Admin city CRUD UI
- User “request a city”
- Enum migration / check constraint (optional later)
- Photos, social, Stripe
- In-app role switcher (shareholder tries guest / second user signup / current admin)
- Rx / pharma shopping policy (parked — see CEO-LOG 2026-08-21)
