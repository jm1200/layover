# Feature: Sponsorship (self-serve)

**Phase:** 5  
**Status:** Spec only — not implemented  
**Code (planned):** `apps/web/src/features/sponsorship/`

## Goal

Hands-off money: sponsor signs up, pays, labeled placement appears. Trust preserved via clear **Sponsored** treatment and separation from organic staples.

## Acceptance criteria

- [ ] Sponsor dashboard
- [ ] Create venue + creative (title, body, image optional, link, city)
- [ ] Choose placement (city page new-ideas rail; optional others)
- [ ] Stripe checkout + webhooks → campaign `active`
- [ ] Active campaigns render with unmistakable Sponsored label
- [ ] Placement caps so organic content remains primary
- [ ] Failed payment stops serving ad
- [ ] Sponsor metrics: impressions, clicks (aggregate only)
- [ ] Admin can force-hide a campaign

## Creative tone

Friendly “New idea for a layover activity” is OK. Must not impersonate crew review. **Never** use **The perfect layover** (homepage organic series) as a campaign name or ad label.

## Out of scope (v1)

- Auction bidding wars
- Targeting by airline or hotel
- Buying placement inside organic staple ranking
