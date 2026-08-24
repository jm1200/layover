# Feature: AI story import

**Phase:** 4  
**Status:** Spec only — not implemented. **Do not build until shareholder yes + `XAI_API_KEY`.**  
**Code (planned):** `apps/web/src/features/ai-import/`

## Goal

**Lumen fills the existing form.** User pastes (or types) a layover story; server extracts a structured draft into Eat/Do/Buy or a layover plan; user edits and publishes. Kill the pain of empty forms. Lumen is the voice of this flow — not a second product, not a travel-agent chatbot.

## v1 (locked 2026-08-24; media + unpack 2026-08-24)

- Auth required. One-shot extract preferred. Text model: **`grok-4.3`** (cheap JSON fill). Not grok-4.6 on every post.
- If the story is thin: **one question** if city / name / a stop is missing. Then extract. Default: no chat.
- **Share a rec (Eat / Do / Buy):** one place draft.
- **Share a full layover:** Lumen drafts the **plan and each stop as a place** (Eat / Do / Buy), then links the stops. Match an existing place in that city by name if it already exists — do not duplicate. Cap: same as the form (**4 stops**). User confirms the bundle. This is how one story densifies the city, not a second form farm.
- **Pictures (photo-first):**
  - Ask the user for a photo **per new place**. Fingers crossed they have one.
  - If they skip: **one** generated still per **new place**, stamped **AI**. Cheap Imagine SKU (`grok-imagine-image`, $0.02). Generate **on publish**, not on first draft.
  - **No still for the plan itself** — a layover is a combo of places; cards and stop images reuse the place still.
  - No regen in v1. Hate the still → upload.
- **City heroes** are not part of user import. One hero per city; refresh rarely. Lumen may say a hero is stale; she **asks John before spending**.
- Draft only. User hits publish. Same RLS as manual create.
- Strip crew hotel names / airline lodging → zones. PG-13.
- Quotas, `AiImportLog`, admin kill switch. Failures never leak the key.

## Not v1

- Auto-publish
- Unbounded multi-turn “plan my layover” chat billed to the owner
- Client-side API keys
- City concierge / browse companion
- Voice dictation (text first)
- Per-stop extra stills, galleries, or city-hero generation on a user post
- Image regen loops

## Acceptance criteria

- [ ] Authenticated endpoint only
- [ ] Input length cap + per-user quota
- [ ] Server calls xAI (`grok-4.3`) with structured schema (city, duration, stops, dishes, zones, tips)
- [ ] Full-layover extract also returns place drafts per stop (or links an existing same-city place)
- [ ] Schema/prompt: **no crew hotel names** in public fields; map to zones
- [ ] Returns draft only — user must confirm to publish
- [ ] Photo-first; at most one still per new place, generated on publish; no plan-level still
- [ ] `AiImportLog` for cost and abuse
- [ ] Admin kill switch respected
- [ ] Failures show safe error; no key leakage

## Cost

See `docs/OPS.md`. Cheap SKUs, one still per place, city-hero spend needs John. Target ~2–5¢/post.
