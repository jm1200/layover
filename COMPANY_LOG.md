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
| 2026-08-23 | Hired **Lumen** — the website. Moderates, generates/asks for photos, PG-13, strips hotels/airlines, full send on activities. Not wired into the app yet (talk-to-the-site is next product). |
| 2026-08-25 | **Lumen is live** at `/share`. Dump → lookup → fill the form. Job/rules baseline: `agents/lumen.md`. |

## Product locks

- Trust > disguised ads. Zones, never crew hotels.
- Destination-first city pages. Not a person-as-brand social network.
- City browse: **Full layover · Eat · Do · Buy** (public word is Buy, not Shop). Object: **layover plan**.
- Audience **A:** crew-layover primary. Word-of-mouth-only recs is the problem. Sponsor money later = labeled placement against crew density in cities.
- Homepage pitch **rejected:** “Steal the whole layover.”
- Homepage pitch: **Layover Intel — For Crew, By Crew.** Full-bleed blue-hour hero with search on the photo (Airbnb). Then three 4:5 Eat/Do/Buy posts (Instagram). Collage **rejected** — John hated it. Hero is editorial mood, not a city we claim.
- **Banner job (locked 2026-08-22, John):** the first screen is a place you want to be. City: **one hero**, refresh rarely — Lumen asks John before spending (2026-08-24). Rec cards: **1 still per place** (user photo first). Not a silent Google scrape. Homepage rotation from live quality pics is later, not a per-post spend.
- Eat / Do / Buy stamps on the cards are the site’s job labels. Keep them large and obvious.
- Header stays thin overlay (no fat toolbar). Logged-in CTA is **Dashboard**, not “Open app” (that dumped John into `/admin`).
- Site has two jobs: **look up** (search) and **share**. Without intel there is no site. **Share your intel** lives in the overlay header (Airbnb “host”), not beside the city search — search stays the lookup action. Logged-out → signup; logged-in → dashboard (forms until AI draft ships).
- City page (pending build): **kill chips** for now. Keep empty groups visible as an invite to share, not “None yet.” Dark first screen = city name + airport on a night band like the landing, not a Wikipedia infobox. Full layover first with hours loud. Eat/Do/Buy as big stamps.
- **Next build after homepage:** city page should inherit this mood. **Then:** how to add data — AI fills a draft (asks for missing bits, e.g. a dish), user approves. Almost no forms. That is the AI moderator v0. Not built.
- Generated stills get a visible **AI** flag + hover note. Sponsored flag reserved, not live. No Google scrape. **No dark placeholder bands** — every city and rec we have gets a still. Lumen’s rule.
- Place pages: photo hero, blurb, Google Maps embed (search query, zoom 16). Itinerary pages: sell the day, stop stills, cost/time notes, start-clock (not hotel, not fake buses). AI ticket/directions parked.
- 2026-08-23: City pages have photo heroes for all four cities. Delhi empty-demo flag **removed**. Every seeded rec has a still.
- Seed cities (after 005): Zurich, Delhi, Santiago, Munich. Homepage cards: SCL steak, ZRH Limmat, MUC mustard. Photos are still generated stand-ins until crew uploads exist.
- **AI-maintained, almost no forms** is John’s contribution model (dictate → draft place/plan, tap blanks, optional generated image + map). Not built. Phase 4 territory. Forms stay until that ships.
- **2026-08-24 — Lumen v1 locked (not built):** Grok/xAI still the provider. Lumen fills the **existing** Eat/Do/Buy or layover-plan form from a story (one-shot extract, photo ask or **AI**-stamped still). User publishes. **Not** an auto-post chatbot, not unbounded travel-agent chat, not client keys. Phase 4 waits on John’s yes + `XAI_API_KEY`. Phase 3 social waits (supply first). City polish is not a blocker.
- **2026-08-24 — Cheap media + unpack (not built):** Product extract = `grok-4.3`; stills = `grok-imagine-image` ($0.02). **1 still per place**, photo-first, generate on publish, no regen. A **full layover unpacks into places** (max 4) + a linked plan; the plan has no extra still. **City: one hero**; Lumen asks John before spending to refresh. User photos via **Supabase Storage** (cheap to keep; compress so bandwidth doesn’t bite). Default AI cap **$20/mo**. Stay on xAI — don’t swap vendors for pennies.
- **2026-08-24 — Spend lock:** No production AI (or paid cloud upgrade) without John’s explicit yes — key **and** monthly cap. Raising quotas, $ cap, Imagine quality, extra stills, paid STT, web search, city-hero refresh = John. Until invoices exist: **3 drafts/user/day**, ~4k chars, **one extract**. Kill switch with Phase 4; AI stays off until he says go. Not built.
- **2026-08-25 — Daily 3-draft cap parked.** John hit it while testing. Restore in a later phase (`DAILY_EXTRACT_CAP` in `features/ai-import/schema.ts`). $20/mo + 4k chars + kill switch stay.
- **2026-08-24 — Share UX (Sofia, not built):** Users **will dictate** via phone keyboard / OS mic ($0 extra; tokens = the text). Dump once → Lumen fills the draft → missing bits are **empty fields** (no second model call). One spoken/typed question only if a **required** field is missing. Not a chat interview. Paid STT not v1.
- **2026-08-24 — Lumen required fields:** Rec: **city + name + type** (type inferred). Full layover: **city + title + ≥1 named stop**. Holes (not blockers): blurb, zone, dish, hours, extra stops, photo. Thin may publish. Matches live form gates.
- **2026-08-24 — Phase 2 + 2.1 complete.** Content + browse UI shipped. Parked: admin city form, Vercel, photo upload (Phase 4). Next is Phase 4 when John authorizes.
- **2026-08-24 — Order locked (board; John has not said go):** **Phase 4 Lumen first.** Thin Phase 3 (like + comment + byline profile) **after** Lumen has produced real posts. Follow = content filter later, not a people-feed. Ban queue stays Phase 6.
- **2026-08-24 — Phase 4 started.** John said yes. Dump box at `/share` → grok-4.3 extract → draft recs/plan. Caps: 3/day, 4k chars, $20/mo, kill switch. Needs his `XAI_API_KEY` + SQL 008. Photo stills not in this slice.
- **2026-08-24 — Lumen lookup:** Extract uses **web_search** (cap 8) so blurbs include what/where, not just the dump. Measured on John’s BCN dump: **4 searches, ~4¢, ~17s**. Still not unbounded chat. No invented walk times.
- **2026-08-24 — Review + stills:** After a dump, file **places first, then the layover**. Per place: upload a photo or Lumen generates (~2¢) only if the blurb sells (not “classic spot in the Gothic Quarter”). **Make this sell** rewrites a limp blurb. Admin does not approve each JPEG. Kill switch + $20 cap still bind. Needs SQL **010** + public Storage bucket `place-stills`.
- **2026-08-25 — Pause.** Phase 4 Lumen is in the app (BCN dump filed and published). **Known:** same itinerary can upload twice — dedup next session. Then founder testing + Theo/Milo review. Not tonight.
- **2026-08-25 — Lumen live baseline.** She is the form: dump once, lookup, unpack, city-open (name+IATA), photo-first stills, draft-then-confirm. Duplicate itinerary is a known gap (match plans like places). City heroes still John’s spend. Charter: `agents/lumen.md`.
- **2026-08-25 — BCN city hero.** John authorized. `public/landing/hero-barcelona.jpg` + `CITY_HERO.barcelona`. Search hint lists live IATA codes. `/cities` is hero cards, not a phone book. No dark placeholders.
- Live rotating homepage from “where crew have been going” needs either a human moderator or the AI pipeline. Not hired. Not built.
- “The perfect layover does not exist… {City} edition” is John’s Instagram series voice — for full plans, not ads. Ads later: “New idea…”
- Rx / pharma shopping policy **parked**.
- Users cannot create cities **via a form**. **Lumen may open a city** from a dump (real name + IATA, e.g. BCN → Barcelona) with default zones. No bulk seed required. No city-hero Imagine spend on create (still later). Admin city form still not built.
- Stack: Next.js + Supabase + Vercel; Stripe and xAI later.

## Rejected / parked

- Influencer feed / person-centric social as the product.
- Follow-notifications (“ping me when this person posts somewhere new”) — person-feed; parked with the influencer product.
- Completion scores / “already done” tracking — a game, not intel.
- QR-for-ad-cut / crew take of venue ad revenue — coupon/kickback. Trust + KYC/tax/fraud. Revisit only as a *labeled* offer after Stripe; never “this rec paid me.”
- Four separate category sites.
- Homepage photo grid of a city until we have real images.
- Clean-slate rewrites.
- Derailing Phase 2.1 for shopping UX, creator payouts, or multi-photo pipelines.
- Derailing Phase 4 for social theater on four thin cities.

## Technical constraints

- `apps/web`: Next 15 App Router, React 19, Tailwind 4, Supabase SSR. No unit/e2e test script yet (eslint + tsc).
- Routes thin; features in `src/features/{auth,places,playbooks}`.
- No media table / upload pipeline **yet**. Landing JPEGs are static files in `public/landing/`. Phase 4: Supabase Storage for user photos (1 still per place).
- RLS: published public; authors edit own; admin hide; cities/zones insert admin-only.

## Unresolved founder decisions

- Keep the name **Layover**?
- Source of rotating hero/card photos (crew vs generated vs licensed). Not scraping Google by default.
- How obvious the top nav should be — thin overlay is current lock; revisit if people miss Log in.
- Rx shopping policy.
