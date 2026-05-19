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

export default function ComponentsPage() {
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
              Components
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Production-ready UI components for modern product interfaces.
              Animated, accessible, and built to ship.
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
                  {visibleComponents.length}
                </span>{" "}
                component{visibleComponents.length !== 1 && "s"}
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
            <section className="grid gap-10 lg:grid-cols-2 xl:gap-x-12 xl:gap-y-14">
              {visibleComponents.map((comp, index) => (
                <ComponentCard
                  key={comp.slug}
                  comp={comp}
                  index={index}
                  reduceMotion={reduce}
                  isTrending={sort === "trending" && index < 5}
                />
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
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
  const Preview = comp.Preview;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.035, 0.28),
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full"
    >
      <div
        id={comp.slug}
        className="group relative flex h-full flex-col overflow-hidden rounded-[28px] bg-muted/55 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] transition duration-300 hover:-translate-y-1 hover:bg-muted/70 hover:shadow-2xl hover:shadow-foreground/10 dark:bg-white/[0.055] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] dark:hover:bg-white/[0.075]"
      >
        <div className="relative p-2.5">
          <div className="relative h-[260px] overflow-hidden rounded-[22px] border border-border/70 bg-zinc-950 shadow-inner sm:h-[300px] xl:h-[320px] dark:border-white/10">
            <div className="pointer-events-none absolute inset-x-0 top-0 w-full">
              <Preview compact />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-950 to-transparent" />

            {/* Trending flame badge — top-right, animates in */}
            {isTrending && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "absolute top-3.5 right-3.5 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold shadow-lg backdrop-blur-sm",
                  "border border-orange-500/30 bg-orange-500/15 text-orange-400",
                  comp.premium && "right-16", // shift left if premium badge also present
                )}
              >
                <Flame className="size-3 fill-current" />
                {index === 0 ? "Hot" : "Trending"}
              </motion.div>
            )}

            {/* Premium badge */}
            {comp.premium && (
              <div className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-border/60 bg-background/95 text-amber-500 shadow-lg shadow-black/10 dark:border-white/10 dark:bg-zinc-950/90">
                <Sparkles className="size-5 fill-current" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col px-8 pb-8 pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              {comp.name}
            </h2>
            {comp.animationKinds.length > 0 && (
              <span className="rounded-lg border border-border/70 bg-background px-2.5 py-1 text-sm font-medium text-foreground shadow-sm dark:bg-white/[0.04]">
                {comp.animationKinds.length} effects
              </span>
            )}
          </div>
          <p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">
            {comp.description}
          </p>
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
            <Badge
              variant="outline"
              className="border-border/70 bg-background/70 text-muted-foreground dark:bg-white/[0.04]"
            >
              {getComponentCategoryLabel(comp.categorySlug)}
            </Badge>
            <Badge
              variant={comp.premium ? "default" : "outline"}
              className={cn(
                comp.premium
                  ? "bg-foreground text-background"
                  : "border-border/70 bg-background/70 text-muted-foreground dark:bg-white/[0.04]",
              )}
            >
              {comp.premium ? "Included with premium" : "Free"}
            </Badge>
            <span className="relative z-10 ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-foreground opacity-0 transition group-hover:opacity-100">
              Open
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>

        <Link
          href={`/components/${comp.slug}`}
          className="absolute inset-0 rounded-[28px]"
          aria-label={`Open ${comp.name}`}
        />
      </div>
    </motion.div>
  );
}
