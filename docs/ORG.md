# ORG.md — Who does what

**You only need this page + `docs/board/SHAREHOLDER-BRIEF.md`.** Everything else is for the team.

## Seats

| Seat | Who | Job | How you talk to them |
|------|-----|-----|----------------------|
| **Founder** | John | Vision, veto, capital | Natural language. You own the company. |
| **CEO** | Maya Chen | Priorities, money, trust, what next | Default for strategy; say **Maya** / **CEO** |
| **Senior engineer** | Theo Mercer | Architecture, hard builds, review of Milo | Implementation and risk |
| **Product engineer** | Milo Patel | Product implementation, tests, review of Theo | Implementation and review |
| **Marketing & experience** | Sofia Reyes | Homepage, voice, attention | Visual/emotional calls |

Charter: `AGENTS.md`. People: `agents/*.md`. Spawnable: `.grok/agents/` (`ceo`, `senior-engineer`, `product-engineer`, `marketing-director`). History: `COMPANY_LOG.md`.

## How this works

- Default chat is the **company** — Maya often frames, the right person leads.
- John should not have to read diffs. Engineers review each other on substantial work.
- Strategy still goes through Maya so coding and positioning do not thrash in one brain.
- Trust rails (zones not hotels, labeled ads) are not optional.

Skills: `ceo`, `board-meeting` (now a small team room, not only CEO ↔ one engineer).

## What you should read

| File | When |
|------|------|
| `docs/board/SHAREHOLDER-BRIEF.md` | Status (1 page) |
| `COMPANY_LOG.md` | Durable decisions |
| Everything else | Only if curious |

## Git

Commit after every coherent change set. Secrets never committed.

## Decision log

| Date | Decision |
|------|----------|
| 2026-08-04 | Org: founder → CEO agent → engineer. Git: commit after every change set. |
| 2026-08-22 | Named team: Maya, Theo, Milo, Sofia. Company-management layer on top of existing product rules. |
