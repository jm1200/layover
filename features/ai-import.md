# Feature: AI story import

**Phase:** 4  
**Status:** **In progress.** Live locally: `/share` → lookup → one-place review → Publish (stills + city hero after). SQL **008–011**. Lumen baseline in `agents/lumen.md`.  
**Code:** `apps/web/src/features/ai-import/`

## Goal

**Lumen fills the existing form.** Crew dump a layover (they will dictate); one extract; they tap blanks and publish. Not a chatbot interview. Not a second product.

**Share your intel** is `/share` (this flow). Dashboard forms remain as a fallback.

## Share flow (UX locked 2026-08-24 — Sofia)

Hotel room, one thumb, ~60 seconds. Lumen talks as little as possible.

1. **Talk once.** Header **Share your intel** → one screen, one box. Lumen: *“Dump what you did. One rec, a few recs, or the whole day.”* They dictate with the **phone keyboard mic** (OS, $0) or type. Same box. Button: **Fill the draft.** No Eat/Do/Buy picker first — **she decides** rec vs recs vs day. Sharing from a city page already has the city.
2. **One extract.** `grok-4.3` fills one rec, several independent recs, or a full layover (standalone recs + plan, max 4). **Do not invent a day.** “Then” alone is not an itinerary. Rec blurbs always stand alone. **No second model call** to chase a dish, zone, or hours.
3. **Holes are the follow-up.** Draft screen, same fields we have today. Empty bits sit obvious. Lumen one-liner: *“I filled what I heard. Tap the blanks, add a pic, publish.”* They tap. They do not answer her.
4. **Photo on that same screen.** Camera roll, or a checkbox: **AI still on publish**. One generation. Cannot publish with neither.
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
| Why / blurb / narrative | she writes; they edit | she writes; they edit |
| Zone | hole (encouraged) | — |
| Dish / what to get | hole (Eat / Buy) | — |
| Hours available | — | hole |
| Extra stops (2–4) | — | hole |
| Photo | upload **or** AI-still checkbox (required one of the two) | none (reuse place stills) |

**Publish** is the only done button. Thin is allowed (empty dish is fine). No “save draft.” Rows sit unpublished until Publish. A rec with no photo and the checkbox off cannot publish.

**She still strips:** crew hotel names, airline lodging → zone if she can, else blank zone. PG-13. She does not require a zone.

Auth required to run extract. Anonymous: no post.

## v1 (locked 2026-08-24; media + unpack 2026-08-24; share UX 2026-08-24)

- Auth required. **One extract per story.** Text model: **`grok-4.3`**. Looks up named places with **web_search** (cap 8). Blurbs = what/where + their voice. Not grok-4.6 on every post.
- Missing dish / zone / hours → **empty fields.** She writes the blurb. Missing **required** city / name / (layover) title+one stop → one question, then extract.
- **Share a rec (Eat / Do / Buy):** one place draft.
- **Share a full layover:** Lumen drafts the **plan and each stop as a place**, then links the stops. Match an existing place in that city by name. Match an existing plan by title or the same stop set — do not copy the day. Cap: **4 stops**. User hits Publish.
- **Pictures (photo-first):**
  - Upload **or** check **AI still on publish**. One generation. Generate **after Publish**.
  - Upload: she **compresses** (max edge 1600, JPEG). No 2 MB “resize it yourself.” Originals up to ~12 MB.
  - Review preview is the **4:5 card crop**, not a wide strip.
  - She does **not** AI-reframe a user photo. Crop is center `object-cover`. Hate it → upload another.
  - **No still for the plan itself** — reuse place stills.
  - Eat/Buy: up to **3 plates** (names on **Get this**). Rec photos are a separate album (max 3). Not on the city card. No AI still per plate. Edit rec can rename / add / X plates.
  - No regen. Hate the still → upload.
- **City heroes:** one per city. Lumen spends **without asking** (within $20). First publish in a city with no hero generates one. She may later swap a generated banner for a good crew shot. She monitors home/cities.
- User hits **Publish**. Same RLS as manual create. No save-draft button.
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
- [x] Photo-first on review: upload or AI-still checkbox; generate after Publish; one generation; no plan-level still. Admin does **not** approve each JPEG.
- [x] Dictate via OS keyboard mic (text in the box). No paid STT
- [x] `AiImportLog` for cost and abuse
- [x] Admin kill switch respected
- [x] Failures show safe error; no key leakage

## Cost

See `docs/OPS.md`. Cheap SKUs, one still per place, one city hero per city (Lumen spends inside $20). Lookup ~4¢ on a 3-stop day; still ~2¢ each.

## Known bugs

- [ ] Founder test pass of `ai-import/` + publish + stills-after-publish.

## Engineer review (2026-08-25)

Theo + Milo. Follow-up pack (same session, John’s product calls):

- [x] Company-wide $20 via `lumen_month_spend_usd()` (SQL **011**)
- [x] `max_tool_calls` on extract; log real `search_calls` + $
- [x] Match existing itineraries (title or stop set)
- [x] Review queue only new recs; rec-only Publish; no Save draft (Publish when ready)
- [x] City-open quota (5/user/day) on `lumen_ensure_city`
- [x] Failed plan writes **keep** the recs (John 2026-08-25); still log cost
- [x] Lumen refuses unverified / hotel / PG-13 dumps — John does not moderate daily
- [x] Blurb auto-written; stills are a checkbox, generate after Publish, one generation
- [x] City heroes: 1/city, Lumen spends without asking, on first publish if missing

