-- ──────────────────────────────────────────────────────────────────
-- orders
-- One row per completed one-time purchase (component, template, lifetime).
-- Written exclusively by the Lemon Squeezy webhook handler.
-- ──────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users on delete cascade,
  ls_order_id     text        not null unique,   -- Lemon Squeezy order ID
  ls_product_id   text        not null,          -- LS product ID
  ls_variant_id   text        not null,          -- LS variant ID
  product_type    text        not null check (product_type in ('component', 'template', 'lifetime')),
  product_slug    text,                          -- e.g. 'animated-select-headline' (null for lifetime)
  status          text        not null default 'paid' check (status in ('paid', 'refunded')),
  amount_cents    int         not null,
  currency        text        not null default 'USD',
  created_at      timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Users can only read their own orders
create policy "orders_select_own"
  on public.orders for select
  using (auth.uid() = user_id);

-- Only service role (webhook handler) can insert/update — no user policy needed
-- (The webhook uses the service role key, which bypasses RLS)

create index orders_user_id_idx        on public.orders (user_id);
create index orders_ls_order_id_idx    on public.orders (ls_order_id);
create index orders_product_slug_idx   on public.orders (user_id, product_slug);

-- ──────────────────────────────────────────────────────────────────
-- subscriptions
-- One row per LS subscription (annual plan). Updated on every
-- subscription lifecycle webhook (created, updated, cancelled, expired).
-- ──────────────────────────────────────────────────────────────────
create table if not exists public.subscriptions (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null references auth.users on delete cascade,
  ls_subscription_id  text        not null unique,
  ls_product_id       text        not null,
  ls_variant_id       text        not null,
  -- active | paused | cancelled | expired | past_due | unpaid
  status              text        not null,
  renews_at           timestamptz,
  ends_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create index subscriptions_user_id_idx        on public.subscriptions (user_id);
create index subscriptions_ls_sub_id_idx      on public.subscriptions (ls_subscription_id);
create index subscriptions_active_idx         on public.subscriptions (user_id, status);

-- ──────────────────────────────────────────────────────────────────
-- webhook_events
-- Idempotency log. Before processing any LS webhook we insert the
-- event ID here. If it already exists we skip processing entirely.
-- This prevents double-crediting if LS retries a delivery.
-- ──────────────────────────────────────────────────────────────────
create table if not exists public.webhook_events (
  id            text        primary key,   -- Lemon Squeezy event UUID
  event_name    text        not null,
  processed_at  timestamptz not null default now()
);

-- No RLS needed — only the service role touches this table
