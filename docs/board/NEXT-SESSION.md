# Next session — founder notes

**Paused:** 2026-08-27 (Playwright in; Phase 4 not frozen)

## Where we are

Phase **4 close**. Product locked in the brief. Founder retest **not passed**. Not Phase 3. Not Stripe.

Playwright E2E is live (`cd apps/web && npm run test:e2e`) — **9 passed** last run. **Milo owns writing and checking.** Theo reviews. John is not the regression suite.

## First up

1. **Milo** — keep `apps/web/e2e` green. Add a spec when a click-path ships. No xAI in the suite.
2. **Theo** — review Milo’s suite; freeze dump/edit/photos after founder feel-pass. Dead-code cleanup after freeze (`PHASE-4-REVIEW.md`).
3. **John** — Google (if you want that button) + feel-pass `FOUNDER-TEST.md` on **your** recs. Not the whole click list.

Do **not** start likes, QR, Stripe, Apple login, or an admin queue.

## Dev

`cd apps/web && npm run dev` → http://localhost:3000  
`cd apps/web && npm run test:e2e`
