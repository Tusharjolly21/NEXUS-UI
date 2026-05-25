"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Eye,
  PanelLeft,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { templates, type TemplateCategory } from "@/lib/catalog/templates";
import {
  LibraryExplorerSidebarProvider,
  LibraryExplorerSidebarDesktopChrome,
  LibraryExplorerSidebarMobileSheetBody,
  useLibraryExplorerSidebar,
} from "@/components/library/library-explorer-sidebar";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { TemplateSceneLoader } from "@/components/templates/template-scene-loader";
import { CatalogSkeleton } from "@/components/library/catalog-skeleton";
import Image from "next/image";

type FilterCat = "all" | TemplateCategory;
const ALL_CATS = ["all", ...Array.from(new Set(templates.map((t) => t.category)))] as FilterCat[];

export default function TemplatesPageClient({ isPremium = false, ownedSlugs = [] }: { isPremium?: boolean; ownedSlugs?: string[] }) {
  return (
    <React.Suspense fallback={<CatalogSkeleton />}>
      <LibraryExplorerSidebarProvider>
        <TemplatesPageInner isPremium={isPremium} ownedSlugs={ownedSlugs} />
      </LibraryExplorerSidebarProvider>
    </React.Suspense>
  );
}

function TemplatesPageInner({ isPremium, ownedSlugs }: { isPremium: boolean; ownedSlugs: string[] }) {
  const ownedSet = React.useMemo(() => new Set(ownedSlugs), [ownedSlugs]);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [cat, setCat] = React.useState<FilterCat>("all");
  const reduce = useReducedMotion() === true;
  const { query, premiumOnly, commitParams } = useLibraryExplorerSidebar();

  const normalizedQuery = query.trim().toLowerCase();

  const sorted = React.useMemo(
    () => [...templates].sort((a, b) => b.trendingScore - a.trendingScore),
    [],
  );

  const filtered = React.useMemo(() => {
    return sorted.filter((t) => {
      const catMatch = cat === "all" || t.category === cat;
      const premiumMatch = !premiumOnly || t.premium;
      const searchMatch =
        !normalizedQuery ||
        `${t.title} ${t.description} ${t.category} ${t.techStack.join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery);
      return catMatch && premiumMatch && searchMatch;
    });
  }, [sorted, cat, premiumOnly, normalizedQuery]);

  return (
    <div className="flex h-[calc(100dvh-4rem)] overflow-hidden lg:flex-row">
      <aside className="relative hidden w-[272px] shrink-0 border-r border-border/40 lg:flex lg:flex-col">
        <LibraryExplorerSidebarDesktopChrome />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {/* Mobile nav bar */}
        <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-background/95 px-4 py-2 backdrop-blur-md lg:hidden">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-2 border-border bg-muted dark:bg-zinc-900/80",
              )}
            >
              <PanelLeft className="size-4" />
              Menu
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[min(100%,300px)] border-border bg-background p-0 dark:bg-zinc-950"
            >
              <SheetHeader className="border-b border-border px-4 py-4 text-left">
                <SheetTitle className="text-base text-foreground">Library</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100dvh-7rem)]">
                <div className="px-3 py-4">
                  <LibraryExplorerSidebarMobileSheetBody onPick={() => setMobileNavOpen(false)} />
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <span className="text-xs font-medium text-muted-foreground">Templates catalog</span>
        </div>

        <main className="mx-auto w-full max-w-[1480px] px-4 py-10 sm:px-6 lg:px-10 lg:py-16 xl:px-14">
          {/* Page heading */}
          <section className="pb-16 lg:pb-24">
            <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Next.js Templates
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Full-page Next.js templates built for production. Copy, customize, ship.
            </p>

            {(cat !== "all" || premiumOnly || normalizedQuery) && (
              <div className="mt-7 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">{filtered.length}</span>{" "}
                template{filtered.length !== 1 && "s"}
                {premiumOnly && (
                  <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground">
                    Premium only
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setCat("all");
                    commitParams({ premium: null, q: null });
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-muted"
                >
                  Clear filters <X className="size-3" />
                </button>
              </div>
            )}

            {/* Category pills */}
            <div className="mt-6 flex flex-wrap gap-2">
              {ALL_CATS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    cat === c
                      ? "border-foreground/20 bg-foreground text-background"
                      : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {c === "all" ? "All Templates" : c}
                  {c === "all" && (
                    <span className="ml-1.5 text-[11px] opacity-60">{templates.length}</span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Template showcase cards */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/15 px-6 py-16 text-center">
              <Search className="mx-auto size-10 text-muted-foreground/30" />
              <p className="mt-4 text-base font-semibold text-foreground">No templates found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different category or search term.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filtered.map((tmpl, i) => {
                const listingPreviews = tmpl.previewImages
                  ? tmpl.previewImages.sections.slice(0, 3)
                  : [];

                return (
                  <motion.article
                    key={tmpl.slug}
                    id={`tmpl-${tmpl.slug}`}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.045, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-xl border border-border/55 bg-muted/20 p-4 shadow-sm sm:p-6 lg:p-7 dark:bg-white/[0.02]"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">{tmpl.title}</h2>
                        </div>
                        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                          {tmpl.description}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-0.5">
                          <span className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs text-muted-foreground">
                            {tmpl.category}
                          </span>
                          {tmpl.premium ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-500">
                              <Sparkles className="size-3" />
                              Premium
                            </span>
                          ) : (
                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500">
                              Free
                            </span>
                          )}
                          {tmpl.techStack.slice(0, 3).map((tech) => (
                            <span
                              key={tech}
                              className="rounded-full border border-border/50 bg-background px-2.5 py-1 text-xs text-muted-foreground"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-row gap-2 sm:flex-col sm:items-stretch">
                        <a
                          href={`/live-preview/template/${tmpl.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border/70 bg-background px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                        >
                          <Eye className="size-4" />
                          Live Preview
                        </a>
                        {tmpl.premium && (isPremium || ownedSet.has(tmpl.slug)) ? (
                          <Link
                            href={`/templates/${tmpl.slug}`}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                          >
                            <Check className="size-4" />
                            Access Template
                          </Link>
                        ) : tmpl.premium ? (
                          <Link
                            href={`/templates/${tmpl.slug}`}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:bg-foreground/90"
                          >
                            Buy now
                            <span>$49</span>
                            <span className="text-xs font-normal opacity-55 line-through">$79</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/templates/${tmpl.slug}`}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border/70 bg-background px-5 py-2.5 text-sm font-semibold transition hover:bg-muted"
                          >
                            Get free
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="mt-7 grid gap-4 md:grid-cols-3">
                      {listingPreviews.length > 0 ? (
                        listingPreviews.map((src, previewIndex) => (
                          <Link
                            href={`/templates/${tmpl.slug}`}
                            key={src}
                            className="group relative aspect-[1.06/1] overflow-hidden rounded-lg border border-border/65 bg-background shadow-sm"
                            aria-label={`View ${tmpl.title} preview ${previewIndex + 1}`}
                          >
                            <Image
                              src={src}
                              alt={`${tmpl.title} preview ${previewIndex + 1}`}
                              fill
                              className="object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                              sizes="(max-width: 767px) 100vw, (max-width: 1279px) 33vw, 390px"
                            />
                          </Link>
                        ))
                      ) : (
                        <div className="col-span-full overflow-hidden rounded-lg border border-border/60 bg-background">
                          <div className="flex h-7 items-center gap-1.5 border-b border-border/50 bg-muted/50 px-3">
                            <span className="size-2 rounded-full bg-red-400/70" />
                            <span className="size-2 rounded-full bg-yellow-400/70" />
                            <span className="size-2 rounded-full bg-green-400/70" />
                            <span className="ml-2 font-mono text-[9px] text-muted-foreground/50">
                              /{tmpl.slug}
                            </span>
                          </div>
                          <div className="relative h-64 overflow-hidden">
                            <div className="pointer-events-none w-[217%] origin-top-left scale-[0.46] will-change-transform">
                              <TemplateSceneLoader slug={tmpl.slug} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}

          {/* Bottom CTA */}
          {filtered.length > 0 && !isPremium && (
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
