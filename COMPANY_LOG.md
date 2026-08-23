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
- Homepage pitch: **Layover Intel — For Crew, By Crew.** Search is the primary action after a visual scene. Eat / Do / Buy cards tappable to real place rows.
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
- Homepage redesign beyond current cards+search. Sofia’s “pairing brief” vs CSS-only scoped pass — needs John’s yes. Do not implement until he says so.
- Empty-submit on city search used to navigate to the first city; fixed 2026-08-22 (no-op unless the box has text).
- When (if) to add cities beyond Zurich/Delhi, and whether Santiago/Munich become real inventory.
- Photo pipeline / city-as-pictures.
- Rx shopping policy.
