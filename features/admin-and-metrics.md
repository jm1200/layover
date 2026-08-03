# Feature: Admin & metrics

**Phase:** 6  
**Status:** Spec only — not implemented  
**Code (planned):** `apps/web/src/features/admin/`, `.../metrics/`

## Goal

Owner (and agent sessions) see health + money; moderate abuse; kill switches. Minimal daily work.

## Acceptance criteria

- [ ] Admin-only `/admin`
- [ ] Moderation queue: reports, hide/delete, ban
- [ ] Metrics overview per `docs/OPS.md` (growth, trust, engagement, revenue, AI cost)
- [ ] JSON export or simple API for agent-friendly snapshots
- [ ] Kill switches: AI import, new campaigns (optional global read-only)
- [ ] Security report reason: crew hotel / sensitive logistics

## Agent use

Metrics exist so optimization suggestions are grounded. No autonomous deploys from metrics alone.
