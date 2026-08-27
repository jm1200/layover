# Founder test — close Phase 4

**Retest after the 2026-08-26 pack.** First pass filed seven items. Product is locked in the brief. You click again.

Dev: `cd apps/web && npm run dev` → http://localhost:3000  
Log in. Use **your** recs (e.g. Geneva dim-sum), not Zurich seed. Dashboard must **not** show seed as yours.

## First pass (filed, not passed)

| # | What you saw | Lock |
|---|----------------|------|
| 1 | Login is terrible | Sofia restyle. Google this cut — you create the OAuth client. |
| 2 | Two unlabeled uploads; same JPEG on hero and dish | Place = exterior (city card). Dishes = Get this. Labels on both. |
| 3 | Day accepted; blurb empty; twin day with new title | Stop-set dedup. The day filled from the dump. |
| 4 | “GVA/BCN is on the map now” for cities that exist | Copy only if she opened it this dump. Hotel strip **worked**. |
| 5 | `(draft)` on dashboard; other people’s recs; black rectangle; Save ate a photo | My published only. No draft badge. Skip photo → Lumen still. |
| 6 | Delete rec worked; copy was confusing | Sofia copy. Rec gone; day keeps other stops. |
| 7 | Order on edit didn’t stick; two buttons; delete day failed | One Save → public layover. Delete day must work. |

## Feel pass — you (2026-08-27)

Not the whole click list. Playwright already does browse, email login, create/save/delete, zoom. **~10 minutes. Your recs, not Zurich seed.**

Dev: http://localhost:3000

1. **Google.** Sign out. `/login`. Button should look like every other site (G + Continue with Google). Click it. Land on **Yours**. If Google isn’t wired, skip and say so — email still works.
2. **Dump.** `/share`. Paste a real place (a few sentences). Phone photo if you have one, or skip. **Write it up** → check → **Publish**. Land on the rec. Hero is in **Photos**. Tap a photo → blows up → **X** closes. No black rectangle. No word “rec”. Get this is names only.
3. **Yours.** Only your published recs and days. No Zurich seed. No `(draft)`.
4. **Hotel (optional).** Dump a line with a crew hotel name. Public rec must not show it.
5. **Feel.** Walk that rec like a crewmate. Intel, or homework?

If something’s wrong: URL + what you clicked + what you saw. Then we freeze dump/edit/photos.

---

## Playwright (2026-08-27)

**Milo owns this.** He writes and runs `cd apps/web && npm run test:e2e` before anyone pings you. Theo reviews. You are not the regression suite.

Covers: home/cities, rec Photos + zoom + X, email login, Yours is yours, create rec, upload still, Get this name, Save → rec, delete rec, layover publish + delete day.

**Does not cover (you still click):** Google button, a photo from your phone, dump → Lumen (xAI spend), “does this feel like crew.”

Needs an email/password user. Either Confirm email OFF so the suite can sign one up, or put `E2E_EMAIL` / `E2E_PASSWORD` in `apps/web/.env.local`.

---

## Grok already checked (2026-08-26)

| Check | Result |
|-------|--------|
| Typecheck | pass |
| Public routes | 200 |
| `place_photos` (016) | live — 12 rows |
| `lumen_month_spend_usd` (011) | live — **$0.40** |
| Storage stills | 200 image/jpeg |
| xAI key | set |
| Hotel strings on sampled public pages | 0 hits |

SQL 011/016 already in. Do not re-run unless a message says the album is missing or Lumen naps.

---

## 1. Browse (logged out)

Private window.

- [ ] `/` — Eat / Do / Buy cards tap through. No hotel names.
- [ ] `/cities` — hero cards.
- [ ] `/cities/zurich` — Full layover · Eat · Do · Buy. Zones, not hotels.
- [ ] A rec — **the place** is the hero. Eat/Buy **Get this** can have dish photos. City card is still **one** still.
- [ ] A layover — stops have stills; recs are linked. The day has a blurb.
- [ ] `/share` logged out → login.

---

## 2. Login

- [ ] Page does **not** feel like an admin tool. Copy from `agents/lumen.md`.
- [ ] Email still works.
- [ ] **Continue with Google** — only if you pasted the OAuth client. If not, skip; restyle still counts.

---

## 3. Dump → publish (`/share`)

**A. One rec**

- [ ] Dump one restaurant. Slots are labeled: **The place** vs **The plate** (Eat/Buy). Not two “Add photo”s.
- [ ] Upload an outside shot in **The place**. A different dish shot on a plate. They stay **different** files.
- [ ] Skip a place photo on another rec → **Publish** still gets a still (AI flag). No black rectangle.
- [ ] Publish. Land on the rec. City card uses the place shot. No `Status: draft`.

**B. Same day twice (dedup)**

- [ ] Dump the **same** Geneva/BCN day you already published, even if she titles it differently.
- [ ] She **refuses the twin**. Recs stay. No second day with empty blurb.

**C. The day is filled**

- [ ] A full layover dump shows **The day** filled from what you pasted. You can edit. Publish with it empty is refused.

**D. City-open copy**

- [ ] Dump in Geneva or Barcelona. She does **not** say it is on the map now. Hotel names still stripped.

**E. Hotel leak**

- [ ] Fake line with a crew hotel. Public rec does **not** show the hotel.

---

## 4. Dashboard

- [ ] Only **your published** recs and days. No `(draft)`. No Zurich seed. No other authors.
- [ ] Recs you just published are here. Abandoned `/share` rows are not.

---

## 5. Edit rec

Open **your** rec → Edit.

- [ ] Two labeled jobs. Add a dish photo → the place still is still there after Save.
- [ ] Rename / X a plate. Save at the bottom → public rec. Both photos still there.
- [ ] Delete rec (one you do not care about). Rec gone. Copy is human. Day keeps other stops.

---

## 6. Edit a layover day

- [ ] Drop or reorder. **One Save.** Lands on the **public** layover. Order matches.
- [ ] **Delete layover**. Day gone; recs remain on Eat/Do/Buy.

---

## 7. What “pass” means

All boxes, or a written fail (URL + click + what you saw).

Then we **freeze** dump / edit / photos. Then thin Phase 3 — not before.

**Still waiting:** likes, follow-pings, completion, QR, Stripe, Apple login, admin queue, restore daily 3-draft cap, Vercel, admin city form.
