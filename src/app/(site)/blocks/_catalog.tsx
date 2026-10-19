"use client";

import { GalleryTile, TileCell, TileGrid } from "@/components/gallery/gallery-tile";
import type { GalleryItem } from "@/components/gallery/types";
import * as React from "react";
import { useUrlParam } from "@/components/gallery/use-url-param";
import { Pagination, scrollToTop, usePage } from "@/components/gallery/pagination";
import { Chip, ChipRail } from "@/components/site/chip-rail";
import { cn } from "@/lib/utils";

/** One section of one block, shown as a tile on the blocks wall. */
export type BlockTileItem = GalleryItem & {
  /** Slug of the block page the section belongs to. */
  block: string;
  premium: boolean;
  /** Block page URL with the section's anchor. */
  href: string;
};

/** Sections per page: block tiles are large, so a page is a dozen. */
const PAGE_SIZE = 12;

export type BlockFilter = { slug: string; name: string; count: number };

function PlanBadge({ pro, dark }: { pro: boolean; dark: boolean }) {
  return (
    <span
      className={cn(
        "grid h-8 place-items-center rounded-full px-3 text-[12px] font-semibold",
        pro
          ? "bg-[#1d1d1f] text-white"
          : dark
            ? "bg-white/12 text-white ring-1 ring-inset ring-white/15 backdrop-blur-md"
            : "bg-white/90 text-[#1d1d1f] shadow-[0_1px_2px_rgba(23,23,28,0.08),0_0_0_1px_rgba(23,23,28,0.06)] backdrop-blur-md",
      )}
    >
      {pro ? "Pro" : "Free"}
    </span>
  );
}

/**
 * The blocks wall, built like the components wall: every section of every block is its own live
 * tile sized to the section, with chips to narrow the wall to one block (deep-linked as `?block=`).
 */
export function BlocksGallery({ items, filters }: { items: BlockTileItem[]; filters: BlockFilter[] }) {
  const [param, setParam] = useUrlParam("block");
  const active = filters.find((f) => f.slug === param) ?? null;
  const matches = active ? items.filter((i) => i.block === active.slug) : items;
  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const [page, setPage] = usePage(pageCount);
  const top = React.useRef<HTMLDivElement>(null);
  const shown = matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pick = (slug: string | null) => {
    setParam(slug);
    setPage(1);
  };
  const goTo = (next: number) => {
    setPage(next);
    scrollToTop(top.current);
  };

  return (
    <div ref={top} className="scroll-mt-28">
      <ChipRail>
        <Chip active={!active} onClick={() => pick(null)}>
          All
          <span className="text-[12px] opacity-60">{items.length}</span>
        </Chip>
        {filters.map((f) => (
          <Chip key={f.slug} active={active?.slug === f.slug} onClick={() => pick(f.slug)}>
            {f.name}
            <span className="text-[12px] opacity-60">{f.count}</span>
          </Chip>
        ))}
      </ChipRail>

      <p className="mt-3 text-[13px] text-muted-foreground" aria-live="polite">
        {active ? `${matches.length} sections in ${active.name}` : `${matches.length} sections across ${filters.length} blocks`}
      </p>

      <TileGrid className="mt-5">
        {shown.map((item) => (
          <TileCell key={item.slug} item={item}>
            <GalleryTile item={item} href={item.href} badge={<PlanBadge pro={item.premium} dark={item.fit.dark} />} />
          </TileCell>
        ))}
      </TileGrid>

      <Pagination page={page} pageCount={pageCount} onChange={goTo} label="Block pages" className="mt-12" />
    </div>
  );
}
