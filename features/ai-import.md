# Feature: AI story import

**Phase:** 4  
**Status:** **Complete** (2026-08-27). Dump → review → Publish. Dump/edit/photos frozen. SQL **008–016**. Lumen baseline in `agents/lumen.md`.  
**Code:** `apps/web/src/features/ai-import/`

## Goal

**Lumen fills the existing form.** Crew dump a layover (they will dictate); one extract; they tap blanks and publish. Not a chatbot interview. Not a second product.

**Share your intel** is `/share` (this flow). Dashboard forms remain as a fallback.

## Share flow (UX locked 2026-08-24 — Sofia)

Hotel room, one thumb, ~60 seconds. Lumen talks as little as possible.

1. **Talk once.** Header **Share your intel**. Public copy does **not** introduce Lumen by name and does **not** say “rec”: *Skip the form. Describe the layover — one place, a few, or the whole day. We’ll look it up and write it up. You check, then publish.* Box: *What did you do?* Helper: *Type or dictate using your mic.* Button **Write it up**. No Eat/Do/Buy picker first — she still decides place vs places vs day. Sharing from a city page already has the city.
2. **One extract.** `grok-4.3` fills one rec, several independent recs, or a full layover (standalone recs + plan, max 4). **Do not invent a day.** “Then” alone is not an itinerary. Rec blurbs always stand alone. **No second model call** to chase a dish, zone, or hours.
3. **Holes are the follow-up.** Draft screen, same fields we have today. Empty bits sit obvious. Lumen one-liner: *“I filled what I heard. Tap the blanks, add a pic, publish.”* They tap. They do not answer her. City-open banner: *“{City} ({IATA}) is on the map now.”* **only** if she actually just opened it. Already live: omit, or *“Still {City}.”* Never *“I’ll put a city hero up when you publish.”* on that line. **The day** is filled from the dump. Empty narrative on Publish = refuse.
4. **Photos on review, max 3**, same album as Edit rec. Tap hero. Skip → she stills on publish. Eat/Buy **Get this** is names only. Never a black rectangle.
5. **One question only if a required field is missing** (table below). Same screen, one line. They answer once. Then extract. Never a third turn. Never “what dish?” as chat.

**Quotas they see (do not hide as a crash):** Over ~4k chars → *“Keep it to one layover.”* Monthly cap / kill switch → *“Lumen’s taking a nap.”* Daily 3-draft cap **parked** (John 2026-08-25) — put back in a later phase.

**Dictate ≠ paid STT.** Keyboard/OS mic is v1. Token cost = the text, same as typing. xAI speech-to-text / in-app waveform mic = **John**, not this cut.

John’s “one follow-up Q then extract” is the **emergency brake** (step 5), not the default. Default is cheaper and less chatty: dump → form holes.

## Required fields (bare minimum — locked 2026-08-24)

Matches what the live forms already refuse to save. Lumen does **not** invent extra gates.

**Cannot draft at all** (one question, then stop): missing anything in this table.

| Post | Must have | Her one question if missing |
|------|-----------|-----------------------------|
| Eat / Do / Buy | **City** (existing **or** Lumen opens one from a real name/IATA) + **place name** + **type** | *“Which city? Airport code if you have it.”* or *“What’s the place called?”* |
| Several recs (no plan) | **City** + **≥2 named places** | *“What’s the place called?”* |
| Full layover | **City** (same) + **title** + **≥1 stop with a place name** | *“Which city? Airport code if you have it.”* or *“What’s the first stop called?”* |

Type is required on the rec form today (`eat` / `do` / `shop`). She infers it. Wrong guess → they tap Type. Not a spoken Q.

**Holes — not required, they tap or skip:**

| Field | Rec | Plan |
|-------|-----|------|
| Why / blurb / narrative | she writes; they edit | she writes **from the dump**; they edit. Empty The day on Publish = refuse |
| Zone | hole (encouraged) | — |
| Dish / what to get | hole (Eat / Buy) | — |
| Hours available | — | hole |
| Extra stops (2–4) | — | hole |
| Photo | **Place (1):** upload or she stills on publish. **Dishes (0–3, Eat/Buy):** named, optional, user only | none (reuse place stills) |

**Publish** is the only done button. Thin is allowed (empty dish is fine). No “save draft.” Rows sit unpublished until Publish — **off public and off My posts.** No `(draft)` badge. A rec with no place photo gets a Lumen still on publish (no checkbox homework). Empty layover **narrative cannot publish** — she fills it from the dump she already has.

**She still strips:** crew hotel names, airline lodging → zone if she can, else blank zone. PG-13. She does not require a zone.

Auth required to run extract. Anonymous: no post.

## v1 (locked 2026-08-24; media + unpack 2026-08-24; share UX 2026-08-24)

- Auth required. **One extract per story.** Text model: **`grok-4.3`**. Looks up named places with **web_search** (cap 8). Blurbs = what/where + their voice. Not grok-4.6 on every post.
- Missing dish / zone / hours → **empty fields.** She writes the blurb. Missing **required** city / name / (layover) title+one stop → one question, then extract.
- **Share a rec (Eat / Do / Buy):** one place draft.
- **Share a full layover:** Lumen drafts the **plan and each stop as a place**, then links the stops. Match an existing place in that city by name. Match an existing plan by **stop set** (same city, same places) — title wording is hers, not a new day. Do not copy the day. Cap: **4 stops**. **Narrative comes from the dump** onto the review card. User hits Publish.
- **Pictures (photo-first) — 2026-08-26:**
  - **Place (1):** exterior / walk-up. City card. Upload, or she stills **after Publish** if they skip it. One generation. AI flag. No checkbox homework. No black rectangle.
  - **Dishes (0–3, Eat/Buy):** named photos on **Get this**. User upload only. No AI per plate.
  - Two labeled slots. Never reuse the place JPEG as a dish. Dump/AI writes `place_photos` + plate images, not `image_url` only.
  - Upload: she **compresses** (max edge 1600, JPEG). Preview is the **4:5 card crop**. She does **not** AI-reframe their shot.
  - **No still for the plan itself** — reuse place stills.
  - Edit rec: same two jobs; rename / add / X a plate without wiping the place still.
  - No regen. Hate the still → upload.
- **City heroes:** one per city. Lumen spends **without asking** (within $20). First publish in a city with no hero generates one. She may later swap a generated banner for a good crew shot. She monitors home/cities.
- User hits **Publish**. Same RLS as manual create. No save-draft button. Dashboard lists **this user’s published** recs/days only.
- **City-open copy:** “{City} ({IATA}) is on the map now” **only** if she created that city this dump. Existing GVA/BCN stay quiet.
- Strip crew hotel names / airline lodging → zones. PG-13. **Real places only:** look up each named rec; skip what search cannot confirm. Hotels are never recs. If the plan write fails, keep the recs she already filed. John does not sit a moderation queue.
- Quotas, `AiImportLog`, admin kill switch. Failures never leak the key. **No production spend without John’s key + cap.** Daily 3-draft cap parked. Raising $20/mo, SKUs, stills, or STT = John.

## Not v1

- Auto-publish
- Unbounded multi-turn “plan my layover” chat billed to the owner
- Interview Lumen (dish / zone / hours as spoken Qs)
- Paid speech-to-text / custom in-app STT
- Client-side API keys
- City concierge / browse companion
- Per-stop extra stills, galleries, or city-hero generation on a user post
- Image regen loops

## Acceptance criteria

- [x] Authenticated endpoint only (`/share`)
- [x] Input length cap (~4k chars). Daily 3-draft quota **parked** — restore later
- [x] Server calls xAI (`grok-4.3`) **once** per story with structured schema (city, duration, stops, dishes, zones, tips)
- [x] Full-layover extract also returns place drafts per stop (or links an existing same-city place)
- [x] Schema/prompt: **no crew hotel names** in public fields; map to zones
- [x] Lookup must confirm a real venue or public activity (`found`); skip the rest; `blocked` for PG-13/hotels
- [x] Returns draft only — user must confirm to publish
- [x] Thin story → prefilled form with holes, not a second extract (except missing **required** city / name / layover title+one stop → one Q)
- [x] Photo-first on review: upload or skip (generate after Publish); one generation; no plan-level still; no black tile. Admin does **not** approve each JPEG.
- [ ] Dump/AI writes `place_photos` + plate images (not `image_url` only)
- [ ] City-open copy only when she actually opened that city this dump
- [ ] Playbook `narrative` filled from dump; refuse Publish if The day is empty
- [ ] Twin days: **stop set** = refuse, even with a new title
- [ ] Two labeled photo jobs (place vs dishes); never copy place onto plate
- [ ] No **Status: draft** badge; dashboard = this user’s published only
- [ ] Edit day: one Save → public layover; delete day works
- [x] Dictate via OS keyboard mic (text in the box). No paid STT
- [x] `AiImportLog` for cost and abuse
- [x] Admin kill switch respected
- [x] Failures show safe error; no key leakage

## Cost

See `docs/OPS.md`. Cheap SKUs, one still per place, one city hero per city (Lumen spends inside $20). Lookup ~4¢ on a 3-stop day; still ~2¢ each.

## Known bugs (founder test 2026-08-26)

- [ ] Founder retest after this pack (`docs/board/FOUNDER-TEST.md`)
- [ ] Dump/AI still skip `place_photos` — same JPEG on hero and dish; Save can drop the other photo
- [ ] Layover review/publish ships empty narrative
- [ ] Title-only mismatch twins a day
- [ ] “City on the map now” for cities that already exist
- [ ] Draft rows and other authors leak onto dashboard
- [ ] Layover Save order / delete day
- [ ] Black rectangle when they skip a photo

## Engineer review (2026-08-25)

Theo + Milo. Follow-up pack (same session, John’s product calls):

- [x] Company-wide $20 via `lumen_month_spend_usd()` (SQL **011**)
- [x] `max_tool_calls` on extract; log real `search_calls` + $
- [x] Match existing itineraries (title or stop set) — **2026-08-26: stop set is the match; title drift is not a new day**
- [x] Review queue only new recs; rec-only Publish; no Save draft (Publish when ready)
- [x] City-open quota (5/user/day) on `lumen_ensure_city`
- [x] Failed plan writes **keep** the recs (John 2026-08-25); still log cost
- [x] Lumen refuses unverified / hotel / PG-13 dumps — John does not moderate daily
- [x] Blurb auto-written; stills generate after Publish, one generation (skip photo = generate; no black tile)
- [x] City heroes: 1/city, Lumen spends without asking, on first publish if missing

## Copy (locked 2026-08-26 — Sofia + Lumen)

Do not invent a CMS voice. Login strings also live in `features/auth.md`. Photo + delete strings also live in `features/places-and-zones.md`.

**Login `/login`** — Google first. Not an admin form. **Never “Steal a day.”** John killed steal.

- Headline: `In from a trip?`
- Supporting: `Describe the layover. We’ll fill it in.`
- Primary: `Continue with Google`
- Quiet: `Use email instead`
- Email submit: `Log in`
- Footer: `No account? Sign up`
- Kill: `Crew, explorers, and sponsors` / signup `Default role is user…` / `Steal a day` / `Google is the door.`
- Signup headline: `First time?`
- Signup supporting: `Describe the layover. We’ll fill it in.`
- Signup email: `Sign up`
- Signup quiet: `Already in? Log in`

**City-open** — only when she actually just opened it.

- Just opened: `{City} ({IATA}) is on the map now.`
- Already live: omit, or `Still {City}.`
- Never: `I’ll put a city hero up when you publish.` on this line.

**The day**

- Label: `The day`
- Helper: `Your dump, tightened. Edit if you want.`
- Empty Publish: `I need The day filled. That’s the story you dumped.`

**Twin day**

- `Same day. Recs stay — I didn’t copy the layover.` + `Open it`

**Rec photos (locked 2026-08-27)**

One album, max 3. Any shots of the rec. Tap one **hero** = city-page tile + rec top. Share: one upload or she stills. Edit: add more, tap hero. Get this = names only.

**Delete rec** (Sofia)

- Button: `Take this rec off`
- Confirm: `This rec comes off the city. The layover day stays.`
- Never: plates go with it / layovers that linked it / other stops.

**Delete day**

- Button: `Take this day off`
- Confirm: `This day leaves the city. Recs stay on Eat / Do / Buy.`

**After save (a day)**

- One button: `Save`. No toast. Redirect to `/playbooks/[id]`. They should be looking at the day.

**Extract prompt (engineering copies into `prompt.ts`)**

For `post_kind=playbook`, `narrative` is the day they dumped — 2–6 sentences, their voice, tightened from the paragraph. Never leave it null if they pitched a day. Rec `blurb`s stay standalone; they are not The day. Same named stops or the same story as an existing plan = do not mint a second itinerary (even with a new title).

