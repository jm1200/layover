# Human setup checklist (shareholder)

You approved Phase 1 + stack. Engineer builds the app. **You only do cloud accounts and keys.**

---

## Right now (required for login to work)

### 1. Create a Supabase project (~10 minutes)

1. Go to [https://supabase.com](https://supabase.com) → **Start your project** / sign up.  
2. **New project**  
   - Name: e.g. `layover`  
   - Database password: **save it** in a password manager (you may need it later)  
   - Region: closest to you or your users  
3. Wait until the project is ready (green).

### 2. Copy API keys

In the Supabase dashboard:

1. **Project Settings** (gear) → **API**  
2. Copy:

| What (dashboard may say) | Env var name |
|--------------------------|----------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| **Publishable** key *or* classic **anon / public** key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` and/or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (same value is fine) |
| **service_role** / secret key | `SUPABASE_SERVICE_ROLE_KEY` (optional for Phase 1 login) |

⚠️ **Never commit** the service_role key. Never put it in client-side code. Treat it like a root password.

**Ignore** Supabase’s sample `page.tsx` / `utils/supabase/*` / “todos” demo — this repo already has clients under `apps/web/src/lib/supabase/` and real auth pages.

### 3. Put keys in the app env file

In the repo, engineer will create:

`apps/web/.env.local`

Paste values like:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

If the file already exists as `.env.local.example`, copy it:

```bash
cp apps/web/.env.local.example apps/web/.env.local
# then edit .env.local with your real keys
```

### 4. Run SQL migrations (paste each file, in order)

In Supabase: **SQL Editor** → New query → paste → **Run**:

1. `apps/web/supabase/migrations/001_profiles.sql` — roles  
2. `apps/web/supabase/migrations/002_content.sql` — cities / places / playbooks (Phase 2)  
3. `apps/web/supabase/migrations/003_seed_zurich_delhi.sql` — Zurich + Delhi seed  
4. `apps/web/supabase/migrations/004_phase2_harden.sql` — admin-only city/zone create + status lock  
5. `apps/web/supabase/migrations/005_seed_santiago_munich.sql` — Santiago steak + Munich mustard  
6. `apps/web/supabase/migrations/006_zurich_density.sql` — extra Zurich recs  
7. `apps/web/supabase/migrations/007_stop_timing.sql` — stop duration / cost notes

If earlier files already ran, only run the ones you have not applied yet (usually **006** then **007**).

### 5. Auth URL config (so login redirects work)

Supabase → **Authentication** → **URL configuration**:

- **Site URL:** `http://localhost:3000` (for local)  
- **Redirect URLs:** add `http://localhost:3000/**` and `http://localhost:3000/auth/callback`

**Strongly recommended for local testing:**  
Authentication → **Providers** → **Email** → turn **OFF** “Confirm email”.  
Then signup logs you in immediately (no email link / callback). You can turn confirmation back on later for production.

If you still see “wait X seconds”: that is Supabase **rate limiting** after several tries — wait a minute and use **Log in** (not Sign up again) with the same email/password.

### 6. Tell the engineer “keys are in”

Then locally (or ask engineer):

```bash
cd apps/web && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Sign up** → check you land on a dashboard.

### 7. Make yourself admin (once)

After you have an account, in Supabase **SQL Editor**:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'YOUR_EMAIL_HERE');
```

Log out and back in. You should reach `/admin`.

---

## Soon (not required for Phase 1 local)

### Vercel (public URL)

1. [https://vercel.com](https://vercel.com) → sign up (GitHub is easiest)  
2. Import this repo  
3. Root / app directory: **`apps/web`**  
4. Add the **same three env vars** in Vercel project settings  
5. Supabase Auth URL config: add your `https://your-app.vercel.app` site + redirect URLs  
6. Deploy  

Upgrade Vercel/Supabase to **Pro** only when free limits or commercial use require it (~$45/mo combined is the usual floor).

---

## Later (not now)

| Account | When |
|---------|------|
| Stripe | Phase 5 (sponsors pay) |
| xAI API key | Phase 4 (AI story import) |
| Google OAuth (optional) | If you want “Log in with Google” — create OAuth client, paste into Supabase Auth providers |

---

## What you do **not** need to do

- Read application source  
- Write SQL beyond the one migration paste + admin role update  
- Design the product (CEO/docs own that)  
- Deploy on day one (local is enough to validate Phase 1)

---

## If something fails

| Symptom | Likely fix |
|---------|------------|
| “Invalid API key” | Wrong keys or `.env.local` not saved / dev server not restarted |
| Redirect error on login | Site URL / redirect URLs in Supabase Auth settings |
| No profile / role errors | Migration SQL not run |
| Stuck as `user` | Admin `update` SQL not run or wrong email |
