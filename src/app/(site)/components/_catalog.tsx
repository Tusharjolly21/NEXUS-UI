"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ArrowRight,
  Clock,
  Flame,
  LayoutGrid,
  PanelLeft,
  Search,
  SlidersHorizontal,
  X,
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
type InteractionFilter = "all" | "hover" | "cursor" | "press" | "drag" | "scroll" | "type" | "ambient" | "3d";

const CATEGORY_ORDER = COMPONENT_CATEGORIES.map((c) => c.slug) as ComponentCategorySlug[];

const FEATURED_BLOCK_SLUGS = ["block-interactive-dots", "block-why-choose-us", "block-faq-folder-card"];
const featuredBlocks = blocks.filter((b) => FEATURED_BLOCK_SLUGS.includes(b.slug));

type CatalogComponent = (typeof libraryComponents)[number];

const hasTag = (c: CatalogComponent, words: string[]) =>
  c.tags.some((t) => words.includes(t.toLowerCase()));
const hasKind = (c: CatalogComponent, kinds: string[]) =>
  c.animationKinds.some((k) => kinds.includes(k));

// Filter by what the visitor *does* with a component rather than what it is — the sidebar
// already covers categories, so these pills answer "how does it respond?".
const INTERACTION_FILTERS: { value: InteractionFilter; label: string; match: (c: CatalogComponent) => boolean }[] = [
  { value: "all",     label: "All",     match: () => true },
  { value: "hover",   label: "Hover",   match: (c) => hasKind(c, ["hover"]) || hasTag(c, ["hover", "spotlight", "tooltip", "tilt", "glow", "link"]) },
  { value: "cursor",  label: "Cursor",  match: (c) => hasKind(c, ["magnetic"]) || hasTag(c, ["cursor", "pointer", "magnetic", "trail", "spotlight"]) },
  { value: "press",   label: "Press",   match: (c) => hasTag(c, ["button", "modal", "expandable", "flip", "copy", "selection", "cta", "folder", "carousel", "dock", "snap", "disintegrate", "stack"]) },
  { value: "drag",    label: "Drag",    match: (c) => hasTag(c, ["drag", "gesture", "slider", "compare", "before-after", "swipe", "wheel"]) },
  { value: "scroll",  label: "Scroll",  match: (c) => hasKind(c, ["scroll", "parallax"]) || hasTag(c, ["scroll", "parallax", "infinite scroll", "progress"]) },
  { value: "type",    label: "Type",    match: (c) => hasTag(c, ["input", "typing", "keyboard", "search", "form", "forms", "auth", "signup", "chat", "terminal", "command", "phone", "validation"]) },
  { value: "ambient", label: "Ambient", match: (c) => hasTag(c, ["background", "particles", "shader", "ambient", "loop", "stars", "starfield", "meteors", "beams", "blobs", "aurora", "loading", "countdown", "typewriter", "marquee", "orbit"]) },
  { value: "3d",      label: "3D",      match: (c) => c.categorySlug === "three-d-components" || hasKind(c, ["3d"]) || hasTag(c, ["3d", "threejs", "webgl", "globe", "isometric", "depth"]) },
];

const SORT_OPTIONS: { value: SortMode; label: string; icon: React.ReactNode }[] = [
  { value: "all",      label: "All",      icon: <LayoutGrid className="size-3" /> },
  { value: "trending", label: "Trending", icon: <Flame className="size-3" /> },
  { value: "newest",   label: "Newest",   icon: <Clock className="size-3" /> },
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

type GridItem =
  | { type: "component"; comp: (typeof libraryComponents)[number]; index: number }
  | { type: "block"; block: (typeof featuredBlocks)[number]; index: number };

function ComponentsPageInner() {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [sort, setSort] = React.useState<SortMode>("all");
  const [interaction, setInteraction] = React.useState<InteractionFilter>("all");
  const reduce = useReducedMotion() === true;
  const { category, query, commitParams } = useLibraryExplorerSidebar();

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const [cols, setCols] = React.useState(3);
  const [scrollMargin, setScrollMargin] = React.useState(0);

  const normalizedQuery = query.trim().toLowerCase();

  const interactionDef = INTERACTION_FILTERS.find((f) => f.value === interaction)!;

  const filteredComponents = React.useMemo(() => {
    return libraryComponents.filter((comp) => {
      const categoryMatch = !category || category === "all" || comp.categorySlug === category;
      const searchMatch =
        !normalizedQuery ||
        `${comp.name} ${comp.description} ${comp.categorySlug} ${comp.tags.join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery);
      const interactionMatch = interaction === "all" || interactionDef.match(comp);
      return categoryMatch && searchMatch && interactionMatch;
    });
  }, [category, normalizedQuery, interaction, interactionDef]);

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
    (category && category !== "all") || normalizedQuery || interaction !== "all";

  const clearAll = () => {
    setSort("all");
    setInteraction("all");
    commitParams({ cat: null, premium: null, q: null });
  };

  // Track columns from scroll container width
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry?.contentRect.width ?? 0;
      setCols(w >= 1200 ? 3 : w >= 640 ? 2 : 1);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Featured blocks only make sense in the unfiltered wall
  const showFeaturedBlocks = !hasActiveFilters;

  // Group all grid items into rows
  const allItems = React.useMemo<GridItem[]>(() => [
    ...visibleComponents.map((comp, i) => ({ type: "component" as const, comp, index: i })),
    ...(showFeaturedBlocks ? featuredBlocks : []).map((block, i) => ({ type: "block" as const, block, index: visibleComponents.length + i })),
  ], [visibleComponents, showFeaturedBlocks]);
  const totalCount = allItems.length;

  const rows = React.useMemo(() => {
    const result: GridItem[][] = [];
    for (let i = 0; i < allItems.length; i += cols) {
      result.push(allItems.slice(i, i + cols));
    }
    return result;
  }, [allItems, cols]);

  // Measure how far the grid sits below the top of the scroll container
  React.useLayoutEffect(() => {
    const grid = gridRef.current;
    const scroll = scrollRef.current;
    if (!grid || !scroll) return;
    const margin =
      grid.getBoundingClientRect().top -
      scroll.getBoundingClientRect().top +
      scroll.scrollTop;
    setScrollMargin(margin);
  }, [visibleComponents.length, category, normalizedQuery, interaction]);

  // eslint-disable-next-line react-hooks/incompatible-library -- virtualization intentionally supplies imperative measurement helpers
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 360,
    overscan: 3,
    scrollMargin,
  });

  return (
    <div className="flex h-[calc(100dvh-4rem)] overflow-hidden lg:flex-row">
      <aside className="relative hidden w-[272px] shrink-0 border-r border-border/40 lg:flex lg:flex-col">
        <LibraryExplorerSidebarDesktopChrome />
      </aside>

      <div ref={scrollRef} className="flex min-w-0 flex-1 flex-col overflow-y-auto">
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
          {/* Heading — short and centered, Bencho-style; the long-form copy lives below the grid */}
          <section className="flex flex-col items-center pb-10 text-center lg:pb-12">
            <span className="inline-flex h-8 items-center rounded-full border border-border/70 px-3.5 text-[13px] text-muted-foreground">
              <span className="font-medium tabular-nums text-foreground">{libraryComponents.length}</span>
              &nbsp;components
            </span>
            <h1 className="mt-5 text-4xl font-medium tracking-[-0.025em] text-foreground sm:text-[44px] sm:leading-[1.1]">
              Next.js and React Components
            </h1>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Interactive, animated building blocks you can explore and take straight into your
              projects.
            </p>
            <Link
              href="/docs/installation"
              className="mt-6 inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition hover:bg-foreground/90"
            >
              Get started
            </Link>
          </section>

          {/* ── Filters: interaction pills + sort ── */}
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="-mx-1 flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto px-1 pb-0.5 scrollbar-none">
              {INTERACTION_FILTERS.map(({ value, label }) => {
                const active = interaction === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setInteraction(active && value !== "all" ? "all" : value)}
                    className={cn(
                      "inline-flex h-8 shrink-0 items-center rounded-full px-3.5 text-sm transition-colors duration-150",
                      active
                        ? "bg-foreground text-background"
                        : "bg-foreground/[0.06] text-foreground/80 hover:bg-foreground/10 hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-full bg-foreground/[0.06] p-0.5">
                {SORT_OPTIONS.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={sort === value}
                    onClick={() => setSort(value)}
                    className={cn(
                      "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors duration-150",
                      sort === value
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-muted-foreground transition hover:bg-foreground/[0.06] hover:text-foreground"
                >
                  <X className="size-3" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Result summary when anything narrows the wall */}
          {hasActiveFilters && (
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium tabular-nums text-foreground">{totalCount}</span>{" "}
              result{totalCount !== 1 && "s"}
              {category && category !== "all" && (
                <Badge variant="outline" className="border-border/70 text-muted-foreground">
                  {getComponentCategoryLabel(category as ComponentCategorySlug)}
                </Badge>
              )}
            </div>
          )}

          {/* Grid */}
          {visibleComponents.length === 0 ? (
            <div className="rounded-[28px] bg-foreground/[0.04] px-6 py-16 text-center">
              <Search className="mx-auto size-10 text-muted-foreground/30" />
              <p className="mt-4 text-base font-semibold text-foreground">No components found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try another category, search, or interaction.
              </p>
            </div>
          ) : (
            <div
              ref={gridRef}
              style={{ position: "relative", height: rowVirtualizer.getTotalSize() }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className="grid gap-3 pb-3"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                    transform: `translateY(${virtualRow.start - scrollMargin}px)`,
                  }}
                >
                  {rows[virtualRow.index]?.map((item) =>
                    item.type === "component" ? (
                      <BenchCard
                        key={item.comp.slug}
                        id={item.comp.slug}
                        href={`/components/${item.comp.slug}`}
                        name={item.comp.name}
                        Preview={item.comp.Preview}
                        index={item.index}
                        reduceMotion={reduce}
                        badge={
                          sort === "trending" && item.index < 5 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/90 px-2.5 py-1 text-[11px] font-medium text-white">
                              <Flame className="size-3 fill-current" />
                              {item.index === 0 ? "Hot" : "Trending"}
                            </span>
                          ) : null
                        }
                      />
                    ) : (
                      <BenchCard
                        key={item.block.slug}
                        href={`/blocks/${item.block.slug}`}
                        name={item.block.name}
                        Preview={item.block.Preview}
                        index={item.index}
                        reduceMotion={reduce}
                        badge={
                          <span className="inline-flex items-center rounded-full bg-background/75 px-2.5 py-1 text-[11px] font-medium text-foreground/80 backdrop-blur-md">
                            Block
                          </span>
                        }
                      />
                    ),
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── About the library ── */}
          <section className="mt-20 border-t border-border/50 pt-16">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                About Nexus UI — Next.js and React components
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Animated building blocks for modern user interfaces. Every component is built for the
                Next.js App Router, supports server side rendering, ships with full TypeScript types,
                and is compatible with shadcn/ui. Improve developer experience with copy-paste
                react components, available free to use.
              </p>
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

function BenchCard({
  id,
  href,
  name,
  Preview,
  index,
  reduceMotion,
  badge,
}: {
  id?: string;
  href: string;
  name: string;
  Preview: React.ComponentProps<typeof ComponentCardPreview>["Preview"];
  index: number;
  reduceMotion: boolean;
  badge?: React.ReactNode;
}) {
  const animate = !reduceMotion && index < 9;
  return (
    <motion.article
      id={id}
      initial={animate ? { opacity: 0, y: 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={animate ? { delay: Math.min(index * 0.025, 0.2), duration: 0.38, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
      className="group relative isolate overflow-hidden rounded-[28px] bg-foreground/[0.05]"
    >
      <ComponentCardPreview Preview={Preview} frame="bleed" />

      {/* Hairline edge drawn above the preview so dark scenes still read as a tile */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-10 rounded-[28px] ring-1 ring-inset ring-foreground/[0.06] transition-[box-shadow] duration-300 group-hover:ring-foreground/15" />

      {badge ? <div className="pointer-events-none absolute left-3.5 top-3.5 z-10">{badge}</div> : null}

      {/* Veil + labels */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-x-3.5 bottom-3.5 z-10 flex items-end justify-between gap-2">
        <span className="inline-flex h-[38px] min-w-0 items-center truncate rounded-full bg-background/75 px-3.5 text-[12.5px] text-foreground/80 shadow-sm ring-1 ring-inset ring-foreground/5 backdrop-blur-md">
          {name}
        </span>
        <span className="grid size-[38px] shrink-0 translate-y-1 place-items-center rounded-full bg-background/75 text-foreground/70 opacity-0 shadow-sm ring-1 ring-inset ring-foreground/5 backdrop-blur-md transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-has-[:focus-visible]:translate-y-0 group-has-[:focus-visible]:opacity-100">
          <SlidersHorizontal className="size-4" />
        </span>
      </div>

      <Link
        href={href}
        className="absolute inset-0 z-20 rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={`Open ${name}`}
      />
    </motion.article>
  );
}
