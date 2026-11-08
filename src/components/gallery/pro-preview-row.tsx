"use client";

import Link from "next/link";
import { GalleryTile } from "./gallery-tile";
import type { GalleryItem } from "./types";
import { trackEvent } from "@/lib/track";

/**
 * Four Pro components from four different categories. The top of the wall is already the newest items, so
 * the row skips the first `skip` of them and shows range from further down instead of repeating what is above it.
 */
export function pickProPreviews(items: GalleryItem[], count = 4, skip = 24): GalleryItem[] {
  const seen = new Set<string>();
  const picks: GalleryItem[] = [];
  const onWall = new Set(items.slice(0, skip).map((i) => i.slug));
  const newest = items.filter((i) => i.premium && !i.pinned && !onWall.has(i.slug)).sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0));
  for (const item of newest) {
    if (seen.has(item.group)) continue;
    seen.add(item.group);
    picks.push(item);
    if (picks.length === count) break;
  }
  return picks;
}

/**
 * A short row inside the /components wall, for visitors without Pro: four Pro components, live, so
 * the paid side is something you can see before you read about it. No price, no timer, no popup: the
 * tiles are the same ones as everywhere else on the wall, and the only link goes to the Pro filter.
 * On a phone it scrolls sideways; from desktop width up the four sit side by side.
 */
export function ProPreviewRow({ picks, proCount }: { picks: GalleryItem[]; proCount: number }) {
  if (picks.length === 0) return null;
  return (
    <section aria-labelledby="pro-row-heading" className="flex h-full flex-col justify-center">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <h2 id="pro-row-heading" className="text-[17px] font-semibold text-foreground">
            More in Pro
          </h2>
          <p className="mt-1 text-[14px] text-muted-foreground">Live, like the free ones. Pro adds the source and the install command.</p>
        </div>
        <Link
          href="/components?access=pro"
          onClick={() => trackEvent("pro_row_click", { slug: "all" })}
          className="shrink-0 text-[14px] text-link hover:underline hover:underline-offset-4"
        >
          All {proCount} Pro components ›
        </Link>
      </div>
      <ul
        tabIndex={0}
        aria-label="Pro components, scroll sideways for more"
        className="-mx-4 mt-4 flex scroll-px-4 snap-x snap-mandatory gap-4 overflow-x-auto px-4 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {picks.map((item) => (
          <li
            key={item.slug}
            onClickCapture={() => trackEvent("pro_row_click", { slug: item.slug })}
            className="h-[216px] w-[72%] shrink-0 snap-start sm:w-[280px] lg:w-auto"
          >
            <GalleryTile item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
