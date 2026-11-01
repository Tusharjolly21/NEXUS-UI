"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FitPreview } from "@/components/gallery/fit-preview";
import { TileCell, TileGrid } from "@/components/gallery/gallery-tile";
import type { GalleryItem } from "@/components/gallery/types";
import * as React from "react";
import { GallerySearch, matchesWords, searchWords } from "@/components/gallery/gallery-search";
import { useUrlParam } from "@/components/gallery/use-url-param";
import { InfiniteSentinel, useInfiniteCount } from "@/components/gallery/infinite-scroll";
import { Chip, ChipRail } from "@/components/site/chip-rail";
import { AccessTag } from "@/components/pro/pro-access";
import { cn } from "@/lib/utils";

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

/** Sections revealed at a time: block tiles are large, so a batch is a dozen. */
const PAGE_SIZE = 12;

export type BlockFilter = { slug: string; name: string; count: number };

/** On a phone only this many filters show until "more" is pressed; wider screens always show them all. */
const PHONE_FILTERS = 5;

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
  const [query, setQuery] = React.useState("");
  const words = searchWords(query);
  const matches = items.filter(
    (i) => (!active || i.block === active.slug) && (!words.length || matchesWords(`${i.name} ${i.blockName} ${i.description} ${i.categoryLabel}`, words)),
  );
  const infinite = useInfiniteCount({ total: matches.length, batch: PAGE_SIZE, storeKey: `blocks|${active?.slug ?? ""}|${words.join(" ")}` });
  const shown = matches.slice(0, infinite.count);

  // The chosen filter always stays visible, even when it is past the phone's short list.
  const [moreOpen, setMoreOpen] = React.useState(false);
  const activeIndex = active ? filters.indexOf(active) : -1;
  const hiddenOnPhone = filters.length - PHONE_FILTERS - (activeIndex >= PHONE_FILTERS ? 1 : 0);

  return (
    <div className="scroll-mt-28">
      <GallerySearch value={query} onChange={setQuery} label="Search blocks" placeholder="Search sections: hero, pricing, FAQ…" className="mb-4 sm:max-w-[360px]" />
      <ChipRail wrap>
        <Chip active={!active} onClick={() => setParam(null)}>
          All
          <span className="text-[12px] opacity-60">{items.length}</span>
        </Chip>
        {filters.map((f, i) => (
          // `contents` keeps the wrapper out of the layout; on a phone the folded ones are removed (and cannot be tabbed to).
          <span key={f.slug} className={cn("contents", !moreOpen && i >= PHONE_FILTERS && f !== active && "max-sm:hidden")}>
            <Chip active={active?.slug === f.slug} onClick={() => setParam(f.slug)}>
              {f.name}
              <span className="text-[12px] opacity-60">{f.count}</span>
            </Chip>
          </span>
        ))}
        {hiddenOnPhone > 0 ? (
          <Chip
            className="sm:hidden"
            aria-pressed={undefined}
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((v) => !v)}
          >
            {moreOpen ? "Show less" : `${hiddenOnPhone} more`}
          </Chip>
        ) : null}
      </ChipRail>

      <p className="mt-3 text-[13px] text-muted-foreground" aria-live="polite">
        {words.length
          ? `${matches.length} ${matches.length === 1 ? "section" : "sections"} matching "${query.trim()}"${active ? ` in ${active.name}` : ""}`
          : active
            ? `${matches.length} sections in ${active.name}`
            : `${matches.length} sections across ${filters.length} blocks`}
      </p>

      {matches.length === 0 ? (
        <p className="mt-8 rounded-[28px] bg-card px-6 py-14 text-center text-[16px] text-muted-foreground pg-glass">
          No sections match that. Try a shorter search
          {active ? (
            <>
              , or{" "}
              <button type="button" onClick={() => setParam(null)} className="font-medium text-foreground underline underline-offset-4">
                look in every block
              </button>
            </>
          ) : null}
          .
        </p>
      ) : null}

      <TileGrid className="mt-5">
        {shown.map((item, i) => (
          <TileCell key={item.slug} item={item}>
            <BlockTile item={item} eager={i < 4} />
          </TileCell>
        ))}
      </TileGrid>

      {infinite.done ? null : (
        <InfiniteSentinel onMore={infinite.more} shown={shown.length} total={matches.length} noun="sections" className="mt-12" />
      )}
    </div>
  );
}
