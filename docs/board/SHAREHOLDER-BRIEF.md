# Shareholder brief

*Updated by CEO / engineer. Target reading time: under 90 seconds.*

**Last updated:** 2026-08-24 (Phase 4 started — you said yes)  
**Company:** Layover (working name)  
**Stage:** **Phase 4 in progress.** Share your intel → dump box. Needs your xAI key + SQL 008. Phase 3 still waits.

**Not this cut:** Auto-post chatbot, unbounded chat, Stripe, likes, follow-notifications, completion scores, QR kickbacks.

## Money (do not forget)

**No production AI spend without your explicit yes** — that’s the key in env **plus** the monthly $ cap. Nobody on this team raises quotas, turns on Imagine quality, adds stills, turns on web search, refreshes a city hero, or lifts the **$20/mo** default. Kill switch ships with Phase 4; AI stays off until you say go.

Until we have real invoices, user rails stay tight: **3 drafts/person/day**, **one extract**, **~4k chars**. They dictate on the **phone keyboard mic** (free). Lumen fills the form; missing bits are **holes they tap** — not a chat. **One** question only if a **required** field is missing (city, place name; layover also needs a title + one stop). Paid speech-to-text is off unless you say so.

## Status

**Phase 2 + 2.1 are finished** (content + the look). Parked on purpose: admin city form, public Vercel, photo upload (comes with Lumen).

**Board lock (CEO rec — you have not said go yet):** supply before social. Likes on four thin cities is a deserted Instagram. **Phase 4 Lumen first.** Thin Phase 3 (like + comment + byline profile) **after** Lumen has produced real posts. Follow is a content filter later, not a people-feed. **Parked:** follow-notifications, completion scores, QR-for-ad-cut (coupon/kickback — revisit only as a *labeled* offer after Stripe, never “this rec paid me”). Ban queue stays Phase 6; hide already exists.

Lumen **required to even draft:** city + place name (and type, which she guesses). Full layover: city + title + one named stop. If the city isn’t on the site yet, she **opens it** from a real name/IATA (BCN → Barcelona). Thin posts may publish.

Stay on Grok. Cheap SKUs: `grok-4.3`, $0.02 stills. **1 still per place**. Target **~2–5¢/post**.

## What I need from you

1. [console.x.ai](https://console.x.ai) → add **$20** credits → create an API key.
2. Put `XAI_API_KEY=...` in `apps/web/.env.local` (never commit it). Cap is **$20/mo** unless you name another number.
3. Paste `apps/web/supabase/migrations/008_ai_import.sql` in the Supabase SQL Editor.
4. Restart `cd apps/web && npm run dev`. Then **Share your intel**.

## Still true

Crew-layover wedge. Zones, not hotels. Trust > revenue. Draft-then-confirm. Destination-first, not a person network. Your wallet stays closed until you open it.
