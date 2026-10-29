"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Lock, LockOpen, Search, Sparkles, X } from "lucide-react";
import { ProBadge, useProAccess } from "@/components/pro/pro-access";
import { PillLink } from "@/components/site/pill-link";
import { PRICES, formatPrice } from "@/lib/pricing";
import { Chip, ChipRail } from "@/components/site/chip-rail";
import { cn } from "@/lib/utils";
import { ComponentModal } from "./component-modal";
import { GalleryTile, TileCell, TileGrid } from "./gallery-tile";
import { INTERACTION_FILTERS, type GalleryItem, type Interaction } from "./types";
import { useUrlParam } from "./use-url-param";
import { InfiniteSentinel, useInfiniteCount } from "./infinite-scroll";

export type CategoryFilter = { id: string; label: string };

/** The category chip that lists recent additions instead of a taxonomy group. */
const NEW_TAB = "new";

/** Where the plans card sits in the wall: after this many tiles, once, so it is passed rather than chased. */
const PLANS_CARD_AFTER = 11;

/**
 * One quiet card inside the wall, for visitors without Pro: what the Pro tiles are and what they
 * cost. It scrolls away like any tile. It never pops up, never comes back after you pass it, and
 * everything on the wall stays previewable.
 */
function PlansCard({ proCount }: { proCount: number }) {
  return (
    <li className="[grid-row-end:span_3] sm:[grid-column-end:span_2] sm:[grid-row-end:span_2]">
      <div className="pg-float flex h-full flex-col justify-between gap-4 rounded-tile bg-card p-6">
        <div>
          <ProBadge />
          <h3 className="mt-3 text-[20px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
            {proCount ? `${proCount} of these are Pro` : "Some of these are Pro"}
          </h3>
          <p className="mt-2 max-w-[420px] text-[14.5px] leading-[1.5] text-muted-foreground">
            You can preview every one of them here. Pro unlocks the source, the install command and the build prompt, plus every
            template and block.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <PillLink href="/pricing" size="sm">
            See plans
          </PillLink>
          <span className="text-[13px] text-muted-foreground">
            From {formatPrice(PRICES.pro)} a year, or {formatPrice(PRICES.allAccess)} once
          </span>
        </div>
      </div>
    </li>
  );
}

type Access = "all" | "free" | "pro";
const ACCESS: Access[] = ["all", "free", "pro"];

/** All / Free / Pro, as a segmented control with a sliding thumb. */
function AccessSwitch({ value, onChange, counts }: { value: Access; onChange: (v: Access) => void; counts: Record<Access, number> }) {
  const id = React.useId();
  const reduce = useReducedMotion();
  const label: Record<Access, string> = { all: "All", free: "Free", pro: "Pro" };
  const { isPro } = useProAccess();
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
              {a === "pro" ? (
                isPro ? <LockOpen className={cn("size-3.5", !on && "text-[#248a3d] dark:text-[#30d158]")} strokeWidth={2.4} aria-hidden /> : <Lock className="size-3.5" strokeWidth={2.4} aria-hidden />
              ) : null}
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
  playOnClick = false,
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
  /** Tiles revealed at a time when there is no `limit`. */
  pageSize?: number;
  /** Tiles show a poster with a Play button and only run the live component once pressed. For heavy components (canvas, WebGL). */
  playOnClick?: boolean;
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

  const { isPro, proCount } = useProAccess();
  const needle = query.trim().toLowerCase();
  const filtering = interaction !== "all" || category !== "all" || needle !== "" || access !== "all";
  const filtered = items.filter(
    (i) =>
      (access === "all" || (access === "pro") === i.premium) &&
      (interaction === "all" || i.interactions.includes(interaction)) &&
      (category === "all" || (category === NEW_TAB ? i.isRecent : i.group === category)) &&
      (!needle || `${i.name} ${i.description} ${i.categoryLabel}`.toLowerCase().includes(needle)),
  );
  // the New tab lists the newest first; the sort is stable, so ties keep the wall's order
  const matches = category === NEW_TAB ? [...filtered].sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0)) : filtered;
  const recentCount = React.useMemo(() => items.filter((i) => i.isRecent).length, [items]);
  const paged = !(limit && !filtering);
  const infinite = useInfiniteCount({
    total: matches.length,
    batch: pageSize,
    storeKey: `gallery|${limit ?? 0}|${access}|${interaction}|${category}|${needle}`,
  });
  const shown = !paged ? matches.slice(0, limit) : matches.slice(0, infinite.count);
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
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {searchable ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="pg-float flex h-[52px] w-full max-w-[560px] items-center gap-3 rounded-full bg-card px-5">
            <Search className="size-[18px] shrink-0 text-muted-foreground" aria-hidden />
            <span className="sr-only">Search components</span>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
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
              }}
              className="py-1.5 text-[13px]"
            >
              Every category
            </Chip>
            {recentCount ? (
              <Chip
                active={category === NEW_TAB}
                icon={<Sparkles className="size-3.5 text-[#ff9f0a]" strokeWidth={2.4} aria-hidden />}
                onClick={() => {
                  setCategory(NEW_TAB);
                }}
                className="py-1.5 text-[13px]"
              >
                New
                <span className={cn("tabular-nums text-[12px]", category === NEW_TAB ? "text-background/60" : "text-muted-foreground")}>
                  {recentCount}
                </span>
              </Chip>
            ) : null}
            {categories.map((c) => (
              <Chip
                key={c.id}
                active={category === c.id}
                onClick={() => {
                  setCategory(c.id);
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
            <React.Fragment key={item.slug}>
              <TileCell item={item} className={cn(!filtering && mobileLimit && i >= mobileLimit && "max-sm:hidden")}>
                <GalleryTile item={item} onOpen={setOpenSlug} playOnClick={playOnClick} />
              </TileCell>
              {paged && !isPro && !needle && access !== "pro" && i === PLANS_CARD_AFTER ? <PlansCard proCount={proCount} /> : null}
            </React.Fragment>
          ))}
        </TileGrid>
      ) : null}
      {shown.length && paged && !infinite.done ? (
        <InfiniteSentinel onMore={infinite.more} shown={shown.length} total={matches.length} noun="components" className="mt-12" />
      ) : null}
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
