create table if not exists public.contact_submissions (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  email       text        not null,
  company     text,
  message     text        not null,
  created_at  timestamptz not null default now()
);

-- No RLS — only the service role (API route) writes here
