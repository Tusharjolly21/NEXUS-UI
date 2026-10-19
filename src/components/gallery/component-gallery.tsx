"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Chip, ChipRail } from "@/components/site/chip-rail";
import { cn } from "@/lib/utils";
import { ComponentModal } from "./component-modal";
import { GalleryTile, TileCell, TileGrid } from "./gallery-tile";
import { INTERACTION_FILTERS, type GalleryItem, type Interaction } from "./types";
import { useUrlParam } from "./use-url-param";

export type CategoryFilter = { id: string; label: string };

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
}) {
  const [interaction, setInteraction] = React.useState<Interaction | "all">("all");
  const [category, setCategory] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [openSlug, setOpenSlug] = useUrlParam("c");

  const needle = query.trim().toLowerCase();
  const filtering = interaction !== "all" || category !== "all" || needle !== "";
  const matches = items.filter(
    (i) =>
      (interaction === "all" || i.interactions.includes(interaction)) &&
      (category === "all" || i.group === category) &&
      (!needle || `${i.name} ${i.description} ${i.categoryLabel}`.toLowerCase().includes(needle)),
  );
  const shown = !filtering && limit ? matches.slice(0, limit) : matches;
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
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {searchable ? (
          <label className="pg-float flex h-[52px] max-w-[560px] items-center gap-3 rounded-full bg-card px-5">
            <Search className="size-[18px] shrink-0 text-muted-foreground" aria-hidden />
            <span className="sr-only">Search components</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${items.length} components`}
              className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="size-4" aria-hidden />
              </button>
            ) : null}
          </label>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ChipRail>
            {INTERACTION_FILTERS.filter((f) => f.value === "all" || counts.get(f.value)).map((f) => (
              <Chip key={f.value} active={interaction === f.value} onClick={() => setInteraction(f.value)}>
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
            {filtering ? (
              <p className="text-[13px] tabular-nums text-muted-foreground" aria-live="polite">
                {matches.length} of {items.length}
              </p>
            ) : null}
            {aside}
          </div>
        </div>

        {categories ? (
          <ChipRail>
            <Chip active={category === "all"} onClick={() => setCategory("all")} className="py-1.5 text-[13px]">
              Every category
            </Chip>
            {categories.map((c) => (
              <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)} className="py-1.5 text-[13px]">
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
      ) : (
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
