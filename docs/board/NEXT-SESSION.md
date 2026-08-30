# Next session — founder notes

**Paused:** 2026-08-27 — Phase 4 complete. Hygiene **coded**. SQL **017** still needs a paste in Supabase.

## Where we are

Dump/edit/photos frozen. Hygiene: dead spend actions gone, album errors surface, hotel gate on stop text, Playwright reorder + X photo.

**You:** paste `apps/web/supabase/migrations/017_lumen_city_hero_lock.sql` in the Supabase SQL Editor. Until then, any logged-in user can still call the old city-hero RPC.

## First up (when John says)

**Phase 3:** like + comment + byline. Spec: `features/social.md`. Playwright for likes on day one of that build.

Not Stripe. Not follow. Not Facebook.

## Dev

`cd apps/web && npm run dev` → http://localhost:3000  
`cd apps/web && npm run test:e2e`
