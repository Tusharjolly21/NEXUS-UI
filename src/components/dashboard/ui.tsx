import * as React from "react";
import { cn } from "@/lib/utils";

/** Page frame shared by every dashboard page, so width, spacing and headings never drift apart. */
export function DashboardPage({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="px-4 py-8 sm:px-8 sm:py-12">
      <div className={cn("mx-auto max-w-[960px]", className)}>{children}</div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="pg-display text-[clamp(36px,5vw,52px)] text-foreground">{title}</h1>
        {description ? <p className="mt-3 max-w-[560px] text-[17px] leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </header>
  );
}

/** The white tile used across the site. */
export function Card({
  children,
  className,
  as: Tag = "section",
  ...rest
}: React.HTMLAttributes<HTMLElement> & { as?: "section" | "div" | "article" | "li" }) {
  return (
    <Tag className={cn("pg-float rounded-tile bg-card p-6", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function CardTitle({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <h2 className="text-[17px] font-semibold text-foreground">{children}</h2>
      {hint ? <span className="text-[13px] text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

const PILL_TONES = {
  good: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  warn: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  bad: "bg-red-500/12 text-red-700 dark:text-red-400",
  neutral: "bg-muted text-muted-foreground",
} as const;

export type PillTone = keyof typeof PILL_TONES;

export function toneForStatus(status: string): PillTone {
  if (status === "paid" || status === "active") return "good";
  if (status === "past_due" || status === "on_hold" || status === "paused" || status === "pending") return "warn";
  if (status === "refunded" || status === "cancelled" || status === "expired" || status === "failed") return "bad";
  return "neutral";
}

export function StatusPill({ status, label, tone }: { status: string; label?: string; tone?: PillTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold capitalize leading-none",
        PILL_TONES[tone ?? toneForStatus(status)],
      )}
    >
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}

export function Notice({ tone, children }: { tone: "warn" | "info" | "success"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "warn" ? "alert" : "status"}
      className={cn(
        "rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed",
        tone === "warn" && "bg-amber-500/12 text-amber-800 dark:text-amber-300",
        tone === "info" && "bg-muted text-body",
        tone === "success" && "bg-[#34c759]/14 text-[#1d6b30] dark:text-[#7ee2a8]",
      )}
    >
      {children}
    </p>
  );
}

export function EmptyState({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <Card className="flex flex-col items-center px-6 py-16 text-center">
      <h2 className="text-[19px] font-semibold text-foreground">{title}</h2>
      <p className="mt-2 max-w-sm text-[15px] text-muted-foreground">{body}</p>
      {children ? <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div> : null}
    </Card>
  );
}

export function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}
