# Phase 4 review

## 2026-08-27 — Theo, after feel pass

Read the files. Did not implement. Did not rubber-stamp. 08-26 is archive below; this pass is the code as it sits, not that memo.

### Verdict

The two freeze blockers from 08-26 are **fixed in code**: dump/AI/edit stills now `rememberInAlbum`, and stop reorder is a two-phase write (`position + 100`, then `1..n`). Edit day is one Save → `/playbooks/[id]`. Dashboard is published-mine-only. Admin is kill switch + last 50. Playwright exists and does not call xAI.

Not shippable as a freeze until dump **dedup matches the lock** (stop set, not title-first) and the public rec **stops showing four photos**. The rest is leftover and copy.

### 08-26 scorecard

| Item | Now |
|------|-----|
| Album write on dump upload / AI still / tap-hero | **FIXED.** `attachPlaceImage`, `generatePlaceStillNow`, `attachPlaceStill` all call `rememberInAlbum`. Review upload goes through `addPlacePhoto`. |
| Stop reorder `unique (playbook_id, position)` | **FIXED.** `writeStopOrder` in `playbooks/actions.ts:328–360`. |
| `listPlacePhotos` swallows missing table | **Still true.** Returns `[]` + console warn (`queries.ts:161–172`). Write path still says “paste 016”. 016 is live per founder-test table; this is a disagree-on-failure, not the album split-brain. |
| Review farms plate JPEGs | **FIXED.** `review-place.tsx` passes `namesOnly`. Edit rec too. Photo branch in `PlatesEditor` is dead UI. |
| Playbook Save stays on edit / button says Publish | **FIXED** for the live path. `savePlaybookEdit` redirects. `EditLayoverForm` button is Save. `PlaybookForm` still ignores `submitLabel` — only `/dashboard/playbooks/new` uses it, and Publish is the right word there. |
| Playbook title/narrative skip hotel gate | **FIXED** on create / meta / save / `publishReviewed`. Stop title + body still skip. Regex is still cheap (`Hilton crew stay` sails). |
| `lumen_set_city_hero` callable by any logged-in user | **Unfixed.** Same 011 RPC. App skips when `CITY_HERO[slug]` exists; the RPC does not. |
| No DB cap of 3 on `place_photos` | **Unfixed.** App `count` only. 016 backfill has no cap. |
| Nested Save | **Looks correct.** Rec e2e uploads a still then Adds a plate then Save without an accidental submit. Not a browser proof of every control. |
| Dead: `sellPlaceBlurb`, `addReviewDish`, `attachDishImage`, `quality.ts` / `lumenOffersStill` | **Still there.** Exported from `"use server"` files. `sellPlaceBlurb` still spends if anyone hits it. |
| `allowHidden` on `PlaceForm` | **Still unused.** Admin cannot hide a rec from this form. Status is a hidden field of the current value. |
| `legacy-hero` fake slot | **Still synthesized** when the album is empty (`edit/page.tsx:55–57`, `review-place.tsx:280–285`). `removePlacePhoto` special-cases the id so X no longer 404s. New dumps with a photo should have album rows. |

### Bugs

#### Dump dedup still keys off title first — Severity: bug

- File: `apps/web/src/features/ai-import/actions.ts:244–272` (`matchExistingPlan`), helpers in `extract.ts:242–253`
- Lock: same **stop set** = same day. Title drift must not ship a twin (`docs/MAP.md`, shareholder brief).
- What the code does, in order: `titlesMatch` → stop **titles** (`sameStopSet`, requires length ≥ 2) → place-id set (also ≥ 2) → first 80 chars of the day blurb.
- Two failures vs the lock:
  1. Two different days that Lumen titles the same (`Geneva layover`) collide. Title is hers, not the identity.
  2. A **one-stop** day with a new title does not hit `sameStopSet` or the place-id set (both require ≥ 2). Twin ships.
- Suggestion: Match place-id set (allow length 1) or normalized stop names. Drop title-first. Narrative prefix is a nice extra, not the key.

#### Public rec still unshifts the hero — Severity: bug

- File: `apps/web/src/app/places/[id]/page.tsx:54–78`, dashboard cards do the same then slice to 3 (`dashboard/page.tsx:93–99`, `your-cards.tsx:31`)
- Locked rule is album max 3, album is the list. New writes put the URL in `place_photos`. Public rec still: album rows, then `unshift` `stillForPlace` if that URL is not in the album.
- Seed exhibit: Zurich raclette. 016 backfill copied three plate JPEGs. Place has no `image_url`, so `stillForPlace` is `PLACE_STILL` `/landing/eat-zurich-raclette.jpg` — a fourth URL. Public rec shows **4**. Dashboard cards hide it (`slice(0, 3)`). Public rec does not.
- Suggestion: Render the album only, cap 3. If album is empty, one hero from `stillForPlace`. Delete the unshift. Then a trigger/check for the cap.

#### City-open line still promises a hero — Severity: bug

- File: `apps/web/src/app/share/review/[id]/page.tsx:65–88`
- `opened_city` gating is correct (copy only when she actually opened it). The sentence is not: `{City} ({IATA}) is on the map now. I’ll put a city hero up when you publish.`
- Spec (`features/ai-import.md`): never that second sentence on that line.
- Suggestion: First sentence only.

#### Skip-photo is still a checkbox — Severity: suggestion

- File: `apps/web/src/features/ai-import/review-place.tsx:255–329, 346–348`
- Lock: no pic → Lumen still. No checkbox homework (founder #5).
- Default is checked, so a rushed Next still generates. They can uncheck and get blocked. That is the homework.
- Suggestion: No checkbox. Empty album → `want_ai_still` true.

### Suggestions

- **`lumen_set_city_hero`:** any authenticated client can set `cities.image_url` when it is null. `heroForCity` prefers that column over static `CITY_HERO`. Validate URL host/bucket; refuse when a static hero exists; or restrict execute.
- **Hotel gate on stops:** `createPlaybook` still does not run `refusePublicCopy` on stop title/body. Day title/narrative now do. Regex is still not a lodging firewall.
- **`sellPlaceBlurb`:** unused UI, live server action, spends. Delete with `addReviewDish` / `attachDishImage` / `quality.ts`. Keep the `sell_blurb` log label.
- **`listPlacePhotos` vs write:** list still returns `[]` on a missing table. `addPlacePhoto` tells you to paste 016. Fail the edit/review closed, or show the same string.
- **`rememberInAlbum` swallows errors** (`counted.error` → return). Publish AI still then looks like a `legacy-hero` again.
- **`writeStopOrder`** does not check the delete error, and does not verify `orderedIds` belong to this playbook. Empty POST drops every stop.
- **Public rec Edit** is author-only (`places/[id]/page.tsx:79`). Layover Edit includes admin. Admin still has the URL.
- **`/playbooks/[id]`** still prints `Status: draft (not public)` (`page.tsx:114–118`). Dashboard will not send anyone there; the badge you killed on Yours still lives on that page.
- **E2E gap:** `layover.spec.ts` publishes a day and deletes it. It never Opens Edit → Up/Down → Save. That is the path that used to unique-violate. Rec spec never X’s a photo. Do not invent a second runner; Milo adds those clicks if we want them in the suite.
- **You-nav** adds Sponsor for admin/sponsor. MAP dropdown is Your recs, Admin if admin, Sign out.

### Nits / leftover

- `PlaceForm.allowHidden` destructured, never rendered.
- `PlaybookForm` `_submitLabel`. `updatePlaybookMeta` unused. `StopsEditor` unused (`savePlaybookStops` only lives for that dead component).
- `DISH_STILL` / `stillForDish` still stuffed onto edit-rec plates that render `namesOnly`.
- `AiStill` defaults `badge = "ai"`. Playbook city hero omits `badge`, so Zurich’s editorial banner gets the AI chip on `/playbooks/[id]`. City page also forces undefined → `"ai"`.
- `fillDraft` log-insert failure: “Check Yours.” Yours does not list drafts.
- Schema-cache retries (`PLACE_COLS` / `LEGACY` / `BARE`, `ownPlace`, `lumen-log`) — leftover 010/011 churn. Harmless if 011+016 stay applied.
- Nested photos/plates inside the Save `<form>`: controls are `type="button"`; rec e2e exercises the happy path.

### Dashboard / admin / chrome (08-27)

- `homeForRole` is `/dashboard` for everyone, including admin. Good.
- Dashboard: published only (`listMyPlaces` / `listMyPlaybooks`), city as a bold section, Full days vs Recs, seed Limmat excluded in e2e. Cards are not a CMS. No Edit on the card — public rec → Edit. Matches the lock.
- Header: Layover · Share your intel · Cities · profile icon. Account dropdown works; e2e opens it.
- `/admin`: kill switch + last 50 + month spend. No dump text. Non-admin redirected via `homeForRole`. Fine for this slice.
- Google button is the official G + “Continue with Google”. OAuth client is still John’s.

### E2E

- `apps/web/e2e`: browse, email login, rec create/upload/Get this/Save/zoom/delete, layover publish + delete day. `auth.spec.ts` says do not click Write it up. No `xai` / `XAI` / `images.generate` under `e2e/`. Workers = 1. Creds path is gitignored.
- Does not cover: Google, dump/Lumen, stop reorder + Save, X a photo, hotel dump.
- That is the right split. Founder still clicks dump.

### Do not delete (still used)

- `attachPlaceStill` — RecPhotosEditor tap-hero.
- `attachPlaceImage` — exported, **nothing imports it**. Duplicate of `attachPlaceStill`. Dead as of this pass.
- `addPlaceDish` / `updatePlaceDish` / `deletePlaceDish` — PlatesEditor names.
- `attachDishStill` — only while `namesOnly` is false. Both live mounts pass `namesOnly`.
- `addPlacePhoto` / `removePlacePhoto` / `rememberInAlbum` — album.
- `stillForPlace` / `PLACE_STILL` / `CITY_HERO` / `STOP_STILL` — city cards, rec hero, layover tiles. Seed stills are not a pipeline.
- `savePlaceReview` / `publishReviewed` / `generatePlaceStillNow` — share review.
- `compressStill` — upload UIs.
- `lumen_month_spend_usd` / `aiBlocked` — fail closed.
- RecStillEditor — still absent.

---

# 2026-08-27 — Milo

Read the files. Did not implement. Did not rubber-stamp the 8/26 list — that review is stale against what is on disk now.

Restored here after Theo’s 08-27 pass (it was appended to the 08-26 file; the rewrite dropped it). Theo agrees with the “still real” list. He adds three the E2E pass did not: dump **dedup is title-first** (and one-stop twins slip), city-open copy still promises a hero, skip-photo is still a checkbox.

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

---

## Archive — 2026-08-26 (Theo)

Read the files. Did not implement. Did not rubber-stamp. RecStillEditor is already gone.

The dump → review → publish path works as a product, and the locked rec-edit decisions (album max 3, plates as Get this names, Save then `/places/[id]`) are in the right files. What the burst left behind is two write paths for the same photos, a plate photo farm that public Get this no longer shows, and a stop-reorder that will unique-violate. Founder CRUD/photo test will hit the album split-brain unless 016 is applied *and* review/AI stills actually insert `place_photos` — they currently do not.

### Dead / leftover (as of 08-26; see scorecard above)

- `apps/web/src/features/ai-import/quality.ts:2` — `lumenOffersStill`. No importer. Whole file.
- `apps/web/src/features/ai-import/media-actions.ts:110` — `addReviewDish`. Twin of `addPlaceDish`. Nothing imports it. Review uses `PlatesEditor` → `addPlaceDish`.
- `apps/web/src/features/ai-import/media-actions.ts:141` — `attachDishImage`. Twin of `attachDishStill`. Nothing imports it.
- `apps/web/src/features/ai-import/media-actions.ts:435` — `sellPlaceBlurb` (“Make this sell”). Nothing imports it. Still spends if someone called it. `lumen-log.tsx:26` still labels old `sell_blurb` rows; keep the label, delete the action.
- `apps/web/src/features/places/rec-media.ts:111` `DISH_STILL` and `:126` `stillForDish` — only wired on edit rec (`dashboard/places/[id]/edit/page.tsx:10,45`) to stuff `image_url` onto plates that render `namesOnly`. Public Get this is names. 016 already copied those JPEGs into `place_photos`.
- `apps/web/src/features/places/place-form.tsx:34,49` — `allowHidden` destructured, never rendered. Edit rec still passes it (`edit/page.tsx:74`). Admin cannot hide a rec from this form.
- `apps/web/src/features/playbooks/playbook-form.tsx:33` — `submitLabel` bound as `_submitLabel` and ignored. Edit layover passes `"Save"` (`edit/page.tsx:58`); the button always says “Publish — live on the city”.
- `apps/web/src/features/places/plates-editor.tsx` — upload / Replace when `namesOnly` is false. Public rec page does not show dish photos. Review now passes `namesOnly` (fixed 08-27).
- Duplicate attach-hero: `media-actions.ts` `attachPlaceImage` (review) vs `places/actions.ts` `attachPlaceStill` (edit). Collapse later; both were live on 08-26. 08-27: review no longer imports `attachPlaceImage`.
- Schema-cache retries (`queries.ts` PLACE_COLS / LEGACY / BARE, `media-actions.ts` `ownPlace`, `lumen-log.tsx`) are leftover from the 010/011 churn. Harmless if 011+016 are applied; do not delete until John has run them.

### Bugs (as filed 08-26)

Album not source of truth after dump/publish; stop reorder unique-violate; `listPlacePhotos` swallows missing table; review plate-photo farm; playbook Save stays on edit; layover title/narrative skip hotel gate; `lumen_set_city_hero` any authenticated; no DB cap of 3; PlaceForm nested controls.

08-26 verdict: not shippable until the album is one table and stop reorder does not unique-violate. Both of those are **fixed in code** as of 08-27. Remaining freeze issues are on this pass’s scorecard, not this archive.
