# OPS.md — Money, AI cost, metrics, agent ops

## Operator philosophy

Hands-off for the owner:

- Sponsors self-serve pay → labeled ads
- Users self-serve content (manual + AI draft)
- Admin intervenes for abuse, refunds, kill switches, policy

Grok (or another agent) helps in **sessions** using metrics and docs — not unsupervised production rewrites.

## Primary optimization goals

1. Do not destroy trust  
2. Increase sponsor revenue (paying campaigns, CTR that justifies renewal)  
3. Grow useful organic content per city  
4. Keep AI token spend under a set budget  

## AI usage policy

### Allowed

- **Story → structured draft** for playbooks/places (server-side)
- Optional later: moderation assist (flag likely hotel leaks) — human confirms

### Not allowed (v1)

- Unbounded multi-turn “travel agent chat” billed to the owner without strict caps
- Client-side API keys
- Auto-publish without user review
- Auto-mutate live site layout/pricing without owner session

### Provider

- **xAI / SpaceXAI** via `XAI_API_KEY`, base URL `https://api.x.ai/v1`
- Default model intent: `grok-4.5` (confirm live docs at implement time)
- Structured JSON output for extraction

### Cost controls (must ship with AI feature — Phase 4)

| Control | Intent |
|---------|--------|
| Auth required | No anonymous extract |
| Daily quota per user | e.g. N imports/day (tune later) |
| Max input length | Cap characters / tokens |
| One-shot extract | Prefer single request per import, not long chat |
| `AiImportLog` | tokens, user, timestamp, success/fail |
| Admin kill switch | Disable AI globally |
| Monthly budget alert | Metric + optional hard stop |

## Metrics the site must expose (Phase 6)

Build these so a human or agent session can answer “what should we change?”

### Growth

- Signups (by role)
- DAU/WAU (simple is fine)
- Cities with ≥1 playbook
- New playbooks / places per week

### Trust

- Reports open/closed
- Admin deletes
- AI drafts abandoned vs published
- Content flagged for security (hotel leak)

### Engagement

- City page views
- Playbook opens
- Likes, comments, follows
- Saves (if implemented)

### Revenue

- Active campaigns
- Sponsor revenue (period)
- Impressions / clicks / CTR by city and campaign
- Saves on sponsored cards (if tracked)
- Top cities by sponsor demand

### AI cost

- Imports count
- Estimated token cost
- Cost per published playbook
- Quota hits / blocked requests

### Admin UI

- `/admin` metrics overview + export JSON for agent sessions
- No need for a fancy BI tool in MVP

## Stripe (Phase 5)

- Sponsors pay for campaigns
- Webhooks update campaign status (`active`, `past_due`, `canceled`)
- Failed payment → stop serving placement
- Owner does not manually flip ads on for each restaurant

## Agent session playbook (for Grok)

When owner asks to “optimize” or “make money”:

1. Read `AGENTS.md`, `MAP.md`, this file  
2. Pull latest metrics (admin export or DB once built)  
3. Propose **small** experiments (copy, placement caps, quota, onboarding)  
4. Implement only after agreement; one change set at a time  
5. Update docs if product rules change  

**Forbidden:** silent production gambling, scraping crew hotels, removing Sponsored labels to “convert better.”

## Environments (intent)

| Env | Use |
|-----|-----|
| local | Dev (`apps/web` + Supabase project) |
| staging (optional) | Sponsor/payment dry run |
| production | Live on **Vercel** + Supabase (Pro when free limits hurt) |

Secrets in env / Vercel env / never commit `.env` with real keys. Full stack + cost: `docs/STACK.md`.

## Shareholder cloud accounts (human)

| Account | When |
|---------|------|
| Supabase | Phase 1 |
| Vercel | When public URL needed |
| Stripe | Phase 5 |
| xAI | Phase 4 |

CEO/engineer do not own these accounts; document required steps in STACK.

## Decision log

| Date | Decision |
|------|----------|
| 2026-08-03 | Metrics-first ops; agent optimizes in sessions, not fully autonomous. |
| 2026-08-03 | AI = gated extraction; xAI server-side. |
| 2026-08-04 | Host Vercel + Supabase free→Pro path; see STACK.md. |
