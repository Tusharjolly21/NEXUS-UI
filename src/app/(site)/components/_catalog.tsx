"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Box,
  Brain,
  Clock,
  Compass,
  CreditCard,
  FileText,
  Flame,
  Layers,
  LayoutGrid,
  PanelLeft,
  Search,
  Sparkles,
  Type,
  X,
  Zap,
} from "lucide-react";
import { libraryComponents } from "@/lib/catalog/library-components";
import { blocks } from "@/lib/catalog/blocks";
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
} from "@/components/library/library-explorer-sidebar";
import { ComponentCardPreview } from "@/components/library/component-card-preview";
import { Badge } from "@/components/ui/badge";
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
import { CatalogSkeleton } from "@/components/library/catalog-skeleton";

type SortMode = "all" | "trending" | "newest";
type AccessMode = "all" | "free" | "pro";
type TypeFilter = "all" | "text" | "background" | "3d" | "motion" | "cards" | "forms" | "navigation" | "ai";

const CATEGORY_ORDER = COMPONENT_CATEGORIES.map((c) => c.slug) as ComponentCategorySlug[];

const FEATURED_BLOCK_SLUGS = ["block-interactive-dots", "block-why-choose-us", "block-faq-folder-card"];
const featuredBlocks = blocks.filter((b) => FEATURED_BLOCK_SLUGS.includes(b.slug));

type TypeFilterDef = { value: TypeFilter; label: string; icon: React.ReactNode; match: (comp: (typeof libraryComponents)[number]) => boolean };
const TYPE_FILTERS: TypeFilterDef[] = [
  { value: "all",        label: "All",        icon: <LayoutGrid className="size-3.5" />, match: () => true },
  { value: "text",       label: "Text",       icon: <Type className="size-3.5" />,       match: (c) => c.tags.some((t) => ["text","typography","typewriter","headline","decode","reveal","typing","warp","underline","highlight","squiggly"].includes(t)) },
  { value: "background", label: "Background", icon: <Layers className="size-3.5" />,     match: (c) => ["background-effects","shaders"].includes(c.categorySlug) || c.tags.some((t) => ["background","particles","beams","stars","starfield","blobs","bloom","aurora","gradient","meteors","shader"].includes(t)) },
  { value: "3d",         label: "3D",         icon: <Box className="size-3.5" />,        match: (c) => c.categorySlug === "three-d-components" || c.tags.some((t) => ["3d","threejs","webgl","globe","orbit","orbital","canvas"].includes(t)) },
  { value: "motion",     label: "Motion",     icon: <Zap className="size-3.5" />,        match: (c) => c.categorySlug === "motion-effects" || c.tags.some((t) => ["magnetic","spring","cursor","spotlight","trails","parallax","framer-motion","animation","animated"].includes(t)) },
  { value: "cards",      label: "Cards",      icon: <CreditCard className="size-3.5" />, match: (c) => ["cards","bento-grids"].includes(c.categorySlug) || c.tags.some((t) => ["card","cards","bento","tilt","glass","stack"].includes(t)) },
  { value: "forms",      label: "Forms",      icon: <FileText className="size-3.5" />,   match: (c) => ["login-forms","signup-forms","contact-sections"].includes(c.categorySlug) || c.tags.some((t) => ["form","forms","input","auth","validation","signup"].includes(t)) },
  { value: "navigation", label: "Navigation", icon: <Compass className="size-3.5" />,   match: (c) => ["navbars","footers","sidebars","dashboards"].includes(c.categorySlug) || c.tags.some((t) => ["dock","navigation","navbar"].includes(t)) },
  { value: "ai",         label: "AI",         icon: <Brain className="size-3.5" />,      match: (c) => c.categorySlug === "ai-components" || c.tags.some((t) => ["ai","copilot","chat"].includes(t)) },
];

const SORT_OPTIONS: { value: SortMode; label: string; icon: React.ReactNode }[] = [
  { value: "all",      label: "All",      icon: <LayoutGrid className="size-3" /> },
  { value: "trending", label: "Trending", icon: <Flame className="size-3" /> },
  { value: "newest",   label: "Newest",   icon: <Clock className="size-3" /> },
];

const ACCESS_OPTIONS: { value: AccessMode; label: string; icon?: React.ReactNode }[] = [
  { value: "all",  label: "All" },
  { value: "free", label: "Free" },
  { value: "pro",  label: "Pro", icon: <Sparkles className="size-3" /> },
];

export function ComponentsCatalog() {
  return (
    <React.Suspense fallback={<CatalogSkeleton />}>
      <LibraryExplorerSidebarProvider>
        <ComponentsPageInner />
      </LibraryExplorerSidebarProvider>
    </React.Suspense>
  );
}

function ComponentsPageInner() {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [sort, setSort] = React.useState<SortMode>("all");
  const [access, setAccess] = React.useState<AccessMode>("all");
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>("all");
  const reduce = useReducedMotion() === true;
  const { category, query, premiumOnly, commitParams } = useLibraryExplorerSidebar();

  const normalizedQuery = query.trim().toLowerCase();

  const typeFilterDef = TYPE_FILTERS.find((f) => f.value === typeFilter)!;

  const filteredComponents = React.useMemo(() => {
    return libraryComponents.filter((comp) => {
      const categoryMatch = !category || category === "all" || comp.categorySlug === category;
      const sidebarPremiumMatch = !premiumOnly || comp.premium;
      const accessMatch =
        access === "free" ? !comp.premium :
        access === "pro"  ?  comp.premium :
        true;
      const searchMatch =
        !normalizedQuery ||
        `${comp.name} ${comp.description} ${comp.categorySlug} ${comp.tags.join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery);
      const typeMatch = typeFilter === "all" || typeFilterDef.match(comp);
      return categoryMatch && sidebarPremiumMatch && accessMatch && searchMatch && typeMatch;
    });
  }, [category, normalizedQuery, premiumOnly, access, typeFilter, typeFilterDef]);

  const visibleComponents = React.useMemo(() => {
    if (sort === "trending") {
      return [...filteredComponents].sort((a, b) => b.trendingScore - a.trendingScore);
    }
    if (sort === "newest") {
      return [...filteredComponents].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    return CATEGORY_ORDER.flatMap((cat) =>
      filteredComponents.filter((comp) => comp.categorySlug === cat),
    );
  }, [filteredComponents, sort]);

  const hasActiveFilters =
    (category && category !== "all") || premiumOnly || normalizedQuery || access !== "all" || typeFilter !== "all";

  const clearAll = () => {
    setSort("all");
    setAccess("all");
    setTypeFilter("all");
    commitParams({ cat: null, premium: null, q: null });
  };

  return (
    <div className="flex h-[calc(100dvh-4rem)] overflow-hidden lg:flex-row">
      <aside className="relative hidden w-[272px] shrink-0 border-r border-border/40 lg:flex lg:flex-col">
        <LibraryExplorerSidebarDesktopChrome />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {/* Mobile top bar */}
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
          <span className="text-xs font-medium text-muted-foreground">Components catalog</span>
        </div>

        <main className="mx-auto w-full max-w-[1480px] px-4 py-10 sm:px-6 lg:px-10 lg:py-16 xl:px-14">
          {/* Heading */}
          <section className="pb-10 lg:pb-14">
            <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Next.js and React Components
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Animated building blocks for modern user interfaces. Every component is built for the
              Next.js App Router, supports server side rendering, ships with full TypeScript types,
              and is compatible with shadcn/ui. Improve developer experience with copy-paste
              react components — free and pro tiers available.
            </p>
          </section>

          {/* ── Filter bar ── */}
          <div className="mb-8 flex flex-wrap items-center gap-2 rounded-2xl border border-border/50 bg-muted/30 p-2 dark:bg-white/[0.03] sm:gap-3 sm:p-2.5">
            {/* Sort group */}
            <div className="flex items-center gap-1">
              {SORT_OPTIONS.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSort(value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-150",
                    sort === value
                      ? "bg-background text-foreground shadow-sm dark:bg-white/10"
                      : "text-muted-foreground hover:bg-background/60 hover:text-foreground dark:hover:bg-white/5",
                  )}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="h-5 w-px shrink-0 bg-border/60" />

            {/* Access group */}
            <div className="flex items-center gap-1">
              {ACCESS_OPTIONS.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAccess(value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-150",
                    access === value
                      ? value === "pro"
                        ? "bg-amber-500/15 text-amber-600 shadow-sm dark:text-amber-400"
                        : "bg-background text-foreground shadow-sm dark:bg-white/10"
                      : "text-muted-foreground hover:bg-background/60 hover:text-foreground dark:hover:bg-white/5",
                  )}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {/* Spacer + count + clear */}
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-xs text-muted-foreground sm:inline">
                <span className="font-semibold tabular-nums text-foreground">
                  {visibleComponents.length + featuredBlocks.length}
                </span>{" "}
                component{visibleComponents.length + featuredBlocks.length !== 1 && "s"}
              </span>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted dark:bg-white/5"
                >
                  <X className="size-3" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* ── Type filter pills ── */}
          <div className="mb-8 -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
            {TYPE_FILTERS.map(({ value, label, icon }) => {
              const active = typeFilter === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTypeFilter(value)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150",
                    active
                      ? "border-foreground bg-foreground text-background shadow-sm"
                      : "border-border/60 bg-background/60 text-muted-foreground hover:border-foreground/30 hover:bg-muted hover:text-foreground dark:bg-white/[0.04] dark:hover:bg-white/[0.08]",
                  )}
                >
                  {icon}
                  {label}
                </button>
              );
            })}
          </div>

          {/* Active sidebar-filter chips (category / query) */}
          {(category && category !== "all" || premiumOnly || normalizedQuery) && (
            <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">{visibleComponents.length}</span>{" "}
              result{visibleComponents.length !== 1 && "s"}
              {category && category !== "all" && (
                <Badge variant="outline" className="border-border/70 text-muted-foreground">
                  {getComponentCategoryLabel(category as ComponentCategorySlug)}
                </Badge>
              )}
              {premiumOnly && (
                <Badge className="bg-foreground text-background">Premium only</Badge>
              )}
            </div>
          )}

          {/* Grid */}
          {visibleComponents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/15 px-6 py-16 text-center">
              <Search className="mx-auto size-10 text-muted-foreground/30" />
              <p className="mt-4 text-base font-semibold text-foreground">No components found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try another category, search, or access filter.
              </p>
            </div>
          ) : (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {visibleComponents.map((comp, index) => (
                <ComponentCard
                  key={comp.slug}
                  comp={comp}
                  index={index}
                  reduceMotion={reduce}
                  isTrending={sort === "trending" && index < 5}
                />
              ))}
              {featuredBlocks.map((block, i) => (
                <BlockCard
                  key={block.slug}
                  block={block}
                  index={visibleComponents.length + i}
                  reduceMotion={reduce}
                />
              ))}
            </section>
          )}

          {/* ── About the library ── */}
          <section className="mt-20 border-t border-border/50 pt-16">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                About Nexus UI — Next.js and React components
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Nexus UI is a component library built specifically for the Next.js App Router. Every
                component is written as a TypeScript React component, styled with Tailwind CSS, and
                animated with Framer Motion. The library covers the full spectrum of building blocks
                you need for modern user interfaces: hero sections, feature grids, pricing tables,
                testimonial carousels, navigation bars, interactive backgrounds, and more.
              </p>

              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Server side rendering and client components
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Next.js gives every React component a rendering context. Static sections — headers,
                    footers, content blocks — render on the server and arrive as plain HTML, keeping
                    initial page loads fast. Interactive components that need state, events, or
                    animation opt into the client side with a single directive. Nexus UI components are
                    designed around this split: each component is clearly marked as server-compatible
                    or client-side, so you always know what to expect in production.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Developer experience first
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Components are delivered as source code you install directly into your project via
                    the shadcn registry. No runtime dependency, no version lock-in — you own the code.
                    Full TypeScript types mean your editor catches prop errors before the browser does.
                    Every component respects the user&apos;s <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">prefers-reduced-motion</code> preference
                    out of the box, so accessibility is the default, not an afterthought.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Built for react applications at scale
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    React applications grow in complexity over time. A component catalogue that treats
                    every piece as an independent building block makes that growth manageable. You can
                    swap a hero section, redesign a pricing block, or replace a navigation bar without
                    touching the rest of the page. Nexus UI is structured so that each component is
                    self-contained: its own styles, its own animation logic, its own TypeScript
                    interface. The result is a library that scales with your product rather than
                    fighting against it.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Libraries and frameworks compatibility
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Nexus UI sits on top of shadcn/ui, which itself builds on Radix UI primitives.
                    This layered approach means components inherit accessible keyboard navigation and
                    ARIA semantics from the ecosystem&apos;s most battle-tested libraries and frameworks.
                    Framer Motion handles all animation — spring physics, enter/exit transitions,
                    scroll-driven effects — while staying completely optional: if a section needs no
                    motion, there is no Framer Motion import and no extra JavaScript weight.
                  </p>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="text-base font-semibold text-foreground">
                  What user experience looks like in practice
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Great user experience in a Next.js product is the sum of many small decisions:
                  how fast the first byte arrives, whether the layout shifts during hydration, whether
                  animations feel natural or mechanical, whether the page reads well at every viewport
                  width. Nexus UI components are designed with each of these decisions already made.
                  Motion curves are tuned to feel responsive without being distracting. Layout uses
                  Tailwind CSS utility classes that compile to minimal CSS at build time. Components
                  that fetch data do so at the server level, so the client side receives ready-to-render
                  HTML rather than loading spinners and empty containers. The goal is a catalog of
                  react components that feel production-ready from the first paste.
                </p>
                <div className="mt-6 flex gap-3">
                  <Link
                    href="/docs/installation"
                    className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-foreground/90"
                  >
                    Get started
                    <ArrowRight className="size-3.5" />
                  </Link>
                  <Link
                    href="/blocks"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                  >
                    Browse blocks
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function BlockCard({
  block,
  index,
  reduceMotion,
}: {
  block: (typeof featuredBlocks)[number];
  index: number;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.2), duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4, boxShadow: "0 24px 64px -20px rgba(15,23,42,0.18)" }}
      className="group relative h-full"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-black/7 bg-white shadow-[0_2px_16px_-4px_rgba(15,23,42,0.10)] transition-all duration-300 hover:border-black/12 hover:shadow-[0_8px_32px_-8px_rgba(15,23,42,0.18)] dark:border-white/8 dark:bg-[#151517] dark:shadow-none dark:hover:border-white/14">
        {/* Preview */}
        <div className="relative p-3 pb-0">
          <ComponentCardPreview Preview={block.Preview} />
          <div className="absolute left-5 top-5 inline-flex items-center gap-1 rounded-md border border-indigo-400/30 bg-black/75 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 backdrop-blur-sm">
            Blocks
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col px-5 pb-4 pt-5">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h2 className="line-clamp-1 text-[17px] font-bold leading-snug tracking-[-0.02em] text-slate-800 dark:text-white">
              {block.name}
            </h2>
            <span className="mt-0.5 shrink-0 text-[13px] font-medium text-slate-400 dark:text-white/40">
              {block.category}
            </span>
          </div>
          <p className="line-clamp-2 text-[13px] leading-[1.6] text-slate-400 dark:text-white/40">
            {block.description}
          </p>
        </div>

        {/* CTA */}
        <div className="border-t border-black/5 px-5 py-4 dark:border-white/6">
          <p className="w-full text-center text-[11px] font-bold uppercase tracking-[0.12em] text-slate-700 transition-colors duration-200 group-hover:text-slate-900 dark:text-white/60 dark:group-hover:text-white">
            View Block
          </p>
        </div>
      </div>

      <Link
        href={`/blocks/${block.slug}`}
        className="absolute inset-0 rounded-[24px]"
        aria-label={`Open ${block.name}`}
      >
        <span className="sr-only">View {block.name}</span>
      </Link>
    </motion.div>
  );
}

function ComponentCard({
  comp,
  index,
  reduceMotion,
  isTrending = false,
}: {
  comp: (typeof libraryComponents)[number];
  index: number;
  reduceMotion: boolean;
  isTrending?: boolean;
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.2), duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4, boxShadow: "0 24px 64px -20px rgba(15,23,42,0.18)" }}
      className="group relative h-full"
    >
      <div
        id={comp.slug}
        className="flex h-full flex-col overflow-hidden rounded-[24px] border border-black/7 bg-white shadow-[0_2px_16px_-4px_rgba(15,23,42,0.10)] transition-all duration-300 hover:border-black/12 hover:shadow-[0_8px_32px_-8px_rgba(15,23,42,0.18)] dark:border-white/8 dark:bg-[#151517] dark:shadow-none dark:hover:border-white/14"
      >
        {/* Preview */}
        <div className="relative p-3 pb-0">
          <ComponentCardPreview Preview={comp.Preview} />
          {isTrending && (
            <div className="absolute left-5 top-5 inline-flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/15 px-2 py-0.5 text-[10px] font-semibold text-orange-400 backdrop-blur-sm">
              <Flame className="size-3 fill-current" />
              {index === 0 ? "Hot" : "Trending"}
            </div>
          )}
          {comp.premium && (
            <div className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-amber-400 backdrop-blur-sm">
              <Sparkles className="size-2.5 fill-current" /> Pro
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col px-5 pb-4 pt-5">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h2 className="line-clamp-1 text-[17px] font-bold leading-snug tracking-[-0.02em] text-slate-800 dark:text-white">
              {comp.name}
            </h2>
            <span className="mt-0.5 shrink-0 text-[13px] font-medium text-slate-400 dark:text-white/40">
              {getComponentCategoryLabel(comp.categorySlug)}
            </span>
          </div>
          <p className="line-clamp-2 text-[13px] leading-[1.6] text-slate-400 dark:text-white/40">
            {comp.description}
          </p>
        </div>

        {/* CTA */}
        <div className="border-t border-black/5 px-5 py-4 dark:border-white/6">
          <p className="w-full text-center text-[11px] font-bold uppercase tracking-[0.12em] text-slate-700 transition-colors duration-200 group-hover:text-slate-900 dark:text-white/60 dark:group-hover:text-white">
            View Component
          </p>
        </div>
      </div>

      <Link
        href={`/components/${comp.slug}`}
        className="absolute inset-0 rounded-[24px]"
        aria-label={`Open ${comp.name}`}
      >
        <span className="sr-only">View {comp.name}</span>
      </Link>
    </motion.div>
  );
}
