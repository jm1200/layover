# ROLES.md — Admin, user, sponsor

One authentication system. Three roles. Same login entry. Everyone lands on `/dashboard` (**Your recommendations**). Admin and Sponsor stay behind the profile menu — they are not post-login homes.

## Roles

### `user` (default)

Flight crew and other explorers.

**Can:**

- Browse public cities, places, playbooks, events
- Create/edit own playbooks, places, dishes, activities (subject to moderation)
- Use AI story → draft import within quota
- Like, comment, follow other users
- Report content

**Cannot:**

- Access sponsor billing or campaign tools (unless also sponsor)
- Access admin tools
- Publish without going through normal content rules (including security)

### `sponsor`

Venues, activities, events, destinations paying for labeled placement.

**Can:**

- Everything a user can (optional; may use same account)
- Open **Sponsor dashboard**
- Create/edit sponsor profile and venue claims
- Create campaigns: budget, city, placement type, creative, schedule
- Pay via Stripe; pause/cancel campaigns per product rules
- View **aggregate** campaign metrics (impressions, clicks, saves)
- Message/support path for billing issues (later)

**Cannot:**

- Mark their placement as organic “crew staple”
- Buy fake reviews or ratings
- See individual crew identities tied to impressions
- Access admin moderation of other users’ organic content (except reporting)

**Onboarding intent (hands-off):**

1. Sign up / upgrade to sponsor  
2. Create venue + creative  
3. Choose city + placement + dates  
4. Pay  
5. System shows **Sponsored** placement automatically (subject to policy; optional first-campaign light review)

### `admin`

Owner / operators. Small set of accounts.

**Can:**

- All moderation: hide/delete content, ban users, handle reports
- View full metrics (growth, trust, revenue, AI cost)
- Kill switches: disable AI import, disable new campaigns, force-hide a campaign
- Refunds / Stripe edge cases (as implemented)
- Promote/demote roles

**Should not need to (product goal):**

- Manually place every ad
- Manually enter every staple
- Re-run AI for users day to day

## Permission matrix (summary)

| Action | Public | user | sponsor | admin |
|--------|--------|------|---------|-------|
| Read public content | ✓ | ✓ | ✓ | ✓ |
| Write organic content | | ✓ | ✓ | ✓ |
| AI import | | ✓ | ✓ | ✓ |
| Social | | ✓ | ✓ | ✓ |
| Create paid campaign | | | ✓ | ✓ |
| View own campaign metrics | | | ✓ | ✓ |
| Moderate any content | | | | ✓ |
| Full site metrics | | | | ✓ |
| Kill switches | | | | ✓ |

## Auth implementation intent (Phase 1)

- **Provider locked:** Supabase Auth + Supabase Postgres — see `docs/STACK.md` and `features/auth.md`
- Email + password stays. **Google OAuth this cut** (2026-08-26) when shareholder creates the OAuth client. Apple / others parked.
- Role stored on profile/user record (`user` \| `sponsor` \| `admin`); enforce server-side on every mutation
- Prefer single `role` plus optional `SponsorProfile` row (profile can be empty in Phase 1)

## Account states

- `active` — normal
- `suspended` — login blocked or read-only (admin)
- `deleted` — soft-delete preferred for audit

## Decision log

| Date | Decision |
|------|----------|
| 2026-08-03 | Three roles: user, sponsor, admin. Self-serve sponsor path is the hands-off money path. |
