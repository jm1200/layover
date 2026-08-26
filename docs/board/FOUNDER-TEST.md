# Founder test — close Phase 4

**You click the logged-in paths.** Grok already ran everything that does not need your session.

Dev: `cd apps/web && npm run dev` → http://localhost:3000  
Log in first. Use **your** recs (e.g. Geneva dim-sum), not Zurich seed, unless you are admin — seed `author_id` is null.

## Grok already checked (2026-08-26)

| Check | Result |
|-------|--------|
| Typecheck | pass |
| Public routes (`/`, cities, Zurich eat/do/buy, raclette rec, a layover) | 200 |
| Logged-out `/dashboard` `/share` `/admin` / edit rec | 307 → login |
| Raclette **Get this** names | Truffle raclette, Lava cake, Cornichons |
| `place_photos` (016) | live — 12 rows |
| `lumen_month_spend_usd` (011) | live — **$0.40** this month |
| Storage `place-stills` JPEGs (user + AI + `/landing/` samples) | all **200** image/jpeg |
| xAI key in `.env.local` | set |
| “crew hotel / airline hotel” on sampled public pages | 0 hits |

**Cannot do without you:** login, camera-roll upload, 4:5 crop feel, tap/X/rename, Save → rec, delete, dump, hotel leak, incognito other-user, layover Up/Down.

## SQL

**011 and 016 are already in your project** (probed). Do not re-run unless a click fails with *“Photo album isn’t in the database yet”* or Lumen naps. Bucket `place-stills` is serving files.

## Known fails (code, not you)

Do these **once** so we have a URL, then stop. Do not fight them.

1. **Dump / AI still → Edit rec → X the only photo** → expect *Photo not found.* Review writes `places.image_url` only, not the album. Fake `legacy-hero` slot.
2. **Edit a day → Up/Down two stops → Save stop order** → expect a unique-position error if you did not also Drop a stop.

Say go and we fix those two before you finish the rest.

---

## 1. Browse (logged out)

Use a private window.

- [ ] `/` — Eat / Do / Buy cards tap through to real recs. No hotel names.
- [ ] `/cities` — hero cards, not a phone book.
- [ ] `/cities/zurich` — Full layover · Eat · Do · Buy. Zones, not hotels.
- [ ] Open **Zurich raclette** rec — album + **Get this** names. City card still shows **one** hero.
- [ ] Open a layover day — stops have stills; recs are linked.
- [ ] `/share` logged out → login, not a free dump.

---

## 2. Dump → publish (`/share`)

Log in. Header **Share your intel**.

**A. One rec (upload, not AI still)**

- [ ] Dump something small you know (one restaurant, city + name). **Fill the draft.**
- [ ] She fills city / name / type / blurb. Edit the blurb if it’s limp.
- [ ] Upload a real photo (phone or files). Preview is **4:5**, not a wide strip. She does not secretly reframe it.
- [ ] **Publish.** Land on the rec. Photo is there. City card uses that shot.

**B. Same day twice (dedup)**

- [ ] Dump the **same BCN day** you already published (or the rec you just made).
- [ ] She should **refuse a twin** — not copy the itinerary / rec.

**C. Hotel leak (trust)**

- [ ] Dump a fake line that names a **crew hotel** or “where [airline] stays.”
- [ ] Public rec must **not** show the hotel. Zone or skip. PG-13 / hotel → no row.

**D. Optional: AI still** (spends ~2¢ inside $20)

- [ ] One rec, check **AI still on publish**, no upload. After Publish, a still appears, stamped **AI**.

Fail the dump? Note the exact message. `/admin` shows her last 50 + month $. No dump text on that page (hotels).

---

## 3. Edit rec (CRUD + photos)

Open **your** rec → **Edit rec** (`/dashboard/places/…/edit`).

**Photos (save as you go — do not hit Save yet)**

Prefer a rec you **Add photo**’d here (not only a dump still). Dump-only X is the known fail above.

- [ ] Section **Photos**. Add a second shot → **Add photo**. It sticks after refresh without Save.
- [ ] Tap a non-hero thumb → *That’s the hero.* City card uses it.
- [ ] **X** on one **added** photo. Gone after refresh. Max **3**; fourth slot should not exist.
- [ ] Logged-out / other user: no Edit on this rec.

**Get this (Eat / Buy only; names, not a second gallery)**

- [ ] Add a plate name (e.g. “the dip”) → **Add plate**. Sticks without Save.
- [ ] Rename it. **X** → confirm *Take this off Get this?* Rec page shows names, not a second photo grid.

**Save last**

- [ ] Change the blurb. **Save** at the bottom → back to the public rec. New blurb. Photos you already added are still there.

**Delete rec** (use a rec you do not care about)

- [ ] Delete. Rec gone. If it was on a day, the **day’s other recs stay**.

---

## 4. Edit a layover day

Open a day you own → edit.

- [ ] **Drop** a stop → **Save stop order**. Rec page for that place **still exists**. (Up/Down-only save is the known unique-position fail — skip or hit once.)
- [ ] **Delete layover**. Day gone; recs remain on Eat/Do/Buy.

---

## 5. What “pass” means

All boxes above, or a written fail (URL + what you clicked + what you saw).

Then we **freeze** dump / edit / photos. Theo/Milo clean dead code from the album pivot. **Then** thin Phase 3 (like + comment + byline) — not before.

**Still waiting (do not start):** likes, follow-pings, completion scores, QR kickbacks, Stripe, restore daily 3-draft cap, Vercel, admin city form.
