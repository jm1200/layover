# Feature: Social

**Phase:** 3  
**Status:** Spec only — not implemented  
**Code (planned):** `apps/web/src/features/social/`

## Goal

Like, comment, follow as **trust signals under content** — surface who gives good recommendations **without** making the product a person-centric social network. City browse stays **destination-first** (“what to do in Zurich”), not “whose feed is this.”

## Acceptance criteria

- [ ] Like playbooks (and optionally places)
- [ ] Comment threads on playbooks
- [ ] Follow users; optional “from people you follow” **filter on content** later (not a mandatory people home feed)
- [ ] Basic profile: display name, bio, cities they post about (secondary; deep-link from bylines)
- [ ] No public follower graph abuse tools required for MVP
- [ ] City page remains content/destination-led; poster is byline-level, not the hero

## Out of scope (v1)

- DMs
- Private circles
- Complex reputation scores (simple counts OK)
- Influencer-style home feed where the **person** is the primary object of browse
- Photo grid / media on city page (deferred multi-photo vision; not Phase 3 requirement)
