# Feature: Admin & metrics

**Phase:** 6  
**Status:** Spec only for Phase 6 queue/metrics. **Lumen’s log is on `/admin` now** (Phase 4): last 50 actions + month spend. Not a full dashboard. **`/dashboard` is not the admin queue** (locked 2026-08-26): it lists this user’s published recs/days only. Admin still edits from the public rec. Queue stays this phase.

## Goal

Owner (and agent sessions) see health + money; moderate abuse; kill switches. Minimal daily work.

## Acceptance criteria

- [x] Admin-only `/admin` (Phase 1 shell + Phase 4 kill switch)
- [x] Lumen activity log on `/admin` (last 50 + month $). No dump text.
- [ ] Moderation queue: reports, hide/delete, ban
- [ ] Metrics overview per `docs/OPS.md` (growth, trust, engagement, revenue, AI cost)
- [ ] JSON export or simple API for agent-friendly snapshots
- [ ] Kill switches: AI import **done**; new campaigns later (optional global read-only)
- [ ] Security report reason: crew hotel / sensitive logistics

## Agent use

Metrics exist so optimization suggestions are grounded. No autonomous deploys from metrics alone.
