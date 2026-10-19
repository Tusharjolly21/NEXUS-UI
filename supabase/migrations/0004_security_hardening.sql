-- ──────────────────────────────────────────────────────────────────
-- Lock down service-role-only tables
-- Without RLS, any public-schema table is readable and writable by
-- anyone holding the anon key. Enabling RLS with no policies means
-- only the service role (which bypasses RLS) can touch these rows.
-- Both the contact route and the Lemon Squeezy webhook use the
-- service role via getAdminClient(), so they are unaffected.
-- ──────────────────────────────────────────────────────────────────
alter table public.webhook_events      enable row level security;
alter table public.contact_submissions enable row level security;

-- ──────────────────────────────────────────────────────────────────
-- api_tokens
-- One CLI token per user for the gated shadcn registry.
-- Only a SHA-256 hash of the token is stored; the plaintext is shown
-- to the user once when generated. Regenerating replaces the row,
-- which revokes the previous token immediately.
-- RLS on, no policies: read and written only by the service role
-- (the dashboard server action and /api/registry/[name]).
-- ──────────────────────────────────────────────────────────────────
create table if not exists public.api_tokens (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null unique references auth.users on delete cascade,
  token_hash    text        not null unique,   -- hex SHA-256 of the full nxs_ token
  token_hint    text        not null,          -- last 4 chars, for display only
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz
);

alter table public.api_tokens enable row level security;
