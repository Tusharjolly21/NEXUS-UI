"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Crown,
  Eye,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { templates, type TemplateCategory } from "@/lib/catalog/templates";
import { cn } from "@/lib/utils";
import { TemplateSceneLoader } from "@/components/templates/template-scene-loader";

type FilterCat = "all" | TemplateCategory;
const ALL_CATS = ["all", ...Array.from(new Set(templates.map((t) => t.category)))] as FilterCat[];

export default function TemplatesPage() {
  const [cat, setCat] = React.useState<FilterCat>("all");
  const reduce = useReducedMotion() === true;

  const sorted = React.useMemo(
    () => [...templates].sort((a, b) => b.trendingScore - a.trendingScore),
    [],
  );

  const filtered = React.useMemo(
    () => (cat === "all" ? sorted : sorted.filter((t) => t.category === cat)),
    [sorted, cat],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex gap-0 lg:gap-14">

        {/* ────────────── Sticky Sidebar ────────────── */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-20 space-y-7 pb-16 pt-10">

            {/* All-Access CTA */}
            <Link
              href="/pricing"
              className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/8 px-3 py-2.5 text-xs font-semibold text-primary transition hover:bg-primary/15 dark:border-primary/20 dark:bg-primary/10"
            >
              <Crown className="size-3.5 shrink-0" />
              Get All-Access
              <ArrowUpRight className="ml-auto size-3 shrink-0" />
            </Link>

            {/* Category filter */}
            <div>
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Categories
              </p>
              <div className="space-y-0.5">
                {ALL_CATS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCat(c)}
                    className={cn(
                      "flex w-full items-center rounded-lg px-3 py-1.5 text-sm transition-colors text-left",
                      cat === c
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <span className="flex-1">{c === "all" ? "All Templates" : c}</span>
                    {c === "all" && (
                      <span className="text-[11px] text-muted-foreground">{templates.length}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Template quick-nav */}
            <div>
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Templates
              </p>
              <div className="space-y-0.5">
                {filtered.map((t) => (
                  <a
                    key={t.slug}
                    href={`#tmpl-${t.slug}`}
                    className="flex items-center rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  >
                    <span className="line-clamp-1 flex-1">{t.title}</span>
                    {t.premium && <Sparkles className="ml-1 size-3 shrink-0 text-amber-400" />}
                  </a>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* ────────────── Main Content ────────────── */}
        <main className="min-w-0 flex-1 py-10">

          {/* Page heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Templates</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">{filtered.length}</span>{" "}
              template{filtered.length !== 1 && "s"}
              {cat !== "all" && (
                <>
                  {" "}in{" "}
                  <span className="font-medium text-foreground">{cat}</span>
                  <button
                    type="button"
                    onClick={() => setCat("all")}
                    aria-label="Clear filter"
                    className="ml-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="inline size-3" />
                  </button>
                </>
              )}
            </p>

            {/* Mobile category pills */}
            <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
              {ALL_CATS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    cat === c
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  {c === "all" ? "All" : c}
                </button>
              ))}
            </div>
          </div>

          {/* Template rows */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/15 px-6 py-16 text-center">
              <Search className="mx-auto size-10 text-muted-foreground/30" />
              <p className="mt-4 text-base font-semibold text-foreground">No templates found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try selecting a different category.</p>
              <button
                type="button"
                onClick={() => setCat("all")}
                className="mt-5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                Show all
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map((tmpl, i) => (
                <motion.div
                  key={tmpl.slug}
                  id={`tmpl-${tmpl.slug}`}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.045, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="py-8"
                >
                  {/* Row header */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-foreground">{tmpl.title}</h2>
                        <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                          {tmpl.category}
                        </span>
                        {tmpl.premium ? (
                          <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                            <Sparkles className="size-2.5" />
                            Premium
                          </span>
                        ) : (
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
                            Free
                          </span>
                        )}
                      </div>
                      <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                        {tmpl.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {tmpl.techStack.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            className="rounded-md border border-border/50 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground dark:bg-white/3"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex shrink-0 flex-row gap-2 sm:flex-col sm:items-end">
                      <a
                        href={`/live-preview/template/${tmpl.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-3.5 py-2 text-xs font-medium text-foreground transition hover:border-border hover:bg-muted dark:bg-white/3"
                      >
                        <Eye className="size-3.5" />
                        Live Preview
                        <ArrowUpRight className="size-3" />
                      </a>
                      <Link
                        href={`/templates/${tmpl.slug}`}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition",
                          tmpl.premium
                            ? "bg-foreground text-background hover:bg-foreground/90"
                            : "border border-border/70 bg-background hover:bg-muted dark:bg-white/3",
                        )}
                      >
                        {tmpl.premium ? "Buy now →" : "Get free →"}
                      </Link>
                    </div>
                  </div>

                  {/* Preview area */}
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="col-span-2 overflow-hidden rounded-xl border border-border/60 bg-background">
                      <div className="flex h-7 items-center gap-1.5 border-b border-border/50 bg-muted/50 px-3">
                        <span className="size-2 rounded-full bg-red-400/70" />
                        <span className="size-2 rounded-full bg-yellow-400/70" />
                        <span className="size-2 rounded-full bg-green-400/70" />
                        <span className="ml-2 font-mono text-[9px] text-muted-foreground/50">
                          /{tmpl.slug}
                        </span>
                      </div>
                      <div className="relative h-44 overflow-hidden">
                        <div className="pointer-events-none origin-top-left scale-[0.46] w-[217%] will-change-transform">
                          <TemplateSceneLoader slug={tmpl.slug} />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex-1 rounded-xl border border-border/60 bg-muted/20 p-3 dark:bg-white/2">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                          Pages
                        </p>
                        <div className="space-y-1.5">
                          {tmpl.pageLabels.slice(0, 4).map((label) => (
                            <div key={label} className="flex items-center gap-1.5 text-xs text-foreground/70">
                              <span className="size-1.5 shrink-0 rounded-full bg-border" />
                              {label}
                            </div>
                          ))}
                          {tmpl.pageLabels.length > 4 && (
                            <p className="text-[11px] text-muted-foreground">
                              +{tmpl.pageLabels.length - 4} more
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-3 dark:bg-white/2">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                          Difficulty
                        </p>
                        <p className="text-xs font-medium text-foreground">{tmpl.difficulty}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {tmpl.sections.length} sections
                        </p>
                      </div>
                    </div>
                  </div>

                </motion.div>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          {filtered.length > 0 && (
            <div className="mt-8 flex flex-col items-center gap-4 border-t border-border/50 pt-8 sm:flex-row sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Ready to ship everywhere? Unlock unlimited downloads and lifetime premium access.
              </p>
              <Link
                href="/pricing"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:bg-foreground/90"
              >
                <Sparkles className="size-3.5" />
                Upgrade to All-Access
              </Link>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
