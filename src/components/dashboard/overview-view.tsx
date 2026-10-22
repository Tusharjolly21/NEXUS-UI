import Link from "next/link";
import { ArrowUpRight, Boxes, LayoutTemplate, Receipt, Terminal } from "lucide-react";
import { Card, DashboardPage, Notice, PageHeader, StatusPill } from "@/components/dashboard/ui";
import { PlanActivating } from "@/components/dashboard/plan-activating";
import { pillClassName } from "@/components/site/pill-link";
import type { PlanSummary } from "@/lib/plan";
import { cn } from "@/lib/utils";

export type OverviewCounts = {
  components: { yours: number; total: number };
  blocks: { yours: number; total: number };
  templates: { yours: number; total: number };
  proComponents: number;
  freeComponents: number;
};

export function OverviewView({
  firstName,
  plan,
  counts,
  activating,
  contact,
}: {
  firstName: string;
  plan: PlanSummary;
  counts: OverviewCounts;
  /** True right after checkout, until the webhook has unlocked the plan. */
  activating: boolean;
  contact: string;
}) {
  const stats = [
    { label: "Components", ...counts.components },
    { label: "Blocks", ...counts.blocks },
    { label: "Templates", ...counts.templates },
  ];

  const links = [
    {
      href: "/components",
      icon: Boxes,
      title: "Browse components",
      body: plan.hasAccess
        ? `All ${counts.components.total} are yours, with a one-line install.`
        : `${counts.freeComponents} free, ${counts.proComponents} more with Pro.`,
    },
    {
      href: "/templates",
      icon: LayoutTemplate,
      title: plan.hasAccess ? "Open your templates" : "Browse templates",
      body: plan.hasAccess
        ? "Every template page has a Download source button."
        : `${counts.templates.total} complete landing pages with live previews.`,
    },
    {
      href: "/dashboard/api-key",
      icon: Terminal,
      title: "Install with the CLI",
      body: "Create a token to add premium items with the shadcn CLI.",
    },
    {
      href: "/dashboard/orders",
      icon: Receipt,
      title: "Orders and receipts",
      body: "Everything you've bought, with the amount and date.",
    },
  ];

  return (
    <DashboardPage>
      <PageHeader
        title={`Hi, ${firstName}`}
        description={plan.hasAccess ? "Your plan includes every Pro component, template and block." : "You're on the free plan."}
      />

      {activating ? <PlanActivating contact={contact} /> : null}

      <Card className="mb-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-foreground">{plan.label}</h2>
            <StatusPill status={plan.badge.label} label={plan.badge.label} tone={plan.badge.tone} />
          </div>
          <p className="mt-1.5 max-w-[520px] text-[15px] leading-relaxed text-muted-foreground">{plan.detail}</p>
          {plan.notice ? (
            <div className="mt-3">
              <Notice tone={plan.notice.tone}>{plan.notice.text}</Notice>
            </div>
          ) : null}
        </div>
        {plan.kind === "free" || plan.notice?.tone === "warn" ? (
          <Link href={plan.kind === "free" && !plan.notice ? "/pricing" : "/dashboard/billing"} className={pillClassName("ink", "md", "shrink-0")}>
            {plan.kind === "free" && !plan.notice ? "Compare plans" : "Fix payment"}
          </Link>
        ) : (
          <Link href="/dashboard/billing" className={pillClassName("white", "md", "shrink-0")}>
            Manage billing
          </Link>
        )}
      </Card>

      <ul className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const pct = s.total ? Math.round((s.yours / s.total) * 100) : 0;
          return (
            <Card as="li" key={s.label} className="p-6">
              <p className="text-[40px] font-bold leading-none tracking-[-0.04em] text-foreground">
                {s.yours}
                {s.yours !== s.total ? <span className="text-[20px] font-semibold text-muted-foreground"> of {s.total}</span> : null}
              </p>
              <p className="mt-2 text-[14.5px] text-body">{s.label} you can use</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted" role="presentation">
                <div className="h-full rounded-full bg-action" style={{ width: `${pct}%` }} />
              </div>
            </Card>
          );
        })}
      </ul>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {links.map(({ href, icon: Icon, title, body }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "pg-float group relative rounded-tile bg-card p-6 transition-transform hover:-translate-y-0.5 motion-reduce:transition-none",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            )}
          >
            <span className="grid size-10 place-items-center rounded-xl bg-muted text-foreground">
              <Icon className="size-[18px]" aria-hidden />
            </span>
            <h2 className="mt-4 text-[17px] font-semibold text-foreground">{title}</h2>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted-foreground">{body}</p>
            <ArrowUpRight
              className="absolute right-5 top-5 size-4 text-muted-foreground transition-colors group-hover:text-foreground"
              aria-hidden
            />
          </Link>
        ))}
      </div>
    </DashboardPage>
  );
}
