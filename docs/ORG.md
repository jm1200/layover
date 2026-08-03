# ORG.md — Who does what

**You only need this page + `docs/board/SHAREHOLDER-BRIEF.md`.** Everything else is for agents.

## Seats

| Seat | Who | Job | You talk to them how |
|------|-----|-----|----------------------|
| **Shareholder / angel** | You | Vision, veto, capital | Natural language in this chat |
| **CEO** | Agent `ceo` | Priorities, money, trust policy, short briefs | Say **CEO** or **board meeting** / skill `/ceo` |
| **Chief Engineer** | This Grok Build session | Design, code, feasibility, shipping | Default chat; implements after you approve |

## Recommendation (locked for Phase 0.1)

- **Do not** make the coding session the CEO. Same brain tries to optimize code *and* strategy and you get thrash.  
- **Do** keep Grok Build as **Chief Engineer**.  
- **Do** use a dedicated **CEO agent** for docs, roadmap, and shareholder briefs.  
- **You** stay above both: approve or redirect in one sentence when possible.

## Multi-agent reality

Yes — Grok Build can spawn multiple agents. Project agent definition:

- `.grok/agents/ceo.md` → `subagent_type: "ceo"`

Skills:

- `.grok/skills/ceo/` — strategy ask  
- `.grok/skills/board-meeting/` — CEO propose → engineer pushback → CEO brief  

## What you should read

| File | When |
|------|------|
| `docs/board/SHAREHOLDER-BRIEF.md` | Anytime you want status (1 page) |
| `docs/board/CEO-LOG.md` | Decision history |
| Everything else | Only if curious; CEO owns it |

## Decision log

| Date | Decision |
|------|----------|
| 2026-08-04 | Org: Shareholder (human) → CEO agent → Chief Engineer (Grok Build). |
