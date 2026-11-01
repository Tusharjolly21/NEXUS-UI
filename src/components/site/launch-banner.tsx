"use client";

import * as React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { PRICES, formatPrice } from "@/lib/pricing";
import { LAUNCH_BANNER_COOKIE, LAUNCH_BANNER_ID } from "@/lib/launch-banner";
import { ICON_COUNT } from "@/lib/icons/count";

/**
 * The thin strip above the nav: what Pro unlocks and what it costs, with one link to the plans.
 * It names no per-category counts (templates and blocks are the smaller numbers and read as "not much
 * for the price"); only the components figure, which is well past it, and that more is coming.
 * Closing it stores a cookie for 60 days; the site shell reads that cookie on the server so the
 * strip never flashes back in on the next page. It is one line, never animates and never returns
 * for someone who closed it.
 */
export function LaunchBanner() {
  const [open, setOpen] = React.useState(true);
  if (!open) return null;

  const close = () => {
    document.cookie = `${LAUNCH_BANNER_COOKIE}=${LAUNCH_BANNER_ID}; Max-Age=${60 * 60 * 24 * 60}; Path=/; SameSite=Lax`;
    setOpen(false);
  };

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="relative z-[51] flex min-h-10 items-center justify-center bg-[#1d1d1f] px-12 py-2 text-center text-[13px] leading-snug text-white/85 dark:bg-[#1c1c1e] dark:shadow-[inset_0_-0.5px_0_rgba(255,255,255,0.12)]"
    >
      <p>
        <span className="mr-1.5 inline-flex rounded-full bg-[conic-gradient(from_210deg,#0a84ff,#bf5af2,#ff375f,#ff9f0a,#0a84ff)] px-2 py-px text-[11px] font-semibold text-white">
          New
        </span>
        <span className="hidden sm:inline">{ICON_COUNT} animated icons, each with a sound of its own. </span>
        <span className="sm:hidden">{ICON_COUNT} icons with sound. </span>
        <Link href="/icons" className="whitespace-nowrap font-medium text-[#2997ff] hover:underline hover:underline-offset-4">
          See the icons ›
        </Link>
        <span className="hidden lg:inline">
          <span aria-hidden className="mx-2 text-white/30">
            |
          </span>
          Pro unlocks the rest from {formatPrice(PRICES.pro)} a year.{" "}
          <Link href="/pricing" className="whitespace-nowrap font-medium text-[#2997ff] hover:underline hover:underline-offset-4">
            See plans ›
          </Link>
        </span>
      </p>
      <button
        type="button"
        onClick={close}
        aria-label="Close announcement"
        className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-[#2997ff]"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
