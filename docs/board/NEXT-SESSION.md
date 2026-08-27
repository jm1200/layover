# Next session — founder notes

**Paused:** 2026-08-27 — **Phase 4 complete.** Board rec: **hygiene then Phase 3.** Dump/edit/photos frozen. Waits on John.

## Where we are

Lumen dump is live. Feel pass passed. Playwright: `cd apps/web && npm run test:e2e`. **Milo owns it.**

## First up (when John says)

1. **Bounded hygiene** (a day, not a phase). Do **not** unfreeze dump / rec photos / edit rec.
   - Delete `sellPlaceBlurb` + dead twins
   - Lock `lumen_set_city_hero` RPC
   - Hotel gate on stop title/body
   - Stop swallowing album errors
   - Playwright: Edit day → Up/Down → Save; X a photo
2. **Then Phase 3:** like + comment + byline. Spec: `features/social.md`. Playwright for likes on day one of that build.
3. Not Stripe. Not follow. Not Facebook. Not the 3-draft cap unless he asks.

## Dev

`cd apps/web && npm run dev` → http://localhost:3000  
`cd apps/web && npm run test:e2e`
