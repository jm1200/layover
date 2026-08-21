# Shareholder brief

*Updated by CEO / engineer. Target reading time: under 90 seconds.*

**Last updated:** 2026-08-21  
**Company:** Layover (working name)  
**Stage:** Phase 2.1 code shipped · smoke in progress · **city browse copy/IA pending your yes**

**Not this cut:** Phase 3 social, photos, events, Stripe. Webpack/admin flake is engineering, not strategy.

**Vision parked:** shopping as a rich product + multi-photo + creator rewards. Eat/Do/Shop *labels* are cheap now; Instagram grids are not.

## What we are

High-trust layover **plans** for flight crew, plus clearly labeled paid “new ideas” later. Zones only — never crew hotels.

## Where we are

| Item | Status |
|------|--------|
| Phase 1 auth | **Complete** |
| Phase 2 content code | **Shipped** |
| Important fixes (2.1) | **Shipped** — smoke still yours if not done |
| City page today | Two lists: “Crew playbooks” then “Places” — the confusion you flagged |
| Add flow today | “Add place” (free-text category) + “New playbook” |
| City create | Users **blocked on purpose**. Admin has **no city form** — SQL only |
| Phase 3 Social | After you confirm cities work + this IA yes/no |

## Recommendation (needs yes)

**Hybrid on the same city page — not 4 separate sites, not 2 jargon lists.**

- City stays the hero.
- Four jump chips with counts: **Full layover · Eat · Do · Shop**, then the lists grouped that way.
- **Playbook** → **layover plan** in the UI (database can stay `playbooks`).
- Stop saying **place**. Add flow is four choices: food / activity / shop / full layover plan.
- Users still cannot add cities. No admin city form until we actually need a third city.

That’s it. No new tables.

## Why

Trust and density beat a pretty empty directory. Two seed cities don’t support four category landing pages (Shop would look dead). Two lists named playbook vs place hide the real jobs: *full plan vs one rec*, and recs are eat / do / shop. User-created cities would be spam and hotel-leak risk; two cities is not enough pain to build an admin form.

## What I need from you

**Yes / no** on this city IA cut (hybrid + rename + add chooser; no admin city form).

If no: say whether you want **two** chips only (plan vs one rec) or **four separate pages**.
