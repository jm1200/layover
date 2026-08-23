# COMPANY_LOG — Layover

Durable history only. Not a chat transcript.

## Identity

- **Company / product name:** Layover (working name). Unresolved whether this stays.
- **Founder:** John — owner, primary investor, final authority.
- **Wedge:** High-trust layover intel for airline crew. Other travelers may use the same city content.
- **Not this year:** A general “fun for everyone” travel site as the lead. Same sequenced-plan object may grow later (e.g. multi-day camping). Not a second website.

## Team

| Date | Change |
|------|--------|
| 2026-08-04 | Org: John → CEO agent → engineer session. |
| 2026-08-22 | Named company: **Maya Chen** (CEO), **Theo Mercer** (senior engineer), **Milo Patel** (product engineer / reviewer), **Sofia Reyes** (marketing & experience). |

## Product locks

- Trust > disguised ads. Zones, never crew hotels.
- Destination-first city pages. Not a person-as-brand social network.
- City browse: **Full layover · Eat · Do · Buy** (public word is Buy, not Shop). Object: **layover plan**.
- Audience **A:** crew-layover primary. Word-of-mouth-only recs is the problem. Sponsor money later = labeled placement against crew density in cities.
- Homepage pitch **rejected:** “Steal the whole layover.”
- Homepage pitch: **Layover Intel — For Crew, By Crew.** Full-bleed blue-hour hero with search on the photo (Airbnb). Then three 4:5 Eat/Do/Buy posts (Instagram). Collage **rejected** — John hated it. Hero is editorial mood, not a city we claim.
- **Banner job (locked 2026-08-22, John):** the first screen is a place you want to be. Later: rotate the hero when an AI moderator (or similar) picks a *quality* new pic. Same for the three rec cards. Source of those pics (crew upload vs generated vs licensed) **unresolved** — not a silent Google scrape.
- Eat / Do / Buy stamps on the cards are the site’s job labels. Keep them large and obvious.
- Header stays thin overlay (no fat toolbar). Logged-in CTA is **Dashboard**, not “Open app” (that dumped John into `/admin`).
- Site has two jobs: **look up** (search) and **share**. Without intel there is no site. **Share your intel** lives in the overlay header (Airbnb “host”), not beside the city search — search stays the lookup action. Logged-out → signup; logged-in → dashboard (forms until AI draft ships).
- City page (pending build): **kill chips** for now. Keep empty groups visible as an invite to share, not “None yet.” Dark first screen = city name + airport on a night band like the landing, not a Wikipedia infobox. Full layover first with hours loud. Eat/Do/Buy as big stamps.
- **Next build after homepage:** city page should inherit this mood. **Then:** how to add data — AI fills a draft (asks for missing bits, e.g. a dish), user approves. Almost no forms. That is the AI moderator v0. Not built.
- Generated stills get a visible **AI** flag + hover note. Sponsored flag reserved, not live. No Google scrape.
- Place pages: photo hero, blurb, Google Maps embed (search query, zoom 16). Itinerary pages: sell the day, stop stills, cost/time notes, start-clock (not hotel, not fake buses). AI ticket/directions parked.
- 2026-08-23: City page v1 shipped. Chips gone. Eat/Do/Buy first (top 3 + kind pages). Full layover below, hours loud. Empty groups invite Share your intel (not hidden). Zurich photo hero (dense demo). Delhi type-only dark hero + forced-empty demo (`CITY_PAGE_FORCE_EMPTY`). SCL/MUC mixed. No carousel. Dedicated `/eat` `/do` `/buy`. Run SQL **006** for Zurich extra recs.
- Seed cities (after 005): Zurich, Delhi, Santiago, Munich. Homepage cards: SCL steak, ZRH Limmat, MUC mustard. Photos are still generated stand-ins until crew uploads exist.
- **AI-maintained, almost no forms** is John’s contribution model (dictate → draft place/plan, follow-up questions, optional generated image + map). Not built. Phase 4 territory. Forms stay until that ships.
- Live rotating homepage from “where crew have been going” needs either a human moderator or the AI pipeline. Not hired. Not built.
- “The perfect layover does not exist… {City} edition” is John’s Instagram series voice — for full plans, not ads. Ads later: “New idea…”
- Rx / pharma shopping policy **parked**.
- Users cannot create cities. Admin city form not built (SQL).
- Stack: Next.js + Supabase + Vercel; Stripe and xAI later.

## Rejected / parked

- Influencer feed / person-centric social as the product.
- Four separate category sites.
- Homepage photo grid of a city until we have real images.
- Clean-slate rewrites.
- Derailing Phase 2.1 for shopping UX, creator payouts, or multi-photo pipelines.

## Technical constraints

- `apps/web`: Next 15 App Router, React 19, Tailwind 4, Supabase SSR. No unit/e2e test script yet (eslint + tsc).
- Routes thin; features in `src/features/{auth,places,playbooks}`.
- No media table / upload pipeline. Landing JPEGs are static files in `public/landing/`.
- RLS: published public; authors edit own; admin hide; cities/zones insert admin-only.

## Unresolved founder decisions

- Keep the name **Layover**?
- Source of rotating hero/card photos (crew vs generated vs licensed). Not scraping Google by default.
- How obvious the top nav should be — thin overlay is current lock; revisit if people miss Log in.
- Rx shopping policy.
