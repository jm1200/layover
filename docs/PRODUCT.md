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

### Layover zone

Abstract geography for logistics **without naming crew hotels**:

- Airport / airport hotel strip
- City center / old town
- Station area
- Waterfront / other named clusters

Tips like “closest grocery” attach to **zones**, not employer hotels. See `SECURITY.md`.

### Place

Restaurant, bar, gym, shop, rental, museum, etc.

### Dish / item

Specific order at a place (truffle raclette, lava cake).

### Activity

Things you do (float the Limmat with gear, climb, run).

### Event

Time-bound (string quartet in Vienna). Needs dates; can expire.

### Playbook

Ordered story/itinerary: stops + notes + transit + gear. Example:

> 22h Zurich → innertube + dry bag + climbing gear → float Limmat to climbing gym → streetcar downtown → raclette factory (truffle raclette + lava cake).

### Social

Like, comment, follow users who give good recommendations. Reputation > vanity metrics.

### Sponsorship (labeled)

Paid placement on city pages / “new ideas” rails. **Never** sold as organic crew staples or fake reviews.

## Content rails (trust)

On city (and similar) views, keep two mental rails:

1. **Crew staples (organic)** — ranked by community signals (saves, likes, follows, recency).
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
