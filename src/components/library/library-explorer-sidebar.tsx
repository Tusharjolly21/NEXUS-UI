"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { parseAsString, useQueryStates } from "nuqs";
import { ArrowUpRight, Crown, Search } from "lucide-react";
import { blocks, type BlockCategory } from "@/lib/catalog/blocks";
import { libraryComponents } from "@/lib/catalog/library-components";
import { templates } from "@/lib/catalog/templates";
import {
  COMPONENT_SIDEBAR_SECTIONS,
  getComponentCategoryLabel,
  type AnimationKind,
  type CatalogSort,
  type ComponentCategorySlug,
} from "@/lib/catalog/taxonomy";
import { InstallationSidebarLinks } from "@/components/library/installation-sidebar-links";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export type ExplorerView = "all" | "components" | "blocks";

const BLOCK_CATEGORIES: BlockCategory[] = [
  "Hero blocks",
  "Pricing blocks",
  "Testimonials",
  "Feature grids",
  "Logo clouds",
  "Stats sections",
  "CTA sections",
  "Contact sections",
  "Text Animations",
  "Interactive backgrounds",
  "FAQ sections",
  "Blog sections",
  "Navigation",
];

const animations: AnimationKind[] = [
  "parallax",
  "hover",
  "scroll",
  "spring",
  "layout",
  "3d",
  "gradient",
  "magnetic",
];

function useCategoryCounts() {
  return React.useMemo(() => {
    const map = new Map<string, number>();
    for (const c of libraryComponents) {
      map.set(c.categorySlug, (map.get(c.categorySlug) ?? 0) + 1);
    }
    return map;
  }, []);
}

function useBlockCategoryCounts() {
  return React.useMemo(() => {
    const map = new Map<string, number>();
    for (const b of blocks) {
      map.set(b.category, (map.get(b.category) ?? 0) + 1);
    }
    return map;
  }, []);
}

export type LibraryExplorerSidebarContextValue = {
  pathname: string;
  view: ExplorerView;
  category: string;
  bcat: string;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  sort: CatalogSort;
  premiumOnly: boolean;
  animFilter: AnimationKind[];
  setAnimFilter: React.Dispatch<React.SetStateAction<AnimationKind[]>>;
  commitParams: (
    next: Record<string, string | null | undefined>,
    replace?: boolean,
  ) => void;
  buildHref: (updates: Record<string, string | null | undefined>) => string;
  setExplorerView: (next: ExplorerView) => void;
  categoryCounts: Map<string, number>;
  blockCategoryCounts: Map<string, number>;
  totalComponents: number;
  totalBlocks: number;
};

const LibraryExplorerSidebarContext =
  React.createContext<LibraryExplorerSidebarContextValue | null>(null);

function getCatalogBasePath(pathname: string) {
  if (pathname === "/blocks") return "/blocks";
  if (pathname === "/templates") return "/templates";
  return "/components";
}

export function useLibraryExplorerSidebar() {
  const ctx = React.useContext(LibraryExplorerSidebarContext);
  if (!ctx) {
    throw new Error(
      "useLibraryExplorerSidebar must be used within LibraryExplorerSidebarProvider",
    );
  }
  return ctx;
}

const CATALOG_PARSERS = {
  view: parseAsString.withDefault(""),
  cat: parseAsString.withDefault("all"),
  bcat: parseAsString.withDefault(""),
  sort: parseAsString.withDefault("trending"),
  q: parseAsString.withDefault(""),
  premium: parseAsString.withDefault(""),
};

export function LibraryExplorerSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [params, setParams] = useQueryStates(CATALOG_PARSERS, {
    scroll: false,
    history: "push",
  });

  const viewParam = params.view as ExplorerView | "";
  const view: ExplorerView =
    viewParam === "components" || viewParam === "blocks" || viewParam === "all"
      ? viewParam
      : pathname === "/blocks"
        ? "blocks"
        : pathname === "/components"
          ? "components"
          : "all";

  const [query, setQuery] = React.useState(params.q);
  const category = params.cat;
  const bcat = params.bcat;
  const sort = (params.sort as CatalogSort) || "trending";
  const [animFilter, setAnimFilter] = React.useState<AnimationKind[]>([]);
  const premiumOnly = params.premium === "1";

  const categoryCounts = useCategoryCounts();
  const blockCategoryCounts = useBlockCategoryCounts();
  const totalComponents = libraryComponents.length;
  const totalBlocks = blocks.length;

  // Sync URL -> local query (browser back/forward navigation)
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors external browser history into the editable search input
    setQuery(params.q);
  }, [params.q]);

  const commitParams = React.useCallback(
    (next: Record<string, string | null | undefined>, replace = false) => {
      const updates: Partial<Record<keyof typeof CATALOG_PARSERS, string | null>> = {};
      for (const [k, v] of Object.entries(next)) {
        updates[k as keyof typeof CATALOG_PARSERS] =
          v === null || v === undefined || v === "" || v === "all" ? null : v;
      }
      setParams(updates, { history: replace ? "replace" : "push" });
    },
    [setParams],
  );

  const buildHref = React.useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const p = new URLSearchParams();
      if (params.view) p.set("view", params.view);
      if (params.cat && params.cat !== "all") p.set("cat", params.cat);
      if (params.bcat) p.set("bcat", params.bcat);
      if (params.sort && params.sort !== "trending") p.set("sort", params.sort);
      if (params.q) p.set("q", params.q);
      if (params.premium) p.set("premium", params.premium);
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === undefined || v === "" || v === "all") p.delete(k);
        else p.set(k, v);
      }
      const qs = p.toString();
      const basePath = getCatalogBasePath(pathname);
      return qs ? `${basePath}?${qs}` : basePath;
    },
    [pathname, params],
  );

  const setExplorerView = React.useCallback(
    (next: ExplorerView) => {
      if (next === "all") {
        commitParams({ view: null, cat: null, bcat: null });
      } else if (next === "components") {
        commitParams({ view: "components", bcat: null });
      } else {
        commitParams({ view: "blocks", cat: null });
      }
    },
    [commitParams],
  );

  const value = React.useMemo(
    () =>
      ({
        pathname,
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
        categoryCounts,
        blockCategoryCounts,
        totalComponents,
        totalBlocks,
      }) satisfies LibraryExplorerSidebarContextValue,
    [
      pathname,
      view,
      category,
      bcat,
      query,
      sort,
      premiumOnly,
      animFilter,
      commitParams,
      buildHref,
      setExplorerView,
      categoryCounts,
      blockCategoryCounts,
      totalComponents,
      totalBlocks,
    ],
  );

  return (
    <LibraryExplorerSidebarContext.Provider value={value}>
      {children}
    </LibraryExplorerSidebarContext.Provider>
  );
}

function FilterFields({ compact }: { compact?: boolean }) {
  const { view, sort, premiumOnly, animFilter, setAnimFilter, commitParams } =
    useLibraryExplorerSidebar();
  return (
    <div className={cn("space-y-4", compact && "pt-1")}>
      <div className="space-y-2">
        <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Sort
        </Label>
        <Select value={sort} onValueChange={(v) => commitParams({ sort: v })}>
          <SelectTrigger className="h-9 border-border bg-muted text-[13px] text-foreground dark:bg-zinc-900/80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {view !== "components" && (
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-muted-foreground">
          <Checkbox
            checked={premiumOnly}
            onCheckedChange={(v) =>
              commitParams({ premium: v === true ? "1" : null })
            }
          />
          Premium only
        </label>
      )}
      {(view === "components" || view === "all") && (
        <div className="space-y-2">
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Animation
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {animations.map((a) => (
              <label
                key={a}
                className="flex cursor-pointer items-center gap-2 text-[11px] capitalize text-muted-foreground"
              >
                <Checkbox
                  checked={animFilter.includes(a)}
                  onCheckedChange={(checked) => {
                    setAnimFilter((prev) =>
                      checked === true
                        ? [...prev, a]
                        : prev.filter((x) => x !== a),
                    );
                  }}
                />
                {a}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarSearch() {
  const { query, setQuery, commitParams } = useLibraryExplorerSidebar();
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter")
            commitParams({ q: query.trim() || null }, true);
        }}
        placeholder="Search…"
        className="lf-library-search-input h-9 border-border bg-muted pl-8 text-[13px] text-foreground placeholder:text-muted-foreground dark:bg-zinc-900/80"
      />
      <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block dark:bg-zinc-900">
        ⌘K
      </span>
    </div>
  );
}

function SidebarNav({ onPick }: { onPick?: () => void }) {
  const {
    pathname,
    view,
    category,
    bcat,
    buildHref,
    categoryCounts,
    blockCategoryCounts,
    totalComponents,
    totalBlocks,
  } = useLibraryExplorerSidebar();

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 px-1 text-[11px] font-semibold text-muted-foreground">
          Installation
        </p>
        <InstallationSidebarLinks pathname={pathname} onPick={onPick} />
      </div>

      <div>
        <p className="mb-2 px-1 text-[11px] font-semibold text-muted-foreground">
          Templates
        </p>
        <div className="space-y-0.5">
          {templates.slice(0, 8).map((tmpl, index) => (
            <Link
              key={tmpl.slug}
              href={`/templates/${tmpl.slug}`}
              onClick={onPick}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] leading-snug text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground dark:hover:bg-white/5"
            >
              <span className="min-w-0 flex-1 truncate">{tmpl.title}</span>
              {index < 2 && (
                <span className="rounded-sm border border-primary/20 bg-primary/8 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                  New
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 px-1 text-[11px] font-semibold text-muted-foreground">
          Sections and Blocks
        </p>
        <div className="space-y-0.5">
          <Link
            href={buildHref({ view: "blocks", bcat: null, cat: null })}
            onClick={onPick}
            className={cn(
              "flex items-center justify-between rounded-md px-2 py-1.5 text-[13px] transition",
              view === "blocks" && !bcat
                ? "bg-foreground/5 text-foreground dark:bg-white/10"
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground dark:hover:bg-white/5",
            )}
          >
            <span>All blocks</span>
            <span className="text-[11px] text-muted-foreground">{totalBlocks}</span>
          </Link>
          {BLOCK_CATEGORIES.map((cat, index) => {
            const count = blockCategoryCounts.get(cat) ?? 0;
            if (count === 0) return null;
            const active = view === "blocks" && bcat === cat;
            return (
              <Link
                key={cat}
                href={buildHref({ view: "blocks", bcat: cat, cat: null })}
                onClick={onPick}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] leading-snug transition",
                  active
                    ? "bg-foreground/5 text-foreground dark:bg-white/10"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground dark:hover:bg-white/5",
                )}
              >
                <span className="min-w-0 flex-1">{cat}</span>
                {index < 2 && (
                  <span className="rounded-sm border border-primary/20 bg-primary/8 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                    New
                  </span>
                )}
                <span className="shrink-0 text-[11px] text-muted-foreground">{count}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 px-1 text-[11px] font-semibold text-muted-foreground">
          Backgrounds & Effects
        </p>
        <div className="space-y-0.5">
          {COMPONENT_SIDEBAR_SECTIONS.find((s) => s.id === "effects")?.slugs.map((slug, index) => {
            const count = categoryCounts.get(slug) ?? 0;
            const active = view === "components" && category === slug;
            return (
              <Link
                key={slug}
                href={buildHref({ view: "components", cat: slug, bcat: null })}
                onClick={onPick}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] leading-snug transition",
                  active
                    ? "bg-foreground/5 text-foreground dark:bg-white/10"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground dark:hover:bg-white/5",
                )}
              >
                <span className="min-w-0 flex-1">{getComponentCategoryLabel(slug)}</span>
                {index < 2 && (
                  <span className="rounded-sm border border-primary/20 bg-primary/8 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                    New
                  </span>
                )}
                <span className="shrink-0 text-[11px] text-muted-foreground">{count}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 px-1 text-[11px] font-semibold text-muted-foreground">
          Card Components
        </p>
        <div className="space-y-0.5">
          {["cards", "bento-grids", "dashboards", "loaders"].map((slug) => {
            const typedSlug = slug as ComponentCategorySlug;
            const count = categoryCounts.get(typedSlug) ?? 0;
            const active = view === "components" && category === typedSlug;
            return (
              <Link
                key={typedSlug}
                href={buildHref({ view: "components", cat: typedSlug, bcat: null })}
                onClick={onPick}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[13px] leading-snug transition",
                  active
                    ? "bg-foreground/5 text-foreground dark:bg-white/10"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground dark:hover:bg-white/5",
                )}
              >
                <span>{getComponentCategoryLabel(typedSlug)}</span>
                <span className="text-[11px] text-muted-foreground">{count}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 px-1 text-[11px] font-semibold text-muted-foreground">
          Text, Forms & Navigation
        </p>
        <div className="space-y-0.5">
          {[
            "motion-effects",
            "login-forms",
            "signup-forms",
            "contact-sections",
            "navbars",
            "footers",
          ].map((slug) => {
            const typedSlug = slug as ComponentCategorySlug;
            const count = categoryCounts.get(typedSlug) ?? 0;
            const active = view === "components" && category === typedSlug;
            return (
              <Link
                key={typedSlug}
                href={buildHref({ view: "components", cat: typedSlug, bcat: null })}
                onClick={onPick}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[13px] leading-snug transition",
                  active
                    ? "bg-foreground/5 text-foreground dark:bg-white/10"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground dark:hover:bg-white/5",
                )}
              >
                <span>{getComponentCategoryLabel(typedSlug)}</span>
                <span className="text-[11px] text-muted-foreground">{count}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <Link
          href={buildHref({ view: "components", cat: null, bcat: null })}
          onClick={onPick}
          className={cn(
            "mb-3 flex items-center justify-between rounded-md px-2 py-1.5 text-[13px] transition",
            view === "components" && category === "all"
              ? "bg-foreground/5 text-foreground dark:bg-white/10"
              : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground dark:hover:bg-white/5",
          )}
        >
          <span>All components</span>
          <span className="text-[11px] text-muted-foreground">{totalComponents}</span>
        </Link>
        <Accordion defaultValue={["filters"]}>
          <AccordionItem value="filters" className="border-0">
            <AccordionTrigger className="px-1 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-transparent hover:no-underline">
              Filters
            </AccordionTrigger>
            <AccordionContent className="px-1 pb-2">
              <FilterFields />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="border-t border-border pt-4">
        <Link
          href="/search"
          onClick={onPick}
          className="block rounded-md px-2 py-1.5 text-[13px] text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground dark:hover:bg-white/5"
        >
          Advanced search →
        </Link>
      </div>
    </div>
  );
}

export function LibraryExplorerSidebarSearch() {
  return <SidebarSearch />;
}

export function LibraryExplorerFilterFields({
  compact,
}: {
  compact?: boolean;
}) {
  return <FilterFields compact={compact} />;
}

export function LibraryExplorerSidebarDesktopChrome() {
  return (
    <>
      <div className="border-b border-border px-4 py-4">
        <Link
          href="/pricing"
          className="flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/8 px-3 py-2.5 text-xs font-semibold text-primary transition hover:bg-primary/14"
        >
          <Crown className="size-3.5 shrink-0" />
          Get All-Access
          <ArrowUpRight className="ml-auto size-3 shrink-0" />
        </Link>
        <div className="mt-4">
          <SidebarSearch />
        </div>
      </div>
      <ScrollArea className="h-full min-h-0 flex-1 overflow-hidden">
        <div className="px-3 py-5">
          <SidebarNav />
        </div>
      </ScrollArea>
    </>
  );
}

export function LibraryExplorerSidebarMobileSheetBody({
  onPick,
}: {
  onPick?: () => void;
}) {
  return (
    <>
      <div className="mb-4">
        <SidebarSearch />
      </div>
      <SidebarNav onPick={onPick} />
    </>
  );
}
