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
4. **Contain cost.** No production spend without John’s authorization. Tight caps until we have real invoices.

## Shareholder spend lock (do not forget)

**John’s money. John’s yes.** Agents and engineers do not turn on, raise, or “just try” paid usage.

| Locked | Meaning |
|--------|---------|
| Production AI | **Off** until John puts `XAI_API_KEY` in env **and** names the monthly $ cap. That is the authorization. |
| Monthly $ cap | Default **$20**. Raising it = John. Hard stop. |
| User interaction caps | Stay **tight** until measured: **3 drafts / user / day**, **~4k chars**, **one extract** per story. Raising quotas = John. |
| Dictate | Phone **keyboard / OS mic** (text in the box). Token cost = the text, same as typing. Paid STT / in-app waveform = **John**. |
| Follow-up | **Holes on the draft form** (Sofia lock). No second model call for dish/zone/hours. **One** spoken/typed Q only if she cannot draft (no city / no place). Not a chat. |
| SKU / quality upgrades | Imagine quality, extra stills, regen, web search, grok-4.6 on the hot path = **John**. |
| City hero refresh | Lumen asks John **before** spending. |
| Kill switch | Ships with Phase 4. Admin (John) can kill AI globally. Default: stay off until the yes above. |
| Other paid cloud | Supabase Pro, Vercel Pro, new vendors, paid SKUs = John. Do not upgrade “to be safe.” |

Until invoices exist, assume we do not know the real cost. Do not loosen caps from a session vibe.

## AI usage policy

### Allowed

- **Story → structured draft** for playbooks/places (server-side)
- Optional later: moderation assist (flag likely hotel leaks) — human confirms

### Not allowed (v1)

- Any production AI call before John’s key + cap
- Unbounded multi-turn “travel agent chat” billed to the owner
- Raising quotas / SKUs / stills / paid STT / search / monthly $ without John
- Client-side API keys
- Auto-publish without user review
- Auto-mutate live site layout/pricing without owner session

### Provider

- **xAI / SpaceXAI** via `XAI_API_KEY`, base URL `https://api.x.ai/v1`
- Product extract: **`grok-4.3`** (JSON form fill). Do not use grok-4.6 / grok-4.5 on every crew post.
- Stills: **`grok-imagine-image`** (~$0.02). Not Imagine 2.0 / quality on the hot path.
- Stay on xAI. Cheaper text vendors save pennies; pictures were the dollar.
- Structured JSON output for extraction

### Cheap v1 (locked 2026-08-24)

Target **~2–5¢ per published post**. Worst we allow **~5¢** (one-shot + one cheap still).

| Rule | Intent |
|------|--------|
| One-shot extract | Dictate once (OS mic or type). No 3-turn chat. Missing bits = **empty fields**. One Q only if undraftable (no city / no place). |
| No reasoning / no web search on the hot path | Extra tokens for no gain. Web search = John. |
| Photo-first | User upload = $0 image |
| **1 still per new place** | Not per stop, not a gallery |
| Layover = combo of places | Plan has **no** extra still; reuse place stills |
| Generate still **on publish** | Abandoned drafts cost text only |
| No regen in v1 | Hate it → upload |
| City hero: one per city | Refresh rarely. Lumen **asks John before spending** |
| Input cap | ~4k characters |
| Daily quota | **3 drafts / user / day** until John raises it after we see invoices |
| Monthly $ hard stop | Default **$20**. Raising it = John. |

A full layover that unpacks into 4 **new** places with no user photos is 4 × $0.02 stills + a few cents of text ≈ **~10¢** — the only time we blow 5¢, and only if nobody uploaded. Prefer their pictures.

### User photos / storage (not the expensive part)

Upload is **not hard** and **not expensive to store**. Use **Supabase Storage** (already on the stack). No new vendor.

| Meter | Reality |
|-------|---------|
| File storage | ~$0.021 / GB / month. Free includes **1 GB**; Pro **100 GB**. A compressed rec JPEG (~0.3–0.8 MB) → thousands of photos in 1 GB. |
| Bandwidth | The real meter if we serve fat originals. Free ~5+5 GB; Pro 250+250 GB. Cached CDN egress is cheaper ($0.03/GB overage vs $0.09 uncached). |
| Transform API | Skip in v1 (Pro: 100 included, then ~$5 / 1k). Compress on upload instead. |

v1 upload (when Phase 4 is authorized, same slice as Lumen — not a separate product): JPEG/WebP, shrink on the phone, max ~2 MB, no video, bucket RLS. That is **engineer calendar time** (photo picker + store in the Supabase we already have). It is **not** a new vendor bill and **not** extra AI spend. Do not call it “a few days of wiring” in shareholder notes — it is a small feature, built only after John’s yes.

### Cost controls (must ship with AI feature — Phase 4)

| Control | Intent |
|---------|--------|
| Auth required | No anonymous extract |
| Daily quota per user | **3 drafts/day.** Engineers do not “tune later.” John raises after invoices. |
| Max input length | ~4k characters |
| One-shot extract | One request per story. Holes on the form. One Q only if undraftable. |
| `AiImportLog` | tokens, images, user, timestamp, success/fail, estimated $ |
| Admin kill switch | Disable AI globally. Must ship. Default off until John’s yes. |
| Monthly budget hard stop | Default $20. Raising $, Imagine quality, extra stills, paid STT, web search, city-hero refresh = John. |

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
| 2026-08-24 | Lumen v1 = Grok one-shot extract into existing forms; no auto-publish; no unbounded chat. Phase 4 waits on shareholder yes + `XAI_API_KEY`. |
| 2026-08-24 | Cheap rails: `grok-4.3` + $0.02 Imagine; 1 still per place; photo-first; generate on publish; layover unpacks to places (no plan still); city hero refresh needs John’s yes; $20/mo default cap. |
| 2026-08-24 | **Spend lock:** no production AI/cloud spend without John’s yes (key + cap). Tight user caps until measured (3 drafts/day, one extract). Raising quotas / SKUs / stills / STT / search / monthly $ / city-hero = John. Kill switch. |
| 2026-08-24 | **Share UX (Sofia):** dump once (OS dictate or type) → one extract → holes on the form. One Q only if no city/place. Paid STT not v1. |
