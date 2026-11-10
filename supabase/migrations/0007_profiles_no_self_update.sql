-- ──────────────────────────────────────────────────────────────────
-- profiles: stop signed-in users updating their own row
-- 0001 let a user update their whole profile row, including the
-- is_premium and role columns. Nothing in the app writes profiles
-- from the browser (Pro comes from orders and subscriptions, which
-- only the service role writes), so the policy only ever left a
-- door open. With it gone, profiles is read-own for users and
-- written only by the service role.
-- ──────────────────────────────────────────────────────────────────
drop policy if exists "profiles_update_own" on public.profiles;
