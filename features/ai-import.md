# Feature: AI story import

**Phase:** 4  
**Status:** **In progress** (2026-08-24). Dump → extract → draft review is in the app. Needs shareholder `XAI_API_KEY` + SQL **008**. Photo upload / generate-on-publish **not in this slice**.  
**Code (planned):** `apps/web/src/features/ai-import/`

## Goal

**Lumen fills the existing form.** Crew dump a layover (they will dictate); one extract; they tap blanks and publish. Not a chatbot interview. Not a second product.

Today **Share your intel** still opens dashboard forms. This flow is Phase 4 only.

## Share flow (UX locked 2026-08-24 — Sofia)

Hotel room, one thumb, ~60 seconds. Lumen talks as little as possible.

1. **Talk once.** Header **Share your intel** → one screen, one box. Lumen: *“Dump the layover. City, the place, why it’s a steal.”* They dictate with the **phone keyboard mic** (OS, $0) or type. Same box. Button: **Fill the draft.** No Eat/Do/Buy picker first — she classifies. Sharing from a city page already has the city.
2. **One extract.** `grok-4.3` fills the existing Eat/Do/Buy form, or a full layover (places + plan, max 4 stops). Wrong type → they tap Type on the form. **No second model call** to chase a dish, zone, or hours.
3. **Holes are the follow-up.** Draft screen, same fields we have today. Empty bits sit obvious. Lumen one-liner: *“I filled what I heard. Tap the blanks, add a pic, publish.”* They tap. They do not answer her.
4. **Photo on that same screen.** Camera roll per new place. Skip → one **AI**-stamped still **on publish**.
5. **One question only if a required field is missing** (table below). Same screen, one line. They answer once. Then extract. Never a third turn. Never “what dish?” as chat.

**Quotas they see (do not hide as a crash):** 3 drafts/day → *“Three for today. Drop another tomorrow.”* Over ~4k chars → *“Keep it to one layover.”* Monthly cap / kill switch → *“Lumen’s taking a nap.”*

**Dictate ≠ paid STT.** Keyboard/OS mic is v1. Token cost = the text, same as typing. xAI speech-to-text / in-app waveform mic = **John**, not this cut.

John’s “one follow-up Q then extract” is the **emergency brake** (step 5), not the default. Default is cheaper and less chatty: dump → form holes.

## Required fields (bare minimum — locked 2026-08-24)

Matches what the live forms already refuse to save. Lumen does **not** invent extra gates.

**Cannot draft at all** (one question, then stop): missing anything in this table.

| Post | Must have | Her one question if missing |
|------|-----------|-----------------------------|
| Eat / Do / Buy | **City** (existing **or** Lumen opens one from a real name/IATA) + **place name** + **type** | *“Which city? Airport code if you have it.”* or *“What’s the place called?”* |
| Full layover | **City** (same) + **title** + **≥1 stop with a place name** | *“Which city? Airport code if you have it.”* or *“What’s the first stop called?”* |

Type is required on the rec form today (`eat` / `do` / `shop`). She infers it. Wrong guess → they tap Type. Not a spoken Q.

**Holes — not required, they tap or skip:**

| Field | Rec | Plan |
|-------|-----|------|
| Why / blurb / narrative | hole | hole |
| Zone | hole (encouraged) | — |
| Dish / what to get | hole (Eat / Buy) | — |
| Hours available | — | hole |
| Extra stops (2–4) | — | hole |
| Photo | hole; skip → 1 AI still **on publish** | none (reuse place stills) |

**Publish succeeds** with the required row only. Thin is allowed. She does not block publish because the dish is empty. Draft vs published is their tap, default **draft**.

**She still strips:** crew hotel names, airline lodging → zone if she can, else blank zone. PG-13. She does not require a zone.

Auth required to run extract. Anonymous: no post.

## v1 (locked 2026-08-24; media + unpack 2026-08-24; share UX 2026-08-24)

- Auth required. **One extract per story.** Text model: **`grok-4.3`**. Looks up named places with **web_search** (cap 8). Blurbs = what/where + their voice. Not grok-4.6 on every post.
- Missing dish / zone / hours / blurb → **empty fields on the draft.** Not a second prompt. Missing **required** city / name / (layover) title+one stop → one question, then extract.
- **Share a rec (Eat / Do / Buy):** one place draft.
- **Share a full layover:** Lumen drafts the **plan and each stop as a place** (Eat / Do / Buy), then links the stops. Match an existing place in that city by name if it already exists — do not duplicate. Cap: same as the form (**4 stops**). User confirms the bundle.
- **Pictures (photo-first):**
  - Ask for a photo **per new place** on the draft (camera roll).
  - If they skip: **one** generated still per **new place**, stamped **AI**. Cheap Imagine SKU (`grok-imagine-image`, $0.02). Generate **on publish**, not on first draft.
  - **No still for the plan itself** — a layover is a combo of places; cards and stop images reuse the place still.
  - No regen in v1. Hate the still → upload.
- **City heroes** are not part of user import. One hero per city; refresh rarely. Lumen **asks John before spending**.
- Draft only. User hits publish. Same RLS as manual create.
- Strip crew hotel names / airline lodging → zones. PG-13.
- Quotas, `AiImportLog`, admin kill switch. Failures never leak the key. **No production spend without John’s key + cap.** Raising 3/day, $20/mo, SKUs, stills, or STT = John.

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
- [x] Input length cap + per-user quota (3/day, ~4k chars) with the copy above
- [x] Server calls xAI (`grok-4.3`) **once** per story with structured schema (city, duration, stops, dishes, zones, tips)
- [x] Full-layover extract also returns place drafts per stop (or links an existing same-city place)
- [x] Schema/prompt: **no crew hotel names** in public fields; map to zones
- [x] Returns draft only — user must confirm to publish
- [x] Thin story → prefilled form with holes, not a second extract (except missing **required** city / name / layover title+one stop → one Q)
- [ ] Photo-first; at most one still per new place, generated on publish; no plan-level still
- [x] Dictate via OS keyboard mic (text in the box). No paid STT
- [x] `AiImportLog` for cost and abuse
- [x] Admin kill switch respected
- [x] Failures show safe error; no key leakage

## Cost

See `docs/OPS.md` spend lock. Cheap SKUs, one still per place, city-hero spend needs John. Target ~2–5¢/post. Dictation through the phone is not an extra line item. **Off until John authorizes.**
