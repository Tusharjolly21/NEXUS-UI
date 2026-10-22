import Link from "next/link";
import { Card, CardTitle, DashboardPage, formatAmount, formatDate, Notice, PageHeader, StatusPill } from "@/components/dashboard/ui";
import { pillClassName } from "@/components/site/pill-link";
import type { PlanSummary } from "@/lib/plan";
import type { Database } from "@/lib/supabase/database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

const PORTAL_MESSAGES: Record<string, string> = {
  none: "We couldn't find a billing profile for your account yet. If you just paid, wait a minute and try again.",
  error: "We couldn't open the billing portal just now. Try again, or email us and we'll sort it out.",
  unavailable: "The billing portal isn't available right now. Email us and we'll help.",
};

export function BillingView({
  plan,
  canUsePortal,
  portalFlag,
  recentOrders,
  contact,
}: {
  plan: PlanSummary;
  canUsePortal: boolean;
  portalFlag?: string;
  recentOrders: Order[];
  contact: string;
}) {
  const portalHref = canUsePortal ? "/api/dodo/portal" : `mailto:${contact}?subject=Nexus%20UI%20billing`;

  return (
    <DashboardPage>
      <PageHeader title="Billing" description="Your plan, how you pay, and your invoices." />

      {portalFlag && PORTAL_MESSAGES[portalFlag] ? (
        <div className="mb-5">
          <Notice tone="warn">{PORTAL_MESSAGES[portalFlag]}</Notice>
        </div>
      ) : null}

      <div className="flex flex-col gap-5">
        <Card>
          <CardTitle>Your plan</CardTitle>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <p className="text-[26px] font-semibold tracking-[-0.025em] text-foreground">{plan.label}</p>
                <StatusPill status={plan.badge.label} label={plan.badge.label} tone={plan.badge.tone} />
              </div>
              <p className="mt-2 max-w-[520px] text-[15px] leading-relaxed text-muted-foreground">{plan.detail}</p>
              {plan.notice ? (
                <div className="mt-4">
                  <Notice tone={plan.notice.tone}>{plan.notice.text}</Notice>
                </div>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2.5">
              {plan.kind === "free" ? (
                <Link href="/pricing" className={pillClassName("ink", "md")}>
                  Compare plans
                </Link>
              ) : (
                <>
                  <a href={portalHref} className={pillClassName(plan.notice?.tone === "warn" ? "ink" : "white", "md")}>
                    {plan.kind === "yearly" ? "Manage subscription" : "View invoices"}
                  </a>
                  {plan.kind === "yearly" ? (
                    <Link href="/pricing" className={pillClassName("white", "md")}>
                      Switch to All-Access
                    </Link>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle hint={recentOrders.length ? "Latest first" : undefined}>Recent payments</CardTitle>
          {recentOrders.length === 0 ? (
            <p className="py-4 text-[15px] text-muted-foreground">
              No one-time payments yet. Pro subscription charges are listed in the billing portal.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-4 py-3.5">
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-foreground">
                      {o.product_type === "lifetime" ? "All-Access, one payment" : "Purchase"}
                    </p>
                    <p className="text-[13px] text-muted-foreground">{formatDate(o.created_at)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-[15px] font-semibold tabular-nums text-foreground">{formatAmount(o.amount_cents, o.currency)}</span>
                    <StatusPill status={o.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link href="/dashboard/orders" className="mt-3 inline-block text-[14.5px] text-link hover:underline hover:underline-offset-4">
            All orders and receipts ›
          </Link>
        </Card>

        <Card>
          <CardTitle>Need help with billing?</CardTitle>
          <p className="max-w-[560px] text-[15px] leading-relaxed text-muted-foreground">
            Questions about a charge, a refund or tax? Payments are handled by Dodo Payments, our merchant of record. Email us and
            include the address you paid with.
          </p>
          <a href={`mailto:${contact}`} className={pillClassName("white", "sm", "mt-4")}>
            Email {contact}
          </a>
        </Card>
      </div>
    </DashboardPage>
  );
}
