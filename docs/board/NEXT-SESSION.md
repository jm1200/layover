# Next session — founder notes

**Paused:** 2026-08-25 (Phase 4 Lumen live locally; major testing next)

## Where we left it

- **Phase 2 + 2.1 complete.** Homepage, cities, recs, plans.
- **Phase 4 in progress.** Key + SQL **008–010** done. Share your intel: dump → web lookup → file **one place at a time** (Make this sell, upload or generate still) → layover card with rec stills in a row → **Publish** puts the day *and* the recs on the city. Lumen can open a city (BCN). **Lumen, write the day** on plan edit. Draft vs publish are two buttons.
- **Board lock:** Phase 4 Lumen first. Phase 3 social waits. QR / completion / follow-pings parked.
- **Spend:** $20/mo, 4k chars, kill switch. Daily 3-draft cap **parked** (restore later).

## First up when you return

1. **Major testing** (John). Walk BCN + a second city. Photo upload, generate, publish, city page Eat/Do/Buy + full layover.
2. **Bug already seen:** the same full layover uploaded **twice**. Lumen must recognize the same itinerary in that city and not copy the plan (places already match by name). Do not start this until John has tested.
3. **Code review** — Theo + Milo on `features/ai-import/` + publish fan-out. Not tonight.

## Dev

Server was stopped. `cd apps/web && npm run dev` → http://localhost:3000
