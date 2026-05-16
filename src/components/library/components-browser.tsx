"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentType } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Crown,
  Heart,
  Layers,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { libraryComponents } from "@/lib/catalog/library-components";
import { blocks, type BlockCategory } from "@/lib/catalog/blocks";
import { templates } from "@/lib/catalog/templates";
import {
  COMPONENT_CATEGORIES,
  getComponentCategoryLabel,
  type ComponentCategorySlug,
} from "@/lib/catalog/taxonomy";
import {
  LibraryExplorerSidebarProvider,
  LibraryExplorerSidebarDesktopChrome,
  LibraryExplorerSidebarMobileSheetBody,
  useLibraryExplorerSidebar,
  type ExplorerView,
} from "@/components/library/library-explorer-sidebar";
import { cn } from "@/lib/utils";
import { useDiscovery } from "@/hooks/use-discovery";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type FeedItem = {
  kind: "component" | "block" | "template";
  slug: string;
  title: string;
  description: string;
  premium: boolean;
  href: string;
  Preview: ComponentType | null;
  trendingScore: number;
  createdAt: string;
  searchBlob: string;
  componentCategory?: ComponentCategorySlug;
  blockCategory?: BlockCategory;
  tags?: string[];
};

function useCategoryCounts() {
  return React.useMemo(() => {
    const map = new Map<string, number>();
    for (const c of libraryComponents) {
      map.set(c.categorySlug, (map.get(c.categorySlug) ?? 0) + 1);
    }
    return map;
  }, []);
}

function buildBaseFeed(view: ExplorerView): FeedItem[] {
  const comp: FeedItem[] = libraryComponents.map((c) => ({
    kind: "component",
    slug: c.slug,
    title: c.name,
    description: c.description,
    premium: c.premium,
    href: `/components/${c.slug}`,
    Preview: c.Preview,
    trendingScore: c.trendingScore,
    createdAt: c.createdAt,
    searchBlob: `${c.name} ${c.description} ${c.tags.join(" ")}`,
    componentCategory: c.categorySlug,
    tags: c.tags,
  }));
  const blk: FeedItem[] = blocks.map((b, i) => ({
    kind: "block",
    slug: b.slug,
    title: b.name,
    description: b.description,
    premium: b.premium,
    href: `/blocks/${b.slug}`,
    Preview: b.Preview,
    trendingScore: 88 - i,
    createdAt: "2026-04-01",
    searchBlob: `${b.name} ${b.description} ${b.tags.join(" ")}`,
    blockCategory: b.category,
    tags: b.tags,
  }));
  const tmpl: FeedItem[] = templates.map((t) => ({
    kind: "template",
    slug: t.slug,
    title: t.title,
    description: t.description,
    premium: t.premium,
    href: `/templates/${t.slug}`,
    Preview: null,
    trendingScore: t.trendingScore,
    createdAt: t.createdAt,
    searchBlob: `${t.title} ${t.description} ${t.tags.join(" ")}`,
    tags: t.tags,
  }));
  if (view === "components") return comp;
  if (view === "blocks") return blk;
  return [...comp, ...blk, ...tmpl];
}

export function ComponentsBrowser() {
  return (
    <LibraryExplorerSidebarProvider>
      <ComponentsBrowserInner />
    </LibraryExplorerSidebarProvider>
  );
}

// ── Compact component card ────────────────────────────────────────
function ComponentCard({
  item,
  index,
  reduceMotion,
}: {
  item: FeedItem;
  index: number;
  reduceMotion: boolean;
}) {
  const router = useRouter();

  const { isFavorite, toggleFavorite } = useDiscovery();
  const Preview = item.Preview;
  const favKind = item.kind;
  const favorited =
    favKind === "template"
      ? isFavorite("template", item.slug)
      : favKind === "block"
        ? isFavorite("block", item.slug)
        : isFavorite("component", item.slug);

  const kindLabel =
    item.kind === "component" ? "Component" : item.kind === "block" ? "Block" : "Template";

  return (
    <div className="group relative">
      <div
        role="link"
        tabIndex={0}
        className="block h-full cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        onClick={() => router.push(item.href)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") router.push(item.href); }}
      >
        <motion.article
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-32px" }}
          transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.025, 0.2), duration: 0.38 }}
          whileHover={reduceMotion ? undefined : {
            y: -4,
            boxShadow: "0 20px 60px -20px rgba(99, 102, 241, 0.25)",
          }}
          className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:border-foreground/15 hover:shadow-xl hover:shadow-foreground/5 dark:bg-zinc-900/60 dark:hover:border-white/12"
        >
          {/* Preview area */}
          <div className="relative aspect-[4/3] overflow-hidden border-b border-border/50 bg-zinc-950">
            <div className="lf-grid absolute inset-0 opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            {Preview ? (
              <div className="relative flex h-full items-center justify-center p-3">
                <div className="w-full origin-center scale-[0.78] transition-transform duration-300 group-hover:scale-[0.84]">
                  <Preview />
                </div>
              </div>
            ) : (
              <div className="relative flex h-full flex-col items-center justify-center gap-2 text-zinc-600">
                <Layers className="size-8 opacity-40" />
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-50">Template</span>
              </div>
            )}
            {/* Top-left badge */}
            <div className="absolute left-3 top-3">
              {item.premium ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                  <Crown className="size-2.5" /> Pro
                </span>
              ) : (
                <span className="rounded-md border border-white/8 bg-black/60 px-2 py-0.5 text-[10px] text-zinc-400 backdrop-blur-sm">
                  Free
                </span>
              )}
            </div>
          </div>

          {/* Card body */}
          <div className="flex flex-1 flex-col gap-1.5 p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-[14px] font-semibold leading-snug tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary">
                {item.title}
              </h2>
              <span className="mt-0.5 shrink-0 rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {kindLabel}
              </span>
            </div>
            <p className="line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
              {item.description}
            </p>
            <div className="mt-auto flex items-center justify-end pt-3">
              <span className="inline-flex items-center gap-1 text-[12px] font-medium text-primary opacity-70 transition-all duration-200 group-hover:gap-1.5 group-hover:opacity-100">
                View Component <ArrowRight className="size-3" />
              </span>
            </div>
          </div>
        </motion.article>
      </div>

      {/* Favorite button */}
      <button
        type="button"
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        className="absolute right-3 top-3 z-20 grid size-8 place-items-center rounded-full border border-white/10 bg-black/70 text-zinc-400 backdrop-blur-sm transition hover:text-white"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFavorite(favKind, item.slug);
        }}
      >
        <Heart className={cn("size-3.5", favorited && "fill-white text-white")} />
      </button>
    </div>
  );
}

// ── Main browser ──────────────────────────────────────────────────
function ComponentsBrowserInner() {
  const router = useRouter();
  const {
    view,
    category,
    bcat,
    query,
    setQuery,
    sort,
    premiumOnly,
    animFilter,
    setAnimFilter,
    commitParams,
    buildHref,
    setExplorerView,
  } = useLibraryExplorerSidebar();

  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const searchRef = React.useRef<HTMLInputElement>(null);

  const categoryCounts = useCategoryCounts();
  const totalComponents = libraryComponents.length;
  const totalBlocks = blocks.length;
  const reduceMotion = useReducedMotion() === true;
  const premiumCount = React.useMemo(() => libraryComponents.filter((c) => c.premium).length, []);
  const freeCount = libraryComponents.length - premiumCount;

  // ⌘K shortcut
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = React.useMemo(() => {
    let list = buildBaseFeed(view);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((item) => item.searchBlob.toLowerCase().includes(q));
    if (premiumOnly) list = list.filter((item) => item.premium);
    if (view === "components" && category !== "all") {
      list = list.filter((item) => item.kind === "component" && item.componentCategory === category);
    }
    if (view === "blocks" && bcat) {
      list = list.filter((item) => item.kind === "block" && item.blockCategory === bcat);
    }
    if (animFilter.length && (view === "components" || view === "all")) {
      const allowed = new Set(
        libraryComponents
          .filter((c) => animFilter.every((a) => c.animationKinds.includes(a)))
          .map((c) => c.slug),
      );
      list = list.filter((item) => item.kind !== "component" || allowed.has(item.slug));
    }
    if (sort === "trending") {
      list.sort((a, b) => b.trendingScore - a.trendingScore);
    } else {
      list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }
    return list;
  }, [view, query, category, bcat, premiumOnly, animFilter, sort]);

  const hasActiveFilters = query || premiumOnly || animFilter.length > 0 || category !== "all" || !!bcat;

  // Category pills data
  const categoryPills = React.useMemo(() => {
    const pills: { slug: ComponentCategorySlug | "all"; label: string; count: number }[] = [
      { slug: "all", label: "All", count: totalComponents },
    ];
    for (const cat of COMPONENT_CATEGORIES) {
      const count = categoryCounts.get(cat.slug) ?? 0;
      if (count > 0) pills.push({ slug: cat.slug as ComponentCategorySlug, label: cat.label, count });
    }
    return pills;
  }, [categoryCounts, totalComponents]);

  // ── View scope tabs ───────────────────────────────────────────
  const scopeTabs = (
    <div
      role="tablist"
      className="inline-flex gap-0.5 rounded-xl border border-border/50 bg-muted/30 p-0.5 dark:bg-white/4"
    >
      {(["all", "components", "blocks"] as const).map((id) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={view === id}
          onClick={() => setExplorerView(id)}
          className={cn(
            "rounded-lg px-3.5 py-1.5 text-[12px] font-medium capitalize transition-all duration-150",
            view === id
              ? "bg-background text-foreground shadow-sm dark:bg-white/10 dark:text-white"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {id}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      {/* ── CATEGORY PILL STRIP (mobile only) ───────────────────── */}
      {(view === "components" || view === "all") && (
        <div className="sticky top-16 z-20 border-b border-border/40 bg-background/90 backdrop-blur-md lg:hidden">
          <div
            className="flex gap-2 overflow-x-auto px-4 py-2.5 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categoryPills.map((pill) => {
              const active =
                pill.slug === "all"
                  ? view === "components" && category === "all"
                  : view === "components" && category === pill.slug;
              return (
                <Link
                  key={pill.slug}
                  href={
                    pill.slug === "all"
                      ? buildHref({ view: "components", cat: null, bcat: null })
                      : buildHref({ view: "components", cat: pill.slug as ComponentCategorySlug, bcat: null })
                  }
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium whitespace-nowrap transition-all duration-150",
                    active
                      ? "border-foreground/20 bg-foreground/10 text-foreground dark:bg-white/12 dark:border-white/20"
                      : "border-border/50 bg-background/60 text-muted-foreground hover:border-border hover:text-foreground dark:bg-white/[0.03]",
                  )}
                >
                  {pill.label}
                  <span className="ml-1 opacity-50">{pill.count}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── BODY: sidebar + grid ─────────────────────────────────── */}
      <div className="flex flex-1 lg:flex-row">

        {/* Desktop sidebar */}
        <aside className="relative hidden w-[272px] shrink-0 border-r border-border/40 lg:block">
          <div className="sticky top-16 flex h-[calc(100dvh-4rem)] min-h-0 flex-col overflow-hidden">
            <LibraryExplorerSidebarDesktopChrome />
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <section className="relative overflow-hidden border-b border-border/40 px-4 py-10 sm:px-6 lg:py-12">
            <div className="pointer-events-none absolute inset-0 lf-grid opacity-[0.12]" />
            {!reduceMotion && (
              <>
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute left-10 top-6 h-px w-48 bg-gradient-to-r from-transparent via-foreground/35 to-transparent"
                  animate={{ x: [-80, 360], opacity: [0, 1, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute bottom-8 right-12 h-28 w-28 rounded-full border border-foreground/10"
                  animate={{ scale: [0.75, 1.2, 0.75], opacity: [0.14, 0.36, 0.14] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
              </>
            )}
            <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <motion.p
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground"
                >
                  Nexus library
                </motion.p>
                <motion.h1
                  initial={reduceMotion ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-3 text-balance text-5xl font-black tracking-tight text-foreground sm:text-7xl lg:text-8xl"
                >
                  Components
                </motion.h1>
                <motion.p
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.08 }}
                  className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base"
                >
                  Explore motion-ready components, shadcn-compatible blocks, and production templates with live previews.
                </motion.p>
              </div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="w-full max-w-xl xl:max-w-md"
              >
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    ref={searchRef}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        commitParams({ q: query.trim() || null }, true);
                    }}
                    placeholder="Search components, blocks, tags..."
                    className="lf-library-search-input h-12 w-full rounded-xl border border-border/70 bg-background/80 pl-11 pr-16 text-sm text-foreground shadow-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:bg-white/[0.04]"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        commitParams({ q: null }, true);
                      }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <X className="size-3.5" />
                    </button>
                  ) : (
                    <kbd className="absolute right-3.5 top-1/2 hidden -translate-y-1/2 rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
                      ⌘K
                    </kbd>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-border/60 bg-background/70 px-2.5 py-1 text-[11px] text-muted-foreground dark:bg-white/[0.04]">
                    {totalComponents} components
                  </span>
                  <span className="rounded-md border border-border/60 bg-background/70 px-2.5 py-1 text-[11px] text-muted-foreground dark:bg-white/[0.04]">
                    {totalBlocks} blocks
                  </span>
                  <span className="rounded-md border border-border/60 bg-background/70 px-2.5 py-1 text-[11px] text-muted-foreground dark:bg-white/[0.04]">
                    {freeCount} free · {premiumCount} pro
                  </span>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/8 px-2.5 py-1 text-[11px] font-semibold text-primary transition hover:bg-primary/14"
                  >
                    <Crown className="size-3" /> Upgrade
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Controls bar */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="flex items-center justify-between gap-3 border-b border-border/40 bg-background/50 px-4 py-3 sm:px-6 backdrop-blur-sm"
          >
            <p className="text-[12px] text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "result" : "results"}
              {view === "components" && category !== "all" && (
                <span className="ml-1.5 text-muted-foreground/70">
                  · {getComponentCategoryLabel(category as ComponentCategorySlug)}
                </span>
              )}
            </p>

            <div className="flex items-center gap-2">
              <div className="hidden lg:block">{scopeTabs}</div>

              {/* Reset */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); setAnimFilter([]); router.push("/components"); }}
                  className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:text-foreground"
                >
                  <X className="size-3" /> Reset
                </button>
              )}

              {/* Mobile filter sheet */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "h-8 gap-1.5 border-border/60 bg-muted/40 text-[12px] text-foreground backdrop-blur-sm lg:hidden",
                  )}
                >
                  <SlidersHorizontal className="size-3.5" />
                  Filters
                  {(premiumOnly || animFilter.length > 0) && (
                    <span className="ml-0.5 size-1.5 rounded-full bg-primary" />
                  )}
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[min(100%,300px)] border-border/60 bg-background/95 p-0 backdrop-blur-xl"
                >
                  <SheetHeader className="border-b border-border px-4 py-4 text-left">
                    <SheetTitle className="text-sm text-foreground">Filters</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100dvh-7rem)]">
                    <div className="px-4 py-4">
                      <LibraryExplorerSidebarMobileSheetBody onPick={() => setMobileFiltersOpen(false)} />
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </motion.div>

          {/* Desktop category pills */}
          {(view === "components" || view === "all") && (
            <div className="hidden border-b border-border/40 px-4 py-3 sm:px-6 lg:block">
              <div className="flex flex-wrap gap-1.5">
                {categoryPills.map((pill) => {
                  const active =
                    pill.slug === "all"
                      ? view === "components" && category === "all"
                      : view === "components" && category === pill.slug;
                  return (
                    <Link
                      key={pill.slug}
                      href={
                        pill.slug === "all"
                          ? buildHref({ view: "components", cat: null, bcat: null })
                          : buildHref({ view: "components", cat: pill.slug as ComponentCategorySlug, bcat: null })
                      }
                      className={cn(
                        "rounded-full border px-3 py-1 text-[11px] font-medium transition-all duration-150",
                        active
                          ? "border-foreground/20 bg-foreground/10 text-foreground dark:bg-white/10 dark:border-white/18"
                          : "border-border/50 bg-transparent text-muted-foreground hover:border-border hover:text-foreground",
                      )}
                    >
                      {pill.label}
                      <span className="ml-1 opacity-40">{pill.count}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="px-4 pb-20 pt-6 sm:px-6">
            <AnimatePresence mode="wait">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center gap-3 py-24 text-center"
                >
                  <div className="rounded-2xl border border-border/50 bg-muted/30 p-5">
                    <Search className="size-8 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No results found</p>
                  <p className="text-xs text-muted-foreground">Try different keywords or reset filters</p>
                  <button
                    type="button"
                    onClick={() => { setQuery(""); setAnimFilter([]); router.push("/components"); }}
                    className="mt-1 rounded-full border border-border/60 bg-muted/40 px-4 py-1.5 text-xs text-foreground transition hover:bg-muted"
                  >
                    Reset filters
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={false}
                  className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                >
                  {filtered.map((item, index) => (
                    <ComponentCard
                      key={`${item.kind}-${item.slug}`}
                      item={item}
                      index={index}
                      reduceMotion={reduceMotion}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export type { ExplorerView } from "@/components/library/library-explorer-sidebar";
