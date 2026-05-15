"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Crown,
  Eye,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { templates, type TemplateCategory } from "@/lib/catalog/templates";
import { GooeyInput } from "@/components/gooey-input";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TemplateSceneLoader } from "@/components/templates/template-scene-loader";

const categories = [...new Set(templates.map((t) => t.category))] as TemplateCategory[];

export default function TemplatesPage() {
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<TemplateCategory | "all">("all");
  const reduce = useReducedMotion() === true;

  // Sort by trending score descending
  const sorted = React.useMemo(
    () => [...templates].sort((a, b) => b.trendingScore - a.trendingScore),
    [],
  );
  const needle = q.trim().toLowerCase();

  const filtered = React.useMemo(() => {
    return sorted.filter((t) => {
      if (cat !== "all" && t.category !== cat) return false;
      if (!needle) return true;
      return (
        t.title.toLowerCase().includes(needle) ||
        t.description.toLowerCase().includes(needle) ||
        t.category.toLowerCase().includes(needle) ||
        t.tags.some((tag) => tag.toLowerCase().includes(needle)) ||
        t.techStack.some((tech) => tech.toLowerCase().includes(needle))
      );
    });
  }, [sorted, cat, needle]);

  const total = templates.length;
  const premiumCount = templates.filter((t) => t.premium).length;
  const hasFilters = cat !== "all" || needle.length > 0;

  // Extract the top featured template from the filtered set
  const featuredTemplate = filtered.length > 0 ? filtered[0] : null;
  // Secondary templates are the rest
  const secondaryTemplates = filtered.length > 1 ? filtered.slice(1) : [];

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 md:py-14">

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-gradient-to-b from-muted/30 via-muted/15 to-transparent px-6 py-12 dark:from-white/[0.03] dark:via-white/[0.01] sm:px-12 sm:py-16">
        {/* Layered glowing orbs */}
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-primary/10 blur-[96px]" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 size-72 rounded-full bg-fuchsia-500/8 blur-[80px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          {/* Left: heading block */}
          <div className="min-w-0 max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1.5 text-[11px] font-semibold text-primary dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300">
              <Sparkles className="size-3.5" />
              Premium Nexus-UI Curated Layouts
            </div>

            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Production-ready{" "}
              <span className="bg-gradient-to-r from-cyan-500 via-sky-400 to-fuchsia-500 bg-clip-text text-transparent dark:from-cyan-300 dark:to-fuchsia-300">
                landing templates
              </span>
            </h1>

            <p className="text-pretty text-base leading-relaxed text-muted-foreground">
              Explore premium multi-page templates equipped with dynamic motion bounds, interactive pricing structures, and responsive bento arrays. Built with Next.js App Router, Tailwind CSS v4, and Framer Motion.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="rounded-full border border-border/80 bg-background/90 px-3.5 py-1 text-xs font-semibold text-foreground shadow-sm dark:bg-white/[0.05]">
                {total} templates available
              </span>
              <span className="rounded-full border border-border/80 bg-background/90 px-3.5 py-1 text-xs text-muted-foreground shadow-sm dark:bg-white/[0.05]">
                {premiumCount} premium · {total - premiumCount} free
              </span>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3.5 py-1 text-xs font-semibold text-primary transition hover:bg-primary/20 dark:bg-cyan-500/10 dark:border-cyan-500/30 dark:text-cyan-300"
              >
                <Crown className="size-3.5 shrink-0" />
                Get All-Access
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>

          {/* Right: search */}
          <div className="flex w-full shrink-0 flex-col gap-2 sm:max-w-[min(100%,340px)] lg:items-end">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground lg:text-right">
              Quick search
            </p>
            <div className="flex justify-start lg:justify-end">
              <GooeyInput
                placeholder="Search templates…"
                value={q}
                onValueChange={setQ}
                collapsedWidth={135}
                expandedWidth={260}
                expandedOffset={56}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Filter Bar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Filter by category
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCat("all")}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200",
              cat === "all"
                ? "border-primary/50 bg-primary/12 text-foreground shadow-sm dark:bg-primary/20"
                : "border-border/70 bg-muted/30 text-muted-foreground hover:border-primary/30 hover:text-foreground dark:bg-white/[0.02]",
            )}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200",
                cat === c
                  ? "border-primary/50 bg-primary/12 text-foreground shadow-sm dark:bg-primary/20"
                  : "border-border/70 bg-muted/30 text-muted-foreground hover:border-primary/30 hover:text-foreground dark:bg-white/[0.02]",
              )}
            >
              {c}
            </button>
          ))}
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setCat("all");
              }}
              className="inline-flex items-center gap-1 rounded-full border border-border/70 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-destructive/40 hover:text-destructive"
            >
              <X className="size-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Results Summary ── */}
      <p className="text-[12px] text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
        {filtered.length === 1 ? "system template" : "system templates"}
        {cat !== "all" && (
          <>
            {" "}
            in category <span className="font-medium text-foreground">{cat}</span>
          </>
        )}
        {needle && (
          <>
            {" "}
            matching &ldquo;<span className="font-medium text-foreground">{q}</span>&rdquo;
          </>
        )}
      </p>

      {/* ── Grid Layout ── */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/70 bg-muted/15 px-6 py-16 text-center dark:bg-white/[0.015]">
          <Search className="mx-auto size-10 text-muted-foreground/30" />
          <p className="mt-4 text-base font-semibold text-foreground">No templates found</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            We couldn&apos;t find any layouts matching your criteria. Try resetting the active filters.
          </p>
          <button
            type="button"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-6 rounded-full")}
            onClick={() => {
              setQ("");
              setCat("all");
            }}
          >
            Reset criteria
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── Featured Template Spotlight ── */}
          {featuredTemplate && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-background via-muted/20 to-primary/[0.04] shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-xl dark:from-background dark:via-white/[0.02] dark:to-primary/[0.05]">
                {/* Subtle corner badge */}
                <div className="absolute top-0 right-0 hidden rounded-bl-2xl border-b border-l border-primary/30 bg-primary/10 px-4 py-1.5 text-[11px] font-semibold tracking-wider uppercase text-primary lg:block">
                  Featured Spotlight
                </div>

                <div className="grid lg:grid-cols-12">
                  {/* Left info column */}
                  <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="border-border/80 text-[11px] text-muted-foreground">
                          {featuredTemplate.category}
                        </Badge>
                        <Badge variant="outline" className="border-border/80 text-[11px] text-muted-foreground">
                          {featuredTemplate.difficulty}
                        </Badge>
                        {featuredTemplate.premium ? (
                          <Badge className="border border-primary/30 bg-primary/12 text-[11px] text-primary">
                            Premium Access
                          </Badge>
                        ) : (
                          <Badge className="border border-border/60 bg-muted/40 text-[11px] text-foreground">
                            Free Version
                          </Badge>
                        )}
                      </div>

                      <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        {featuredTemplate.title}
                      </h2>

                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {featuredTemplate.description}
                      </p>

                      {/* Tech stack array */}
                      <div className="space-y-2 pt-2">
                        <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                          Engineered Core Stack
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {featuredTemplate.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground dark:bg-white/[0.03]"
                            >
                              <Check className="size-3 text-primary" />
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Included structural modules */}
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                          Architectural Modules
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {featuredTemplate.sections.join(" · ")}
                        </p>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-8 flex flex-wrap items-center gap-2.5">
                      <Link
                        href={`/templates/${featuredTemplate.slug}`}
                        className={cn(
                          buttonVariants(),
                          "rounded-full bg-foreground px-6 font-semibold text-background shadow-sm hover:bg-foreground/90",
                        )}
                      >
                        Inspect Template
                      </Link>
                      <a
                        href={`/template-preview/${featuredTemplate.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "inline-flex items-center gap-1.5 rounded-full border-border/80 bg-background/50 hover:bg-muted",
                        )}
                      >
                        <Eye className="size-3.5" />
                        Live Preview
                        <ArrowUpRight className="size-3" />
                      </a>
                    </div>
                  </div>

                  {/* Right interactive window column */}
                  <div className="flex items-center justify-center border-t border-border/40 bg-muted/30 p-4 lg:col-span-7 lg:border-t-0 lg:border-l dark:bg-black/20">
                    <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border/80 bg-background shadow-2xl dark:bg-zinc-950">
                      {/* macOS window chrome top-bar */}
                      <div className="flex h-9 items-center gap-2 border-b border-border/50 bg-muted/40 px-4 dark:bg-white/[0.02]">
                        <div className="flex gap-1.5">
                          <span className="size-2.5 rounded-full bg-red-500/70" />
                          <span className="size-2.5 rounded-full bg-yellow-500/70" />
                          <span className="size-2.5 rounded-full bg-green-500/70" />
                        </div>
                        <p className="mx-auto text-[10px] font-mono text-muted-foreground/60">
                          nexus-ui.local/{featuredTemplate.slug}
                        </p>
                        <div className="w-9" />
                      </div>

                      {/* Scaled view viewport */}
                      <div className="relative h-64 overflow-hidden sm:h-72">
                        <div className="origin-top-left scale-[0.46] w-[217%] will-change-transform">
                          <TemplateSceneLoader slug={featuredTemplate.slug} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Secondary Templates Grid ── */}
          {secondaryTemplates.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {secondaryTemplates.map((tmpl, i) => (
                <motion.div
                  key={tmpl.slug}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 dark:bg-white/[0.025] dark:hover:border-primary/20"
                >
                  {/* ── Preview thumbnail ── */}
                  <div className="relative overflow-hidden border-b border-border/40 bg-muted/40 dark:bg-zinc-950">
                    {/* Hover reveal overlay */}
                    <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Live Preview button on hover */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <a
                        href={`/template-preview/${tmpl.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition hover:bg-white/20"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye className="size-3.5" />
                        Live Preview
                        <ArrowUpRight className="size-3" />
                      </a>
                    </div>

                    <div className="h-44 overflow-hidden">
                      <div className="origin-top-left scale-[0.46] w-[217%] will-change-transform pointer-events-none">
                        <TemplateSceneLoader slug={tmpl.slug} />
                      </div>
                    </div>
                  </div>

                  {/* ── Card info ── */}
                  <div className="flex flex-1 flex-col p-4">
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                      <div className="flex flex-wrap gap-1">
                        <span className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground">
                          {tmpl.category}
                        </span>
                        <span className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground">
                          {tmpl.difficulty}
                        </span>
                      </div>
                      {tmpl.premium ? (
                        <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                          <Sparkles className="size-2.5" />
                          Premium
                        </span>
                      ) : (
                        <span className="rounded-full border border-border/50 bg-muted/20 px-2 py-0.5 text-[10px] text-muted-foreground">
                          Free
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-1">
                      {tmpl.title}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {tmpl.description}
                    </p>

                    {/* Tech stack */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {tmpl.techStack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md border border-border/40 bg-muted/30 px-1.5 py-0.5 text-[10px] text-muted-foreground dark:bg-white/[0.02]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Features preview */}
                    {tmpl.features?.slice(0, 2).map((f) => (
                      <div key={f} className="mt-1.5 flex items-center gap-1.5">
                        <Check className="size-3 shrink-0 text-primary" />
                        <span className="text-[11px] text-muted-foreground line-clamp-1">{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* ── Footer ── */}
                  <div className="flex items-center justify-between border-t border-border/40 bg-muted/10 px-4 py-2.5 dark:bg-white/[0.01]">
                    <span className="text-[11px] text-muted-foreground">
                      {tmpl.pages.length} pages
                    </span>
                    <Link
                      href={`/templates/${tmpl.slug}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground transition-colors group-hover:text-primary"
                    >
                      View details <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Relevant Deep Dives Rail ── */}
      <section className="mt-16 border-t border-border/60 pt-10">
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
            Relevant Guides & Integration Rails
          </p>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Explore Architecture & Motion Best Practices
          </h2>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Designing Cinematic Scroll Choreography in Next.js",
              href: "/blog",
              category: "Design System Lab",
            },
            {
              title: "Optimizing Client-Server Boundaries with Framer Motion",
              href: "/blog",
              category: "Performance Architecture",
            },
            {
              title: "High-Fidelity Tailwind CSS Tokens for AI Platforms",
              href: "/blog",
              category: "Luminous Aesthetics",
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group flex flex-col justify-between rounded-2xl border border-border/50 bg-muted/20 p-5 transition-all hover:border-primary/30 hover:bg-muted/30 dark:bg-white/[0.015]"
            >
              <div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {item.category}
                </span>
                <p className="mt-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {item.title}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
                Read deep dive{" "}
                <ArrowUpRight className="size-3 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA Block ── */}
      {filtered.length > 0 && (
        <div className="flex flex-col items-center gap-4 border-t border-border/50 pt-8 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Ready to ship everywhere? Unlock unlimited downloads and lifetime premium access.
          </p>
          <Link
            href="/pricing"
            className={cn(
              buttonVariants(),
              "shrink-0 rounded-full bg-foreground px-6 font-semibold text-background hover:bg-foreground/90",
            )}
          >
            <Sparkles className="mr-1.5 size-3.5" />
            Upgrade to All-Access
          </Link>
        </div>
      )}
    </div>
  );
}
