import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/seo";

export function TechArticleJsonLd({
  title,
  description,
  slug,
  datePublished = "2026-03-01",
}: {
  title: string;
  description: string;
  slug: string;
  datePublished?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description,
    url: `${siteConfig.url}/docs/${slug}`,
    datePublished,
    author: { "@type": "Organization", name: "Nexus UI", url: siteConfig.url },
    publisher: { "@type": "Organization", name: "Nexus UI", url: siteConfig.url },
    proficiencyLevel: "Beginner",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export const docPreClass =
  "overflow-x-auto rounded-xl border border-border bg-muted p-4 text-[13px] leading-relaxed text-foreground/90 dark:bg-zinc-950 dark:text-muted-foreground";

export const docInlineCodeClass =
  "rounded border border-border bg-muted px-1.5 py-0.5 text-[13px] text-foreground";

export function DocPageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary/80">Docs</p>
      <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </header>
  );
}

export function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export function DocPre({ children }: { children: string }) {
  return (
    <pre className={docPreClass}>
      <code>{children}</code>
    </pre>
  );
}

export function DocFooterNav({
  prev,
  next,
}: {
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
}) {
  if (!prev && !next) return null;
  return (
    <nav
      className="flex flex-col gap-3 border-t border-border pt-10 text-sm sm:flex-row sm:items-center sm:justify-between"
      aria-label="Documentation pagination"
    >
      {prev ? (
        <Link href={prev.href} className="text-muted-foreground transition hover:text-foreground">
          ← {prev.label}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} className="text-primary transition hover:underline">
          {next.label} →
        </Link>
      ) : null}
    </nav>
  );
}

export function DocPageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto max-w-3xl space-y-10 px-4 py-14", className)}>{children}</div>;
}
