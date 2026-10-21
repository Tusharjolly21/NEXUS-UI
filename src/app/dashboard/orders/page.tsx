import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Receipt,
  Crown,
  RefreshCw,
  Calendar,
  ExternalLink,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getUserEntitlements } from "@/lib/entitlements";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders – Nexus UI",
  description: "View your purchased products and subscriptions.",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function statusColors(status: string) {
  if (status === "paid" || status === "active")
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";
  if (status === "past_due" || status === "on_hold")
    return "border-amber-500/30 bg-amber-500/10 text-amber-500";
  if (status === "refunded" || status === "cancelled" || status === "expired" || status === "failed")
    return "border-red-500/30 bg-red-500/10 text-red-500";
  return "border-border bg-muted/40 text-muted-foreground";
}

export default async function DashboardOrdersPage() {
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/orders");

  const { orders, subscription } = await getUserEntitlements(user.id);
  const hasAnything = orders.length > 0 || subscription !== null;

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-10">
      <div className="mb-8">
        <h1 className="pg-display text-[clamp(36px,5vw,52px)] text-foreground">Your Orders</h1>
        <p className="mt-1 text-muted-foreground">Purchases and active subscriptions</p>
      </div>

      {!hasAnything ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-24 text-center">
          <Package className="size-12 text-muted-foreground" />
          <h2 className="mt-4 font-semibold text-foreground">No orders yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            You haven&apos;t made any purchases yet.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/components"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-lg")}
            >
              Browse Components
            </Link>
            <Link
              href="/pricing"
              className={cn(buttonVariants({ size: "sm" }), "rounded-lg bg-foreground text-background hover:bg-foreground/90")}
            >
              Get All Access
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">

          {/* Active subscription card */}
          {subscription && (
            <div className="pg-float rounded-tile border-0 bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <RefreshCw className="size-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground">Subscription</h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40">
                    <Zap className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Pro — Annual Plan</p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {subscription.renews_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          Renews {formatDate(subscription.renews_at)}
                        </span>
                      )}
                      {subscription.ends_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          Expires {formatDate(subscription.ends_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize", statusColors(subscription.status))}>
                    {subscription.status.replace(/_/g, " ")}
                  </span>
                  <Link
                    href="mailto:contact@nexus-ui.com?subject=Manage%20my%20Nexus%20UI%20subscription"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 rounded-lg text-xs")}
                  >
                    <ExternalLink className="size-3" />
                    Manage
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* One-time orders */}
          {orders.length > 0 && (
            <div className="pg-float rounded-tile border-0 bg-card">
              <div className="flex items-center gap-2 border-b border-border px-6 py-4">
                <Receipt className="size-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground">One-time purchases</h2>
              </div>
              <div className="divide-y divide-border">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40">
                        <Crown className="size-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground capitalize">
                          {order.product_type === "lifetime"
                            ? "Lifetime All-Access"
                            : order.product_slug
                            ? `Template — ${order.product_slug}`
                            : "Component Pack"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatDate(order.created_at)} · Order #{order.ls_order_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-foreground">
                        {formatAmount(order.amount_cents, order.currency)}
                      </span>
                      <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize", statusColors(order.status))}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Questions about a charge?{" "}
            <Link href="mailto:contact@nexus-ui.com" className="underline underline-offset-2 hover:text-foreground">
              Contact support
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
