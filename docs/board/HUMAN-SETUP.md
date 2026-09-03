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

If earlier files already ran, only run the ones you have not applied yet.

**Now (hygiene):** paste `017_lumen_city_hero_lock.sql` — stops any logged-in user from setting a city banner.

**Phase 3:** paste `018_social.sql`, `019_comments.sql`, then `020_author.sql` — likes (count only), comments, author page (name + photo). Without 018, Like shows a paste message. Without 020, saving a name fails the same way.

**Fresh intel (2026-08-31):** paste `021_wipe_content.sql` once — **after** the homepage that no longer hardcodes seed IDs is on the live URL. Drops demo recs/days/notes. Accounts and cities stay. Do **not** re-run 003 / 005 / 006 after that unless you want fake recs back. The monthly xAI spend counter in her log resets; city-open quota resets too.

### 5. Auth URL config (so login redirects work)

Supabase → **Authentication** → **URL configuration**:

- **Site URL:** `http://localhost:3000` (for local)  
- **Redirect URLs:** add `http://localhost:3000/**` and `http://localhost:3000/auth/callback`

**Strongly recommended for local testing:**  
Authentication → **Providers** → **Email** → turn **OFF** “Confirm email”.  
Then signup logs you in immediately (no email link / callback). You can turn confirmation back on later for production.

Playwright (`cd apps/web && npm run test:e2e`) uses that same setting to sign up a throwaway email user. Or set `E2E_EMAIL` / `E2E_PASSWORD` in `.env.local`. Google login is not in the suite.

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

Log out and back in. You should reach `/dashboard` (**Your recommendations**). Admin is in the profile menu, not the landing.

Paste **022** (`apps/web/supabase/migrations/022_admin_people.sql`) so `/admin` can list people (last sign-in) and what’s new. Without it: **Can’t read people.**

---

## Soon (not required for Phase 1 local)

### Vercel (public URL)

1. [https://vercel.com](https://vercel.com) → sign up (GitHub is easiest)  
2. Import this repo  
3. Root / app directory: **`apps/web`**  
4. Add the **same three env vars** in Vercel project settings  
5. Supabase Auth URL config: add your `https://your-app.vercel.app` site + redirect URLs  
6. Deploy  

### Custom domain (`layoverintel.com`)

Bought on Vercel, so nameservers are already theirs. No GoDaddy DNS.

1. Vercel → the **layover** project → **Settings → Domains**. If checkout already offered **Connect an existing project**, pick this project. Otherwise **Add** `layoverintel.com`. Also add `www.layoverintel.com` and **Redirect to** `layoverintel.com` (no www).
2. Wait until the domain shows **Valid** (SSL is automatic). First hit can take a few minutes.
3. Vercel → **Settings → Environment Variables**: set `NEXT_PUBLIC_SITE_URL` to `https://layoverintel.com` (Production). Save, then **Deployments → … → Redeploy** so the Google button **and share-card images** use the new host. Do not leave this as `http://localhost:3000` on Production — iMessage/WhatsApp will fetch a blank picture.
4. Supabase → **Authentication → URL configuration**:
   - **Site URL:** `https://layoverintel.com`
   - **Redirect URLs** (keep the old ones too): `https://layoverintel.com/**`, `https://layoverintel.com/auth/callback`, plus the existing `https://layover-him7-eight.vercel.app/**` and localhost.
5. Google Cloud → **Auth platform → Clients** → the Layover web client → **Authorized JavaScript origins** add `https://layoverintel.com` (and `https://www.layoverintel.com` if you didn’t redirect www). **Redirect URI stays** `https://ysuxlxwbaqestffskaqp.supabase.co/auth/v1/callback` — do not change that.
6. Google **Branding**: homepage `https://layoverintel.com`, privacy `https://layoverintel.com/privacy`. If it says **Missing domain: layoverintel.com**, Google wants that host on **Authorized domains**, and it has to be verified in Search Console first (same Google account as the Cloud project):
   1. [Search Console](https://search.google.com/search-console) → **Add property** → **Domain** → `layoverintel.com`. Copy the TXT record.
   2. Vercel → **Domains** → `layoverintel.com` → DNS → **Add** TXT, name `@`, paste Google’s value. Save. Wait a minute, then **Verify** in Search Console.
   3. Google Auth platform → **Branding** → **Authorized domains** → **Add domain** `layoverintel.com` (no `https://`). Save. Then set homepage / privacy again.

Open `https://layoverintel.com`, then **Log in** with Google once. The old `*.vercel.app` URL can stay; it is just not the name you send people.  

Upgrade Vercel/Supabase to **Pro** only when free limits or commercial use require it (~$45/mo combined is the usual floor).

---

## Phase 4 — xAI key (you do this; Grok cannot)

1. Open [console.x.ai](https://console.x.ai) and sign up / log in (same account as [accounts.x.ai](https://accounts.x.ai) if prompted).
2. Add credits. **$20** is the monthly cap we locked — load at least that.
3. Create an API key: [API Keys](https://console.x.ai/team/default/api-keys).
4. In `apps/web/.env.local` add (never commit this file):

```
XAI_API_KEY=xai-...your key...
AI_MONTHLY_CAP_USD=20
```

5. Run migration **008** in the Supabase SQL Editor (`apps/web/supabase/migrations/008_ai_import.sql`). Same paste-and-run as 002–007.
6. Run **009** (`009_lumen_cities.sql`) so Lumen can open a new city (e.g. BCN) from a dump.
7. Run **010** (`010_place_images.sql`). If the storage bucket insert fails, create a **public** bucket named `place-stills` in Supabase Storage.
8. Run **011** (`011_lumen_spend.sql`) — global $20 meter, city heroes, generate-on-publish. **Required** or Lumen will nap / dumps will fail.
9. Run **012** (`012_dish_images.sql`) — plate photos on dishes. Rec cards stay one still.
10. Run **013** (`013_zurich_plates.sql`) — sample plates on the Zurich raclette rec.
11. Run **014** (`014_raclette_blurb.sql`) — rec blurb stands alone, not the itinerary.
12. Run **015** (`015_dimsum_plates.sql`) — extra plates on the dim-sum rec so you can pick a hero.
13. Run **016** (`016_place_photos.sql`) — rec photo album (max 3). Required for Edit rec uploads.
14. Restart the dev server (`cd apps/web && npm run dev`).

If the key is missing, Share still opens but Fill the draft says **Lumen’s taking a nap.**

## Google sign-in (you; the button is already in the app)

Two places. **Google Cloud** makes the Client ID + secret. **Supabase** stores them. Nothing goes in `.env.local`.

Your callback (copy this once, use it twice):

`https://ysuxlxwbaqestffskaqp.supabase.co/auth/v1/callback`

### A. Google Cloud Console

1. Open [https://console.cloud.google.com/](https://console.cloud.google.com/). Sign in with your Google account.
2. Top bar project picker → **New project** → name `Layover` → **Create**. Select that project.
3. Consent / branding (once per project). Either:
   - Left menu **APIs & Services** → **OAuth consent screen**, or
   - **Google Auth platform** → **Branding**
4. User type **External** (any Gmail). App name **Layover**. User support email = you. Developer contact email = you. Save. Skip scopes extras. If it asks for a homepage, `http://localhost:3000` is fine for testing.
5. If the app is in **Testing**, **Audience** / test users → add **your Gmail**. Only those accounts can sign in until you publish the app (don’t publish yet).
6. Create the client. Either:
   - **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**, or
   - **Google Auth platform** → **Clients** → **Create client**
7. Application type: **Web application**. Name: `Layover web`.
8. **Authorized JavaScript origins** → **Add URI**:
   - `http://localhost:3000`
9. **Authorized redirect URIs** → **Add URI**:
   - `https://ysuxlxwbaqestffskaqp.supabase.co/auth/v1/callback`  
   Exact, no trailing slash. This is **not** `localhost`.
10. **Create**. Copy **Client ID** (ends in `.apps.googleusercontent.com`) and **Client secret**. Leave that tab open.

### B. Supabase (where you save it)

1. [https://supabase.com/dashboard](https://supabase.com/dashboard) → project **layover** (the one whose URL is `ysuxlxwbaqestffskaqp`).
2. Left: **Authentication** → **Sign In / Providers** (sometimes labeled **Providers**).
3. Open **Google**.
4. Fill **only**:

| Setting | Paste / set |
|---------|-------------|
| **Enable Sign in with Google** | On |
| **Client IDs** | Client ID from Google (step A10). One ID is enough. |
| **Client Secret (for OAuth)** | Client secret from Google |
| **Skip nonce checks** | Off |
| **Allow users without an email** | Off |
| **Callback URL** | Leave it. Already matches step A9. |

5. **Save**.
6. Also check **Authentication** → **URL configuration**: Site URL `http://localhost:3000`. Redirect URLs include `http://localhost:3000/**` and `http://localhost:3000/auth/callback`.

### C. Try it

`http://localhost:3000/login` → **Continue with Google**. Use a Gmail you added as a test user.

Do **not** add Apple, Facebook, or Instagram. Email + password stays. Instagram-as-content is not a login provider — parked.

## Later (not now)

| Account | When |
|---------|------|
| Stripe | Phase 5 (sponsors pay) |
| Apple / other OAuth | Parked |

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
