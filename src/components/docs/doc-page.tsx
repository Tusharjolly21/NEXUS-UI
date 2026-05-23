"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState, useCallback } from "react";
import { Check, Copy } from "lucide-react";
import { highlight } from "sugar-high";
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
  const ogImage = `${siteConfig.url}/api/og?${new URLSearchParams({ title, description: description.slice(0, 120) }).toString()}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description,
    url: `${siteConfig.url}/docs/${slug}`,
    datePublished,
    image: { "@type": "ImageObject", url: ogImage, width: 1200, height: 630 },
    author: { "@type": "Organization", name: "Nexus UI", url: siteConfig.url },
    publisher: {
      "@type": "Organization",
      name: "Nexus UI",
      url: siteConfig.url,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/nexus-ui-logo.png`, width: 192, height: 192 },
    },
    proficiencyLevel: "Beginner",
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteConfig.url}/docs/${slug}` },
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
  const [copied, setCopied] = useState(false);
  const highlighted = highlight(children);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [children]);

  return (
    <div className="group relative">
      <pre className="doc-code-block overflow-x-auto rounded-xl border border-[#3e3e3e] bg-[#1e1e1e] p-4 text-[13px] leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
      <button
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className={cn(
          "absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md border transition-all duration-200",
          "border-[#3e3e3e] bg-[#2d2d2d] text-[#858585]",
          "opacity-0 group-hover:opacity-100",
          copied
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
            : "hover:border-[#555] hover:bg-[#3a3a3a] hover:text-[#d4d4d4]",
        )}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
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
