# Supabase email sign-in setup

CoCreate uses passwordless email sign-in: a user enters their name and email, then opens a secure confirmation/sign-in link sent by Supabase. No password or PIN is required. The name and email are kept in Supabase Auth and mirrored to `public.profiles`; no credential is written to the profile table or a spreadsheet.

During the temporary Vite/Arena development preview, workspace access and the local API are open so the app can be tried without signing in. Anyone with the preview link may use model requests and consume configured API credits. This bypass is development-only; production builds and Vercel continue to require a valid Supabase session. Do not enable or copy the preview bypass into production.

## 1. Configure Supabase Auth and email

1. In the Supabase Dashboard, open **Authentication → Sign In / Providers → Email** and enable email sign-in.
2. Enable custom SMTP under **Authentication → Emails** and enter your provider’s verified sender and SMTP credentials. Do not put SMTP credentials in frontend environment variables.
3. Under **Authentication → URL Configuration**, set the Site URL and allow the exact app URL used by the email link. The app redirects back to `/auth?next=...` before opening the requested workspace route.

## 2. Create and backfill profile records

Apply [`supabase/migrations/20261018_create_user_profiles.sql`](supabase/migrations/20261018_create_user_profiles.sql) in the Supabase SQL Editor (or apply it with the Supabase CLI after linking the project). It creates `public.profiles`, enables row-level security, creates a profile automatically whenever an Auth user is created, and backfills existing Auth users. Users can read only their own profile.

Check **Authentication → Users** for account records and **Table Editor → profiles** for the corresponding name/email records. If an Auth user exists but no profile appears, check the migration/trigger and Supabase database logs.

## 3. Set application environment variables

Set these in local `.env.local` and in the Vercel project (then redeploy):

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

The `VITE_` values initialize the browser client; the server values let `/api/openrouter` verify each signed-in user's session. These are Supabase public project values, not service-role secrets. Never put a Supabase service-role key or an OpenRouter key in `VITE_` variables.

## 4. Verify the flow

1. Create an account with a name and email.
2. Open the confirmation/sign-in link sent to that email.
3. Confirm the app opens `/workspace`.
4. Confirm the user appears in **Authentication → Users** and the matching row appears in **Table Editor → profiles**.
