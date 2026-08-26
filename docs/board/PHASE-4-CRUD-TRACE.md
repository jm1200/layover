# Phase 4 CRUD trace — what the code actually does

**Milo, 2026-08-26.** Read from the files. Not a pass/fail. Click script is still `FOUNDER-TEST.md`.

There is **no** test runner in `apps/web` (`package.json` scripts: `dev` / `build` / `start` / `lint` only). Agents cannot log into a browser. **You click.**

---

## 0. Before any of this works

Paste-and-run in **your** Supabase SQL Editor, in order, if not already applied. Files live in `apps/web/supabase/migrations/`.

| SQL | Unlocks |
|-----|---------|
| **008** | dump logs + kill switch (`ai_import_logs`, `site_settings`) |
| **009** | Lumen can open a new city (`lumen_ensure_city`) |
| **010** | `places.image_url` + bucket **`place-stills`** (public) + storage RLS |
| **011** | `want_ai_still`, `$20` RPC, city-hero. Dump insert writes `want_ai_still` (`actions.ts:214`). Missing column → “Couldn’t save the rec.” |
| **012** | `dishes.image_url` (leftover plate photos) |
| **013–015** | seed plates / dim-sum extras (browse Zurich; not required for *your* new rec) |
| **016** | **`place_photos` album.** Edit-rec Add photo writes here. Missing → *“Photo album isn’t in the database yet”* (`actions.ts:214–221`). |

Also: Storage → bucket `place-stills` exists and is **public**. `.env.local` has `XAI_API_KEY` + `AI_MONTHLY_CAP_USD=20` or dump says **Lumen’s taking a nap.** Restart `cd apps/web && npm run dev` after SQL / env.

---

## You must click (we cannot)

1. Open http://localhost:3000
2. **Sign up** or **Log in** (`/login`, `/signup`). `/share` bounced logged-out → `/login?next=/share` (`share/page.tsx:13`). Other `/dashboard/*` → `/login` with **no** `next` — after login you land on the dashboard, not the edit URL.
3. Confirm email if Supabase still requires it (`HUMAN-SETUP.md`: turn **Confirm email** off for local).
4. Optional: SQL yourself to `admin` for the admin row below.
5. Second account / incognito for “other user.”

Dashboard is the hub: **Share your intel** + manual Eat / Do / Buy / Full layover cards (`dashboard/page.tsx:15–69`). Your recs and days are links to the **public** pages, not straight to Edit.

---

## 1. Manual rec

### Create → public

| You click | What should happen |
|-----------|-------------------|
| Dashboard → **Eat** / **Do** / **Buy** | `/dashboard/places/new?kind=…` (`new/page.tsx:18–34`). Locked type. |
| Or **Add a rec** without `kind` | Type dropdown Eat / Do / Buy (`place-form.tsx:139–157`). |
| City, optional zone, name, blurb. Eat/Buy: optional one dish/item (`place-form.tsx:175–218`). | Zones only — amber hotel warning (`place-form.tsx:69–72`). |
| **Create** | `createPlace` (`actions.ts:22–101`). Status is a hidden **`published`** (`place-form.tsx:169–173`) — live immediately. No photo on this form. |
| Lands on | `/places/[id]` (`actions.ts:100`). |

**Do not expect photos here.** Album exists only on **Edit rec**.

### Public rec `/places/[id]`

- Hero = `stillForPlace` = `places.image_url` or seed still (`rec-media.ts:136–151`). No image → **empty dark block** (`places/[id]/page.tsx:85–86`).
- **Photos** grid = `place_photos` album, plus hero unshifted if not already in the list (`page.tsx:54–66, 134–159`).
- **Get this** = dish **names + notes only** — no plate images (`page.tsx:160–176`).
- **Edit** link only if you are author or admin (`page.tsx:67–68, 110–119`).

### Edit rec `/dashboard/places/[id]/edit`

Gate: logged in, not suspended; else `/login` or `/dashboard`. Not author and not admin → redirect `/places/[id]` (`edit/page.tsx:25–33`).

Page order (`edit/page.tsx:59–92`): city / name / type / blurb → **Photos** → **Get this** (Eat/Buy only) → hint → **Save** → **Delete rec**.

| You click | Persists? | Code |
|-----------|-----------|------|
| **Add photo** (grey 4:5 slot) | Immediate. Compress → `place-stills` → `addPlacePhoto`. Max 3. | `rec-photos-editor.tsx:34–70, 145–161`; `actions.ts:224–281` |
| Tap a thumb | Immediate. Sets **hero** (`places.image_url`). City card uses this. | `rec-photos-editor.tsx:87–100`; `attachPlaceStill` `actions.ts:171–210` |
| **X** on a thumb | Immediate. Needs a real `place_photos.id`. | `rec-photos-editor.tsx:115–134`; `removePlacePhoto` `actions.ts:283–338` |
| **Add plate** / rename (blur or Enter) / **X** | Immediate. Max 3. Confirm on X. Names only on this page (`namesOnly`). | `plates-editor.tsx:82–91, 144–166`; `actions.ts:340–453` |
| **Save** (bottom) | City / name / type / blurb only, then **redirects to the rec**. | `place-form.tsx:233–246`; `updatePlace` `actions.ts:103–168` |
| **Delete rec** | Confirm. Rec gone. Stops keep the day (`place_id` ON DELETE SET NULL). Redirect city. | `delete-rec-button.tsx:6–28`; `actions.ts:495–521`; `002_content.sql:105` |

Hint on the form: *“Photos and plates save as you go. This button is for city, name, type, and blurb.”* (`place-form.tsx:233–237`). Hit Save **last**, after photos/plates.

### What is half-built on this path

- **Grey Add-photo slots** (`bg-zinc-100`, `rec-photos-editor.tsx:147`) are the empty album UI — not a bug. A **published rec with no still** is a **dark** city card (`bg-zinc-900`, `cities/[slug]/page.tsx:243–257`). Manual create never requires a photo, so that dark card is what you get until Edit → Add photo.
- **`legacy-hero`:** If the rec has `places.image_url` but **no** `place_photos` rows, Edit synthesizes a slot `{ id: "legacy-hero" }` (`edit/page.tsx:48–57`). **X on that slot fails** (`removePlacePhoto` looks up a UUID — `actions.ts:301–307` → “Photo not found.”). Tap-as-hero still works. Dump upload / AI still write the hero column **only** (see §4) — you will hit this on dump recs.
- **016 backfill** copies dish plate URLs into the album (`016_place_photos.sql:68–86`) with **no cap of 3**. Seed raclette can show **4** photos on the public rec (hero + 3 plates) while Edit slices to 3 (`rec-photos-editor.tsx:27`). Public album has no max (`places/[id]/page.tsx:54–66`).
- `allowHidden` is passed for admin (`edit/page.tsx:74`) and **never rendered** in `PlaceForm`. Recs cannot be hidden from this form — only deleted. Status is a hidden field; you cannot unpublish.

---

## 2. Dump flow `/share` → review → Publish

| You click | What should happen |
|-----------|-------------------|
| Header / dashboard **Share your intel** | `/share`. Must be logged in. |
| Paste a story → **Fill the draft** | `fillDraft` (`ai-import/actions.ts:40`). One follow-up question possible (`dump-box.tsx:47–57`). |
| Lands on | `/share/review/[logId]` (`actions.ts:499`). Drafts: `status: "draft"`, `want_ai_still: true` (`actions.ts:214–217`). **Nothing public yet.** |
| Per place: edit blurb, **Upload yours** or leave **AI still on publish** checked | Upload: compress → `place-stills/{you}/{placeId}.jpg` → `attachPlaceImage` (hero column only). Checkbox hidden once a preview exists (`review-place.tsx:269–376`). |
| Eat/Buy: **Get this** plates | Same `PlatesEditor` as Edit rec but **`namesOnly` is off** — dump review still offers plate **photo** upload (`review-place.tsx:379–385`; `plates-editor.tsx:239–269`). |
| Last rec-only place: button is **Publish**. With a day: **Next — the layover**, then title / the day / **Publish** | `publishReviewed` (`media-actions.ts:311–432`). Needs photo **or** checkbox per rec (`review-place.tsx:393–395`; `media-actions.ts:344–350`). |
| After Publish | Stills generate **now** if you asked (`generatePlaceStillNow`, `media-actions.ts:369–374`). Redirect `/places/[id]` or `/playbooks/[id]`. Recs + day set `published`. |

Dedup: same published rec/day → error + **Open it** (`actions.ts:392–404, 283–297`). Hotel copy: `refusePublicCopy` / Lumen `blocked` (`moderate.ts:3–17`). Fail closed to nap if no key / kill switch / over cap (`spend.ts:19–32`).

### Half-built

- Dump **does not** insert `place_photos`. After Publish, Edit rec shows **legacy-hero** until you Add photo on Edit (which *does* write the album).
- Dump plates can still take photos into `dishes.image_url`. Public rec **does not show** those images under Get this. Dual gallery leftover.
- Review layover tiles without an upload are dark with *“AI still on publish”* (`review-place.tsx:151–154`) — expected until Publish spends ~2¢.

---

## 3. Layover (playbook)

### Create `/dashboard/playbooks/new`

City, title, hours, story, up to **4** stop slots (title + optional linked **published** rec + notes) (`playbook-form.tsx:109–148`). Only button: **Publish — live on the city** (`playbook-form.tsx:172–180`). `createPlaybook` (`playbooks/actions.ts:12–101`) → `/playbooks/[id]`. Publishes the day; does **not** auto-publish linked recs (they must already be published to appear in the dropdown — `listPublishedPlaces`, `queries.ts:78–84`).

### Edit `/dashboard/playbooks/[id]/edit`

Same author/admin gate as recs (`edit/page.tsx:22–26`). **Edit** on the public day (`playbooks/[id]/page.tsx:41–43, 100–108`).

**This is the “Save in the middle” layout** (`edit/page.tsx:46–64`):

1. City (locked), title, hours, narrative  
2. **Publish — live on the city** ← meta save, **middle of the page**  
3. **Stops** — Up / Down / Drop (local only)  
4. **Save stop order**  
5. **Delete layover**

`submitLabel="Save"` is **ignored** (`playbook-form.tsx:33`). There is no “Save draft.” Author cannot Hide (admin only, `playbook-form.tsx:182–191`).

| You click | What should happen |
|-----------|-------------------|
| Change title / story → **Publish — live on the city** | `updatePlaybookMeta` (`actions.ts:103–197`). Stays on the edit page (`success` string). If status is published, **also publishes that day’s recs** you authored (`actions.ts:146–165`). |
| **Up / Down / Drop** | Client only (`stops-editor.tsx:19–31`). Public day unchanged until the next row. |
| **Save stop order** | `savePlaybookStops` (`actions.ts:234–280`). Recs are **not** deleted. Message: *“Stops updated. Recs are unchanged.”* |
| **Delete layover** | Confirm. Day gone. Recs stay on Eat / Do / Buy (`delete-layover-button.tsx:13–16`; `deletePlaybook` `actions.ts:199–232`; stops cascade, places do not). |

**Cannot add a stop on edit** — only reorder / drop. Add stops at create, or dump a new day.

If you reorder, then hit **Publish** before **Save stop order**, `revalidatePath` can remount the stops list and **wipe the unsaved order**.

Stops with no still: **empty dark tiles** on city layover cards (`layover-card.tsx:33`) and the public day (`playbooks/[id]/page.tsx:129–137`). Seed Zurich days have stills; a manual day whose recs have no photos will look empty.

---

## 4. Photo pipeline (one diagram)

```
file → compressStill (browser, max 12MB, long edge 1600, JPEG 0.82)
     → storage bucket place-stills / {auth.uid()}/…
     → public URL (must include /place-stills/)
     → one of:
          addPlacePhoto      → place_photos row; hero if places.image_url empty
          attachPlaceStill   → places.image_url hero only (tap thumb)
          attachPlaceImage   → places.image_url hero only (dump upload)
          generatePlaceStillNow → places.image_url + image_source=ai (after Publish)
          attachDishStill    → dishes.image_url (dump plates; hidden on Edit rec)
```

- Compress: `compress-still.ts:7–31`. HEIC often fails — JPEG/PNG. Dump review special-cases `too-large`; Edit rec does not (`rec-photos-editor.tsx:41–43`).
- Storage RLS: first path segment **must be `auth.uid()`** (`010_place_images.sql:19–24`). Editors pass **logged-in** `profile.id` (`edit/page.tsx:78`; `review-place.tsx:77`) — admin upload to *someone else’s* rec still goes in the **admin’s** folder. That is OK.
- Public rec / city cards use `next/image` + `remotePatterns` for your Supabase host (`next.config.ts:14–21`). Edit thumbs use raw `<img>`. If the host is wrong, **public** stills break, edit previews may not.
- City card = **one** hero (`stillForPlace` → `places.image_url`). Album is the rec page only.
- Storage has **no delete policy** in 010. X removes the DB row, not the file.

**Dual galleries (album pivot leftover):**

| Store | Who writes | Who reads |
|-------|------------|-----------|
| `places.image_url` | dump upload, AI still, tap-hero, first album photo | city card, rec hero, layover tiles |
| `place_photos` | Edit **Add photo** + 016 backfill | rec Photos grid, Edit thumbs |
| `dishes.image_url` | dump plate upload, seeds 013/015 | **not** public Get this; 016 copied them into the album once |

---

## 5. Permissions

RLS (`002_content.sql:168–190`, `004_phase2_harden.sql:19–30`; photos `016_place_photos.sql:17–66`):

| Actor | Browse published | Edit rec / day | Upload stills | Hide | Delete own |
|-------|------------------|----------------|---------------|------|------------|
| **Author** (`user` / `sponsor` — `requireUser` does not block sponsor) | yes | yes | yes (own) | no | yes |
| **Admin** | yes, including drafts | anyone’s | yes | **day** only (rec Hide is unwired) | anyone’s |
| **Other logged-in** | published only | Edit link hidden; URL redirects to public | server action “Not your rec.” | no | “Not your rec.” |
| **Logged out** | published only | `/login` | no | no | no |
| **Suspended** | — | `/dashboard` (panel) | “Log in first.” | — | — |

Draft dump recs: author + admin via RLS; city pages filter `status === "published"` (`cities/[slug]/page.tsx:62–63`). Public `/places/[id]` shows *Status: draft* to the owner (`places/[id]/page.tsx:126–128`).

Incognito: no Edit on someone else’s rec. Direct `/dashboard/places/[id]/edit` → public rec.

---

## Should work IF 008–016 + bucket + key

- Manual rec create → public page → Edit photos/plates (as-you-go) → Save → back to rec → Delete rec (day keeps other recs).
- Dump → review → upload **or** AI-still checkbox → Publish → stills after → public rec/day.
- Layover create with 4 stops → Edit Up/Down/Drop → **Save stop order** → Delete day, recs remain.
- Author vs admin vs other user as in §5.
- Hotel string in name/blurb refused (`"Zones, not hotels."`).

---

## Broken or half-built (expect these)

1. **Dump / AI still never write `place_photos`.** Edit **X** on the only photo → “Photo not found.” (`legacy-hero`).
2. **Save in the middle of layover edit.** Publish (meta) sits above stops. `submitLabel="Save"` dead. Unsaved stop order can vanish if you Publish first.
3. **Cannot add a stop on edit.**
4. **Dual galleries.** Dump plate photos + 016 seed backfill vs names-only Get this vs album max-3 in Edit only.
5. **Grey/dark empty tiles** wherever a rec has no `image_url` and no seed still — especially **manual** recs (no photo on create) and layover stops that point at them.
6. **Schema cache / missing 016.** Add photo → paste-016 message. `listPlacePhotos` swallows the error and returns `[]` (`queries.ts:161–172`) so Edit looks empty instead of exploding.
7. **Missing 011.** Dump insert of `want_ai_still` fails; or stills nap because the $20 RPC is missing (`spend.ts:9–16` fail-closed).
8. **Rec cannot be hidden.** Admin Hide exists only on days.
9. **Delete rec / day** ignore action errors in the button — if RLS fails you get no message (`delete-rec-button.tsx:20–22`).
10. **No tests.** `tsc` / eslint are not this trace.

---

## Gaps you will hit (practical)

- **SQL 011 + 016 + public `place-stills`** — first. Photo 500s / nap until then.
- **Create rec has no photo field.** Create → open rec (dark hero) → Edit → Add photo. Easy to think upload is missing.
- **HEIC from iPhone.** “Couldn’t read that photo. JPEG or PNG is safest.”
- **Email confirm / rate limit** on signup (`HUMAN-SETUP.md`).
- **Two accounts** to prove other-user. We cannot.
- **Seed Zurich raclette** after 016 may show more than 3 photos on the rec and 3 on Edit.
- Spend: AI still ~2¢, new-city hero ~2¢, inside $20. `/admin` = last 50 logs + month $ — not dump text.

---

## Verdict

The **happy paths are implemented** and should work on a project that has 008–016, a public `place-stills` bucket, and an xAI key. They are not proven: no runner, no browser login from here.

The album pivot is **incomplete at the dump boundary** (hero column vs `place_photos`). Layover edit **Save is in the wrong place** and does not persist stop order. Manual recs go live with **no photo**, so city cards go dark until you Edit.

Click `FOUNDER-TEST.md`. Write URL + what you clicked + what you saw on any fail. Then we freeze dump / edit / photos — not likes, not Stripe.
)
