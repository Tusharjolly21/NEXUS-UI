import Link from "next/link";
import { ArrowUpRight, Boxes, Check, LayoutTemplate, LockOpen, Receipt, Sparkles, Terminal } from "lucide-react";
import { Card, DashboardPage, Notice, PageHeader, StatusPill } from "@/components/dashboard/ui";
import { PlanActivating } from "@/components/dashboard/plan-activating";
import { PurchaseReturnTracker } from "@/components/dashboard/purchase-return-tracker";
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
  justUnlocked,
  token,
  contact,
}: {
  firstName: string;
  plan: PlanSummary;
  counts: OverviewCounts;
  /** True right after checkout, until the webhook has unlocked the plan. */
  activating: boolean;
  /** True right after checkout once the plan is active: shows the unlocked welcome. */
  justUnlocked: boolean;
  /** Whether the API key exists and whether the CLI has used it. */
  token: { exists: boolean; used: boolean };
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
      body: "Create an API key to add Pro items with the shadcn CLI.",
    },
    {
      href: "/dashboard/orders",
      icon: Receipt,
      title: "Orders and receipts",
      body: "Everything you've bought, with the amount and date.",
    },
  ];

  const visibleLinks = plan.hasAccess ? links.filter((l) => l.href !== "/dashboard/api-key") : links;

  // What a Pro member can do, in the order that gets them value fastest. The first two know whether
  // they're done (the token exists; the CLI has used it); the rest are things to try.
  const steps = [
    {
      key: "token",
      title: "Create your API key",
      body: "One key lets the shadcn CLI add Pro components and blocks to any project.",
      href: "/dashboard/api-key",
      cta: token.exists ? "View key" : "Create key",
      done: token.exists,
    },
    {
      key: "install",
      title: "Install your first Pro component",
      body: "Open a Pro component and run its one-line install. This turns green once the CLI has used your key.",
      href: "/components?access=pro",
      cta: "Pick a component",
      done: token.used,
    },
    {
      key: "prompt",
      title: "Copy a build prompt",
      body: "Every Pro component has the exact brief to rebuild it with Claude, Cursor or v0.",
      href: "/components?access=pro",
      cta: "Try one",
      done: null,
    },
    {
      key: "template",
      title: "Start from a template",
      body: "Open any template and use Download source to get the whole landing page.",
      href: "/templates",
      cta: "Browse templates",
      done: null,
    },
  ] as const;
  const nextKey = steps.find((s) => s.done === false)?.key ?? null;

  return (
    <DashboardPage>
      <PageHeader
        title={`Hi, ${firstName}`}
        description={plan.hasAccess ? "Your plan includes every Pro component, template and block." : "You're on the free plan."}
      />

      {activating || justUnlocked ? <PurchaseReturnTracker state={activating ? "activating" : "unlocked"} /> : null}
      {activating ? <PlanActivating contact={contact} /> : null}
      {justUnlocked ? (
        <div className="mb-5">
          <Notice tone="success">Payment received. Pro is unlocked, and everything below is yours. Start with the checklist.</Notice>
        </div>
      ) : null}

      <Card className="mb-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            {plan.hasAccess ? (
              <span aria-hidden className="grid size-9 place-items-center rounded-full bg-[#34c759]/16 text-[#248a3d] dark:text-[#30d158]">
                <LockOpen className="size-[18px]" strokeWidth={2.2} />
              </span>
            ) : null}
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
          const all = s.total > 0 && s.yours === s.total;
          return (
            <Card as="li" key={s.label} className="relative p-6">
              <p className="text-[40px] font-bold leading-none tracking-[-0.04em] text-foreground">
                {s.yours}
                {s.yours !== s.total ? <span className="text-[20px] font-semibold text-muted-foreground"> of {s.total}</span> : null}
              </p>
              {all ? (
                <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-[#34c759]/16 px-2 py-0.5 text-[11.5px] font-semibold text-[#248a3d] dark:text-[#30d158]">
                  <Check className="size-3" strokeWidth={3} aria-hidden />
                  All unlocked
                </span>
              ) : null}
              <p className="mt-2 text-[14.5px] text-body">{s.label} you can use</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted" role="presentation">
                <div className={cn("h-full rounded-full", all ? "bg-[#34c759]" : "bg-action")} style={{ width: `${pct}%` }} />
              </div>
            </Card>
          );
        })}
      </ul>

      {plan.hasAccess ? (
        <Card className="mt-5">
          <div className="flex items-center gap-2.5">
            <Sparkles className="size-[18px] text-[#248a3d] dark:text-[#30d158]" aria-hidden />
            <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-foreground">What to do with Pro</h2>
          </div>
          <ol className="mt-4 divide-y divide-border">
            {steps.map((step, i) => (
              <li key={step.key} className="flex items-start gap-4 py-4 first:pt-1 last:pb-1">
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-semibold",
                    step.done ? "bg-[#34c759] text-white" : step.key === nextKey ? "bg-action text-white" : "bg-muted text-muted-foreground",
                  )}
                >
                  {step.done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-[16px] font-semibold text-foreground">
                    {step.title}
                    {step.done ? (
                      <span className="rounded-full bg-[#34c759]/16 px-2 py-0.5 text-[11.5px] font-semibold text-[#248a3d] dark:text-[#30d158]">Done</span>
                    ) : step.key === nextKey ? (
                      <span className="rounded-full bg-action/10 px-2 py-0.5 text-[11.5px] font-semibold text-link">Next</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-[14.5px] leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
                <Link
                  href={step.href}
                  className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-[14px] font-medium text-link hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {step.cta}
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ol>
        </Card>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {visibleLinks.map(({ href, icon: Icon, title, body }) => (
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
