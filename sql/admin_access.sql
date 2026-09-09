-- AsthmaCare Admin Panel access
-- Run this once in Supabase SQL Editor (after supabase_schema.sql).
-- Safe to run more than once.

-- 1) Helper function: is the *currently authenticated* user an admin/clinician?
-- SECURITY DEFINER lets this function read `profiles` bypassing RLS, which is
-- required to avoid infinite recursion (a policy on `profiles` can't safely
-- query `profiles` under RLS itself).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'clinician')
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 2) Read-only admin policies. These are ADDITIONAL select policies —
-- Postgres OR's multiple permissive policies together, so existing
-- "users can only see their own rows" policies are untouched. Admins never
-- get insert/update/delete rights through these.

drop policy if exists admin_read_profiles on public.profiles;
create policy admin_read_profiles on public.profiles
  for select to authenticated using (public.is_admin());

drop policy if exists admin_read_peak_flow_logs on public.peak_flow_logs;
create policy admin_read_peak_flow_logs on public.peak_flow_logs
  for select to authenticated using (public.is_admin());

drop policy if exists admin_read_symptom_logs on public.symptom_logs;
create policy admin_read_symptom_logs on public.symptom_logs
  for select to authenticated using (public.is_admin());

drop policy if exists admin_read_trigger_logs on public.trigger_logs;
create policy admin_read_trigger_logs on public.trigger_logs
  for select to authenticated using (public.is_admin());

drop policy if exists admin_read_medication_logs on public.medication_logs;
create policy admin_read_medication_logs on public.medication_logs
  for select to authenticated using (public.is_admin());

drop policy if exists admin_read_reminders on public.reminders;
create policy admin_read_reminders on public.reminders
  for select to authenticated using (public.is_admin());

drop policy if exists admin_read_user_medications on public.user_medications;
create policy admin_read_user_medications on public.user_medications
  for select to authenticated using (public.is_admin());

drop policy if exists admin_read_emergency_contacts on public.emergency_contacts;
create policy admin_read_emergency_contacts on public.emergency_contacts
  for select to authenticated using (public.is_admin());

-- 3) Promote an account to admin.
-- Admins CANNOT self-promote through the app (the patient-facing update
-- policy forces role = 'patient'), which is intentional. To create an
-- admin:
--   a) Have the person sign up / sign in once through Supabase Auth
--      (Authentication > Users in the dashboard, "Add user" works too), OR
--      let them create an anonymous session by opening the AsthmaCare app.
--   b) Find their user id (Authentication > Users), then run:
--
--        update public.profiles set role = 'admin' where id = '<uuid-here>';
--
--      Use 'clinician' instead of 'admin' if you want read-only medical
--      staff without implying full admin trust — both roles get the same
--      read access under the policies above; treat 'admin' as the tier
--      that can also manage other admins if you extend this later.
