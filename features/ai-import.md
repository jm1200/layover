# Feature: AI story import

**Phase:** 4  
**Status:** Spec only — not implemented  
**Code (planned):** `apps/web/src/features/ai-import/`

## Goal

User pastes a layover story; server extracts structured draft; user edits and publishes. Kill the pain of empty forms.

## Acceptance criteria

- [ ] Authenticated endpoint only
- [ ] Input length cap + per-user quota
- [ ] Server calls xAI with structured schema (city, duration, stops, dishes, zones, tips)
- [ ] Schema/prompt: **no crew hotel names** in public fields; map to zones
- [ ] Returns draft only — user must confirm to publish
- [ ] `AiImportLog` for cost and abuse
- [ ] Admin kill switch respected
- [ ] Failures show safe error; no key leakage

## Cost

See `docs/OPS.md`. Prefer one-shot extraction over chat UI in v1.
