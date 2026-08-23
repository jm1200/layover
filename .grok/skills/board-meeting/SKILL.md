---
name: board-meeting
description: >
  Run a short Layover team-room: Maya frames, relevant employees speak,
  John gets a decision. Use for /board-meeting, "board meeting", next-steps
  debate, homepage fights, or quarterly-style planning.
metadata:
  short-description: "Team room → founder brief"
---

# Board meeting

Bounded loop. John gets a short room, not Phase 0 docs.

## Procedure

1. **Maya** (`ceo`, read-write docs): proposal, one primary bet.
2. **Only relevant others:**
   - Sofia (`marketing-director`) if attention / homepage / voice
   - Theo (`senior-engineer`) if cost / architecture / risk
   - Milo (`product-engineer`) if implementation options / review
3. **Maya close:** recommend; update SHAREHOLDER-BRIEF, CEO-LOG, COMPANY_LOG (durable).
4. Present to John in team-room format. He decides.

## Limits

- One primary milestone
- No coding unless John already authorized implementation in the same message
- Do not force every employee to speak
- Security/trust: cannot override `docs/SECURITY.md` without John’s explicit risk acceptance in the log
