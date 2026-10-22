"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FitPreview } from "@/components/gallery/fit-preview";
import { TileCell, TileGrid } from "@/components/gallery/gallery-tile";
import type { GalleryItem } from "@/components/gallery/types";
import * as React from "react";
import { useUrlParam } from "@/components/gallery/use-url-param";
import { Pagination, scrollToTop, usePage } from "@/components/gallery/pagination";
import { Chip, ChipRail } from "@/components/site/chip-rail";
import { AccessTag } from "@/components/pro/pro-access";

/** One section of one block, shown as a tile on the blocks wall. */
export type BlockTileItem = GalleryItem & {
  /** Slug of the block page the section belongs to. */
  block: string;
  premium: boolean;
  /** Block page URL with the section's anchor. */
  href: string;
  /** Name of the block, shown under the section name. */
  blockName: string;
};

/** Sections per page: block tiles are large, so a page is a dozen. */
const PAGE_SIZE = 12;

export type BlockFilter = { slug: string; name: string; count: number };

/**
 * A section tile: the live section, scaled down so all of it shows, above a caption that is always
 * visible (section name, its block, Free or Pro). The whole card is one link to the section.
 */
function BlockTile({ item, eager }: { item: BlockTileItem; eager: boolean }) {
  const { fit } = item;
  return (
    <article className="group relative isolate flex h-full flex-col overflow-hidden rounded-[28px] bg-card p-2 shadow-[0_0_0_0.5px_var(--border)] transition-shadow duration-200 hover:shadow-[0_0_0_0.5px_var(--border),0_18px_40px_-18px_rgba(0,0,0,0.3)]">
      <div
        aria-hidden
        className="pointer-events-none relative min-h-0 flex-1 overflow-hidden rounded-[22px] bg-background"
        style={fit.bg ? { backgroundColor: fit.bg } : undefined}
      >
        <FitPreview exportName={item.exportName} canvas={fit.canvas} focus={fit.focus} eager={eager} />
        {item.isNew ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11.5px] font-semibold text-[#bf4800] shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] backdrop-blur-md">
            New
          </span>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center justify-between gap-3 px-3 pb-1.5 pt-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-foreground">
            <Link
              href={item.href}
              className="after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none [&:focus-visible]:after:rounded-[28px] [&:focus-visible]:after:outline-2 [&:focus-visible]:after:outline-offset-2 [&:focus-visible]:after:outline-ring"
            >
              {item.name}
            </Link>
          </h3>
          <p className="truncate text-[13px] text-muted-foreground">{item.blockName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <AccessTag premium={!!item.premium} />
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-full bg-action text-white transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          >
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </article>
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
        {shown.map((item, i) => (
          <TileCell key={item.slug} item={item}>
            <BlockTile item={item} eager={i < 4} />
          </TileCell>
        ))}
      </TileGrid>

      <Pagination page={page} pageCount={pageCount} onChange={goTo} label="Block pages" className="mt-12" />
    </div>
  );
}
