# CEO log

Append-only decisions and board outcomes. Newest first.

---

## 2026-08-31 — Profiles instead of follow

**Source:** Shareholder — maybe no follow; do profiles. Tap someone else’s posts, see where they’ve been / eaten / done / bought. “Posted by Crew” is wrong. Get the Google name, let them edit, pic or initials. Asked who liked vs count. Sofia/Lumen on the picture.

**Facts:** Phase 3 v1 locked like + comment + byline; follow and profile-as-product were **out**. `Posted by Crew` is not the Google button. `handle_new_user` writes id/email/role/status only — never `full_name`. `byline_for` maps empty → **Crew**. RLS is `profiles_select_own`; no update policy. Header icon is a silhouette. Dashboard **Your recommendations** is already “my posts.” What’s missing is the **public** twin. SQL 018+019 still need his paste. Dump/edit/photos frozen. `likes` select is currently open on the whole row (user_id included) — count-only means that cannot stay as a public who-list.

**Not this product:** influencer network. No bio essay, follower count, follow button, DMs, “people in Zurich” rail. City pages stay Eat / Do / Buy + plans. Airline, hotel, home base stay off the page.

### Decision (CEO rec — John confirms likes)

| Item | Call |
|------|------|
| Primary bet | **Public author page, not follow.** Same object as Your recommendations, public. |
| On the page | Name, avatar, published recs + days grouped by city. Edit own name + pic. |
| Off the page | Bio, followers, follow, DMs, like-activity, completion scores, airline/hotel/base. |
| Name | Copy Google `full_name` / `name` on signup. Editable. Empty → **Crew**. Not email. Not “Someone.” Backfill existing nulls. |
| Avatar | Sofia/Lumen pick. Constraint: **no AI spend**, initials OK. Do **not** auto-publish Google picture. |
| Likes | **Count only.** Named signal = the note. Sponsors never see who liked. |
| Byline | **Link** to the author page when there is an author. Seed/null stays Crew, not a link. City is still the hero. |
| Still out | Follow, pings, QR. Dump/edit/photos frozen. |
| Spend | Avatars are uploads or initials. John’s $20 is rec/city stills. |

**Shareholder ask:** Yes on the author page. **Yes/no on like lists** (rec: no). No `apps/` from CEO.

**Status:** Spec in `features/social.md`. Build after 018+019 and his likes call.

---

## 2026-08-31 — Comment delete is Remove

**Source:** Shareholder — “Take off” on a note is weird. Meant delete or remove comment. Asked Maya + Lumen how like / comment / byline look.

**Facts:** Visible own-note action is **Take off**, stolen from rec-gone admin “Taken off the city” and rec/day **Take this rec off**. Recs leave the city. A note does not. Dump/edit/photos stay frozen. Follow / profiles still out.

**Lumen (simulated):** Byline and Like are quiet trust. Comments as notes is the right job. **Take off** is the wrong metaphor. **Delete** is a CMS. Lock **Remove**.

**Decision:**

| Item | Call |
|------|------|
| Note delete | **Remove** (aria **Remove note**) |
| Rec/day delete | Unchanged — Take this rec/day off · Taken off the city |
| Not the word | Delete · Remove comment · Take off on a note |
| Product | Like + byline + notes stay. Destination-first. Not a people feed. |
| Freeze | Copy is freeze-worthy **after** the string swap. Phase 3 is not frozen until he clicks it. Do not unfreeze dump. |

Engineering swaps the string + Playwright. No `apps/` from CEO.

---

## 2026-08-31 — Comments on recs, edit own, photos, Lumen gate

**Source:** Shareholder — comments showed on full days, not recs. Asked to edit own comment, upload pictures (3 max), Lumen moderate.

**Facts:** v1 spec put threads on playbooks only. Recs already had like + byline. Dump/edit/photos stay frozen. No AI spend for this gate — same cheap lodging regex as dumps, plus PG-13 keywords. John does not sit a queue.

**Decision:** Comments on recs and days. Author can edit/take off. Up to 3 photos (same cap as a rec). Lumen refuses hotel copy and PG-13. SQL **019** after **018**. Follow / profiles still out.

---

## 2026-08-27 — Hygiene then thin Phase 3

**Source:** Shareholder — Phase 4 felt chaotic, lots of bugs and bandaids. Asked whether to organize / code-review before Phase 3.

**Facts:** Phase 4 is **complete**. Dump/edit/photos **frozen**. Feel pass passed. Playwright exists. Theo/Milo 08-27 review: freeze-blockers fixed; leftovers are cleanup, not a product gap. Chaos was coding while photos/dashboard locked in the room — not a rotting app. No third full review.

**Theo:** Four-item hygiene, then like + comment + byline. A day, not a phase. Do not unfreeze dump.

**Milo:** Tests chased copy. Jumping to likes replays it. Thin `features/social.md` before code. Playwright spec for likes on day one. Two e2e clicks in hygiene (Edit day → Up/Down → Save; X a photo). Votes the week.

### Decision (CEO rec — John says yes/no)

| Item | Decision |
|------|----------|
| Primary bet | **Hygiene then Phase 3.** Not a cleanup month. Not likes tomorrow. |
| Phase 3 v1 | **Like + comment + byline only.** City stays destination-first. |
| Out of v1 | Follow, profile-as-product, follow-pings, completion, QR. |
| Hygiene | Theo’s four + Milo’s two e2e clicks. Bounded. Not a rewrite. |
| Frozen | Dump / edit / photos. Do not reopen. |
| Not next | Stripe. Facebook. Restore the 3-draft cap. A third full review. |

Hygiene list (when he says go): (1) delete `sellPlaceBlurb` + dead twins, (2) lock `lumen_set_city_hero` RPC, (3) hotel gate on stop title/body, (4) stop swallowing album errors, (5) Playwright Edit→Up/Down→Save and X-photo.

**Shareholder ask:** Yes/no on this sequence. No `apps/` from this meeting.

**Status:** Scope locked on paper (`features/social.md`). Build **not** started.

---

## 2026-08-26 — Facebook / Instagram: no (login and feed)

**Source:** Shareholder on the Supabase Google OAuth screen. “I should probably allow facebook/instagram too.” Also: maybe link Instagram so crew posts of awesome layovers show on Layover. Auth first.

**Facts:** This cut is already locked: **Google + email.** Not Apple. Not Facebook. Phase 4 close, not Phase 3 social. Two different products mixed:

1. **Sign in with Facebook/Instagram** — Meta OAuth, App Review, privacy-policy URL, operator load.
2. **Link Instagram as content** — Instagram Basic Display is dead. Graph API wants Meta business/creator accounts, app review, ongoing moderation. A feed/import product, not a login button.

Low operator load is a primary goal. Trust > disguised ads. Supply first (Lumen dumps). Thin Phase 3 later is like + comment + byline. Follow-notifications / QR already parked.

### Decision (locked)

| Item | Decision |
|------|----------|
| Google | **Finish this week.** Skip nonce **Off**. Allow users without an email **Off**. |
| Facebook / Instagram login | **No.** Not this cut. Not next unless he wants a Meta app-review job instead of closing Phase 4. |
| Instagram-as-content | **Later, separate product.** Bad fit for zones-not-hotels + low moderation. Crew already dump. Sofia’s door is Google. Probably not this year. |

**Shareholder ask:** Fill Google Client ID + secret. Leave the two toggles off. Ignore Facebook. Dump the rec if they have a trip — do not pipe IG.

**Status:** Locked. Brief + COMPANY_LOG. HUMAN-SETUP already says don’t add Facebook — unchanged. No `apps/` from CEO.

---

## 2026-08-26 — Founder test: product locked (seven items)

**Source:** Shareholder click pass. Seven fails. Engineering context: dump still writes `places.image_url` not `place_photos`; no save-draft button but Lumen inserts draft rows; John is admin so dashboard can list everyone’s recs; Google OAuth was parked in HUMAN-SETUP; itinerary match is title OR stop set (title drift twins a day); playbook narrative not filled from dump; “city on the map now” fires when the city already exists.

**Facts:** Phase 4 is still **in progress**. Not Phase 3. Not Stripe. Trust > revenue. Zones, not hotels. Hotel strip on the dump **worked** — keep it.

### Decision (locked)

| Item | Decision |
|------|----------|
| A. Google sign-in | **This cut.** Crew will not keep a hotel-room password. **Not** Apple / Facebook — that is partner sprawl. Email + password stays. Sofia + Lumen restyle `/login` now (copy, not a new product). **John** creates the Google OAuth web client and pastes it into Supabase Auth. Maya cannot. Button ships after that. Restyle does not wait. |
| B. Rec photos | **Hero = the place (exterior / walk-up). One shot. City card.** Eat/Buy: **up to 3 named dish photos** on Get this. Two jobs, two labels. Never two unlabeled upload slots. Do: place still only. No AI still per dish. No photo of the place → Lumen generates on publish (AI flag). Do **not** copy the exterior onto a plate. Dump/AI must write the album / plate rows — `image_url` only is why the same JPEG showed twice and why Save ate a photo. **Supersedes** 2026-08-25 “one album, tap hero, plates are names only.” That lock confused the founder. |
| C. Drafts | **No draft product.** No `(draft)` on dashboard. No `Status: draft` on a rec page. Unpublished Lumen rows stay off public **and** off My posts until Publish. Review cards on `/share` are the only unpublished surface. Abandoned rows: hide (GC later, not this cut). |
| D. Dashboard | **This user’s published recs and days only.** Seed (`author_id` null) is not yours. Other people’s posts are not yours. Admin may still edit a rec from the public page. Dashboard is not the moderation queue. Queue = **Phase 6**. Do not pull it forward because John is admin. |
| E. No-photo recs | **No black rectangle.** Already Lumen’s rule — enforce. No upload → she stills on publish. Drop the checkbox as homework. |
| F. Dedup | **Match stop set** (same city, same places). Title wording is Lumen’s, not a new day. Refuse the twin. Recs already match by name. **Day blurb is required from the dump** she already has — review card filled, publish refuses empty narrative. “Geneva/Barcelona is on the map now” **only** if she actually opened that city this dump. GVA and BCN exist. Do not lie. |
| G. Edit layover | **One Save.** It persists drop/reorder and keeps the day live. Then redirect to the public layover. No Publish + Save order + Back. |
| H. Delete | Delete day **must work** (recs stay — already locked). Delete-rec **copy = Sofia.** Meaning: rec comes off the site; the day stays minus that stop. |

### Why not more

Login partners plural is a third product. Admin-sees-everything is Phase 6 dressed as a dashboard. Two unlabeled photo slots was us being confused — labeled jobs, not a gallery product.

**Shareholder ask:** Google Cloud OAuth if he wants the button this week (`HUMAN-SETUP.md`). Then re-click FOUNDER-TEST on his recs after the pack.

**Status:** Locked. Brief + COMPANY_LOG + specs aligned. No `apps/` from CEO. Sofia/Lumen on copy. Theo/Milo implement.

---

## 2026-08-26 — Close Phase 4; founder test is the job

**Source:** Shareholder — feels he should test everything, does not want to. Asked what Grok can test vs what he must, for point-by-point clicks, a thorough code review, and to “test and get organised for next phase.”

**Facts:** Phase 4 is **in progress**, not done. SQL **008–016** exist on disk. **016 `place_photos` is not in his live Supabase.** Phase 3 social waits until after Lumen (already locked). Phase 5 Stripe not started. Daily 3-draft cap parked. $20/mo + 4k chars + kill switch locked.

**Grok vs John:** Engineers can read code, typecheck, and review the album pivot. They cannot paste SQL into his project, upload from his camera roll, or see a hotel leak on a published rec. That is him.

### Decision (locked)

| Item | Decision |
|------|----------|
| Primary bet | **Close Phase 4.** SQL (011 + 016) → founder click pass → Theo/Milo dead-code cleanup → **freeze** dump / edit / photos. |
| Not next | Phase 3 likes/comments. Phase 5 Stripe. QR, completion, follow-pings. Restore daily 3-draft cap. |
| Founder test | Required. Script: `docs/board/FOUNDER-TEST.md`. Skipping it is not “getting organised.” |
| Code review | Theo/Milo **after** (or in parallel with) the pass — album vs leftover dish images, RLS, dead paths. Not a substitute for clicks. Maya does not review `apps/`. |
| Trust | Zones, never crew hotels. One dirty dump in the script. Labeled ads later; not this cut. |

**Shareholder ask:** Run 011 + 016. Click the script. Report fails. Do not open Phase 3/5 this session.

**Status:** Locked. Brief + next-session + COMPANY_LOG aligned. No `apps/` from CEO.

---

## 2026-08-26 — Correction: 011 + 016 are live

**Source:** Chief Engineer probe (anon PostgREST + public stills). Maya’s lock above assumed 016 missing from older session logs.

**Facts:** `place_photos` returns rows. `lumen_month_spend_usd` returns **0.40**. User and AI JPEGs in `place-stills` return 200. xAI key is set. Founder still must click logged-in CRUD. Two code bugs remain (album write split; stop-position unique). Primary bet unchanged: close Phase 4, not likes.

---

## 2026-08-25 — Keep recs; Lumen moderates

**Source:** Shareholder — if the plan write fails, keep the individual recs. Lumen must moderate all entries (real places at least). He does not want to moderate.

**Lock:** Recs stay. Lookup must confirm a real venue or public activity; hotels/PG-13 refused. No founder queue. Admin hide remains Phase 6 nuclear.

---

## 2026-08-25 — Don’t ask for heroes; publish when ready

**Source:** Shareholder — he’ll pay for city heroes (1/city); Lumen may freshen with good user shots and should monitor the site. AI writes the blurb; they edit. Photo = upload or checkbox, generate after publish, one generation. No save-draft button. No duplicate itineraries. Asked what the four opaque review items meant (definer RPC, search log, city-open grant, orphan writes) — those are implemented, explained in the session.

**Locks:** City-hero spend no longer a ping. $20 is company-wide (SQL **011**). Publish is the only done button.

---

## 2026-08-25 — Team meeting: make Lumen happy

**Source:** Shareholder — seed data aside; thorough Theo/Milo review of the dump-to-draft work; lock Lumen’s job and rules; give her the BCN hero.

**Done:** BCN city hero (John authorized). `/cities` is cards, not a phone book. Search hint lists live IATA. Charter: `agents/lumen.md` (she is live; dump once; unpack; city-open; ask John for heroes; duplicate itinerary is a known gap).

**Next:** founder test. Then itinerary dedup. Phase 3 still waits.

---

## 2026-08-25 — Pause: Phase 4 live locally; testing next

**Source:** Shareholder — “Gotta break. Update docs. Commit. When I come back: major testing. Already see a bug: full layover uploaded twice. Lumen must not copy the same itinerary. Code review later. Not tonight.”

**State:** Lumen dump → lookup → sequential rec cards → layover stills strip → publish (recs + day). BCN is on the site.

**Next (do not start tonight):** (1) founder test pass, (2) itinerary dedup, (3) Theo/Milo review of `features/ai-import/`.

---

## 2026-08-25 — Daily 3-draft cap parked

**Source:** Shareholder hit “Three for today. Drop another tomorrow.” while testing Lumen. Take it off for now; put it back later.

**Decision:** Per-user daily extract cap **off**. Constant parked at `DAILY_EXTRACT_CAP = null` in `apps/web/src/features/ai-import/schema.ts`. Restore in a later phase (ops / before public users). **$20/mo, 4k chars, kill switch stay.**

---

## 2026-08-24 — Phase 4 started: John said yes

**Source:** Shareholder — yes on Phase 4; asked how to get an xAI key.

Dump → draft is in the app (`/share`). Cap **$20/mo**. Photos/generate-on-publish still to do in this phase. He must: console.x.ai credits + key in `.env.local` + SQL 008.

---

## 2026-08-24 — Board: Phase 4 Lumen first; Phase 3 waits on purpose; QR/completion parked

**Source:** Shareholder — skip Phase 3 (likes) for Lumen, or do “the whole social side”? Dump mixed likes/comments/follow/notifications/profiles/completion scores/admin-ban **and** restaurant QR that pays crew a cut of ad revenue. Also: “Lumen gets important before we start adding posts.”

**Facts:** Phase 2 + 2.1 complete. Phase 3 is spec only (`features/social.md`: like, comment, follow, basic profile — destination-first, not an influencer feed). Phase 4 Lumen is spec only; spend lock still holds (key + $20). Phase 1 already has admin role + hide; full ban queue is Phase 6. Lumen does **not** depend on social tables.

**Sofia:** Likes/follows on today’s four thin cities would feel like a deserted Instagram. Lumen-before-social **is** the hotel-room product. QR-for-ad-cut is a coupon/kickback, not intel. Completion scores are a game.

**Theo:** John’s list is five products, not Phase 3. Notifications need push/email infra. Completion score is new schema. QR revenue share needs Stripe Connect, KYC/tax, fraud — Phase 5+ money product. Social after Lumen is cheaper because there are posts to hang signals on.

### Decision (locked as CEO rec — John has not said go)

| Item | Decision |
|------|----------|
| Primary bet | **Phase 4 Lumen first.** Supply engine. John’s AI-maintained / almost-no-forms bet. |
| Phase 3 | **Waits on purpose**, not skipped. Thin cut **after** Lumen has produced real posts: **like + comment + byline profile.** City stays the hero. |
| Follow | Content **filter** later. Not “great accounts to follow” as the product. Not a people home feed. |
| Admin / ban | Hide already exists (Phase 1). Full queue = **Phase 6**. Do not pull forward. |
| Follow-notifications | **Parked.** Person-centric social we rejected (destination-first, 08-05). Needs infra we do not have. |
| Completion score / “already done” | **Parked.** A game. New schema. Not intel. |
| QR ad-revenue share | **Parked hard.** Coupon/kickback, not intel. Trust + identity (KYC, tax, fraud, bought recs). Revisit **only** as a *labeled* offer code **after Stripe**, never as “this rec paid me.” Organic staples cannot be the payout rail. |
| Phase 4 start | **Still blocked** on John yes + `XAI_API_KEY` + $ cap. Do not implement `apps/` from this meeting. |

### Why this is one bet, not five

The fork is **supply vs social**, not likes vs Lumen. Forms are why cities stay thin. Social amplifies trust **after** there is intel to trust. Follow-pings + QR payouts would become the person-centric network we already killed.

**Shareholder ask:** Yes/no on Phase 4 (key + **$20/mo**). If no, we sit. We do not build the social network instead.

**Status:** Order locked in brief + MAP + social spec. Build **not** started.

---

## 2026-08-24 — Spend lock: no AI/money without John; tight user caps until invoices

**Source:** Shareholder — cost must be contained; no spending without his authorization; caps on user interactions until we know the real bill. Also: keep Lumen prompts to a minimum (users dictate; one follow-up if needed). Sofia owns that UX.

**Facts:** Phase 4 is still not built. Cheap rails already locked (`grok-4.3`, $0.02 stills, 1 still/place, $20/mo, city hero needs John). This entry makes the *authorization* unforgettable — not a new product.

### Decision (locked — still not building Phase 4)

| Item | Decision |
|------|----------|
| Production AI | **Off** until John puts the key in **and** names the monthly cap. That pair is the yes. |
| Raise anything | Quotas, $20 cap, Imagine quality, extra stills, regen, web search, city-hero refresh = **John**. Not Maya, not engineering “tuning.” |
| User caps (until measured) | **3 drafts / user / day.** **One extract** per story. **At most one** follow-up. |
| Lumen talk | Users **dictate** (OS keyboard mic). Sofia **locked**: holes on the form (no second model call). **One** Q only if she cannot draft (no city / no place). |
| Kill switch | Ships with Phase 4. John/admin can kill AI globally. Default off until the yes above. |
| Other paid cloud | Supabase Pro, Vercel Pro, new vendors = John. |

Supersedes same-day Lumen v1 “1–2 follow-ups”: **one** is the max, and zero is better if Sofia can show the holes.

**Shareholder ask:** None new. Phase 4 still waits on yes + key + cap.

**Status:** Locked in OPS + brief. Build **not** started.

---

## 2026-08-24 — Cheap media: 1 still/place; layover unpacks to places; city hero needs John

**Source:** Shareholder — dollar/post is too high; then: one city hero, 1 still per place, hope for user pics, layover = combo of places, Lumen should file those places too.

### Decision (locked — still not building Phase 4)

| Item | Decision |
|------|----------|
| Text | Stay xAI. Product extract = **`grok-4.3`**, not 4.6. |
| Still | **`grok-imagine-image`** (~$0.02). Photo-first. **One still per new place.** Generate on publish. No regen. |
| Plan | **No extra still.** Stops reuse place stills. |
| Unpack | Full layover draft = **places for each stop** (or link existing) + the plan. Max 4. User confirms the bundle. |
| City hero | **One per city.** Rare refresh. Lumen **asks John before spending.** |
| Upload | Supabase Storage. Cheap to keep (~2¢/GB-mo). Compress so bandwidth doesn’t bite. Ship with Phase 4. |
| Cap | Default **$20/mo** hard stop. Target **~2–5¢/post**. |
| Leave xAI? | **No.** Pictures were the dollar. Other text models save pennies. |

Phase 4 still waits on yes + `XAI_API_KEY`.

---

## 2026-08-24 — Lumen v1: Grok drafts the form; no auto-post; Phase 4 waiting yes

**Source:** Shareholder — how do we bring AI to life? Grok? Can Lumen fill the form and draft a post?

**Facts:** Phase 4 is spec only (`features/ai-import.md`). Stack already locked: xAI, `XAI_API_KEY`, `https://api.x.ai/v1`, grok-4.5, server-side. City pages exist (Eat/Do/Buy + plans). Lumen hired as the site; not wired. OPS forbids unbounded travel-agent chat billed to the owner and auto-publish. Board #3 once said Phase 3 Social next; later locks (08-22/23) put AI draft-from-story after city UI. City UI is in. Social still not started.

### Decision (locked as CEO stance — Phase 4 does **not** start until shareholder yes + key)

| Item | Decision |
|------|----------|
| Provider | **Grok / xAI. Still yes.** Already locked. Structured JSON extract. Do not swap to a browser ChatGPT toy. |
| Lumen v1 | She **fills the existing form** from a story. Auth required. One-shot extract preferred. 1–2 follow-ups if the post is thin (dish, zone, hours). Photo: ask first; else generate and stamp **AI**. User edits and publishes. Same RLS. Hotels → zones. PG-13. |
| Not v1 | Chatbot that auto-posts. Unbounded “plan my layover” chat on John’s bill. Client keys. City concierge. Voice. Auto-publish. |
| Phase 3 Social | **Wait.** Likes on empty cities is theater. Supply engine first. |
| City polish | **Not a blocker.** Do not restyle city pages to delay AI. |
| Phase 4 start | **Blocked** on John yes + `XAI_API_KEY` in `.env.local`. Do not pretend we started. |

### Why Grok, not “whatever chat”

We already bought the stack. OpenAI-compatible, server-only, JSON schema. Lumen’s job is extraction + a short missing-field ask, not a personality companion. Switching providers now is founder fidgeting.

### Why this is not a third product

Lumen is the **site**, talking. The object is still Eat/Do/Buy recs and layover plans. She drafts those rows. She does not become a travel agent, a moderator dashboard, or a second app.

### Why Social waits

John’s bet is **AI-maintained, almost no forms**. Empty forms are why cities stay thin. Social amplifies trust **after** there is intel to trust. Board #3’s Phase 3-next is superseded by that bet + city UI being in.

### Engineering implication (only if shareholder says yes)

Milo/Theo implement `features/ai-import.md` as Lumen on the add flow: server extract, quotas, `AiImportLog`, kill switch, hotel strip, draft-then-confirm. No unbounded chat UI. No auto-publish. No `apps/` from CEO.

**Shareholder ask:** Yes/no to open Phase 4. If yes: xAI key in `.env.local`. Optional monthly $ cap.

**Status:** v1 meaning **locked**. Build **not** started.

---

## 2026-08-22 — Homepage re-lock: intel + Eat/Do/Buy; Perfect layover is a subsection

**Source:** Shareholder — rejects “Steal the whole layover.” Product is intel for crew, by crew: what to do, where to eat, what to buy, or the full suggested layover. Landing = three main cards, then a subsection for the full experience. Running Instagram theme: “The perfect layover does not exist… {City} edition.” Minimal reading on `/`. Clicking a city should *eventually* be pics of eat / do / buy.

**Facts:** Homepage just shipped steal-the-layover + featured plans. City page is 4-chip **text** (Full layover · Eat · Do · Shop), not photos. Multi-photo / city grid deferred 2026-08-05. No image pipeline, no place photos in DB. Do not fake stock of real venues. A still locked. Zones not hotels. Phase 5 ads already use “New idea…” — do not steal that voice for organic plans.

### Decision (locked)

| Item | Decision |
|------|----------|
| Steal headline | **Killed.** Not the product. |
| Homepage job | **Intel for crew, by crew.** Minimal copy. |
| Primary scan on `/` | Three cards: **Eat / Do / Buy**. |
| Full sequenced layover on `/` | **Subsection**, not a fourth hero card. Series name: **The perfect layover**. Line: “The perfect layover does not exist… {City} edition.” Body = existing Zurich + Delhi layover plans. |
| Public third verb | **Buy** — one word, everywhere customer-facing (homepage cards, city chip, add chooser, place groups). |
| Shop | **Retired as public copy.** Internal category may stay `shop`. Do not run Shop and Buy together. |
| Object | Still **layover plan**. “The perfect layover” is the *homepage series*, not a new object, not chip 1, not an ad name. |
| City chip 1 | **Keep Full layover.** Shareholder reordered the **landing**, not the city page. Landing vs city may differ. |
| City photos | **Parked.** Destination-first intent stands. Ship when we have real images. Do not promise Barcelona pics. Do not greenlight stock of real venues. |
| Ads | Labeled **“New idea…”** only. Never sell “The perfect layover” as sponsorship. |

### Why Buy not Shop

Shareholder verbs are eat / do / buy. Destination-first already said “what to do / eat / buy.” Shop is a store; Buy is the job. One public word.

### Why Full layover stays on the city page

City page is the à-la-carte + complete-plan scan. Chip 1 still means “copy-paste the whole ordered layover.” Homepage leads with the three recs and tucks the series under **The perfect layover**. Same object, different surface.

### Why photos wait

Phase 2 is text/structure. No photo rows, no upload pipeline, no honest Barcelona grid. Fake venue photos would burn trust. Same destination-first city surface **later**.

### Engineering implication

**Ship `/` now.** Constraints:

- Kill “Steal the whole layover.”
- Minimal intel line. Three cards Eat / Do / Buy.
- Subsection The perfect layover + IG series titles on existing Zurich/Delhi plans.
- Rename customer **Shop → Buy** (city chip, groups, add chooser). No schema change.
- Keep city **Full layover** chip and text lists.
- No brand pass, no new tables, no Ontario, no image pipeline, no stock photos.

**Non-goals:** city photo grid, Barcelona edition (no Barcelona city), Phase 3, Stripe, turning Perfect layover into an ad rail.

**Shareholder ask:** Hard-refresh `/` after ship. Yes/no on the landing.

**Status:** Locked. Brief + PRODUCT + specs aligned. Engineer implements. No `apps/` from CEO.

---

## 2026-08-22 — A locked: crew-layover wedge; one object, not two sites

**Source:** Shareholder — rejects B (general fun = worse income). Locks crew-layover primary because it solves word-of-mouth-only recs. Pushes back on “two websites”: Cypress Lake camping vs 12h Zurich is the same stealable done-for-you sequence.

### Decision (locked)

| Item | Decision |
|------|----------|
| Fork | **A** — crew-layover primary. Other travelers welcome on the same city content. |
| B | **Rejected.** Broader “everyone fun” is less likely to make money and does not solve the crew recs problem. |
| C | Not the pick. The object is allowed to grow later; we do not hide that. |
| One site / one object | **Locked.** Ordered stealable plan is the object. Hours in a city vs days at a park is **timing**, not a second product. |
| Wedge / money | Crew layover **now**: city density, labeled venue sponsors, crew-trust. |
| Ontario / multi-day | Same object **later**. Not this year. Not on `/` until it exists and can be browsed. |
| City IA | **Unchanged.** Full layover · Eat · Do · Shop. |
| Homepage | **Greenlit:** small `/` copy/layout cut. Zurich + Delhi. Crew as source. Sell stealable full layover. |

### Why this is not B in disguise

Shareholder is right that camping *feels* like the same product. That does not mean we build it now. Camping first-class would re-scope IA, seed, SEO, and the sponsor buyer (parks/guides vs city venues). A stays the **money and trust wedge**. Later expansion reuses the object — it does not split the company.

### Correction from last brief

Prior note called Ontario a “different product.” **Wrong frame.** Same object, later. Wedge stays crew-layover so we actually have a buyer.

### Engineering implication

**Do the homepage copy cut.** Constraints:

- Rewrite `/` copy/layout using existing Zurich/Delhi
- Keep “from people who fly” / crew as source
- Sell stealable full layover
- No Ontario, no brand pass, no new tables, no Phase 3
- Do not re-scope city IA

**Non-goals:** second site, camping seed, trip-type IA, design system.

**Shareholder ask:** None. A locked.

**Status:** Locked. PRODUCT audience aligned. Brief updated. Engineer implements `/` copy. No `apps/` from CEO.

---

## 2026-08-22 — Homepage vs brand; audience fork (pending pick)

**Source:** Shareholder — uninspired by homepage; wonders if UI is too soon. Feels the site has shifted from “for flight crew” to “for everyone looking for something fun.” Ontario camping trip (Cypress Lake, Sauble Falls, Halfway Dump bouldering, The Grotto — 4d/3n) “belongs on this website.” Wants done-for-you full experiences.

**Facts:** Homepage is still a Phase 1 stub (crew headline + Browse cities). City IA (Full layover · Eat · Do · Shop) and Zurich/Delhi seed are the real product. No design system. Phase 3 not started. PRODUCT already lists other travelers as same content, lower verification priority. Ontario trip is playbook-shaped, **not a layover**.

### Split (locked as CEO stance)

| Topic | Too soon? |
|-------|-----------|
| **Copy / positioning on `/`** | **No.** Timely now that city pages exist. Cheap. Must stay honest to Zurich/Delhi. |
| **Visual brand / design system / marketing-site rewrite** | **Yes, still later.** Do not greenlight. Uninspired homepage ≠ need a brand pass. |
| **Promise Ontario camping on `/`** | **No.** Cannot browse it. Dishonest. |

### Product fork (not a vibe)

| Option | Meaning |
|--------|---------|
| **A (CEO rec — tight)** | Stay **crew-layover primary**. Other travelers welcome on the same city content. Homepage may talk stealable **full sequenced experiences** without dropping crew as the source. |
| **B** | Broaden now to general done-for-you itineraries. Camping in scope. Layover becomes one trip type. Changes homepage, IA (city vs trip), seed, SEO, sponsorship (venues vs parks/guides), crew-trust story. **Do not pretend we built this.** |
| **C** | Park general experiences. Keep layover wedge. Log Ontario as *future* proof that the object (layover plan) wants to grow into “full experience plans.” Homepage can stay stub. |

**Default unless they abandon crew: A (tight), with C’s parking of Ontario-scale trips.** They did not clearly abandon crew; they named a new feeling after a non-layover trip.

### Why not B now

- Money still rests on **crew density in cities** + later labeled city sponsors. General “fun” has no wedge and a different buyer.
- Phase 2.1 city IA just shipped — do not throw it away for trip-type IA we don’t have tables for.
- Time scale (hours vs days) and geography (airport/city zones vs parks/crags) are different products, same object *shape*.
- Trust: crew as source is the supply. Other people stealing the plan is already allowed. “For everyone” as the headline on a two-city layover site is worse than a stub.

### Ontario trip (logged, not built)

Proof that the **object** (ordered, stealable, look-no-further plan) is the thing they love. **Parked:** multi-day, non-city, general-audience experience plans. Revisit after layover density + city IA is proven — not this cut. Crew hotels remain forbidden on the public site regardless.

### Engineering implication

- **If A:** small `/` copy/layout cut only. Point at Zurich + Delhi full layovers. Keep crew as source. No new tables. No design system. No camping seed. No Phase 3. City IA unchanged.
- **If B:** stop. Re-scope as a different product. No small copy cut.
- **If C:** no homepage rewrite required. Optional one-line polish. Ontario stays a log note.

**Non-goals this cut:** brand/theme pass, marketing site, new trip type, schema, Phase 3, renaming the company.

**Shareholder ask:** Pick **A / B / C**. CEO rec = **A**.

**Status:** Recommendation written. PRODUCT **not** changed until they pick. Brief updated. No `apps/` until yes on A (or explicit B/C).

---

## 2026-08-21 — Shareholder: ship Full layover (built)

**Source:** Shareholder — “ok full layover.”

Chip 1 + 4-chip city page **approved**. Engineering shipped the UX/copy cut: jump chips, Eat/Do/Shop groups, dashboard chooser, layover-plan copy. No schema change. No Phase 3.

**Shareholder ask:** Refresh Zurich / Delhi.

**Status:** Built.

---

## 2026-08-21 — Chip 1 locked: Full layover

**Source:** Shareholder — “full recommendations by other crews… the whole shebang. look no further. copy paste. full package. itineraries? Guides?” Naming chip 1 on **Full layover? · Eat · Do · Shop**.

**Job-to-be-done (locked):** A **stealable full crew layover** — complete, operational, copy-paste, look no further. Not a travel blog. Not one eat/do/shop rec.

### Decision (locked)

| Item | Decision |
|------|----------|
| Chip 1 | **Full layover** |
| Object | **layover plan** (unchanged). Add flow: “Add a layover plan.” |
| Itineraries | **Rejected as chip.** Accurate as later sentence copy (“copy this itinerary”). Tourism-generic as a tab; no crew flavor; does not say *complete*. |
| Guides | **Rejected.** Sounds like a person (“follow this guide”) or a PDF. Fights destination-first (city is hero, not the poster). |
| Plan as chip | **Rejected.** Right as the object name; too thin as the tab next to Eat/Do/Shop. Completeness is the differentiator — that word is **Full**. |
| Full package / full recs / crew recs / crew staples | **Rejected as chip.** Package ≈ sold tour (already bounced with adventure). Eat/Do/Shop are already recs. “Crew staples” is the *whole organic rail*, not this group only. |
| Copy-paste / whole shebang / look no further | **Marketing line**, not a chip. City H1/tagline later is fine. |
| Still rejected | Ideas / Layover ideas, Play, tour, adventure, Full (alone), playbook (customer-facing) |

### Why Full layover (not another round of three names)

Shareholder’s new words all point at **completeness**, not a new product type. Chip 1 must scan as “take the whole ordered layover”; Eat · Do · Shop stay à la carte. Two-word chip is acceptable — cadence with Eat/Do/Shop matters less than telling the truth.

### Engineering implication

**No `apps/` until shareholder says yes to this lock.** Then the already-specified Phase 2.1 UX/copy cut: **Full layover · Eat · Do · Shop**, grouped lists, layover-plan copy, add chooser. No schema change. No Phase 3.

**Shareholder ask:** Yes/no — ship **Full layover · Eat · Do · Shop**.

**Status:** Chip 1 **locked** (pending yes to build). Brief + PRODUCT + playbooks spec aligned.

---

## 2026-08-21 — Chip 1: no on Ideas / Layover ideas

**Source:** Shareholder — “How about Layover Ideas. or just Ideas.” Naming chip 1 (ordered itinerary group). Eat · Do · Shop already yes.

**Facts:** Chip 1 is an *ordered full layover*, not a single rec. Eat/Do/Shop are already “ideas” colloquially. PRODUCT + sponsorship spec already use **“new ideas” / “New idea for a ZRH layover”** for the Phase 5 labeled-ad rail. Object name stays **layover plan**. No `apps/` until chip 1 is named.

### Decision (locked)

| Item | Decision |
|------|----------|
| Ideas | **Rejected** as chip 1 label |
| Layover ideas | **Rejected** as chip 1 label |
| Why | Trust: organic plans must not share a name with paid “new ideas.” Scan: chip 1 would look like another rec, not the whole ordered layover. Product: “layover ideas” is the *whole city page* job (plans + eat + do + shop), not one chip. |
| Keep as later copy | “Layover ideas” may be a city-page tagline / H1 later. Do not steal it for chip 1. Do not rename the sponsored rail to free this word. |
| Still open | Chip **Full layover** (CEO default) vs **Plan** (one-word alt). Object **layover plan**. |
| Still rejected | Play, tour, adventure, Full (alone), full package adventure |

### Engineering implication

**No `apps/` work.** Wait for shareholder to pick **Full layover** or **Plan**. Then the already-specified Phase 2.1 UX/copy cut.

**Shareholder ask:** Pick **Full layover** (default) or **Plan**. Not Ideas.

**Status:** Ideas rejected. Name still open. Brief + PRODUCT + playbooks spec aligned.

---

## 2026-08-21 — 4-chip city IA yes; first-chip name still open

**Source:** Shareholder — Delhi shopping is real; pharma (Party Smart, Viagra) as a later legal question; **“i think 4 chips. that makes it clear.”** Rejects “full package adventure.” Considering Play / tour / adventure / Full. Also wants to try guest / user / admin themselves.

**Facts (engineer):** Roles exist: guest (public browse published), user (create/edit own; no hide; no `/admin`; no city insert), sponsor stub, admin (all of that + `/admin` stub + hide + SQL city insert). Dashboard ≈ user plus Admin link. **No in-app role switcher.** 4-chip city page **not built** until first-chip name is locked.

### Decision (locked)

| Item | Decision |
|------|----------|
| Chip count / structure | **Yes — 4 chips, same city page.** **[name TBD] · Eat · Do · Shop**, then grouped lists. City stays hero. Zone chips stay. Not 4 category sites. Not 2 jargon lists. |
| First chip name | **Still open.** Do **not** build until shareholder picks or says “use CEO default.” |
| CEO default (tie-break) | Chip **Full layover**. Object **layover plan**. Internal table may stay `playbooks`. |
| Rejected | “Full package adventure.” |
| Play | **Not recommended** — collides with **Do** (two activity verbs). |
| Tour / adventure | **Not recommended** — oversells an 8h airport-strip night. |
| Full (alone) | **Not recommended** — too vague (Full *what?*). |
| Plan (one-word alt) | Acceptable if they want Eat/Do/Shop cadence. Not the default. |
| Shop chip | **Keep first-class.** Delhi shopping is real crew work. Empty-looking Shop is a **content** problem, not a reason to drop the chip or add extra pages. |
| Pharma / Rx shopping | **Parked — not decided.** Not this UX cut. Do not write how-to-buy medical advice. Never attach to crew hotels. |
| Roles try-path | Privileges already differ. Shareholder should try **guest** (logged out), a **second signup as user**, current **admin**. |
| Role-switcher | **No** this cut. Extra product for a one-time smoke. |
| Schema / Phase 3 | **No** expand schema. **No** Phase 3. |

### Pharma / Rx (parked policy — do not lock)

Shareholder is not sure yet. Flag only:

- **Party Smart** (typically sold as a supplement / “party” product) and **sildenafil / Viagra** (prescription-controlled in many countries, not all; crews also fly from places where it is not Rx) are **different legal classes**. Do not treat them as one “Delhi pharmacy” tip type.
- Later options (pick when we write content policy, not now): **ban Rx/controlled**; **allow OTC / convenience pharmacy only**; **allow with “not medical advice / check local law.”**
- Locked regardless: zones not hotels; no medical advice; no buy-guides for controlled drugs.

### Engineering implication

**No `apps/` work** until first-chip name is locked (pick, or “use CEO default”). Then the already-specified Phase 2.1 UX/copy cut: chips + grouped lists + add chooser + Eat/Do/Shop category select. Empty group = “None yet.”

**Non-goals:** admin city CRUD, role-switcher, Rx policy engine, events, photos, social, enum migration.

**Shareholder ask:** Pick first-chip name, or say **use CEO default** (Full layover). Then try guest / user / admin yourself.

**Status:** 4-chip **yes**. First-chip name **open**. Brief updated.

---

## 2026-08-21 — City browse IA: hybrid Eat/Do/Shop + layover plan (pending yes)

**Source:** Shareholder review of Phase 2.1 city page. Three questions: (1) playbook vs place is unclear; (2) add flow should maybe be restaurant/shopping/activity not “place”; (3) users can’t add a city — is that on purpose, and can admin?

**Facts (engineer):** City page is two lists (“Crew playbooks”, “Places”), not cards. Place = one table, free-text `category` (seed: activity, restaurant, bar, grocery). Playbook = ordered story. Users cannot insert cities/zones (migration 004). Admin UI is still a Phase 1 stub — city insert is SQL-only. No Phase 3 until shareholder says so.

### Decision (locked pending shareholder yes)

| Item | Decision |
|------|----------|
| City browse | **Hybrid, same page.** Four jump chips with counts: **Full layover · Eat · Do · Shop**, then grouped lists. City stays hero. Zone chips stay. |
| Not this cut | Four separate category landing pages; two jargon lists (playbooks / places); media grid; events; Stripe; Phase 3 |
| Why not 4 pages | Sparse seed (Shop would be empty on Delhi). Format (full plan) is not the same kind of thing as Eat/Do/Shop. Extra routes for no density. |
| Why not 2 cards only | Hides eat vs do vs shop — the actual scan job, and the parked shopping vision’s cheap label |
| UI name for playbook | **Layover plan** (short: plan). “Playbook” is internal-only. “Adventure” oversells an 8h airport-strip night. |
| UI name for place | Do not headline **Place**. Browse and add use **Eat / Do / Shop** (a recommendation). Internal table stays `places`. |
| Add flow | Chooser: recommend food / activity / shop / add a layover plan. No generic “Add place”. Category required via chooser, not free-text. Eat keeps optional dish; Shop relabels to “what to get”; Do hides dish. |
| Category storage | No schema change. UI constrains to eat/do/shop. Map legacy: restaurant/bar/cafe → Eat; activity and similar → Do; grocery/shop → Shop; unknown → Do so nothing vanishes. |
| User city create | **Stay blocked.** By design (trust, spam, hotel-leak, empty shells). |
| Admin city form | **Not this cut.** SQL is fine at 2 seed cities. Build a tiny admin form when we want city #3, not now. Phase 6 remains moderation. |

### Engineering implication (only if shareholder says yes)

Small Phase 2.1 **UX/copy cut** — not a rewrite, not Phase 3, no new tables:

- City page: jump chips + grouped lists + rename
- Dashboard: add chooser
- Place form: required Eat/Do/Shop select; dish label rules
- Empty group: one line “None yet” (logged-in can still add). Do not invent category routes.

**Non-goals:** admin city CRUD, user-requested-city form, enum migration, events, photos, social.

**Shareholder ask:** Yes/no on this IA. If no, pick 2-chip (plan vs one rec) or 4 separate pages.

**Status:** Recommendation written. **No `apps/` work until yes.**

---

## 2026-08-05 — Destination-first UX (city as hero, not influencer social)

**Source:** Shareholder — when you open a city, photos of fun / food / products should lead; destination is the focus, not the poster. People should think “what to do in Zurich,” not “who posted it.”

### Stance (locked product DNA)

| Principle | Decision |
|-----------|----------|
| Primary browse frame | **Destination-first** — city → playbooks, places, items, experiential photos |
| Not building | Person-as-brand Instagram clone; main city UI is not a creator feed |
| Phase 3 “Social” means | Trust **signals** (like, comment, follow) to rank content + surface reliable tipsters — not make the poster the hero on city pages |
| City photos | Mood / experience grid (fun, food, product) — deferred with multi-photo vision; not shipped |
| Author credit | Small / secondary (byline on detail), useful for follow/trust; never the city-page center |

### Coexists with earlier vision (same day)

- Shopping + multi-photo posting + creator rewards still parked.  
- Creator rewards reward **contribution quality**, not turning Layover into a personality network.  
- Phase order unchanged: 2.1 green → Phase 3 social signals → later media-rich city surfaces.

### Guardrails

- Zones not hotels; labeled sponsored vs organic staples; photos must not leak lodging patterns.

### Engineering implication (when Phase 3 opens)

Spec social as **reputation under content**, not “home feed of people.” City page stays content/destination-led.

**Shareholder ask:** None.

**Status:** Vision logged. PRODUCT + `features/social.md` lightly aligned. No build, no phase change.

---

## 2026-08-05 — Shareholder vision: shopping, products, photo-first posting, creator rewards

**Source:** Shareholder message (not a phase-change ask). FAs are heavy shoppers — best mustard Munich, best wine Rome, best places to buy. Want to reward high-signal posters. Posting must feel enjoyable and Instagram-easy (multi-photo). Expand beyond restaurant dishes to **products**.

### How it maps today (no new build)

| Idea | Existing product fit |
|------|----------------------|
| Best shop / boutique / specialty store | **Place** already includes shops (not food-only) |
| Specific thing to buy (mustard, wine) | **Dish / item** is already “specific order at a place”; stretch language → “what to get” including products |
| Who to trust | **Social** (Phase 3): follow/like/comment as reputation substrate |
| Ordered layover including shopping | **Playbook** stops can already point at places + free-text notes |

### What’s new / expanded (deferred vision — not Phase 2/3 scope)

1. **Products as first-class tips** — “what to buy in this city” as a clear content type (or item kind), not only menu dishes; still tied to a Place/zone when possible.  
2. **Photo-first, multi-image posting** — Instagram-easy UX (lots of pictures, low friction). Phase 2 is text/structure first; media pipeline is a later product cut.  
3. **Creator rewards** — surface and reward people who post high-trust tips. Phase 3 = social signals only. Paid/gifted rewards, badges, payouts = later (trust + ops design; no fake “crew staple” buy-ins).

### Guardrails (locked)

- Zones, not crew hotels — shopping tips use city/zone/landmarks, never “walk out of [airline] hotel.”  
- Organic staples stay organic; sponsored product placement must be **labeled**.  
- Products must not become affiliate spam or anonymous buy-link dumps — place + story + creator signal.  
- Trust > growth hacks on rewards.

### Priority vs roadmap (provisional stance)

| Decision | Status |
|----------|--------|
| Derail Phase 2.1 smoke / Phase 3 Social for shopping UX | **No** |
| Expand Dish language to cover products in docs | **Soft yes** (PRODUCT vision only) |
| Multi-photo Instagram flow | **Deferred** until after content density + Social basics |
| Creator rewards beyond follow/like | **Deferred**; design when Social exists |
| Separate Product entity / marketplace | **Not locked** — prefer reusing Place + item until proven need |

**Phase order unchanged:** 2.1 green → Phase 3 Social → later AI / Stripe. Shopping + photos + rewards park as **content-model + UX vision** for when phases unlock.

**Shareholder ask:** None blocking. Optional later: whether “item” = one type for dish *and* product, or two labels in UI.

**Status:** Vision logged. No phase change. No `apps/` work from this note.

---

## 2026-08-04 — Important fix pack implemented (Phase 2.1 code)

Shareholder: “fix important items.”

| # | Fix | How |
|---|-----|-----|
| 1 | Zone ∈ city | UI filters zones by city; server `assertZoneInCity` |
| 2 | Stop place ∈ city | UI filters places; server `assertPlaceInCity` |
| 3 | City/zone insert admin-only | Migration **004** drops open insert policies |
| 4 | RLS matrix | Checklist `docs/board/RLS-SMOKE.md` (human runs) |
| 5 | Partial writes | Dish/stop failure deletes parent create |
| 6 | Free-text hotels | Unchanged residual (accepted) |

Also: non-admin cannot set `hidden` via RLS WITH CHECK; stop slots aligned to 4.

**Human:** run **004** (and 002/003 if missing).

---

## 2026-08-04 — Board Meeting #3 CLOSED

**Proposal:** Phase 2.1 verify + harden first; Phase 3 Social only after green; no Phase 4/5 yet.

**Code review #2 (Phase 2):** **Ship with fixes.** No clear Critical. Important (must before Phase 2 “done” / Phase 3):

1. Zone must belong to selected city (UI filter + server validate)  
2. Playbook stop `place_id` must match playbook city  
3. `cities` / `zones` insert: **admin only**  
4. RLS matrix documented as run (ops / live Supabase smoke)  
5. Partial writes (dish fail silent; playbook stops fail leaves orphan)  
6. Free-text hotel residual accepted (forms warn only)

**Scope check:** No Phase 3–5 creep. Seed zone-safe. Hotel fields: pass.

**Engineer feasibility:** Phase 2.1 **FEASIBLE** (S–M for code Important 1–3 + 5; RLS matrix = human/eng smoke). Phase 3 after 2.1 green: FEASIBLE. Money-now **rejected** — no inventory density.

### Decisions locked

| Item | Decision |
|------|----------|
| Milestone | **Phase 2.1 — verify + harden** |
| Phase 3 / 4 / 5 | **Closed** until 2.1 green |
| Next build after green | **Phase 3 Social** (not Stripe first) |
| Stretch | Seed polish ZRH/DEL only if green — not new cities |
| Hotel free-text | Residual accepted; warn UX only this cut |

**Shareholder ask:** Yes on Phase 2.1; run SQL 002→003 if needed; smoke Zurich/Delhi.

**Status:** Board closed. Engineering implements fix pack; no Social until ship + RLS smoke green.

---

## 2026-08-04 — Phase 2 approved and implemented (code)

**Shareholder:** Yes on Phase 2.

**Shipped in app:** cities/zones/places/dishes/playbooks schema (002), Zurich+Delhi seed (003), public browse, auth create/edit, zone warnings on forms. No social/AI/Stripe/Events.

**Human remaining:** run 002 + 003 in Supabase SQL Editor; then verify `/cities`.

---

## 2026-08-04 — Second code review + cleanup (pre–Phase 2)

**Verdict:** Prior 5 review holes remain fixed. Residual Important items cleaned by engineer: middleware fail-closed without env; cookies forwarded on login redirect; safer `safeNextPath`; remove dead `getSessionUser`; `asRole` in callback; signup/login suspended alignment.

**Phase 1:** Ship complete. **Phase 2:** still blocked on shareholder yes. Org gate + anti-hallucination rules in AGENTS/MAP stand.

---

## 2026-08-04 — Pre–Phase 2 organization gate

**Ask:** Project is getting significant; hallucinations/forgetfulness risk rising. Org + on-target check **before** Phase 2 code.

### Assessment: are docs still single source of truth?

**Mostly yes for product intent; partly no for phase reality.** Control plane still works: MAP → docs → features → board. Vision (trust, zones-not-hotels, labeled sponsors, phase order) is coherent across PRODUCT / SECURITY / ROLES / OPS / AGENTS.

**Drift found (would make agents invent wrong world):**

| Doc | Problem |
|-----|---------|
| `README.md` | Still said Phase 0 / no app |
| `docs/board/CEO-VISION-DIGEST.md` | Still “Nothing is live / Phase 1 blocked” |
| `docs/STACK.md` | Header still “gates Phase 1 if not yet given” |
| `docs/MAP.md` | Layout notes “to be created in Phase 1”; Activity/Event listed without Board #2 cut |
| `features/places-and-zones.md` | Acceptance still required activities + events |
| `features/playbooks.md` | Stops still referenced activity/event entities |
| `SHAREHOLDER-BRIEF.md` (pre-this entry) | Still listed auth fix pack as next engineering step after pack shipped |

**Not drift (OK):** PRODUCT north-star still describes Activity/Event as product concepts for later; SECURITY/ROLES/OPS trust rules solid. Feature stubs for Phases 3–6 intentionally thin.

### Decision / action

1. **Gate before Phase 2 code:** `docs/board/PRE-PHASE-2-GATE.md` — agent-facing: shareholder yes required, Board #2 locks, MAP honesty, one feature at a time, non-goals.  
2. Align Phase 2 feature specs + MAP + STACK status + vision digest + brief with **Phase 1 hardened, Phase 2 pending yes**.  
3. **Do not start `apps/` Phase 2** until shareholder yes.

### Recommendation to shareholder

Approve Phase 2 only after (or with) this org gate closed. Scope unchanged from Board #2. Auth fix pack already shipped — not a re-gate.

**Status:** Org gate written; brief updated; Phase 2 still **blocked on shareholder yes**.

---

## 2026-08-04 — Phase 1 auth fix pack shipped

Shareholder asked to plug review holes before Phase 2. Shipped: safe callback `next`, fail-closed `getProfile` on DB error, suspended panel + sign-out, stable login error codes, middleware gate on `/dashboard` `/sponsor` `/admin`. Theme/design: discuss at start of Phase 2 (real content UI), not a standalone pre-content art phase.

---

## 2026-08-04 — Board Meeting #2 CLOSED (pending shareholder yes/no)

**Proposal:** Phase 2 — cities, zones, places, dishes, playbooks + seed Zurich & Delhi. No social / AI / Stripe.

**Engineer feasibility:** FEASIBLE. Tight scope accepted.

| Decision | Locked |
|----------|--------|
| Milestone | **Phase 2 only** |
| Schema | Thin tables; stop = optional `place_id` + free-text note/activity (no separate Activity entity unless free) |
| Dishes | **In** (simple child of place) |
| Events | **Out** (nice-to-have later) |
| Draft/publish | Published = public; draft = author only |
| RLS | Public read published; auth write own; admin all — test matrix required |
| Seed | Zurich + Delhi, 1–2 playbooks each (SQL or seed script after CRUD) |
| Effort | **M** — prefer 2 sessions: (1) schema+RLS+browse (2) forms+seed |
| Social / AI / Stripe | **No** this cut |
| Vercel | Not required for Phase 2 done |

**Code review (Phase 1):** Verdict **ship with fixes**. Pre-Phase-2 / first-PR fix pack is a **gate** before content-rich public:

1. CRITICAL — sanitize `next` on auth callback (open redirect)  
2. IMPORTANT — getProfile fail-closed on DB error  
3. IMPORTANT — sign-out on suspended screens  
4. IMPORTANT — stable error codes on callback (no raw Supabase msgs in URL)  
5. Shared layout/middleware guards for auth routes  

**Security reminder:** Zones only; no public hotel fields; seed copy zone-safe.

**Shareholder ask:** Yes/no on Phase 2 + fix pack as above.

**Status:** Proposal final. **Implementation blocked until shareholder approves.** Board brief updated.

---

## 2026-08-04 — Phase 1 complete (live)

Shareholder confirmed admin login works on local app + Supabase. Phase 1 acceptance closed. Optional later: Vercel public URL, service_role key, re-enable email confirm for production. Next build = Phase 2 (cities/zones/playbooks) when shareholder says go.

---

## 2026-08-04 — Shareholder approved Phase 1 + stack

**Decisions:**

1. **Yes** — Phase 1 (app shell + auth + three roles + stub dashboards)  
2. **Yes** — Stack: Next.js + Supabase + Vercel + Stripe (Phase 5) + xAI (Phase 4)

**Next:** Chief Engineer implements Phase 1. Shareholder: `docs/board/HUMAN-SETUP.md`.

---

## 2026-08-04 — Vision re-read complete

**Task:** Full CEO re-ingest of PRODUCT, SECURITY, ROLES, OPS, STACK, ORG, MAP, board, AGENTS, all `features/*`, `.grok/agents/ceo.md`.

**Answers for shareholder:**

1. **Did Phase 0 need updates after discussions?** Yes — already done in the earlier “Phase 0 sync” pass (`STACK.md`, MAP 0.2, auth/ROLES/OPS/PRODUCT/AGENTS alignment). This session **verified** that pass; no further Phase 0 rewrites required for strategy.
2. **Does CEO understand the vision?** Yes. Written proof: `docs/board/CEO-VISION-DIGEST.md` (product, trust rails, zones, roles, money, AI limits, stack, org, phase order).

**Remaining gaps (non-blocking):**

- Feature specs for Phases 2–6 stay intentionally thin until those phases open — OK.
- Cold-start seeding (which cities / how many stories) not a formal product section — soft gap for later content planning, not Phase 1.
- Placement caps and AI quota **numbers** deferred to Phase 4–5 implement — correct.
- No material contradictions between docs after the sync pass.

**Blocked on:** Shareholder yes/no for **Phase 1 + stack**.

**Status:** Phase 0 closed for vision/docs. Implementation still not started.

---

## 2026-08-04 — Phase 0 sync (docs catch-up)

**Issue:** Stack/org decisions lived in board brief + chat, but Phase 0 core files still said “Postgres TBD / Auth TBD.”

**Fix (Chief Engineer, CEO to re-verify vision):**

- Added `docs/STACK.md` (Next.js, Supabase, Vercel, Stripe, xAI, cost, human setup)
- Updated `AGENTS.md`, `docs/MAP.md` (phase 0.2), `features/auth.md`, `docs/ROLES.md`, `docs/PRODUCT.md`, `docs/OPS.md`, `README.md`, CEO agent read list
- CEO tasked with full vision re-read + gap report for shareholder

**Status:** Phase 0 documentation aligned with discussion. Phase 1 still needs shareholder yes.

---

## 2026-08-04 — Stack recommendation (money + operator load)

**Ask:** Supabase + Next.js confirmed useful; is Vercel easiest? Expensive convenience? Full Phase 1–5 stack pass.

| Layer | Decision | Rationale |
|-------|----------|-----------|
| Host | **Vercel** | Best solo DX for Next.js; free Hobby until real traffic |
| DB + Auth | **Supabase** | Matches Board #1; one vendor vs Auth.js + Neon glue |
| Payments | **Stripe** (Phase 5) | Self-serve; no card storage |
| AI | **xAI** server-side (Phase 4) | Extraction only + quotas |
| App | Next.js App Router + TS | Unchanged |

**Optimize for:** speed to working product + hands-off ops. **Not** cheapest infra at zero users.

**Overpaying for convenience?** **No** at this stage. Vercel/Supabase free tiers cover Phase 1–5 pre-revenue. Convenience tax becomes real only with high serverless/bandwidth or paid Pro without revenue — then consider Fly/Railway/self-host Postgres. Do **not** optimize that now.

**Leave free tiers when:** sponsors pay and/or free limits hurt reliability; enable paid Supabase/Vercel only when needed. Stripe % is cost of revenue. AI: hard monthly cap when Phase 4 ships.

**Shareholder ask:** Yes/no on this stack + existing Phase 1 yes/no. Engineer may push feasibility after.

**Status:** CEO recommendation locked in brief. Implementation still blocked until shareholder approves Phase 1 (+ stack).

---

## 2026-08-04 — Board Meeting #1 CLOSED (pending shareholder yes/no)

**Outcome (CEO + Chief Engineer aligned):**

| Item | Decision |
|------|----------|
| Milestone | **Phase 1 only** — app shell + auth + three roles |
| Combine Phase 1+2? | **No** |
| AI / Stripe / content CRUD | **Out of scope** this cut |
| Auth/DB default | **Supabase Auth + Supabase Postgres** (role on app `users` / `profiles` synced from `auth.uid`) |
| Alt if shareholder objects | Auth.js + Neon |
| Effort | S–M: ~1 focused session; 2 if provider friction |
| Stretch allowed | Admin role-switcher for testing |
| Stretch rejected for Phase 1 | Static city page → start of Phase 2, not Phase 1 |

**Must-haves unchanged:** Next.js `apps/web`, signup/login/logout, server-enforced `user` \| `sponsor` \| `admin`, stubs `/dashboard` `/sponsor` `/admin`, public `/`, document provider in `features/auth.md`, secrets in `.env` only.

**Engineer risks to watch:** commit hygiene for secrets; lock provider choice in feature spec when implementing.

**Shareholder ask:** Yes/no on Phase 1; optional Supabase (default) vs Auth.js + Neon.

**Status:** Proposal final. **Implementation blocked until shareholder approves.**

---

## 2026-08-04 — Board Meeting #1: next milestone = Phase 1 auth

**Recommendation (pending shareholder approve + engineer feasibility):**  
**Phase 1 — App shell + auth + roles only.** Single primary milestone. No Stripe, no AI, no full content product in this cut.

**Sequencing call:**

| Order | Why |
|-------|-----|
| 1. Auth + roles | Every write path, sponsor dashboard, admin, AI quota, and metrics need identity and server-side roles |
| 2. Content (cities/zones/playbooks) | Something real to browse and seed; inventory for later ads |
| 3. Social | Amplifies trust signals once content exists |
| 4. AI import | Contribution unlock; costs money; needs auth + draft targets |
| 5. Stripe sponsorship | Needs pages + density; labeled only |
| 6. Metrics/admin depth | Optimize after loop exists |
| 7. Crew-only precision | After verification story; never public hotels |

**Must-haves (Phase 1):** Next.js `apps/web`, Postgres, signup/login, role on user, server enforcement, stub dashboards (`/dashboard`, `/sponsor`, `/admin`), public home, role model documented in `features/auth.md`.

**Non-goals (Phase 1):** Places/playbooks CRUD, social, AI, Stripe, production hard launch, crew verification.

**Money / trust:** No revenue this milestone; builds the only honest path to hands-off sponsor revenue later without fake endorsements or hotel leaks.

**Ask of shareholder:** Approve Phase 1 as next build; engineer debates stack choices (Auth.js / Clerk / Supabase) within boring constraints.

**Ask of Chief Engineer:** Feasibility pushback on provider, schema, and definition of done; do not broaden into Phase 2 unless stretch explicitly approved.

---

## 2026-08-04 — Org established

**Decision:** Shareholder (human) → CEO agent (`.grok/agents/ceo.md`) → Chief Engineer (main Grok Build).  

**Rationale:** Owner will not read full wiki; coding agent should not also own pure strategy. Board skills: `ceo`, `board-meeting`.  

**Ask of shareholder:** Confirm this org; run first board meeting on next milestone.  
