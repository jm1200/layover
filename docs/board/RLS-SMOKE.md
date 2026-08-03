# RLS smoke checklist (Phase 2)

Run after migrations **002**, **003**, and **004** on Supabase.  
Mark pass/fail. Do not invent results.

Use three sessions if possible: **incognito (anon)**, **your admin account**, **second user (plain user)**.

## Setup

- [ ] 002_content.sql applied  
- [ ] 003_seed_zurich_delhi.sql applied  
- [ ] 004_phase2_harden.sql applied  
- [ ] Second account signed up as role `user`  

## Matrix

| # | Check | Anon | Author (user) | Other user | Admin |
|---|--------|------|---------------|------------|-------|
| 1 | See Zurich/Delhi published playbooks on `/cities/...` | | | | |
| 2 | Open published place/playbook detail | | | | |
| 3 | Cannot open another user’s **draft** by URL | | | | |
| 4 | Author sees own draft on detail after create | n/a | | n/a | |
| 5 | Create place + playbook works when logged in | no | | n/a | |
| 6 | Edit own place/playbook works | n/a | | no | |
| 7 | Cannot edit seed content (author_id null) as user | n/a | | | yes (admin) |
| 8 | Admin can set status **hidden** | n/a | no | no | |
| 9 | Hidden content not visible to anon | | | | admin can still open |

## SQL probes (optional, SQL Editor as postgres)

```sql
-- Should return published seed playbooks (run as service role / dashboard)
select title, status from public.playbooks;

-- As non-admin authenticated user, insert city should FAIL after 004:
-- (use app or PostgREST; dashboard SQL often bypasses RLS)
```

## Result

| Date | Runner | Result |
|------|--------|--------|
| | | pass / fail + notes |

## Notes

- Free-text fields can still mention hotels — product residual risk; forms warn only.  
- After fail, fix policy or app before Phase 3.  
