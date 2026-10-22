import Link from "next/link";
import { Card, CardTitle, DashboardPage, EmptyState, formatAmount, formatDate, PageHeader, StatusPill } from "@/components/dashboard/ui";
import { pillClassName } from "@/components/site/pill-link";
import type { PlanSummary } from "@/lib/plan";
import type { Database } from "@/lib/supabase/database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

function orderName(o: Order) {
  if (o.product_type === "lifetime") return "All-Access, one payment";
  if (o.product_slug) return `Template: ${o.product_slug}`;
  return "Purchase";
}

export function OrdersView({
  orders,
  subscription,
  plan,
  canUsePortal,
  contact,
}: {
  orders: Order[];
  subscription: Subscription | null;
  plan: PlanSummary;
  canUsePortal: boolean;
  contact: string;
}) {
  const manageHref = canUsePortal ? "/api/dodo/portal" : `mailto:${contact}?subject=Manage%20my%20Nexus%20UI%20subscription`;
  const empty = orders.length === 0 && !subscription;

  return (
    <DashboardPage>
      <PageHeader title="Orders" description="Everything you've bought, and your subscription." />

      {empty ? (
        <EmptyState title="No orders yet" body="When you buy Pro or All-Access it will show up here, with a receipt.">
          <Link href="/components" className={pillClassName("white", "md")}>
            Browse components
          </Link>
          <Link href="/pricing" className={pillClassName("ink", "md")}>
            See pricing
          </Link>
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-5">
          {subscription ? (
            <Card>
              <CardTitle>Subscription</CardTitle>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[17px] font-semibold text-foreground">Pro, yearly</p>
                  <p className="mt-1 text-[14.5px] text-muted-foreground">{plan.detail}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusPill status={subscription.status} />
                  <a href={manageHref} className={pillClassName("white", "sm")}>
                    Manage
                  </a>
                </div>
              </div>
            </Card>
          ) : null}

          {orders.length > 0 ? (
            <Card className="p-0">
              <div className="px-6 pt-6">
                <CardTitle hint={`${orders.length} ${orders.length === 1 ? "purchase" : "purchases"}`}>One-time purchases</CardTitle>
              </div>
              <ul className="divide-y divide-border px-6 pb-2">
                {orders.map((o) => (
                  <li key={o.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[15.5px] font-medium text-foreground">{orderName(o)}</p>
                      <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                        {formatDate(o.created_at)}
                        {o.provider_order_id ? <span className="font-mono"> · {o.provider_order_id}</span> : null}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-[15px] font-semibold tabular-nums text-foreground">{formatAmount(o.amount_cents, o.currency)}</span>
                      <StatusPill status={o.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <p className="text-center text-[13.5px] text-muted-foreground">
            Questions about a charge?{" "}
            <a href={`mailto:${contact}`} className="text-foreground underline underline-offset-2">
              Email us
            </a>
            . Invoices and tax details are in the{" "}
            <a href={manageHref} className="text-foreground underline underline-offset-2">
              billing portal
            </a>
            .
          </p>
        </div>
      )}
    </DashboardPage>
  );
}
