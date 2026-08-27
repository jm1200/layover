# Feature: Admin & metrics

**Phase:** 6 for queue/metrics. **Phase 4 slice lives on `/admin` now.**  
**Status:** Kill switch + Lumen log (last 50 + month $). Not a full dashboard. **Copy locked 2026-08-27** in `agents/lumen.md` → Admin. Pixels still show verbs with no place names — that is the miss.

**`/dashboard` is not the admin queue** (locked 2026-08-26): it lists this user’s published recs/days only. Admin still edits from the public rec. Reports / hide / ban / Stripe stay Phase 6. **This cut is not that queue.** No likes. No Stripe.

## Goal

Owner sees: is she on, what she spent, **what she put on the map** (named recs and days, tappable). Moderate abuse later. Minimal daily work.

## `/admin` copy (locked — paste from `agents/lumen.md`)

| Slot | String |
|------|--------|
| Title | Admin |
| Spend | This month ${spent} of ${cap}. |
| Key (quiet) | Key is set. **or** Key is missing — she can’t file. |
| Kill title | Lumen |
| Kill on | On. She’ll file dumps. |
| Kill off | Off. Dumps get a nap. |
| Kill button on | Turn her off |
| Kill button off | Turn her on |
| Kill after | Lumen is on. **/** Lumen is off. |
| Log heading | What she’s been doing |
| Log empty | Nothing yet. |
| Log unreadable | Can’t read her log. |

**Never on the page:** *Kill switch and her log. Full moderation queue lands in Phase 6.* SQL / HUMAN-SETUP footer. *Kill Lumen.* *extract is live.* *Last 50 actions. No dump text here.* User dashboard · Sponsor dashboard.

## Log row (must)

Join `created_place_ids` / `created_playbook_id` / `city_id` to **names**. The name is the link (`/places/[id]`, `/playbooks/[id]`; city only on hero / just-opened). One dump = one sentence listing **every** named rec + the day if she filed one. Exact strings: `agents/lumen.md` → Admin → Row.

**Shape:** `Filed **Jamon Jamon** in Barcelona · Posted Aug 27 · $0.02`

Money only if > 0. `Posted {Mon D}` — not ISO, not a time. Rec gone → **Taken off the city.** Twin day → **Same day — {Day}.** Hotel/PG-13 → **Wouldn't file that** (no hotel name). Nap → **Lumen's taking a nap.**

**Never in a row:** dump text, payload, email, user id, hotel names, airline lodging, model, tokens, search counts, follow-up, error_code, `$0.00`, *Filed Eat, Do, or Buy*, *Dump ok*, untitled *Filed a layover*.

## Acceptance criteria

- [x] Admin-only `/admin` (Phase 1 shell + Phase 4 kill switch)
- [x] Lumen activity log on `/admin` (last 50 + month $). No dump text.
- [ ] Log rows show **place/day name + link**, city, when, $ (copy lock 2026-08-27)
- [ ] Kill switch + page strings match `agents/lumen.md` Admin
- [ ] No Phase 6 / SQL / dump-text copy on the page
- [ ] Moderation queue: reports, hide/delete, ban
- [ ] Metrics overview per `docs/OPS.md` (growth, trust, engagement, revenue, AI cost)
- [ ] JSON export or simple API for agent-friendly snapshots
- [ ] Kill switches: AI import **done**; new campaigns later (optional global read-only)
- [ ] Security report reason: crew hotel / sensitive logistics

## Agent use

Metrics exist so optimization suggestions are grounded. No autonomous deploys from metrics alone.
