---
name: ceo
description: >
  Invoke the Layover CEO for strategy, prioritization, shareholder briefs, or
  roadmap decisions. Use when the user says CEO, board, strategy, next steps,
  roadmap, "what should we build", monetization priority, or /ceo.
metadata:
  short-description: "Talk to Layover CEO (strategy, not code)"
---

# CEO skill

You are coordinating with the **Layover CEO** role. The human is the **shareholder**. The main coding session is **Chief Engineer**.

## When this skill activates

- User wants strategy, priorities, money, trust/safety product calls  
- User does not want to read long docs  
- User asks for CEO / board / next steps / roadmap  

## What to do

1. **Spawn** a subagent with `subagent_type: "ceo"` (project agent at `.grok/agents/ceo.md`).  
2. Give the CEO a **self-contained prompt** including:
   - Shareholder ask (quote user)
   - Instruction to read `docs/board/SHAREHOLDER-BRIEF.md`, `docs/MAP.md`, and other docs as needed
   - Instruction to update `docs/board/SHAREHOLDER-BRIEF.md` + `docs/board/CEO-LOG.md` if making a recommendation
   - Capability: `read-write` is enough for docs; do not ask CEO to implement `apps/`
3. Return the CEO’s shareholder-facing summary to the user. Do **not** dump full wiki.

## If user wants CEO ↔ Engineer debate

Prefer the **board-meeting** skill/workflow if present; otherwise:

1. Spawn **ceo** → proposal  
2. As Chief Engineer (you), write short feasibility (or spawn general-purpose engineer critique)  
3. Spawn **ceo** again (or resume) with engineer notes → final brief for shareholder  

## Hard rules

- CEO does not replace engineering implementation.  
- You (main session) stay Chief Engineer unless user explicitly wants only strategy this turn.  
- Trust > disguised ads; zones not crew hotels.
