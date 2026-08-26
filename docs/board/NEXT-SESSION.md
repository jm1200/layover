# Next session — founder notes

**Paused:** 2026-08-26 (founder test filed — product locked, then the pack)

## Where we left it

- Founder clicked. Seven items. Maya locked product in the brief + CEO-LOG. **Not passed.** Phase 4 still in progress. Not Phase 3. Not Stripe.
- SQL 011 + 016 live. Spend **$0.40**. Dump/AI still skip `place_photos`.

## First up (the pack)

Theo/Milo — `apps/` this cut, in this order:

1. Rec photos: labeled **place** vs **dishes**; dump/AI write `place_photos` + plate images; never copy place onto plate; no black rectangle (skip → Lumen still).
2. Dashboard: this user’s **published** only. No `(draft)`. No seed. No everyone else’s.
3. Dedup: **stop set**. Day blurb from dump; refuse empty The day. “On the map now” only for a city she opened this dump.
4. Edit day: **one Save** → public layover. Drop/reorder persist. Delete day works.
5. Sofia/Lumen copy already in `agents/lumen.md` (login, photo labels, delete, twin, The day). Wire those strings.
6. Google button **after** John pastes the OAuth client (`HUMAN-SETUP.md`). Login restyle does not wait.

Then retest `docs/board/FOUNDER-TEST.md`. Then freeze dump/edit/photos. Then dead-code cleanup.

Do **not** start likes, QR, Stripe, Apple login, or an admin queue.

## Dev

`cd apps/web && npm run dev` → http://localhost:3000
