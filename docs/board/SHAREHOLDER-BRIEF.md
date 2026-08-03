# Shareholder brief

*Updated by CEO / engineer. Target reading time: under 90 seconds.*

**Last updated:** 2026-08-04 (Important fix pack shipped)  
**Company:** Layover (working name)  
**Stage:** Phase 2.1 code fixes **done** · run SQL **004** (+ 002/003 if needed) · optional RLS smoke

## What we are

High-trust layover playbooks for flight crew, plus **clearly labeled** paid “new ideas” later. Zones only — never crew hotels.

## Where we are

| Item | Status |
|------|--------|
| Phase 1 auth | **Complete** |
| Phase 2 content code | **Shipped** |
| Important fixes (2.1) | **Shipped** — zone/city, stop/city, admin city insert, partial writes |
| Your SQL | Run **002 → 003 → 004** if not already |
| RLS smoke checklist | `docs/board/RLS-SMOKE.md` (optional but recommended) |
| Phase 3 Social | After you confirm cities work + smoke |

## What we need from you

1. Supabase SQL Editor → run missing migrations, especially **`004_phase2_harden.sql`**  
2. Refresh app → **Cities** → Zurich / Delhi  
3. Optional: create a place (zones should filter by city)  

No Vercel required.
