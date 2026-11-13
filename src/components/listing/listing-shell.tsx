"use client";

import * as React from "react";
import { useProAccess } from "@/components/pro/pro-access";
import { cn } from "@/lib/utils";

/**
 * The listing pages' frame: names down the left, the page in the middle, the Pro card on the right, edge to edge
 * on any screen (the middle takes whatever width there is, and the card grid adds columns as it grows).
 *
 * - 1280px and up: all three columns. The two side columns stay put while the middle scrolls.
 * - 1024px to 1279px: names and page; the Pro card moves into the page as a band (see ProBand).
 * - Below 1024px: one column; the names open from a "Browse by name" button (see ListingBrowse).
 *
 * Members with Pro have nothing to buy, so the right column goes and the page takes its width.
 */
export function ListingShell({
  sidebar,
  rail,
  children,
}: {
  /** The names column; a page whose content is already the full list (Sounds) leaves it out. */
  sidebar?: React.ReactNode;
  rail: React.ReactNode;
  children: React.ReactNode;
}) {
  const { isPro } = useProAccess();
  const side = !!sidebar;
  return (
    <div className="relative -mt-[64px] pb-24 pt-[112px]">
      <div aria-hidden className="pg-dotgrid pointer-events-none absolute inset-x-0 top-0 h-[620px] [mask-image:linear-gradient(black_55%,transparent)]">
        <div className="pg-bloom absolute inset-0" />
      </div>
      <div
        className={cn(
          "relative grid w-full grid-cols-1 gap-6 px-4 sm:px-6 2xl:px-8",
          side && "lg:grid-cols-[236px_minmax(0,1fr)] lg:gap-8 2xl:grid-cols-[264px_minmax(0,1fr)] 2xl:gap-10",
          side && !isPro && "xl:grid-cols-[248px_minmax(0,1fr)_296px] 2xl:grid-cols-[264px_minmax(0,1fr)_312px]",
          !side && !isPro && "xl:grid-cols-[minmax(0,1fr)_296px] xl:gap-8 2xl:grid-cols-[minmax(0,1fr)_312px] 2xl:gap-10",
        )}
      >
        {side ? <div className="hidden lg:block">{sidebar}</div> : null}
        <div className="@container min-w-0">{children}</div>
        {isPro ? null : <div className="hidden xl:block">{rail}</div>}
      </div>
    </div>
  );
}
