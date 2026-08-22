# PRODUCT.md — Layover

## One-liner

High-trust layover playbooks for flight crew, with self-serve labeled sponsorship for venues that want crew traffic.

## Problem

Crew layover knowledge is word-of-mouth. Staples exist (e.g. “the only bar” in Delhi — literally named Only Bar), but there is no durable, searchable, social list. Entering tips is painful. Hotels are sensitive. Restaurants that want a steady crew stream have no clean way to show up without ruining trust.

## Audience

**Locked 2026-08-22 (A):** Crew-layover **primary**. Other travelers welcome to steal the same city plans. Not a general “fun itineraries” site this year. One product, one object (ordered stealable plan). Multi-day camping/climbing is that same object **later** — not a second site, not on the homepage until it exists.

| Segment | Need |
|---------|------|
| Flight crew | “What do I do with 12–24h in this city?” Durable recs instead of word-of-mouth only. Ordered layover plans, food, activities, events. |
| Other travelers | Same city content; steal the plan. Lower priority for verification. |
| Sponsors | Restaurants, activities (e.g. boat rental), events, destinations — pay for labeled discovery of **crew density in cities** |
| Owner (admin) | Revenue + health metrics; minimal daily work |

## Core concepts

### City

A destination hub (Zurich, Delhi, Vienna). Browse starts here, often with **hours available** later.

**UX rule (locked intent):** **Destination-first.** Opening a city should answer “what to do / eat / buy here,” not “who is posting.” Eat · Do · Buy recs and layover plans lead; the poster is secondary credit, not the brand. We are not a person-centric social network. Experiential photos (fun, food, products) are the **later** city surface — parked until we have real images (no stock of real venues). Phase 2 city pages stay **text lists**.

**Homepage IA (locked 2026-08-22):** Intel for crew, by crew. Minimal reading. Three main cards **Eat / Do / Buy**, then a subsection **The perfect layover** — not a steal pitch, not “places” as a word. Series line: “The perfect layover does not exist… {City} edition.” Object is still **layover plan**. **Rejected on `/`:** “Steal the whole layover.” Do not put camping/Ontario here.

**City browse IA (4-chip structure + first chip locked 2026-08-21; Buy locked 2026-08-22):** Hybrid on the **same** city page — not four category sites. Jump chips **Full layover · Eat · Do · Buy**, then grouped **text** lists. Chip 1 stays **Full layover** (shareholder reordered the *landing*, not this page). Object name: **layover plan**. Public third verb is **Buy** (not Shop) — one word with the homepage. Internal category may stay `shop`. **Rejected for chip 1:** Ideas / Layover ideas (Eat·Do·Buy are already ideas; Phase 5 ads already use “New idea…”); Guides; Itineraries (OK later in a sentence, not the tab); Plan as the chip; Play / tour / adventure / Full package; **The perfect layover** as a city chip (that name is the homepage *series* only). **Buy stays first-class** (Delhi shopping is real; density from content, not extra pages). Zones stay. Users do not create cities. Rx / pharma shopping policy is **parked**, not this cut. Photo grid on city = **parked**.

### Layover zone

Abstract geography for logistics **without naming crew hotels**:

- Airport / airport hotel strip
- City center / old town
- Station area
- Waterfront / other named clusters

Tips like “closest grocery” attach to **zones**, not employer hotels. See `SECURITY.md`.

### Place (internal) — Eat / Do / Buy in the UI

Restaurant, bar, gym, shop, rental, museum, etc. One table. **Customer copy does not say “place.”** Browse and add group as **Eat · Do · Buy**.

| UI | Typical `category` |
|----|-------------------|
| Eat | restaurant, bar, cafe |
| Do | activity, gym, museum, rental |
| Buy | shop, grocery, boutique (persist `shop`) |

### Dish / item

Specific thing to get at a place — menu dishes (truffle raclette, lava cake) **and** products to buy (Munich mustard, Roman wine). Same idea: name the *thing*, not only the venue. Full “shopping tips” product surface + multi-photo UX is **deferred** (see board CEO log 2026-08-05); Phase 2 still treats this as a simple place child.

### Activity

Things you do (float the Limmat with gear, climb, run).

### Event

Time-bound (string quartet in Vienna). Needs dates; can expire.

### Layover plan (internal: playbook)

Ordered story/itinerary: stops + notes + transit + gear. **UI name: layover plan** — not “playbook”, not “adventure.” This is the product object (complete, look-no-further sequence). On `/`, those plans sit in the organic series **The perfect layover** (“The perfect layover does not exist… {City} edition”). That series name is **not** a city chip and **not** a sponsored rail (Phase 5 stays “New idea…” / **Sponsored**). Crew layover in a city is the wedge we ship now; a multi-day park trip is the same object later, not a second product. Example:

> 22h Zurich → innertube + dry bag + climbing gear → float Limmat to climbing gym → streetcar downtown → raclette factory (truffle raclette + lava cake).

### Social

Like, comment, follow — **trust signals under content**, not a creator-celebrity product. Reputation ranks playbooks/places/items; city browse stays destination-led. Later: photo-first posting + reward high-signal creators (signals first; paid rewards only with trust-safe design). Phase 3 = basic signals only — not a person feed as the home experience.

### Sponsorship (labeled)

Paid placement on city pages / “new ideas” rails. **Never** sold as organic crew staples or fake reviews.

## Content rails (trust)

On city (and similar) views, keep two mental rails:

1. **Crew staples (organic)** — layover plans (homepage series: **The perfect layover**) + Eat/Do/Buy recs, ranked later by community signals (saves, likes, follows, recency).
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
- **General-fun / camping-first this year** — same object later; do not put Ontario-scale trips on `/` or re-scope city IA until layover density exists

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
