# SECURITY.md — Crew privacy and public safety

## The hard problem

The most useful crew tip is often: **what is near the hotel we actually stay at?**  
Publishing that on the open web can expose lodging patterns, safety risk, and operational sensitivity.

**Product decision:** useful logistics without public hotel identity.

## Rules (public site)

### Forbidden (public content)

- Naming **crew hotels** (property names tied to airline crew stays)
- Lists like “where [Airline] crews stay in DEL”
- Map pins or directions that only make sense as “out the door of [crew hotel]”
- Encouraging users to post room blocks, crew bus schedules, or hotel confirmations
- “Ask the concierge at [Hotel X]” as the **only** way to describe a location when X is a known crew hotel

### Allowed (public content)

- **Layover zones:** airport strip, downtown, station, waterfront, etc.
- Landmarks, transit hubs, street names not tied to crew housing
- “Grocery for **airport hotel cluster** — ~5 min walk for most airport-area hotels”
- Playbooks starting from **airport / station / downtown**, not from a named crew property
- Activity and restaurant content with no lodging context

## Zones model

Each city has zones. Content that needs “near me” semantics uses zone tags.

| Zone type | Intent |
|-----------|--------|
| `airport_strip` | Airport hotels + terminal area logistics |
| `downtown` | City center / old town |
| `station` | Main rail / bus station cluster |
| `other` | Named clusters (e.g. waterfront) without hotel lists |

**Grocery / pharmacy / ATM** tips: attach to zone + public landmark, never to “the crew hotel.”

## Crew-only layer (Phase 7 — not Phase 0)

Optional later precision for verified crew only:

- Still prefer zones over hotel names
- If a user pastes a hotel name, moderation or filters should strip/redact for public; crew-only storage is a separate, deliberate design
- Verification ladder (pick when building Phase 7):

  1. Self-attest + reputation (weak; early experiments only)
  2. Invite codes from known bases
  3. Work email where viable
  4. Partner verification (long term)

**Not planned:** biometric / government ID collection for MVP (nightmare cost and liability).

## Contribution UX

- Forms and AI extract should **not** have a “hotel name” field for public playbooks
- AI system prompt / schema: extract zones and public landmarks; **do not** output crew hotel names into public fields
- If story mentions a hotel, draft UI should rewrite toward zone (“airport area”) and warn the user

## Moderation

- Admin can hide/delete content that leaks lodging
- Reports: “exposes crew hotel / sensitive logistics”
- Repeat offenders: ban

## Sponsor content

- Sponsors advertise venues and activities, not “we’re next to your crew hotel” as targeting copy on the public site
- No sponsor product that sells “target by airline crew hotel”

## Data handling (intent)

- Minimize PII
- Sponsor metrics: aggregate impressions/clicks/saves — not “which crew member”
- Auth secrets and `XAI_API_KEY` server-only
- Stripe handles card data; we do not store raw cards

## Liability / safety tone

- Risky activities (rivers, climbing, etc.): short disclaimer; not legal theater, not encouragement of illegal acts
- Events: dates matter; stale events should not present as live

## Decision log

| Date | Decision |
|------|----------|
| 2026-08-03 | Public product uses zones, not crew hotels. Hotel-level public tips are out of scope. |
| 2026-08-03 | Crew-only higher precision deferred to Phase 7 with light verification, not biometrics. |
