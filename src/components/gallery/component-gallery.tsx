"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Lock, Search, X } from "lucide-react";
import { Chip, ChipRail } from "@/components/site/chip-rail";
import { cn } from "@/lib/utils";
import { ComponentModal } from "./component-modal";
import { GalleryTile, TileCell, TileGrid } from "./gallery-tile";
import { INTERACTION_FILTERS, type GalleryItem, type Interaction } from "./types";
import { useUrlParam } from "./use-url-param";
import { Pagination, scrollToTop, usePage } from "./pagination";

export type CategoryFilter = { id: string; label: string };

type Access = "all" | "free" | "pro";
const ACCESS: Access[] = ["all", "free", "pro"];

/** All / Free / Pro, as a segmented control with a sliding thumb. */
function AccessSwitch({ value, onChange, counts }: { value: Access; onChange: (v: Access) => void; counts: Record<Access, number> }) {
  const id = React.useId();
  const reduce = useReducedMotion();
  const label: Record<Access, string> = { all: "All", free: "Free", pro: "Pro" };
  return (
    <div role="radiogroup" aria-label="Show free or Pro components" className="pg-float inline-flex h-[52px] shrink-0 items-center gap-0.5 rounded-full bg-card p-1.5">
      {ACCESS.map((a) => {
        const on = value === a;
        return (
          <button
            key={a}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(a)}
            className={cn(
              "relative inline-flex h-full items-center gap-1.5 rounded-full px-4 text-[14px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              on ? "text-background" : "text-foreground/70 hover:text-foreground",
            )}
          >
            {on ? (
              <motion.span
                layoutId={`${id}-thumb`}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 36 }}
                className="absolute inset-0 rounded-full bg-foreground"
              />
            ) : null}
            <span className="relative inline-flex items-center gap-1.5">
              {a === "pro" ? <Lock className="size-3.5" strokeWidth={2.4} aria-hidden /> : null}
              {label[a]}
              <span className={cn("tabular-nums text-[12px]", on ? "text-background/60" : "text-muted-foreground")}>{counts[a]}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * The live component gallery: interaction chips (and optionally search and category chips) over a
 * size-aware bento of live previews. Opening a tile shows the detail modal, deep-linked as `?c=slug`.
 */
export function ComponentGallery({
  items,
  categories,
  searchable = false,
  limit,
  mobileLimit,
  aside,
  pageSize = 24,
}: {
  items: GalleryItem[];
  /** Category chips; omit to hide them. */
  categories?: CategoryFilter[];
  searchable?: boolean;
  /** How many tiles to show when no filter is active. */
  limit?: number;
  /** Fewer tiles on phones when no filter is active. */
  mobileLimit?: number;
  /** Shown at the right of the filter row (e.g. a "Browse all" link). */
  aside?: React.ReactNode;
  /** Tiles per page when there is no `limit`. */
  pageSize?: number;
}) {
  const [interaction, setInteraction] = React.useState<Interaction | "all">("all");
  const [category, setCategory] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [openSlug, setOpenSlug] = useUrlParam("c");
  const [accessParam, setAccessParam] = useUrlParam("access");
  const access: Access = accessParam === "free" || accessParam === "pro" ? accessParam : "all";
  const accessCounts = React.useMemo(() => {
    const pro = items.filter((i) => i.premium).length;
    return { all: items.length, free: items.length - pro, pro };
  }, [items]);

  const needle = query.trim().toLowerCase();
  const filtering = interaction !== "all" || category !== "all" || needle !== "" || access !== "all";
  const matches = items.filter(
    (i) =>
      (access === "all" || (access === "pro") === i.premium) &&
      (interaction === "all" || i.interactions.includes(interaction)) &&
      (category === "all" || i.group === category) &&
      (!needle || `${i.name} ${i.description} ${i.categoryLabel}`.toLowerCase().includes(needle)),
  );
  const paged = !(limit && !filtering);
  const pageCount = paged ? Math.max(1, Math.ceil(matches.length / pageSize)) : 1;
  const [page, setPage] = usePage(pageCount);
  const gridTop = React.useRef<HTMLDivElement>(null);
  const shown = !paged ? matches.slice(0, limit) : matches.slice((page - 1) * pageSize, page * pageSize);
  const goTo = (next: number) => {
    setPage(next);
    scrollToTop(gridTop.current);
  };
  const openItem = openSlug ? (items.find((i) => i.slug === openSlug) ?? null) : null;
  const counts = React.useMemo(() => {
    const c = new Map<string, number>();
    for (const i of items) for (const k of i.interactions) c.set(k, (c.get(k) ?? 0) + 1);
    return c;
  }, [items]);

  const clear = () => {
    setInteraction("all");
    setCategory("all");
    setQuery("");
    setAccessParam(null);
    setPage(1);
  };

  return (
    <>
      <div ref={gridTop} className="flex flex-col gap-3">
        {searchable ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="pg-float flex h-[52px] w-full max-w-[560px] items-center gap-3 rounded-full bg-card px-5">
            <Search className="size-[18px] shrink-0 text-muted-foreground" aria-hidden />
            <span className="sr-only">Search components</span>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={`Search ${items.length} components`}
              className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="size-4" aria-hidden />
              </button>
            ) : null}
          </label>
          <AccessSwitch
            value={access}
            counts={accessCounts}
            onChange={(a) => {
              setAccessParam(a === "all" ? null : a);
              setPage(1);
            }}
          />
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ChipRail>
            {INTERACTION_FILTERS.filter((f) => f.value === "all" || counts.get(f.value)).map((f) => (
              <Chip
                key={f.value}
                active={interaction === f.value}
                onClick={() => {
                  setInteraction(f.value);
                  setPage(1);
                }}
              >
                {f.label}
                {f.value !== "all" ? (
                  <span className={cn("tabular-nums text-[12px]", interaction === f.value ? "text-background/60" : "text-muted-foreground")}>
                    {counts.get(f.value)}
                  </span>
                ) : null}
              </Chip>
            ))}
          </ChipRail>
          <div className="flex shrink-0 items-center gap-4">
            {interaction !== "all" || category !== "all" || needle ? (
              <p className="shrink-0 text-[13px] tabular-nums text-muted-foreground" aria-live="polite">
                {matches.length} of {items.length}
              </p>
            ) : null}
            {aside}
          </div>
        </div>

        {categories ? (
          <ChipRail>
            <Chip
              active={category === "all"}
              onClick={() => {
                setCategory("all");
                setPage(1);
              }}
              className="py-1.5 text-[13px]"
            >
              Every category
            </Chip>
            {categories.map((c) => (
              <Chip
                key={c.id}
                active={category === c.id}
                onClick={() => {
                  setCategory(c.id);
                  setPage(1);
                }}
                className="py-1.5 text-[13px]"
              >
                {c.label}
              </Chip>
            ))}
          </ChipRail>
        ) : null}
      </div>

      {shown.length ? (
        <TileGrid className="mt-6">
          {shown.map((item, i) => (
            <TileCell key={item.slug} item={item} className={cn(!filtering && mobileLimit && i >= mobileLimit && "max-sm:hidden")}>
              <GalleryTile item={item} onOpen={setOpenSlug} />
            </TileCell>
          ))}
        </TileGrid>
      ) : null}
      {shown.length && paged ? <Pagination page={page} pageCount={pageCount} onChange={goTo} label="Component pages" className="mt-12" /> : null}
      {shown.length ? null : (
        <div className="mt-6 rounded-tile bg-card px-6 py-16 text-center">
          <p className="text-[17px] font-semibold text-foreground">No components match.</p>
          <p className="mt-1 text-[15px] text-muted-foreground">Try another word, or clear the filters.</p>
          <button type="button" onClick={clear} className="pg-glass mt-5 h-[44px] rounded-full bg-foreground px-5 text-[14px] font-semibold text-background">
            Clear filters
          </button>
        </div>
      )}

      <ComponentModal item={openItem} onClose={() => setOpenSlug(null)} />
    </>
  );
}
