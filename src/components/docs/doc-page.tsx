"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState, useCallback, useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PACKAGE_MANAGERS, isPackageCommand, toPackageManager, usePackageManager } from "@/components/docs/package-manager";
import { Check, Copy } from "lucide-react";
import { highlight } from "sugar-high";
import { cn } from "@/lib/utils";
import { docSectionId } from "@/lib/doc-anchor";
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
  const id = docSectionId(title);
  return (
    <section className="space-y-4" data-doc-section aria-labelledby={id}>
      <h2 id={id} className="pg-display scroll-mt-28 pt-2 text-[28px] leading-[1.1] text-foreground">
        <a href={`#${id}`} className="rounded-md !text-foreground !no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          {title}
        </a>
      </h2>
      {children}
    </section>
  );
}

/**
 * A code block with a copy button. Shell commands get a package-manager switch (npm, pnpm, yarn,
 * bun) that every command block on every docs page shares and remembers.
 */
export function DocPre({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  const [pm, setPm] = usePackageManager();
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const isCommand = isPackageCommand(children);
  const code = isCommand ? toPackageManager(children, pm) : children;
  const highlighted = highlight(code);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="group relative overflow-hidden rounded-[20px] bg-[#1d1d1f]">
      {isCommand ? (
        <div role="tablist" aria-label="Package manager" className="flex gap-1 border-b border-white/[0.08] px-3 pt-2.5 pb-2">
          {PACKAGE_MANAGERS.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={pm === name}
              onClick={() => setPm(name)}
              className={cn(
                "relative h-8 rounded-full px-3 font-mono text-[12.5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                pm === name ? "text-white" : "text-white/50 hover:text-white/80",
              )}
            >
              {pm === name ? (
                <motion.span
                  layoutId={`${uid}-pm`}
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-white/[0.12]"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 34 }}
                />
              ) : null}
              <span className="relative">{name}</span>
            </button>
          ))}
        </div>
      ) : null}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.pre
          key={isCommand ? pm : "code"}
          initial={reduce ? false : { opacity: 0, y: 6, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(3px)" }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className="doc-code-block overflow-x-auto p-5 pr-14 text-[13.5px] leading-relaxed"
        >
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </motion.pre>
      </AnimatePresence>
      <button
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className={cn(
          "absolute right-3 flex size-8 items-center justify-center rounded-full transition-colors duration-150",
          isCommand ? "bottom-3" : "top-3",
          "bg-white/10 text-white/70 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100",
          copied ? "text-[#34c759]" : "hover:bg-white/20 hover:text-white",
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? "check" : "copy"}
            initial={reduce ? false : { scale: 0.4, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 18 }}
          >
            {copied ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <Copy className="h-3.5 w-3.5" />}
          </motion.span>
        </AnimatePresence>
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
