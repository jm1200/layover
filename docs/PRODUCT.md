# PRODUCT.md — Layover

## One-liner

High-trust layover playbooks for flight crew, with self-serve labeled sponsorship for venues that want crew traffic.

## Problem

Crew layover knowledge is word-of-mouth. Staples exist (e.g. “the only bar” in Delhi — literally named Only Bar), but there is no durable, searchable, social list. Entering tips is painful. Hotels are sensitive. Restaurants that want a steady crew stream have no clean way to show up without ruining trust.

## Audience

| Segment | Need |
|---------|------|
| Flight crew | “What do I do with 12–24h in this city?” ordered plans, food, activities, events |
| Other travelers | Same content; lower priority for verification features |
| Sponsors | Restaurants, activities (e.g. boat rental), events, destinations — pay for labeled discovery |
| Owner (admin) | Revenue + health metrics; minimal daily work |

## Core concepts

### City

A destination hub (Zurich, Delhi, Vienna). Browse starts here, often with **hours available** later.

**UX rule (locked intent):** **Destination-first.** Opening a city should answer “what to do / eat / buy here,” not “who is posting.” Experiential photos (fun, food, products) and layover plans / Eat·Do·Shop recs lead; the poster is secondary credit, not the brand. We are not a person-centric social network.

**City browse IA (4-chip structure locked 2026-08-21; first-chip name still open):** Hybrid on the **same** city page — not four category sites. Jump chips **[name TBD] · Eat · Do · Shop**, then grouped lists. CEO default for chip 1: **Full layover** (object: **layover plan**). Do not ship the chips until the name is locked. **Shop stays first-class** (Delhi shopping is real; density from content, not extra pages). Zones stay. Users do not create cities. Rx / pharma shopping policy is **parked**, not this cut.

### Layover zone

Abstract geography for logistics **without naming crew hotels**:

- Airport / airport hotel strip
- City center / old town
- Station area
- Waterfront / other named clusters

Tips like “closest grocery” attach to **zones**, not employer hotels. See `SECURITY.md`.

### Place (internal) — Eat / Do / Shop in the UI

Restaurant, bar, gym, shop, rental, museum, etc. One table. **Customer copy does not say “place.”** Browse and add group as **Eat · Do · Shop**.

| UI | Typical `category` |
|----|-------------------|
| Eat | restaurant, bar, cafe |
| Do | activity, gym, museum, rental |
| Shop | shop, grocery, boutique |

### Dish / item

Specific thing to get at a place — menu dishes (truffle raclette, lava cake) **and** products to buy (Munich mustard, Roman wine). Same idea: name the *thing*, not only the venue. Full “shopping tips” product surface + multi-photo UX is **deferred** (see board CEO log 2026-08-05); Phase 2 still treats this as a simple place child.

### Activity

Things you do (float the Limmat with gear, climb, run).

### Event

Time-bound (string quartet in Vienna). Needs dates; can expire.

### Layover plan (internal: playbook)

Ordered story/itinerary: stops + notes + transit + gear. **UI name: layover plan** — not “playbook”, not “adventure.” Example:

> 22h Zurich → innertube + dry bag + climbing gear → float Limmat to climbing gym → streetcar downtown → raclette factory (truffle raclette + lava cake).

### Social

Like, comment, follow — **trust signals under content**, not a creator-celebrity product. Reputation ranks playbooks/places/items; city browse stays destination-led. Later: photo-first posting + reward high-signal creators (signals first; paid rewards only with trust-safe design). Phase 3 = basic signals only — not a person feed as the home experience.

### Sponsorship (labeled)

Paid placement on city pages / “new ideas” rails. **Never** sold as organic crew staples or fake reviews.

## Content rails (trust)

On city (and similar) views, keep two mental rails:

1. **Crew staples (organic)** — layover plans + Eat/Do/Shop recs, ranked later by community signals (saves, likes, follows, recency).
2. **Fresh / sponsored ideas** — clearly **Sponsored** (friendly copy OK: “New idea for a ZRH layover”).

Caps so the page does not become a billboard (product detail in sponsorship feature spec).

## AI contribution

Users tell a **story** (text first; voice later). Server-side model extracts structured fields → **user reviews draft → publish**. No auto-publish of raw AI. Quotas protect token cost. Provider intent: xAI / SpaceXAI (see OPS).

## Monetization

1. Self-serve sponsor campaigns (Stripe): city placement, new-ideas rail, optional playbook sidebar.
2. Verified venue badge + sponsor-facing metrics (impressions, clicks, saves — not crew personal data).
3. Later: crew offers/codes, airline/hotel partnerships (not MVP).

Trust rule: if a monetization idea requires looking organic, reject it.

## Explicit non-goals (near term)

- Native mobile apps (responsive web first)
- Public maps of crew hotels
- Full open-ended AI travel chatbot
- Automated unsupervised site redesign by AI
- DM network / heavy gamification on day one
- Affiliate / product marketplace spam (shopping tips stay place-tied and labeled if paid)
- Creator payouts or complex reward economy before basic social + content density
- Influencer-style “follow people as the product” — destination and layover utility stay primary
- **Rx / controlled-drug shopping policy** — parked (ban vs OTC-only vs disclaimer). Do not publish how-to-buy medical advice. Party Smart vs sildenafil are different legal classes; do not treat as one tip type until policy exists.

## Success signals

- Crew return to check cities before trips
- Organic staples emerge per city
- Sponsors pay without owner manually placing every ad
- AI import used without budget blowups
- No credible leak of crew lodging patterns via the product

## Example north-star story (product quality bar)

A crew member with 22h in Zurich finds (or posts) a playbook: water activity → climbing → specific restaurant items, with zone-level transit — not “walk out of the [Airline] crew hotel.”

## Working name

**Layover** (temporary until branding). Update this doc if the public name changes.

## Tech (pointer)

Locked stack lives in **`docs/STACK.md`** (Next.js, Supabase, Vercel, Stripe later, xAI later). Product rules here do not change when host bills change.
