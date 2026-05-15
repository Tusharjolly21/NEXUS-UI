"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { blocks, type BlockCategory } from "@/lib/catalog/blocks";
import { libraryComponents } from "@/lib/catalog/library-components";
import {
  COMPONENT_SIDEBAR_SECTIONS,
  getComponentCategoryLabel,
  type AnimationKind,
  type CatalogSort,
  type ComponentCategorySlug,
} from "@/lib/catalog/taxonomy";
import { InstallationSidebarLinks } from "@/components/library/installation-sidebar-links";
import { NexusMark } from "@/components/brand";
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
  "FAQ sections",
  "Blog sections",
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

export function useLibraryExplorerSidebar() {
  const ctx = React.useContext(LibraryExplorerSidebarContext);
  if (!ctx) {
    throw new Error(
      "useLibraryExplorerSidebar must be used within LibraryExplorerSidebarProvider",
    );
  }
  return ctx;
}

export function LibraryExplorerSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const viewParam = searchParams.get("view") as ExplorerView | null;
  const view: ExplorerView =
    viewParam === "components" || viewParam === "blocks" ? viewParam : "all";

  const [query, setQuery] = React.useState(searchParams.get("q") ?? "");
  const category = searchParams.get("cat") ?? "all";
  const bcat = searchParams.get("bcat") ?? "";
  const sort = (searchParams.get("sort") as CatalogSort | null) ?? "trending";
  const [animFilter, setAnimFilter] = React.useState<AnimationKind[]>([]);
  const [premiumOnly, setPremiumOnly] = React.useState(
    searchParams.get("premium") === "1",
  );

  const categoryCounts = useCategoryCounts();
  const blockCategoryCounts = useBlockCategoryCounts();
  const totalComponents = libraryComponents.length;
  const totalBlocks = blocks.length;

  React.useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setPremiumOnly(searchParams.get("premium") === "1");
  }, [searchParams]);

  const commitParams = React.useCallback(
    (next: Record<string, string | null | undefined>, replace = false) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([k, v]) => {
        if (v === null || v === undefined || v === "" || v === "all")
          params.delete(k);
        else params.set(k, v);
      });
      const qs = params.toString();
      const url = qs ? `/components?${qs}` : "/components";
      if (replace) router.replace(url);
      else router.push(url);
    },
    [router, searchParams],
  );

  const buildHref = React.useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === undefined || v === "" || v === "all")
          params.delete(k);
        else params.set(k, v);
      }
      const qs = params.toString();
      return qs ? `/components?${qs}` : "/components";
    },
    [searchParams],
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
      <label className="flex cursor-pointer items-center gap-2 text-[13px] text-muted-foreground">
        <Checkbox
          checked={premiumOnly}
          onCheckedChange={(v) =>
            commitParams({ premium: v === true ? "1" : null })
          }
        />
        Premium only
      </label>
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
    <div className="space-y-4">
      <div>
        <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Installation
        </p>
        <InstallationSidebarLinks pathname={pathname} onPick={onPick} />
      </div>

      {(view === "components" || view === "all") && (
        <div className="border-t border-border pt-4">
          <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Component categories
          </p>
          <div className="space-y-3">
            <Link
              href={buildHref({ view: "components", cat: null, bcat: null })}
              onClick={onPick}
              className={cn(
                "flex items-center justify-between rounded-md px-2 py-1.5 text-[13px] transition",
                view === "components" && category === "all"
                  ? "bg-foreground/5 text-foreground dark:bg-white/10"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground dark:hover:bg-white/5",
              )}
            >
              <span>All components</span>
              <span className="text-[11px] text-muted-foreground">
                {totalComponents}
              </span>
            </Link>
            {COMPONENT_SIDEBAR_SECTIONS.map((section) => (
              <details key={section.id} className="group" open>
                <summary className="cursor-pointer list-none px-1 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground marker:hidden [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between">
                    {section.label}
                    <span className="text-muted-foreground transition group-open:rotate-180">
                      ⌄
                    </span>
                  </span>
                </summary>
                <div className="mt-1 space-y-0.5 border-l border-border pl-2">
                  {section.slugs.map((slug) => {
                    const count = categoryCounts.get(slug) ?? 0;
                    const active = view === "components" && category === slug;
                    return (
                      <Link
                        key={slug}
                        href={buildHref({
                          view: "components",
                          cat: slug,
                          bcat: null,
                        })}
                        onClick={onPick}
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-md py-1 pr-1 pl-2 text-[13px] leading-snug transition",
                          active
                            ? "border-l-2 border-primary bg-primary/10 text-foreground dark:border-primary dark:bg-primary/10"
                            : "border-l-2 border-transparent text-muted-foreground hover:text-muted-foreground",
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          {getComponentCategoryLabel(slug)}
                        </span>
                        <span className="shrink-0 tabular-nums text-[11px] text-muted-foreground">
                          {count}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {view === "blocks" && (
        <div className="border-t border-border pt-4">
          <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Block categories
          </p>
          <div className="space-y-0.5">
            <Link
              href={buildHref({ view: "blocks", bcat: null, cat: null })}
              onClick={onPick}
              className={cn(
                "flex items-center justify-between rounded-md px-2 py-1.5 text-[13px] transition",
                !bcat
                  ? "bg-foreground/5 text-foreground dark:bg-white/10"
                  : "text-muted-foreground hover:bg-foreground/5 dark:hover:bg-white/5",
              )}
            >
              <span>All blocks</span>
              <span className="text-[11px] text-muted-foreground">
                {totalBlocks}
              </span>
            </Link>
            {BLOCK_CATEGORIES.map((cat) => {
              const count = blockCategoryCounts.get(cat) ?? 0;
              if (count === 0) return null;
              const active = bcat === cat;
              return (
                <Link
                  key={cat}
                  href={buildHref({
                    view: "blocks",
                    bcat: cat,
                    cat: null,
                  })}
                  onClick={onPick}
                  className={cn(
                    "flex items-center justify-between rounded-md px-2 py-1.5 text-[13px] transition",
                    active
                      ? "bg-foreground/5 text-foreground dark:bg-white/10"
                      : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground dark:hover:bg-white/5",
                  )}
                >
                  <span className="leading-snug">{cat}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-t border-border pt-4">
        <Accordion defaultValue={["filters"]}>
          <AccordionItem value="filters" className="border-0">
            <AccordionTrigger className="px-1 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:bg-transparent hover:no-underline">
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

// type LibraryExplorerSidebarChromeProps = {
//   /** e.g. "Components & blocks" vs "Docs & setup" */
//   subtitle?: string;
// };

export function LibraryExplorerSidebarDesktopChrome({
  subtitle = "Components & blocks",
}: LibraryExplorerSidebarChromeProps) {
  return (
    <>
      {/* <div className="border-b border-border px-4 py-4">
        <Link
          href="/"
          aria-label="Nexus-UI home"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-foreground"
        >
          <NexusMark size={18} />
          <span>Nexus-UI</span>
        </Link>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>
        <div className="mt-4">
          <SidebarSearch />
        </div>
      </div> */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="px-3 py-4">
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
