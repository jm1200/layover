# Feature: Social

**Phase:** 3  
**Status:** **In progress.** Like + comment + byline. SQL **018** + **019**. Dump/edit/photos stay frozen.  
**Code:** `apps/web/src/features/social/`

## Goal

Like, comment, and a **byline** as trust signals under content — who posted this, without making the product a person-centric social network. City browse stays **destination-first** (“what to do in Zurich”), not “whose feed is this.”

## Acceptance criteria (v1)

- [x] Like playbooks (and optionally places)
- [x] Comment threads on playbooks **and recs**
- [x] Edit own comment. Up to **3** photos on a comment (same cap as a rec)
- [x] Lumen moderates notes: zones not hotels, PG-13. No founder queue
- [x] Byline on playbooks/places (display name). Poster is secondary; city stays the hero
- [x] Playwright covers like + comment on day one of the build
- [x] No public follower graph

## Out of this cut (v1)

- Follow users / “from people you follow” content filter — later, not this build
- Profile as a product (bio, cities they post about, people pages) — byline is enough
- DMs
- Private circles
- Complex reputation scores (simple like counts OK)
- Influencer-style home feed where the **person** is the primary object of browse
- Photo grid / media on city page

## Parked (not Phase 3, not next)

- Follow-notifications / “ping me when this user posts somewhere new” — person-feed; needs push/email infra
- Completion scores / “already done” tracking — a game; new schema
- QR codes that pay crew a cut of venue ad revenue — coupon/kickback; Stripe Connect + KYC/tax/fraud. Revisit only as a *labeled* offer after Phase 5 Stripe, never as “this rec paid me”
- Full admin ban queue — Phase 6 (hide already exists in Phase 1)
