"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { useProAccess } from "@/components/pro/pro-access";
import { useSlots } from "@/components/site/use-slots";
import { slotsLeft } from "@/lib/launch-slots";
import { GLOBAL_PRICING, type DisplayPricing } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export type PromoCopy = {
  /** The card's heading. `accent` is the part set in the spectrum (a number, or "Pro"). */
  title: [before: string, accent: string, after: string];
  /** One or two sentences under it, about this page's things. */
  body: string;
  /** The band's one line, for narrower screens. */
  band: string;
};

/** Four Pro pieces that look good still: one large, two side by side, one wide. Each links to its own page. */
const SHOWCASE = {
  hero: { slug: "glass-drop", name: "Glass Drop", src: "/promo/glass-drop.webp", w: 720, h: 353 },
  pair: [
    { slug: "heat-field", name: "Heat Field", src: "/promo/heat-field.webp", w: 442, h: 283, bg: "bg-white" },
    { slug: "liquid-send", name: "Liquid Send", src: "/promo/liquid-send.webp", w: 431, h: 335, bg: "bg-[#f5f5f7]" },
  ],
  wide: { slug: "standing-calendar", name: "Standing Calendar", src: "/promo/standing-calendar.webp", w: 667, h: 350 },
} as const;

const caption =
  "pointer-events-none absolute bottom-1.5 left-1.5 max-w-[calc(100%-12px)] truncate rounded-full bg-white/92 px-2 py-0.5 text-[10.5px] font-semibold text-[#1d1d1f] shadow-[0_0_0_0.5px_rgba(0,0,0,0.1)]";
const tile =
  "group/tile relative block overflow-hidden rounded-[16px] shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function Showcase() {
  const { hero, pair, wide } = SHOWCASE;
  return (
    <div className="grid gap-1.5">
      <Link href={`/components/${hero.slug}`} className={cn(tile, "aspect-[16/10] rounded-[20px] bg-black")}>
        <Image src={hero.src} alt={`${hero.name}, a Pro component`} fill sizes="280px" className="object-cover transition-transform duration-500 group-hover/tile:scale-[1.03] motion-reduce:transition-none" />
        <span className={cn(caption, "bottom-2.5 left-2.5 px-2.5 text-[11.5px]")}>{hero.name}</span>
      </Link>
      <div className="grid grid-cols-2 gap-1.5">
        {pair.map((p) => (
          <Link key={p.slug} href={`/components/${p.slug}`} className={cn(tile, "aspect-[4/3]", p.bg)}>
            <Image src={p.src} alt={`${p.name}, a Pro component`} fill sizes="140px" className="object-contain" />
            <span className={caption}>{p.name}</span>
          </Link>
        ))}
      </div>
      <Link href={`/components/${wide.slug}`} className={cn(tile, "aspect-[667/300] bg-white")}>
        <Image src={wide.src} alt={`${wide.name}, a Pro component`} fill sizes="280px" className="object-contain px-2 pb-5 pt-1" />
        <span className={caption}>{wide.name}</span>
      </Link>
    </div>
  );
}

/** "Early prices: 98 slots left", counted from the orders, only while there are slots to count. */
function EarlySlots({ className }: { className?: string }) {
  const left = slotsLeft(useSlots(true) ?? null);
  if (!left) return null;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-[#ffcc00]/16 px-2.5 py-1 text-[12.5px] font-medium text-[#8a5a00] shadow-[inset_0_0_0_1px_rgba(255,204,0,0.45)] dark:text-[#ffd60a]", className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-[#ffb300]" />
      Early prices: <span className="font-semibold tabular-nums">{left.total}</span> slots left
    </span>
  );
}

/** The thin spectrum ring the Pro things wear on this site. */
const RING =
  "[background:linear-gradient(var(--card),var(--card))_padding-box,linear-gradient(140deg,#0090f7,#6e5bff_30%,#ba62fc_52%,#f2416b_76%,#f55600)_border-box] border-[1.5px] border-transparent";

/**
 * The right-hand column on wide screens, for visitors without Pro: four Pro pieces, what Pro costs, how many early
 * slots are left, then the 21st.dev line and the MCP server. It stays in view while the page scrolls.
 */
export function ProRail({ copy, pricing: given }: { copy: PromoCopy; pricing?: DisplayPricing }) {
  const { isPro, pricing: shell } = useProAccess();
  // the page's own regional prices when it has them, otherwise the ones the site shell already worked out
  const pricing = given ?? shell ?? GLOBAL_PRICING;
  if (isPro) return null;
  const [before, accent, after] = copy.title;
  return (
    <aside aria-label="Nexus UI Pro" className="sticky top-[88px] flex max-h-[calc(100dvh-104px)] flex-col gap-3 overflow-y-auto overscroll-contain pb-2 [scrollbar-width:none]">
      <div className={cn("rounded-[26px] p-2", RING)}>
        <Showcase />
        <div className="px-2.5 pb-2.5 pt-4">
          <h2 className="text-[21px] font-semibold leading-[1.15] tracking-[-0.025em] text-foreground">
            {before}
            <span className="bg-[linear-gradient(90deg,#0090f7,#6e5bff,#ba62fc,#f2416b,#f55600)] bg-clip-text text-transparent">{accent}</span>
            {after}
          </h2>
          <p className="mt-2 text-[14px] leading-[1.5] text-muted-foreground">{copy.body}</p>
          <p className="mt-4 flex items-baseline gap-1.5">
            <span className="text-[28px] font-semibold tabular-nums tracking-[-0.03em] text-foreground">{pricing.pro}</span>
            <span className="text-[14px] text-muted-foreground">a year</span>
          </p>
          <p className="text-[13.5px] text-muted-foreground">or {pricing.allAccess} once, for good</p>
          <Link
            href="/pricing"
            data-plans-source="listing_rail"
            className="pg-cta mt-4 flex h-11 items-center justify-center rounded-full text-[15px] font-semibold text-white transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Get Pro
          </Link>
          <EarlySlots className="mt-3" />
          <p className="mt-3 text-[12.5px] leading-[1.5] text-muted-foreground">
            Pro includes every component, block and template, and the MCP server for your coding agent.
          </p>
        </div>
      </div>

      <Link href="/impact" className="group flex items-start gap-2.5 rounded-2xl px-2 py-1 text-[13.5px] leading-[1.45] text-foreground/80 focus-visible:outline-2 focus-visible:outline-ring">
        <span aria-hidden className="mt-px grid size-6 shrink-0 place-items-center rounded-md bg-[#3b5bff] text-[10px] font-bold text-white">21</span>
        <span>
          Almost 1M views on 21st.dev.{" "}
          <span className="whitespace-nowrap text-link group-hover:underline group-hover:underline-offset-4">
            See our impact <ChevronRight className="inline size-3.5 -translate-y-px" aria-hidden />
          </span>
        </span>
      </Link>

      <Link href="/mcp" className="pg-float group block rounded-[22px] bg-card p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <span className="inline-flex rounded-full bg-[conic-gradient(from_210deg,#0a84ff,#bf5af2,#ff375f,#ff9f0a,#0a84ff)] px-2 py-px text-[11px] font-semibold text-white">New</span>
        <p className="mt-2 flex items-center justify-between gap-2 text-[15px] font-semibold tracking-[-0.015em] text-foreground">
          Your agent adds them by name
          <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </p>
        <p className="mt-2 rounded-2xl bg-foreground/[0.05] px-3.5 py-2.5 text-[13.5px] leading-[1.45] text-foreground/85">
          &ldquo;Add the Eclipse Toggle to my settings page&rdquo;
        </p>
        <p className="mt-2 text-[12.5px] text-muted-foreground">Works in Claude, Cursor and Codex.</p>
      </Link>
    </aside>
  );
}

/**
 * The Pro card's place below 1280px, where there is no right column: one band in the page, under the filters.
 */
export function ProBand({ copy, pricing: given, className }: { copy: PromoCopy; pricing?: DisplayPricing; className?: string }) {
  const { isPro, pricing: shell } = useProAccess();
  const pricing = given ?? shell ?? GLOBAL_PRICING;
  if (isPro) return null;
  return (
    <div className={cn("flex items-center gap-4 rounded-[24px] p-2 pr-3 xl:hidden", RING, className)}>
      <Link href="/components/glass-drop" className="relative hidden aspect-[16/10] w-[112px] shrink-0 overflow-hidden rounded-[16px] bg-black sm:block" aria-label="Glass Drop, a Pro component">
        <Image src={SHOWCASE.hero.src} alt="" fill sizes="112px" className="object-cover" />
      </Link>
      <div className="min-w-0 flex-1 py-1 pl-2 sm:pl-0">
        <p className="text-[16px] font-semibold leading-tight tracking-[-0.02em] text-foreground">{copy.band}</p>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          {pricing.pro} a year, or {pricing.allAccess} once.
        </p>
        <EarlySlots className="mt-2 sm:hidden" />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <Link
          href="/pricing"
          data-plans-source="listing_band"
          className="pg-cta inline-flex h-10 items-center rounded-full px-4 text-[14px] font-semibold text-white transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Get Pro
        </Link>
      </div>
    </div>
  );
}
