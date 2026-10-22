-- ──────────────────────────────────────────────────────────────────
-- Move commerce tables from Lemon Squeezy to Dodo Payments.
--
-- Column names become provider-neutral (ls_* → provider_*), and a
-- `provider` column records where each row came from. Existing Lemon
-- Squeezy rows are kept and tagged 'lemonsqueezy'.
--
-- orders.provider_order_id         Dodo payment_id   (pay_…)
-- subscriptions.provider_sub…_id   Dodo subscription_id (sub_…)
-- *.customer_id                    Dodo customer_id  (cus_…), used to open
--                                  the Dodo customer portal
-- ──────────────────────────────────────────────────────────────────

-- orders ─────────────────────────────────────────────────────────────
alter table public.orders rename column ls_order_id   to provider_order_id;
alter table public.orders rename column ls_product_id to provider_product_id;
alter table public.orders rename column ls_variant_id to provider_variant_id;
alter table public.orders alter column provider_variant_id drop not null;

alter table public.orders add column if not exists provider    text not null default 'lemonsqueezy';
alter table public.orders add column if not exists customer_id text;
alter table public.orders alter column provider set default 'dodo';

alter index if exists orders_ls_order_id_idx rename to orders_provider_order_id_idx;

-- subscriptions ──────────────────────────────────────────────────────
alter table public.subscriptions rename column ls_subscription_id to provider_subscription_id;
alter table public.subscriptions rename column ls_product_id      to provider_product_id;
alter table public.subscriptions rename column ls_variant_id      to provider_variant_id;
alter table public.subscriptions alter column provider_variant_id drop not null;

alter table public.subscriptions add column if not exists provider             text    not null default 'lemonsqueezy';
alter table public.subscriptions add column if not exists customer_id          text;
alter table public.subscriptions add column if not exists cancel_at_period_end boolean not null default false;
alter table public.subscriptions alter column provider set default 'dodo';

alter index if exists subscriptions_ls_sub_id_idx rename to subscriptions_provider_sub_id_idx;
