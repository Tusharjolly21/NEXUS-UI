-- ──────────────────────────────────────────────────────────────────
-- login_handoffs
-- Lets a sign-in that was requested on one device (e.g. a PC) be
-- approved on another (e.g. the phone that opened the email link), and
-- signs the requesting device in automatically.
--
--   id           shown in the email link; identifies the request
--   secret_hash  SHA-256 of a secret that only the requesting browser
--                holds. Only that browser can claim the session, so the
--                link on its own is never enough to hijack the request.
--   status       pending  → created when the link is requested
--                approved → the user tapped "Approve" on the link device
--                claimed  → the requesting browser took the session
--   hashed_token one-time sign-in token for the requesting device; wiped
--                the moment it is claimed
--
-- RLS on, no policies: only the service role (the /api/auth/* routes)
-- can read or write these rows. Rows expire after 10 minutes.
-- ──────────────────────────────────────────────────────────────────
create table if not exists public.login_handoffs (
  id            uuid        primary key default gen_random_uuid(),
  secret_hash   text        not null,
  status        text        not null default 'pending'
                            check (status in ('pending', 'approved', 'claimed')),
  device        text,                              -- e.g. "Chrome on Windows"
  location      text,                              -- e.g. "Mumbai, IN" (best effort)
  hashed_token  text,
  user_id       uuid        references auth.users on delete cascade,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null default now() + interval '10 minutes'
);

create index if not exists login_handoffs_expires_at_idx
  on public.login_handoffs (expires_at);

alter table public.login_handoffs enable row level security;
