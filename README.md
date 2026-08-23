# Layover

High-trust layover playbooks for flight crew — places, activities, events, restaurants, specific dishes — plus self-serve **Sponsored** ideas for venues that want crew traffic.

> Working name. Product rules live in `docs/`. Agents must read `AGENTS.md` and `docs/MAP.md`.

## Current status

**Phase 1 complete + hardened** (auth + roles on Supabase + local Next.js).  
**Phase 2** (cities / zones / places / playbooks) needs shareholder yes — see [docs/board/SHAREHOLDER-BRIEF.md](./docs/board/SHAREHOLDER-BRIEF.md).  
Agents: read [docs/MAP.md](./docs/MAP.md) and, before Phase 2 code, [docs/board/PRE-PHASE-2-GATE.md](./docs/board/PRE-PHASE-2-GATE.md).  
Stack: [docs/STACK.md](./docs/STACK.md).

## If you are the shareholder (human)

Read **only**:

1. [docs/board/SHAREHOLDER-BRIEF.md](./docs/board/SHAREHOLDER-BRIEF.md) — status in ~90 seconds  
2. Optionally [docs/ORG.md](./docs/ORG.md) — who is CEO vs engineer  

Talk to the **company**: Maya (CEO), Theo / Milo (engineering), Sofia (experience). Strategy via Maya (`ceo` skill / board meeting). John does not need to review diffs.

## Agent / engineer reading order

| Doc | What it is |
|-----|------------|
| [AGENTS.md](./AGENTS.md) | Company charter (auto-loaded) |
| [agents/](./agents/) | Maya, Theo, Milo, Sofia |
| [COMPANY_LOG.md](./COMPANY_LOG.md) | Durable company decisions |
| [docs/PRODUCT.md](./docs/PRODUCT.md) | What we build and why |
| [docs/MAP.md](./docs/MAP.md) | Phases, folders, feature index |
| [docs/SECURITY.md](./docs/SECURITY.md) | Zones not hotels; crew privacy |
| [docs/ROLES.md](./docs/ROLES.md) | user / sponsor / admin |
| [docs/OPS.md](./docs/OPS.md) | Money, AI cost, metrics, hands-off ops |
| [docs/STACK.md](./docs/STACK.md) | Next.js + Supabase + Vercel + Stripe + xAI |
| [features/](./features/) | One short spec per feature |
| [.grok/agents/](./.grok/agents/) | Spawnable employees (`ceo`, `senior-engineer`, `product-engineer`, `marketing-director`) |

## Phases (summary)

0. Docs + org + stack — **done**  
1. Auth + roles — **done**  
2. Cities, zones, places, playbooks — **next (pending yes)**  
3. Social (like, comment, follow)  
4. AI story → draft import  
5. Sponsor self-serve + Stripe  
6. Admin metrics + moderation  
7. Optional crew-only precision  

## For humans (non-code)

You should not need to read application source to know what the product is. If a decision matters, it belongs in `docs/` or `features/`. When something ships, `docs/MAP.md` should say it exists.

## For agents

Do not invent a different architecture. Follow `AGENTS.md`. One feature at a time. Update the map when reality changes.
