# AsthmaCare Admin Panel

A small, read-only web app for clinic staff to look up a patient's profile,
medications, peak flow readings, symptoms, triggers, and emergency contact —
the same data shown in the app's "Doctor report" screen.

It talks directly to your existing Supabase project. There is no separate
backend server: access control is enforced by Supabase Row Level Security
(RLS), the same mechanism the Flutter app already uses.

## 1. Run the SQL migration (once)

Open your Supabase project → SQL Editor → New query, paste the contents of
`sql/admin_access.sql`, and run it. This adds **read-only** policies that let
accounts with `role = 'admin'` or `role = 'clinician'` in `profiles` see
every patient's rows. It does not grant insert/update/delete, and it does not
change any existing patient-facing policy.

## 2. Create an admin account

Admins can't self-promote through the app (by design). To create one:

1. In Supabase Dashboard → Authentication → Users, click **Add user** and
   set an email + password for the clinic staff member (or have them sign up
   however you prefer).
2. Copy their user UUID from that same screen.
3. In SQL Editor, run:
   ```sql
   update public.profiles set role = 'admin' where id = '<uuid-here>';
   ```
   (`clinician` also works — both roles get the same read access under the
   policies in step 1.)

Repeat step 3 whenever you want to add another admin.

## 3. Configure and run locally

```bash
cd admin_panel
cp .env.example .env
# edit .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
# (same values as the Flutter app's .env — the anon key is safe to expose,
# access is enforced by RLS, not by keeping this key secret)

npm install
npm run dev
```

Visit the printed local URL, sign in with the admin account you created.

## 4. Deploy (Vercel or Netlify)

Both platforms build static sites straight from this folder.

**Vercel**
1. Push this `admin_panel` folder to a Git repo (or the whole project, and
   set the Vercel project's "Root Directory" to `admin_panel`).
2. Import the repo in Vercel → framework preset **Vite**.
3. Add environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   in the Vercel project settings.
4. Deploy. Vercel runs `npm run build` and serves the `dist` folder.

**Netlify**
1. Same repo setup as above (base directory `admin_panel` if it's a subfolder).
2. Build command: `npm run build`, publish directory: `dist`.
3. Add the same two environment variables in Site settings → Environment.
4. Deploy.

Give clinic staff the deployed URL plus their email/password. They sign in
and immediately see the patient list.

## Notes / things you may want to extend later

- The panel is **read-only** on purpose — it can't edit or delete patient
  data. If you want editing later, that needs new RLS policies plus UI, and
  more thought about audit trails.
- `role = 'admin'` and `role = 'clinician'` currently get identical access.
  If you later want admins-only features (e.g. managing other admin
  accounts), gate those in the UI on `role === 'admin'` specifically —
  `useAuth()` already exposes enough to add that.
- There's no self-serve "forgot password" flow wired up; use the Supabase
  dashboard to reset an admin's password if needed, or enable Supabase's
  password-reset email flow.
