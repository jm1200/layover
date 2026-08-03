---
name: board-meeting
description: >
  Run a short CEO ↔ Chief Engineer board meeting: CEO proposes, engineer
  feasibility, CEO revises, shareholder brief updated. Use for /board-meeting,
  "board meeting", "CEO and engineer", next steps debate, or quarterly-style planning.
metadata:
  short-description: "CEO ↔ engineer board meeting → brief"
---

# Board meeting

Run a **bounded** strategy loop. Shareholder gets a short brief; they do not need to read Phase 0 docs.

## Procedure

### 1. CEO proposal

Spawn `subagent_type: "ceo"` with `capability_mode: "read-write"` and a prompt like:

- Read `docs/board/SHAREHOLDER-BRIEF.md`, `docs/MAP.md`, `docs/PRODUCT.md`, `docs/SECURITY.md`, `docs/OPS.md`
- Current shareholder context: (paste user message)
- Produce a **Next milestone proposal** (one primary recommendation)
- Do not implement code
- Write proposal draft into the reply (CEO may also touch board files)

### 2. Chief Engineer feasibility

In the **main session** (you are Chief Engineer), or via a short `general-purpose` child:

- React only to the CEO proposal  
- Feasibility, sequencing risks, missing deps, estimate (S/M/L)  
- Counter-proposal only if CEO’s plan is unsafe or blocked  
- No long essays  

### 3. CEO close

Spawn CEO again (or `resume_from` prior CEO id if same type completed) with engineer feedback:

- Accept, amend, or reject engineer points  
- Update `docs/board/SHAREHOLDER-BRIEF.md` to the latest one-pager  
- Append `docs/board/CEO-LOG.md` with date + decision  
- Output **shareholder format** only in the final user-visible summary  

### 4. Present to shareholder

Show only:

- Status  
- Recommendation  
- Why  
- Yes/no ask  
- What ships if approved  

Offer to execute as Chief Engineer if they approve.

## Limits

- One primary milestone per meeting  
- No coding during the meeting unless shareholder already approved implementation in the same message  
- Security/trust conflicts: CEO must not override `docs/SECURITY.md` without an explicit shareholder risk acceptance noted in the log  
