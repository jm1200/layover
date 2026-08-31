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
| 2026-08-27 | **Milo owns Playwright E2E** (`apps/web/e2e`, `npm run test:e2e`). Theo reviews. Not a tester hire. Suite does not call xAI or Google. |
| 2026-08-27 | **Phase 4 complete.** Dump/edit/photos frozen. Feel pass passed. Phase 3 waits on John. |
| 2026-08-27 | **Hygiene coded** (dead spend actions gone, album errors surface, hotel gate on stops, e2e reorder + X photo). City-hero RPC lock is SQL **017** — John pastes. |
| 2026-08-31 | **Phase 3 started:** like recs + days, comments on days, byline. SQL **018**. Follow/profiles still out. |
| 2026-08-31 | **Comments:** recs too, not only days. Edit own. Up to 3 photos. Lumen hotel + PG-13 gate (no founder queue). SQL **019**. Dump/edit/photos still frozen. |
| 2026-08-31 | **Note delete copy:** **Remove** (not Take off, not Delete). Recs/days still “come off the city.” |
| 2026-08-31 | **Author page instead of follow.** Public twin of Your recommendations. Follow still out. Likes = count only. SQL **020**. |
| 2026-08-31 | **Lumen reads notes.** Text + comment photos before they go live. Same Grok as dumps, $20 cap. If she is off, the note does not go up. |
| 2026-08-31 | **Phase 3 complete.** Like, notes, byline, author page. Follow out. Dump / rec edit / rec photos stay as they are. |
| 2026-08-31 | **Demo intel wiped.** SQL **021** — recs, days, notes, likes, photos, dump logs gone. Accounts, cities, zones, kill switch stay. Homepage no longer links seed IDs. Next content is real dumps. |
| 2026-08-31 | **Board rec: skip Phase 5 until people use the site.** Go-live = public URL (Vercel + Auth/Google URLs), not Stripe/ads. Phase 6 = metrics + reports/hide/ban (not a URL blocker). Phase 7 still later. John still says go-live. |
| 2026-08-27 | Board rec: **hygiene then Phase 3.** Phase 3 v1 = like + comment + byline. Follow / profile / pings / QR out. |

## Product locks

- Trust > disguised ads. Zones, never crew hotels.
- Destination-first city pages. Not a person-as-brand social network.
- City browse: **Full layover · Eat · Do · Buy** (public word is Buy, not Shop). Object: **layover plan**.
- Audience **A:** crew-layover primary. Word-of-mouth-only recs is the problem. Sponsor money later = labeled placement against crew density in cities.
- Homepage pitch **rejected:** “Steal the whole layover.”
- Homepage pitch: **Layover Intel — For Crew, By Crew.** Full-bleed blue-hour hero with search on the photo (Airbnb). Then three 4:5 Eat/Do/Buy posts (Instagram). Collage **rejected** — John hated it. Hero is editorial mood, not a city we claim.
- **Banner job (locked 2026-08-22, John):** the first screen is a place you want to be. City: **one hero**, refresh rarely — Lumen asks John before spending (2026-08-24). Rec cards: **1 still per place** (user photo first). Not a silent Google scrape. Homepage Eat/Do/Buy use that rec’s still — not leftover mood JPEGs (Limmat on a Geneva rec). No extra Imagine spend.
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
- **2026-08-31 — Skip Stripe; URL before ads.** Phase 5 (self-serve labeled ads + Stripe) waits until there is public traffic. Phase 6 is the metrics + reports / hide-delete / ban dashboard — not required to put a URL up. `/admin` already has kill switch + Lumen log; hide is Phase 1 nuclear. Go-live leftover is parked Vercel + production Auth/Google URLs, not another product phase. Dump / rec edit / rec photos stay as they are. John still says yes to go-live.
- **2026-08-27 — Hygiene then Phase 3.** Phase 4 complete; dump/edit/photos stay frozen. Next is a **bounded** hygiene slice (dead spend actions, lock `lumen_set_city_hero`, hotel gate on stops, fail-closed album reads, two Playwright clicks), then Phase 3. **Phase 3 v1 = like + comment + byline only.** Follow, profile-as-product, follow-pings, completion, QR are out of this cut. City stays destination-first. Not a cleanup month. Not likes with a dirty kitchen. Build waits on John.
- **2026-08-31 — Note delete is Remove.** Own-note action is **Remove**, not Take off (rec/day leaving the city) and not Delete (CMS). Like / Posted by / Leave a note stay. Copy in `agents/lumen.md`.
- **2026-08-31 — Author page, not follow.** Posted by is a link. Name from Google, editable. Photo: upload / initials / silhouette. Google headshot is opt-in. Likes are a count.
- **2026-08-31 — Author page, not follow.** “Posted by Crew” is empty `display_name` (signup never copies Google `full_name`). Copy the Google name on signup; they edit. Fallback stays **Crew**. Public page = published recs/days by city (Eat/Do/Buy). Byline becomes a link. **Not** bio, followers, DMs, a people feed. City stays destination-first. Avatar (Lumen/Sofia): circle; upload, else initials, else silhouette; no Imagine; do not auto-publish Google headshot; **Use my Google photo** is opt-in. **Likes = count only** (locked). Named people live on notes. Sponsors never get liker identities. Follow / pings / QR still parked. Dump/edit/photos still frozen. Copy: `agents/lumen.md`.
- **2026-08-24 — Phase 4 started.** John said yes. Dump box at `/share` → grok-4.3 extract → draft recs/plan. Caps: 3/day, 4k chars, $20/mo, kill switch. Needs his `XAI_API_KEY` + SQL 008. Photo stills not in this slice.
- **2026-08-24 — Lumen lookup:** Extract uses **web_search** (cap 8) so blurbs include what/where, not just the dump. Measured on John’s BCN dump: **4 searches, ~4¢, ~17s**. Still not unbounded chat. No invented walk times.
- **2026-08-24 — Review + stills:** After a dump, file **places first, then the layover**. Per place: upload a photo or Lumen generates (~2¢) only if the blurb sells (not “classic spot in the Gothic Quarter”). **Make this sell** rewrites a limp blurb. Admin does not approve each JPEG. Kill switch + $20 cap still bind. Needs SQL **010** + public Storage bucket `place-stills`.
- **2026-08-25 — Pause.** Phase 4 Lumen is in the app (BCN dump filed and published). **Known:** same itinerary can upload twice — dedup next session. Then founder testing + Theo/Milo review. Not tonight.
- **2026-08-25 — Lumen live baseline.** She is the form: dump once, lookup, unpack, city-open (name+IATA), photo-first stills, draft-then-confirm. Duplicate itinerary is a known gap (match plans like places). City heroes still John’s spend. Charter: `agents/lumen.md`.
- **2026-08-25 — BCN city hero.** John authorized. `public/landing/hero-barcelona.jpg` + `CITY_HERO.barcelona`. Search hint lists live IATA codes. `/cities` is hero cards, not a phone book. No dark placeholders.
- **2026-08-25 — City heroes: don’t ask.** One per city. Lumen spends inside $20. She may freshen with a good user shot. She monitors home/cities and updates unless they still feel right.
- **2026-08-25 — Publish when ready.** No save-draft button. She writes the blurb; they edit. Photo: upload or **AI still on publish** (one generation, after Publish). No duplicate itineraries. $20 is company-wide (SQL **011**). **2026-08-26:** no draft badge / no drafts on dashboard; no photo of the place → she stills (no checkbox homework); itinerary match is **stop set**.
- **2026-08-25 — Keep recs if the plan write fails.** They are still Lumen-moderated. John does not sit a queue.
- **2026-08-25 — Real-place gate.** Lumen looks up each named rec. Unconfirmed / hotel / PG-13 does not get a row. John does not moderate daily. Hide stays admin nuclear (Phase 6).
- **2026-08-25 — Lumen log on `/admin`.** Last 50 actions + month spend. No dump text (could leak hotels). Not the Phase 6 dashboard.
- **2026-08-25 — User photos.** Compress on upload (no 2 MB homework). Preview = 4:5 card crop. Lumen does not AI-reframe their shot.
- **2026-08-25 — Plates.** Rec card stays **one still**. Eat/Buy may have up to **3 named dish photos** on the rec page. User upload only. No AI spend per plate. Published recs: edit page can add/replace plates. Sample: Zurich raclette. **2026-08-26:** dish photos are this Get this rail — not a second unlabeled album. Place exterior is the city-card still.
- **2026-08-25 — Rec blurbs are independent of the plan.** No “streetcar from the gym” in a place blurb. Transit lives on the layover stop.
- **2026-08-25 — Lumen decides rec vs recs vs day.** They jabber once. She does not invent an itinerary. Several recs can exist with no plan. When unsure: recs, not a day.
- **2026-08-25 — Rec photos.** One album, max 3. Tap = hero (city card). X removes. Plates are **names** (Get this), not a second gallery. SQL **016** `place_photos`. **Superseded 2026-08-26:** place exterior (1) + named dish photos (0–3) on Get this; two labeled jobs.
- **2026-08-26 — Facebook / Instagram parked.** Google + email is the door. **No** Facebook/Instagram login this cut or next (Meta app review is a different job). **No** Instagram-as-content this year — Graph API, business/creator accounts, moderation. Crew dump the rec. Sofia’s door is Google.
- **2026-08-26 — Founder test product lock (seven items).** Close Phase 4 on these, not likes. **Google sign-in this cut** (email stays; not Apple). John creates the OAuth client. Sofia + Lumen restyle `/login`. **Rec photos:** place exterior (1) = city card; Eat/Buy dishes (0–3 named) on Get this; labels on both; no unlabeled double upload; no photo → Lumen still; never copy exterior onto a plate. Supersedes 08-25 album/tap-hero/names-only plates. **No draft product:** unpublished Lumen rows off public and off My posts; no `(draft)` badge. **Dashboard = this user’s published recs and days.** Seed and other authors are not “mine.” Admin queue stays Phase 6. **Dedup = stop set**, not title. Day blurb from the dump; refuse empty narrative. “On the map now” only for a city she actually opened. **Edit day: one Save** → public layover; drop/reorder persist; delete day must work. Delete-rec copy = Sofia.
- **2026-08-26 — UI copy (Sofia + Lumen).** Login: **In from a trip?** / **Dump the rec. She fills the form.** / **Continue with Google**. Never steal. Photos: **The place** — *The outside — door, street, walk-up. This is the city card.* **Get this** — *The food. Not the building. This sits under Get this.* Dashboard title **Yours**. Delete rec: **This rec comes off the city. The layover day stays.** Edit layover: **Save** → the day. Strings in `features/auth.md`, `features/ai-import.md`, `features/playbooks.md`, `agents/lumen.md`.
- **2026-08-26 — Close Phase 4 before Phase 3.** Next milestone is founder click pass + freeze dump/edit/photos. Not likes, not Stripe, not QR. SQL **011 + 016 are live** (probed). Script: `docs/board/FOUNDER-TEST.md`. Review: `docs/board/PHASE-4-REVIEW.md`.
- **2026-08-26 — Founder-test pack.** Place shot (1, city card) ≠ dish shots (Get this). Google login this cut (John pastes OAuth client). Dashboard = your published only. Same stop set = same day. One Save on edit layover. No “on the map now” for cities that already exist.
- **2026-08-26 — One chrome.** Logged-in header is the same family as the city bar: Layover · Share your intel · Cities · You · Sign out. Dashboard is **Yours**. Admin lives under You. No CMS footer.
- **2026-08-27 — Rec photos (founder).** Any pics of the rec (max 3). Tap hero = city tile + rec top. No pic → Lumen still. Get this = names only. Not “building vs food.”
- **2026-08-27 — Share copy.** Public dump does not name Lumen. Skip the form; describe the layover; we write it up. Review album max 3.
- **2026-08-27 — No “rec” on public pages.** Users see Eat / Do / Buy, place, intel. Mic line: *Type or dictate using your mic.* **Dashboard may:** title **Your recommendations**; profile menu **Your recs**.
- **2026-08-27 — Login lands on Your recommendations.** Everyone (admin too) → `/dashboard`, not `/admin`. Header: Layover · Share your intel · Cities · profile icon. Dropdown: Your recs, Admin if admin, Sign out. No You. No Sign out in the bar. No `{email} · {role}`. Dashboard cards: stills, posted date, **city** bold; Full days (stop strip) vs Recs (4:5). Quiet *or type it yourself* stays after the cards. Copy in `agents/lumen.md` + `features/auth.md`.
- **2026-08-27 — Admin log names the rec.** Last 50 is a caption: **Filed Jamon Jamon in Barcelona · Posted Aug 27 · $0.02**. Name links to the rec/day. No dump text. Not a Phase 6 queue. Copy in `agents/lumen.md`.
- **2026-08-26 — Edit rec Save is last.** Photos and Get this plates persist as you go (no extra Save). Rename or X a plate. Save then returns to the rec.
- **2026-08-25 — Edit.** Rec: hero upload, plates, delete rec. No status dropdown. Zone = cluster (downtown/airport/station). Layover: reorder/drop stops; delete day **keeps recs**. Do not start over to fix a stop. **2026-08-26:** layover edit is **one Save** then the public day; delete day must actually work.
- Live rotating homepage from “where crew have been going” needs either a human moderator or the AI pipeline. Not hired. Not built.
- “The perfect layover does not exist… {City} edition” is John’s Instagram series voice — for full plans, not ads. Ads later: “New idea…”
- Rx / pharma shopping policy **parked**.
- Users cannot create cities **via a form**. **Lumen may open a city** from a dump (real name + IATA, e.g. BCN → Barcelona) with default zones. No bulk seed required. No city-hero Imagine spend on create (still later). Admin city form still not built.
- Stack: Next.js + Supabase + Vercel; Stripe and xAI later.

## Rejected / parked

- Influencer feed / person-centric social as the product.
- Follow + profile-as-product in Phase 3 v1 — **superseded 2026-08-31:** thin **public author page** instead of follow. Follow is still a later content filter, not this cut. Bio / follower count / DMs / like-lists stay out (influencer product).
- Follow-notifications (“ping me when this person posts somewhere new”) — person-feed; parked with the influencer product.
- Completion scores / “already done” tracking — a game, not intel.
- QR-for-ad-cut / crew take of venue ad revenue — coupon/kickback. Trust + KYC/tax/fraud. Revisit only as a *labeled* offer after Stripe; never “this rec paid me.”
- Four separate category sites.
- Homepage photo grid of a city until we have real images.
- Clean-slate rewrites.
- Derailing Phase 2.1 for shopping UX, creator payouts, or multi-photo pipelines.
- Derailing Phase 4 for social theater on four thin cities.
- Facebook / Instagram login (Meta OAuth + App Review). Parked with Apple.
- Instagram-as-content / “link IG so layover posts show here.” Dead Basic Display; Graph API is a moderation product. Crew dump. Parked, probably not this year.

## Technical constraints

- `apps/web`: Next 15 App Router, React 19, Tailwind 4, Supabase SSR. No unit/e2e test script yet (eslint + tsc).
- Routes thin; features in `src/features/{auth,places,playbooks}`.
- No media table / upload pipeline **yet**. Landing JPEGs are static files in `public/landing/`. Phase 4: Supabase Storage for user photos (1 still per place).
- RLS: published public; authors edit own; admin hide; cities/zones insert admin-only.

## Unresolved founder decisions

- Keep the name **Layover**?
- Source of rotating hero/card photos (crew vs generated vs licensed). Not scraping Google by default.
- How obvious the top nav should be — thin overlay is current lock; revisit if people miss Log in.
- Apple / Facebook / Instagram OAuth — parked. Google is this cut (John’s OAuth client). Instagram linking is not a login provider.
- Rx shopping policy.
