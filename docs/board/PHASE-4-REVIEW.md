# Phase 4 review — Theo, 2026-08-26

Read the files. Did not implement. Did not rubber-stamp. RecStillEditor is already gone.

## Summary

The dump → review → publish path works as a product, and the locked rec-edit decisions (album max 3, plates as Get this names, Save then `/places/[id]`) are in the right files. What the burst left behind is two write paths for the same photos, a plate photo farm that public Get this no longer shows, and a stop-reorder that will unique-violate. Founder CRUD/photo test will hit the album split-brain unless 016 is applied *and* review/AI stills actually insert `place_photos` — they currently do not.

## Dead / leftover (safe to delete later)

- `apps/web/src/features/ai-import/quality.ts:2` — `lumenOffersStill`. No importer. Whole file.
- `apps/web/src/features/ai-import/media-actions.ts:110` — `addReviewDish`. Twin of `addPlaceDish`. Nothing imports it. Review uses `PlatesEditor` → `addPlaceDish`.
- `apps/web/src/features/ai-import/media-actions.ts:141` — `attachDishImage`. Twin of `attachDishStill`. Nothing imports it.
- `apps/web/src/features/ai-import/media-actions.ts:435` — `sellPlaceBlurb` (“Make this sell”). Nothing imports it. Still spends if someone called it. `lumen-log.tsx:26` still labels old `sell_blurb` rows; keep the label, delete the action.
- `apps/web/src/features/places/rec-media.ts:111` `DISH_STILL` and `:126` `stillForDish` — only wired on edit rec (`dashboard/places/[id]/edit/page.tsx:10,45`) to stuff `image_url` onto plates that render `namesOnly`. Public Get this is names. 016 already copied those JPEGs into `place_photos`.
- `apps/web/src/features/places/place-form.tsx:34,49` — `allowHidden` destructured, never rendered. Edit rec still passes it (`edit/page.tsx:74`). Admin cannot hide a rec from this form.
- `apps/web/src/features/playbooks/playbook-form.tsx:33` — `submitLabel` bound as `_submitLabel` and ignored. Edit layover passes `"Save"` (`edit/page.tsx:58`); the button always says “Publish — live on the city”.
- `apps/web/src/features/places/plates-editor.tsx:34–70, 239–269` — upload / Replace / “Use rec photo” when `namesOnly` is false. Public rec page does not show dish photos (`places/[id]/page.tsx:160–176`). Review still mounts `PlatesEditor` without `namesOnly` (`review-place.tsx:379–385`), so dump review is a second plate-photo farm that writes `dishes.image_url` and never `place_photos`.
- Duplicate attach-hero: `media-actions.ts:83` `attachPlaceImage` (review) vs `places/actions.ts:171` `attachPlaceStill` (edit). Same `places.image_url` update. Collapse later; both are live today.
- Schema-cache retries (`queries.ts` PLACE_COLS / LEGACY / BARE, `media-actions.ts` `ownPlace` 44–52, `lumen-log.tsx` 70–85) are leftover from the 010/011 churn. Harmless if 011+016 are applied; do not delete until John has run them.

## Bugs

### Album is not the source of truth after dump/publish — Severity: bug

- File: `apps/web/src/features/ai-import/media-actions.ts:95–102` (`attachPlaceImage`), `:220–227` (`generatePlaceStillNow`), `apps/web/src/app/places/[id]/page.tsx:54–66`, `apps/web/src/app/dashboard/places/[id]/edit/page.tsx:48–57`, `apps/web/src/features/places/actions.ts:271–276`
- Description: Locked rule is rec photos = `place_photos` max 3. Review upload and AI-still-on-publish only set `places.image_url`. They never insert `place_photos`. Public rec then does: album rows, then `unshift` the hero if that URL is not in the album — so a rec with 3 album shots plus a different hero shows **4**. Edit rec, if the album is empty, synthesizes `{ id: "legacy-hero", src: heroSrc }`. X calls `removePlacePhoto(placeId, "legacy-hero")` → “Photo not found.” Adding a second photo via `addPlacePhoto` writes the *new* URL into the album and leaves the original hero only on `places.image_url` (because that column is already set). Tap-hero then overwrites `places.image_url` and the original dump photo drops out of the album entirely.
- Suggestion: One write. `attachPlaceImage`, `generatePlaceStillNow`, and `attachPlaceStill` should upsert the URL into `place_photos` (cap 3) and set hero from that row. Public rec should render the album only — no unshift. Delete the `legacy-hero` fake slot.

### Stop reorder hits `unique (playbook_id, position)` — Severity: bug

- File: `apps/web/src/features/playbooks/actions.ts:262–268`, constraint `apps/web/supabase/migrations/002_content.sql:108`
- Description: `savePlaybookStops` updates position 1..n in order. Swapping two stops tries to set B to position 1 while A still holds 1. Constraint is not deferrable. Founder “tug a day” + Save stop order will error unless they also dropped a stop (delete first frees the slot).
- Suggestion: Two-phase update (offset positions, then 1..n) or delete-and-reinsert the kept rows in one statement.

### `listPlacePhotos` swallows a missing table — Severity: bug

- File: `apps/web/src/features/places/queries.ts:161–172` vs write path `places/actions.ts:214–221, 253–255`
- Description: If 016 is not applied, or PostgREST schema cache is stale, list returns `[]` with a console warn. Edit looks empty / falls back to `legacy-hero`. X does not mention 016. Add photo *does* (`albumMissing`). Read and write disagree. Shareholder brief already says 016 is missing in the live project.
- Suggestion: Surface the same “paste 016” string on list failure, or fail the edit page closed. Do not invent an empty album.

### Dump review still farms plate photos — Severity: suggestion

- File: `apps/web/src/features/ai-import/review-place.tsx:379–385`, `apps/web/src/features/places/plates-editor.tsx:20, 88–90, 239–269`
- Description: Locked: plates on Edit rec = names (Get this); photos live in the album. Review omits `namesOnly`, so you can still attach JPEGs to `dishes.image_url`. Public Get this ignores those URLs. 016’s backfill copied historical dish JPEGs into the rec album once; new review uploads do not.
- Suggestion: Pass `namesOnly` on review too, then delete `attachDishStill` / the photo branch. Do not keep two galleries.

### Playbook Save stays on edit; button never says Save — Severity: suggestion

- File: `apps/web/src/features/playbooks/actions.ts:191–196` (`updatePlaybookMeta` returns success, no `redirect`), `playbook-form.tsx:33, 173–180`
- Description: Rec Save redirects to `/places/[id]` (`places/actions.ts:168`). Layover meta save stays on `/dashboard/playbooks/[id]/edit` and the ignored `submitLabel` means the primary button is still “Publish — live on the city”. Locked: note only, do not reverse rec redirect. The dead label is leftover, not a product call.
- Suggestion: Use `submitLabel`. Hide vs Publish copy is wrong for `status === "hidden"` (`actions.ts:191–196` says “Saved as draft”).

### Layover title/narrative skip the hotel gate — Severity: suggestion

- File: `apps/web/src/features/ai-import/media-actions.ts:380–392` (`publishReviewed` patches playbook with no `refusePublicCopy`), `apps/web/src/features/playbooks/actions.ts:21–25, 113–117` (create/update playbook same)
- Description: Rec name/blurb and plate names go through `refusePublicCopy` (`moderate.ts:10–17`). The regex is cheap (`crew hotel|the hotel|crash pad|…`) — “Hilton crew stay” still sails. Playbook title, narrative, and stop body never hit it. Lumen’s extract prompt is the real strip for dumps; a user can type a hotel into “The day” on review and publish.
- Suggestion: Run `refusePublicCopy` on playbook title + narrative + stop titles in `publishReviewed` / `createPlaybook` / `updatePlaybookMeta`. Do not pretend the regex is a lodging firewall.

### `lumen_set_city_hero` is callable by any logged-in user — Severity: suggestion

- File: `apps/web/supabase/migrations/011_lumen_spend.sql:37–68`
- Description: Security-definer RPC, `grant execute … to authenticated`, no check that the caller filed a rec in that city. URL is not required to live in `place-stills`. `heroForCity` prefers `cities.image_url` over the static `CITY_HERO` JPEGs (`rec-media.ts:9–16`), so a client call can replace Zurich’s editorial banner if `image_url` is still null. App path `generateCityHeroIfNeeded` skips when `CITY_HERO[slug]` exists (`media-actions.ts:256`); the RPC does not.
- Suggestion: Validate URL host/bucket; refuse when a static hero exists; or restrict execute to the server role you actually use.

### No DB cap of 3 on `place_photos` — Severity: nit

- File: `apps/web/supabase/migrations/016_place_photos.sql` (table, no check), `places/actions.ts:212, 256–257`
- Description: Cap is app `count` only. Two parallel uploads can both see `count < 3`. 016 backfill also has no cap — raclette’s three dish JPEGs plus a distinct `places.image_url` / `PLACE_STILL` unshift is how you get four on the public rec.
- Suggestion: After the album write path is unified, add a trigger or unique+check. Not first.

### PlaceForm nested controls — Severity: nit

- File: `apps/web/src/features/places/place-form.tsx:68, 231`, `rec-photos-editor.tsx:85, 117, 147`, `plates-editor.tsx:158, 271`
- Description: Photos and plates sit inside the Save `<form>`. I checked: hero tap, X, Add plate, Remove plate are `type="button"`. File pickers are `<label>` + hidden `<input type="file">`. Plate name Enter is `preventDefault`. This is the class of bug that survives a churn; it looks correct on the page, not proven in a browser.
- Suggestion: Founder test: Add photo / X / Add plate / rename plate must not fire rec Save. If anything submits, that control is missing `type="button"`.

## Do not delete (still used)

- `attachPlaceStill` — RecPhotosEditor tap-hero.
- `attachPlaceImage` — dump review upload. Duplicate, but live.
- `addPlaceDish` / `updatePlaceDish` / `deletePlaceDish` / `attachDishStill` — PlatesEditor. `attachDishStill` only while review is not `namesOnly`.
- `addPlacePhoto` / `removePlacePhoto` — RecPhotosEditor.
- `stillForPlace` / `PLACE_STILL` / `CITY_HERO` / `STOP_STILL` — city cards, rec hero, layover tiles. Seed stills are not a pipeline; do not rip them because dish stills died.
- `savePlaceReview` / `publishReviewed` / `generatePlaceStillNow` — the share review path.
- `compressStill` — both upload UIs.
- `lumen_month_spend_usd` / `aiBlocked` — fail closed if the RPC is missing (`spend.ts:9–16`).
- RecStillEditor — already absent. Do not go looking for a file to restore.

## Verdict

Not shippable as a Phase 4 freeze until the album is one table. Dump → upload or AI still → publish → Edit rec is a fake `legacy-hero` row; X fails; extra photos and the public unshift can break “max 3.” Stop Up/Down + Save stop order will bounce on the position unique. Both are in the founder script. Leftover actions (`sellPlaceBlurb`, `lumenOffersStill`, `addReviewDish`, `attachDishImage`, dish still maps, unused `allowHidden` / `submitLabel`) are churn, not the blocker — delete them in a cleanup pass after the album write is unified. RecStillEditor is already gone. Nested Save looks correctly `type="button"`; still click it. Playbook staying on edit is the inconsistency you already locked — don’t reverse rec redirect to match it. 011 and 016 must actually be in the project or the spend RPC and album 500 in the brief stay true. After those two bugs and SQL, founder CRUD/photo test is the gate, not more features.

---

# 2026-08-27 — Milo

Read the files. Did not implement. Did not rubber-stamp the 8/26 list — that review is stale against what is on disk now.

## E2E vs product (I own this)

Suite: `apps/web/e2e` — `auth`, `browse`, `rec`, `layover`. Chromium. Email user. Does not call xAI. Does not click Google. That split is correct.

**Matches the 8/27 chrome:**

- Login lands on heading **Your recommendations** (`auth.spec.ts`, `helpers.ts`).
- Profile icon is `aria-label="Account"`; menu has **Your recs** + Sign out (`you-nav.tsx`, asserted in `auth.spec.ts`).
- `homeForRole` is always `/dashboard` — admin included (`get-profile.ts:87–90`). Callback uses it.
- Dashboard is **grouped by city** (`dashboard/page.tsx`: city `h2`, then **Full days** / **Recs**). Published-mine only. No `(draft)`. Seed Limmat is asserted not yours.
- Rec: Create → Edit upload → Get this name → **Save** → public rec → Photos + zoom + Close → delete. Layover: **Publish — live on the city** on *new* (PlaybookForm still uses that string) → dashboard link → **Take this day off**.

**Does not match / does not cover:**

- City grouping is in the page, **not in the suite**. After a Zurich rec/day, nothing asserts the **Zurich** heading or Full days vs Recs. If grouping regresses, E2E still greens.
- **Continue with Google** is on `/login` and `/signup`. Suite never even checks the button is visible. Clicking it stays human — John’s OAuth client. Fine. Blind to the button is a gap.
- **`/admin` Lumen log** (last 50 + month spend) exists. Suite user is not admin. No spec. Kill switch untested.
- Edit-day reorder + one Save → public layover: product has it (`savePlaybookEdit` + `writeStopOrder` offset). `layover.spec.ts` only create + delete. Founder item 7 is still a human click.
- Did not re-run `npm run test:e2e` this pass. Last claimed 9 passed (`NEXT-SESSION.md`). I will not stamp green without a run.

## Disagree with Theo (8/26) — the code moved

| 8/26 claim | Now |
|------------|-----|
| Dump/AI still never insert `place_photos` | They do: `rememberInAlbum` after `attachPlaceImage`, `generatePlaceStillNow`, `attachPlaceStill`. |
| Stop reorder unique-violates | Two-phase: position `i+100` then `1..n` (`writeStopOrder`). |
| Review farms plate JPEGs | Review mounts `PlatesEditor` with `namesOnly`. |
| Layover Save stays on edit; button never says Save | Edit is `EditLayoverForm` — one **Save**, `savePlaybookEdit` redirects to `/playbooks/[id]`. |
| Playbook title/narrative skip hotel gate | `refusePublicCopy` on create, meta, edit, and `publishReviewed`. |
| X on `legacy-hero` → “Photo not found.” | `removePlacePhoto` handles `legacy-hero`. Fake slot still exists if album is empty. |

Do not treat those as current blockers.

## Still real (I agree, or leftover)

- **Two stores + unshift.** Public rec and dashboard still `unshift` `places.image_url` if it is not in the album. `rememberInAlbum` no-ops at count ≥ 3. A rec with 3 album rows and a different hero can still show **4**. Cap is app-count only — no trigger. `legacy-hero` is still synthesized on empty album (edit + dump review).
- **`listPlacePhotos` still swallows** a missing table (`queries.ts:168–170` → `[]`). Write path says “paste 016.” Read does not. 016 is live per founder check; fail-open is still the wrong shape.
- Dead twins still sit in `media-actions.ts`: `addReviewDish`, `attachDishImage`, `sellPlaceBlurb` (still spends if called). `quality.ts` `lumenOffersStill` unused. `PlaceForm.allowHidden` destructured, never rendered. `PlaybookForm.submitLabel` still `_submitLabel` — create path always “Publish — live on the city.” Cleanup, not freeze.
- `lumen_set_city_hero` still `grant execute … to authenticated`. App skips when `CITY_HERO[slug]` exists; the RPC does not.
- Stop **titles/bodies** still skip `refusePublicCopy`. Day title/narrative are gated. Cheap regex is still not a lodging firewall.

## Admin / Google (gaps, not suite bugs)

- `/admin` = kill switch + Lumen log last 50. Phase 4 slice is built. E2E cannot see it without an admin fixture. Do not invent one this week.
- Google button is real (official G, Continue with Google). Land is `/dashboard`. Wiring the OAuth client is John. Playwright must not script Google.

## Verdict

Theo’s freeze-blockers from 8/26 are mostly gone. Remaining album issue is the unshift safety net, not “dump never writes `place_photos`.” E2E matches title / Account / Your recs / mine-only / rec CRUD / layover delete. It does **not** lock city grouping, the Google button’s existence, or the admin log. Founder feel-pass (Google if wired, dump/Lumen, a phone photo) is still the gate. Do not start Phase 3.
