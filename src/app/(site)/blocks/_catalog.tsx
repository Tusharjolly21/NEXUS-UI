"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { AccessSwitch, type Access } from "@/components/gallery/component-gallery";
import { FitPreview } from "@/components/gallery/fit-preview";
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
 * A section card: the live section, scaled down so all of it shows inside a frame that is the same shape on every
 * card, above a caption that is always visible (section name, its block, Free or Pro). The whole card is one link
 * to the section.
 */
function BlockTile({ item, eager }: { item: BlockTileItem; eager: boolean }) {
  const { fit } = item;
  return (
    <article className="group relative isolate flex flex-col overflow-hidden rounded-[28px] bg-card p-2 shadow-[0_0_0_0.5px_var(--border)] transition-shadow duration-200 hover:shadow-[0_0_0_0.5px_var(--border),0_18px_40px_-18px_rgba(0,0,0,0.3)]">
      <div
        aria-hidden
        className="pointer-events-none relative aspect-[16/10] overflow-hidden rounded-[22px] bg-background"
        style={fit.bg ? { backgroundColor: fit.bg } : undefined}
      >
        <div className="absolute inset-3">
          <FitPreview exportName={item.exportName} canvas={fit.canvas} focus={fit.focus} eager={eager} />
        </div>
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

/** The `?block=` value of the New tab (a block slug otherwise). */
const NEW_TAB = "new";

/**
 * The blocks wall, built like the components wall: every section of every block is its own live
 * tile sized to the section, with a New tab (the latest additions, newest first), chips to narrow
 * the wall to one block (deep-linked as `?block=`) and an All / Free / Pro switch (`?access=`).
 */
export function BlocksGallery({
  items,
  filters,
  afterFilters,
}: {
  items: BlockTileItem[];
  filters: BlockFilter[];
  /** Shown under the filters, above the wall (the Pro band on narrower screens). */
  afterFilters?: React.ReactNode;
}) {
  const [param, setParam] = useUrlParam("block");
  const [accessParam, setAccessParam] = useUrlParam("access");
  const access: Access = accessParam === "free" || accessParam === "pro" ? accessParam : "all";
  const recentCount = React.useMemo(() => items.filter((i) => i.isRecent).length, [items]);
  const newTab = param === NEW_TAB && recentCount > 0;
  const active = newTab ? null : (filters.find((f) => f.slug === param) ?? null);
  const [query, setQuery] = React.useState("");
  const words = searchWords(query);
  const accessCounts = React.useMemo(() => {
    const pro = items.filter((i) => i.premium).length;
    return { all: items.length, free: items.length - pro, pro };
  }, [items]);
  const filtered = items.filter(
    (i) =>
      (access === "all" || (access === "pro") === i.premium) &&
      (newTab ? i.isRecent : !active || i.block === active.slug) &&
      (!words.length || matchesWords(`${i.name} ${i.blockName} ${i.description} ${i.categoryLabel}`, words)),
  );
  // the New tab lists the newest first; the sort is stable, so ties keep the wall's order
  const matches = newTab ? [...filtered].sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0)) : filtered;
  const infinite = useInfiniteCount({
    total: matches.length,
    batch: PAGE_SIZE,
    storeKey: `blocks|${newTab ? NEW_TAB : (active?.slug ?? "")}|${access}|${words.join(" ")}`,
  });
  const shown = matches.slice(0, infinite.count);
  const scope = newTab ? "New" : active?.name;
  const kind = access === "free" ? "free " : access === "pro" ? "Pro " : "";
  const clearAll = () => {
    setParam(null);
    setAccessParam(null);
    setQuery("");
  };

  // The chosen filter always stays visible, even when it is past the phone's short list.
  const [moreOpen, setMoreOpen] = React.useState(false);
  const activeIndex = active ? filters.indexOf(active) : -1;
  const hiddenOnPhone = filters.length - PHONE_FILTERS - (activeIndex >= PHONE_FILTERS ? 1 : 0);

  return (
    <div className="scroll-mt-28">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <GallerySearch value={query} onChange={setQuery} label="Search blocks" placeholder="Search sections: hero, pricing, FAQ…" className="sm:min-w-0 sm:flex-1 sm:max-w-[420px]" />
        <AccessSwitch value={access} counts={accessCounts} noun="sections" size="md" onChange={(a) => setAccessParam(a === "all" ? null : a)} />
      </div>
      <ChipRail wrap>
        <Chip active={!active && !newTab} onClick={() => setParam(null)}>
          All
          <span className="text-[12px] opacity-60">{items.length}</span>
        </Chip>
        {recentCount ? (
          <Chip active={newTab} icon={<Sparkles className="size-3.5 text-[#ff9f0a]" strokeWidth={2.4} aria-hidden />} onClick={() => setParam(NEW_TAB)}>
            New
            <span className="text-[12px] opacity-60">{recentCount}</span>
          </Chip>
        ) : null}
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
          ? `${matches.length} ${kind}${matches.length === 1 ? "section" : "sections"} matching "${query.trim()}"${scope ? ` in ${scope}` : ""}`
          : scope
            ? `${matches.length} ${kind}${newTab ? "new " : ""}sections${newTab ? "" : ` in ${scope}`}`
            : `${matches.length} ${kind}sections across ${filters.length} blocks`}
      </p>

      {matches.length === 0 ? (
        <p className="mt-8 rounded-[28px] bg-card px-6 py-14 text-center text-[16px] text-muted-foreground pg-glass">
          No sections match that. Try a shorter search
          {scope || access !== "all" ? (
            <>
              , or{" "}
              <button type="button" onClick={clearAll} className="font-medium text-foreground underline underline-offset-4">
                clear the filters
              </button>
            </>
          ) : null}
          .
        </p>
      ) : null}

      {afterFilters}

      <ul className="mt-5 grid grid-cols-1 gap-4 @[620px]:grid-cols-2">
        {shown.map((item, i) => (
          <li key={item.slug}>
            <BlockTile item={item} eager={i < 4} />
          </li>
        ))}
      </ul>

      {infinite.done ? null : (
        <InfiniteSentinel onMore={infinite.more} shown={shown.length} total={matches.length} noun="sections" className="mt-12" />
      )}
    </div>
  );
}
