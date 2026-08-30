# Feature: Social

**Phase:** 3  
**Status:** **In progress.** Like + comment + byline + author page. SQL **018**–**020** (John pastes). Dump/edit/photos stay frozen.  
**Code:** `apps/web/src/features/social/`

## Goal

Like, comment, and a **byline** as trust signals under content. The byline opens that person’s **published intel** — not a follower graph, not an influencer home. City browse stays **destination-first** (“what to do in Zurich”), not “whose feed is this.”

## Acceptance criteria (v1)

- [x] Like playbooks (and optionally places)
- [x] Comment threads on playbooks **and recs**
- [x] Edit own comment. Up to **3** photos on a comment (same cap as a rec)
- [x] Lumen reads each note and its pictures before they go live (same Grok as dumps, pennies). Word filter first. If she is off or the $20 is spent, the note does not go up.
- [x] Byline on playbooks/places (display name). Poster is secondary; city stays the hero
- [x] Playwright covers like + comment on day one of the build
- [x] No public follower graph
- [x] Public author page: name + photo, Posted by is a link, likes are a count

## Author page

Public twin of **Your recommendations**. Tap Posted by {name} (or a note byline) → their published recs and days, grouped by city, Eat / Do / Buy. Where they’ve been = cities they posted in. Not GPS. Not hotels.

| On | Off |
|----|-----|
| Display name (editable by owner) | Bio essay |
| Avatar: upload, else initials, else silhouette | Auto-publish Google headshot |
| Published recs + days only | Drafts, hidden, other people’s posts |
| Grouped by city | Follower / following counts |
| Edit own name + pic | Follow button, DMs, pings |
| | Airline, hotel, home base, “people in this city” |

**Name:** `handle_new_user` copies Google `raw_user_meta_data.full_name` or `name` into `display_name`. Owner can edit. Empty → **Crew**. Never email. Backfill existing nulls from Auth metadata. “Posted by Crew” today is this hole, not a Google-button bug.

**Avatar (Sofia/Lumen 2026-08-31):** Circle. Upload, else initials, else silhouette. **No Imagine.** Do not auto-publish the Google headshot. Edit may offer **Use my Google photo** if Google has one. Initials: first + last word; one word → one letter; Crew → **C**. Zinc-800 / white (invert on dark). No rainbow hash. One photo, compressed, circle preview. Never a face on the city card or the rec byline.

**Likes (locked):** **count only.** Button shows Like / Liked · n. You know you liked it. Nobody sees a list of who. A roster is a party; a count is a stamp. Notes already name people. Sponsors never get crew PII (`docs/ROLES.md`). SQL **020** replaces public `likes_select` with own-only + `like_count_of` RPC.

**Byline:** Posted by {name} **is a link** when `author_id` exists. Seed / null author stays **Crew**, not a link. City pages do not grow a people rail.

**Route (intent):** one stable id URL (e.g. `/u/[id]`). Sofia/Lumen may rename the path. No vanity slug this cut. Dashboard stays private mine; this page is the public version of the same posts.

**RLS (intent):** public may read `display_name` + avatar, never email/role/status. Owner may update own name + avatar, never role/status.

**Still frozen:** dump / edit rec / photos pipeline.

## Copy (locked 2026-08-31)

Lumen paste list: `agents/lumen.md` → Header dropdown, Rec/day hero, Comments, Person page, Name and photo. Engineering does not invent a second voice.

| Slot | String |
|------|--------|
| Rec/day byline | Posted by {name} (fallback **Crew**). **Link** if there is an author. Never a face. **Posted {Mon D}** under it. |
| Like | **Like** / **Liked** · count. Visible never **Unlike**. Never a who-list. |
| Person title | {name} / empty **Crew** |
| Person line | Where they've been. |
| Person empty | Nothing on the map yet. |
| Own | Edit |
| Edit title | Name and photo |
| Edit line | This is Posted by. |
| Photo | Add a photo / Change photo / **Use my Google photo** / **Remove** |
| Save | Save |
| Comments heading | Comments |
| Empty | None yet. |
| Form | Leave a note / Been? Add a line. / **Post** |
| Note date | Posted {Mon D} |
| Note photos | View: pictures only. Edit: Add a photo / X. New note: **Add a photo** opens the slots (hidden until then). |
| Own delete | **Remove** (aria **Remove note**) |
| **Never on a note** | Take off · Delete · Remove comment |
| Header menu | **Profile** → `/u/[id]`. **Your recs** → `/dashboard`. Never the display name in the menu. |
| **Never on a person page** | rec · Follow · Bio · Content creator · Take off · Delete · a cover |

**Take off** stays on rec/day delete and admin “Taken off the city.” A note is not on the city.

## Out of this cut (v1 + author page)

- Follow users / “from people you follow” content filter — later, not this build
- Bio, follower counts, DMs, private circles
- Public **who liked** list
- Complex reputation scores (simple like counts OK)
- Influencer-style home feed where the **person** is the primary object of browse
- Photo grid / media on city page

## Parked (not Phase 3, not next)

- Follow-notifications / “ping me when this user posts somewhere new” — person-feed; needs push/email infra
- Completion scores / “already done” tracking — a game; new schema
- QR codes that pay crew a cut of venue ad revenue — coupon/kickback; Stripe Connect + KYC/tax/fraud. Revisit only as a *labeled* offer after Phase 5 Stripe, never as “this rec paid me”
- Full admin ban queue — Phase 6 (hide already exists in Phase 1)
