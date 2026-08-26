# Next session — founder notes

**Paused:** 2026-08-26 (close Phase 4 — test, don’t build)

## Where we left it

- **Phase 4 still in progress.** Dump → blurb → upload or AI-still checkbox → Publish. Rec album = `place_photos`. Edit rec: photos/plates save as you go; **Save** last then back to the rec.
- **SQL 011 + 016 are live** (engineer probe 2026-08-26). Spend RPC **$0.40**. `place_photos` has rows. Stills in `place-stills` return 200.
- Known bugs (not founder-error): dump/AI still skip the album (`legacy-hero` X fails); layover Up/Down + Save stop order can unique-violate.
- Phase 3 social **waits**. QR / completion / follow-pings / Stripe parked. Daily 3-draft cap **parked**.

## First up (not new features)

1. **Founder test** — `docs/board/FOUNDER-TEST.md`. Mark pass/fail. Do not invent results.
2. If John says go: unify album writes + fix stop reorder, then dead-code cleanup (`sellPlaceBlurb`, unused dish twins).
3. After pass: **freeze** dump/edit/photos.

Do **not** start likes, QR, or Stripe this session.

## Dev

`cd apps/web && npm run dev` → http://localhost:3000
