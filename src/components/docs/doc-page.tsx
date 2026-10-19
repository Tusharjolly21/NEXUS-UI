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
  "overflow-x-auto rounded-[20px] bg-[#1d1d1f] p-5 font-mono text-[13.5px] leading-relaxed text-[#e6e6ea]";

export const docInlineCodeClass = "rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.88em] text-foreground";

export function DocPageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header>
      <h1 className="pg-display text-[clamp(40px,6vw,60px)] leading-[1.04] text-foreground">{title}</h1>
      <p className="mt-4 text-[19px] leading-[1.55] text-muted-foreground">{description}</p>
    </header>
  );
}

export function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="pg-display pt-2 text-[28px] leading-[1.1] text-foreground">{title}</h2>
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
      <pre className="doc-code-block overflow-x-auto rounded-[20px] bg-[#1d1d1f] p-5 pr-14 text-[13.5px] leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
      <button
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className={cn(
          "absolute right-3 top-3 flex size-8 items-center justify-center rounded-full transition-colors duration-150",
          "bg-white/10 text-white/70 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100",
          copied ? "text-[#34c759]" : "hover:bg-white/20 hover:text-white",
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
    <nav className="grid gap-3 pt-6 sm:grid-cols-2" aria-label="Previous and next page">
      {prev ? (
        <Link href={prev.href} className="pg-float rounded-tile bg-card px-6 py-5 transition-transform hover:-translate-y-0.5 motion-reduce:transition-none">
          <span className="block text-[13px] text-muted-foreground">Previous</span>
          <span className="mt-1 block text-[17px] font-semibold text-foreground">{prev.label}</span>
        </Link>
      ) : (
        <span aria-hidden />
      )}
      {next ? (
        <Link href={next.href} className="pg-float rounded-tile bg-card px-6 py-5 text-right transition-transform hover:-translate-y-0.5 motion-reduce:transition-none">
          <span className="block text-[13px] text-muted-foreground">Next</span>
          <span className="mt-1 block text-[17px] font-semibold text-foreground">{next.label}</span>
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
  // Page bodies were written with 14px muted text; lift paragraphs and lists to a reading size here.
  return (
    <div
      className={cn(
        "max-w-[760px] space-y-12 [&_section_li]:text-[16px] [&_section_li]:leading-[1.65] [&_section_p]:text-[16.5px] [&_section_p]:leading-[1.7] [&_section_p]:text-body [&_section_a]:text-link [&_section_a]:underline-offset-4 [&_section_a:hover]:underline",
        className,
      )}
    >
      {children}
    </div>
  );
}
