import { redirect } from "next/navigation";
import Link from "next/link";
import { Crown, Receipt, CheckCircle2, Calendar, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getUserEntitlements } from "@/lib/entitlements";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing – Nexus UI",
  description: "Manage your subscription and view invoices.",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}

export default async function DashboardBillingPage() {
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/billing");

  const { subscription, lifetime, orders, hasAccess } = await getUserEntitlements(user.id);

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Billing</h1>
        <p className="mt-1 text-muted-foreground">Manage your subscription and view invoices</p>
      </div>

      <div className="flex flex-col gap-6">

        {/* Plan status card */}
        {hasAccess ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                <Crown className="size-5 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">
                    {lifetime ? "Lifetime Access" : "Pro — Annual"}
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                    <CheckCircle2 className="size-2.5" />
                    Active
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lifetime
                    ? "You have lifetime access to all premium content. No expiry, ever."
                    : "Full access to all templates, components, and blocks."}
                </p>

                {subscription && !lifetime && (
                  <div className="mt-3 flex flex-wrap gap-4 text-sm">
                    {subscription.renews_at && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="size-3.5" />
                        Renews {formatDate(subscription.renews_at)}
                      </div>
                    )}
                    {subscription.ends_at && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="size-3.5" />
                        Expires {formatDate(subscription.ends_at)}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-muted-foreground capitalize">
                      <Zap className="size-3.5" />
                      Status: {subscription.status.replace("_", " ")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center">
            <Crown className="size-10 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold text-foreground">No Active Plan</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Get unlimited access to all components, blocks, and templates.
            </p>
            <Link
              href="/pricing"
              className={cn(buttonVariants({ size: "sm" }), "mt-6 rounded-lg bg-foreground text-background hover:bg-foreground/90")}
            >
              View Plans
            </Link>
          </div>
        )}

        {/* Order history */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Receipt className="size-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Order History</h2>
          </div>
          <div className="border-t border-border pt-4">
            {orders.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No orders found</p>
            ) : (
              <div className="divide-y divide-border">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">
                        {order.product_type === "lifetime" ? "Lifetime Access" : order.product_type}
                        {order.product_slug ? ` — ${order.product_slug}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-foreground">
                        {formatAmount(order.amount_cents, order.currency)}
                      </span>
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                        order.status === "paid"
                          ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                          : "border border-red-500/30 bg-red-500/10 text-red-500"
                      )}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Support */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground">Need help with billing?</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Contact support for questions about your subscription or invoices.
          </p>
          <Link
            href="mailto:contact@nexus-ui.com"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 rounded-lg")}
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
