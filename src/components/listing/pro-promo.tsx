"use client";

import { WasPrice } from "@/components/pricing/sale-badge";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, Pause, Play } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useProAccess } from "@/components/pro/pro-access";
import { useSlots } from "@/components/site/use-slots";
import { slotsLeft } from "@/lib/launch-slots";
import { GLOBAL_PRICING, type DisplayPricing } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { CollageRow } from "@/components/pro/upgrade-dialog";
import { LINE_COMMENT, MiniQuote } from "@/components/home/reddit-love";

export type PromoCopy = {
  /** The card's heading. `accent` is the part set in the spectrum (a number, or "Pro"). */
  title: [before: string, accent: string, after: string];
  /** One or two sentences under it, about this page's things. */
  body: string;
  /** The band's one line, for narrower screens. */
  band: string;
};

/** The Pro pieces the band under 1280px shows (the column has the spotlight instead). */
const SHOWCASE = {
  hero: { slug: "glass-drop", name: "Glass Drop", src: "/promo/glass-drop.webp", w: 720, h: 353 },
  pair: [
    { slug: "heat-field", name: "Heat Field", src: "/promo/heat-field.webp", w: 442, h: 283, bg: "bg-white" },
    { slug: "liquid-send", name: "Liquid Send", src: "/promo/liquid-send.webp", w: 431, h: 335, bg: "bg-[#f5f5f7]" },
  ],
  wide: { slug: "standing-calendar", name: "Standing Calendar", src: "/promo/standing-calendar.webp", w: 667, h: 350 },
} as const;




/**
 * The best Pro pieces, one at a time: each holds for a few seconds with a slow push-in, then the next slides over it.
 * The set is long and the day picks where it starts, so the column looks different from one visit to the next.
 * Pointing at it (or focusing it) holds the current one; under reduced motion it stays still until you step through.
 */
const SPOTLIGHT: { slug: string; name: string; line: string }[] = [
  { slug: "glass-drop", name: "Glass Drop", line: "A logo poured in liquid glass" },
  { slug: "airmail-globe", name: "Airmail Globe", line: "A postcard that folds and flies" },
  { slug: "magic-calendar", name: "Magic Calendar", line: "Fifty festivals, each celebrated" },
  { slug: "eclipse-toggle", name: "Eclipse Toggle", line: "Drag the sun, the moon rises" },
  { slug: "lightfall", name: "Lightfall", line: "A hero lit by falling light" },
  { slug: "silk-print", name: "Silk Print", line: "A scarf that ripples in the breeze" },
  { slug: "dynamic-island", name: "Dynamic Island", line: "Live activity, island style" },
  { slug: "flight-tracker", name: "Flight Tracker", line: "A boarding pass that lands" },
  { slug: "vinyl-player", name: "Vinyl Player", line: "Drop the needle, scratch the record" },
  { slug: "interactive-globe-explorer", name: "Globe Explorer", line: "Spin the world, land anywhere" },
  { slug: "glyph-rain", name: "Glyph Rain", line: "A 404 that hides a message" },
  { slug: "order-tracking", name: "Order Tracking", line: "Every parcel, every step" },
];
const HOLD = 5200;

function Spotlight() {
  const reduce = useReducedMotion();
  const [start] = React.useState(() => Math.floor(Date.now() / 86_400_000) % SPOTLIGHT.length);
  const [step, setStep] = React.useState(0);
  const [held, setHeld] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const at = (start + step) % SPOTLIGHT.length;
  const item = SPOTLIGHT[at];
  const running = !reduce && !held && !paused;
  React.useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => setStep((s) => s + 1), HOLD);
    return () => window.clearTimeout(t);
  }, [running, step]);
  const shown = [0, 1, 2, 3, 4, 5].map((k) => (start + Math.floor(step / 6) * 6 + k) % SPOTLIGHT.length);
  return (
    <div
      className="relative"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <Link
        href={`/components/${item.slug}`}
        className="group/spot relative block aspect-[4/3] overflow-hidden rounded-[20px] bg-[#f2f2f4] shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:bg-[#111113]"
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={item.slug}
            className="absolute inset-0"
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: "18%", scale: 1.04 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: "-12%", scale: 0.98 }}
            transition={{ type: "spring", stiffness: 160, damping: 26, mass: 0.9 }}
          >
            {/* The slow push-in is a CSS transform animation, so it runs on the compositor: driving it from script
                changed the image's transform on every frame. Holding the card pauses it where it is. */}
            <div
              className="absolute inset-0 will-change-transform"
              style={
                reduce
                  ? { transform: "scale(1.02)" }
                  : { animation: `pg-spot-push ${HOLD / 1000 + 0.6}s linear forwards`, animationPlayState: running ? "running" : "paused" }
              }
            >
              <Image src={`/og-shots/components/${item.slug}.jpg`} alt={`${item.name}, a Pro component`} fill sizes="280px" className="object-cover" />
            </div>
          </motion.div>
        </AnimatePresence>
        {/* a dark wash at the foot so the name reads on any shot */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-white">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
              className="min-w-0"
            >
              <p className="truncate text-[15px] font-semibold tracking-[-0.015em]">{item.name}</p>
              <p className="truncate text-[12px] text-white/75">{item.line}</p>
            </motion.div>
          </AnimatePresence>
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-[#1d1d1f] shadow-[0_6px_18px_-6px_rgba(0,0,0,0.6)] transition-transform group-hover/spot:-translate-y-0.5 group-hover/spot:translate-x-0.5">
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </div>
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/45 px-2 py-0.5 text-[10.5px] font-semibold text-white backdrop-blur-md">Pro spotlight</span>
      </Link>
      {/* the next few as story segments: the running one fills, any one can be picked */}
      <div className="mt-2 flex items-center gap-1 px-1">
        {shown.map((k, i) => {
          const on = k === at;
          const past = shown.indexOf(at) > i;
          return (
            <button
              key={`${k}-${i}`}
              type="button"
              onClick={() => setStep((s) => s + ((k - at + SPOTLIGHT.length) % SPOTLIGHT.length))}
              aria-label={`Show ${SPOTLIGHT[k].name}`}
              aria-current={on || undefined}
              className="relative h-1 flex-1 overflow-hidden rounded-full bg-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {on ? (
                // scaleX, not width: animating the width re-laid the page out on every frame
                <span
                  key={`${step}-${running}`}
                  className="absolute inset-0 origin-left rounded-full bg-foreground/70"
                  style={running ? { animation: `pg-spot-fill ${HOLD}ms linear forwards` } : undefined}
                />
              ) : past ? (
                <span className="absolute inset-0 rounded-full bg-foreground/35" />
              ) : null}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setPaused((v) => !v)}
          aria-label={paused ? "Play the spotlight" : "Pause the spotlight"}
          className="ml-1 grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          {paused || reduce ? <Play className="size-3" aria-hidden /> : <Pause className="size-3" aria-hidden />}
        </button>
      </div>
    </div>
  );
}

/** Two rows of Pro screenshots drifting past each other, the strip the upgrade dialog opens with. */
const STRIP: string[][] = [
  ["dynamic-island", "vinyl-player", "airmail-globe", "led-button", "warp-cta", "soap-bubble"],
  ["interactive-globe-explorer", "magic-calendar", "venom-button", "image-galleries", "silk-print", "flight-tracker"],
];

function Strip() {
  return (
    <Link
      href="/components?access=pro"
      className="pg-marquee group/strip relative block overflow-hidden rounded-[18px] bg-[#f2f2f4] py-2.5 shadow-[0_0_0_0.5px_rgba(0,0,0,0.06)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:bg-[#0c0c0e]"
    >
      <div aria-hidden className="flex flex-col gap-2 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <CollageRow slugs={STRIP[0]} time="34s" />
        <CollageRow slugs={STRIP[1]} time="40s" reverse />
      </div>
      <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-card/85 px-3 py-1.5 text-[12.5px] font-semibold text-foreground shadow-[0_0_0_0.5px_rgba(0,0,0,0.08),0_10px_24px_-12px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-transform group-hover/strip:scale-[1.03] dark:bg-[#1c1c1e]/85">
        See every Pro component
        <ChevronRight className="size-3.5" aria-hidden />
      </span>
    </Link>
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
 * The right-hand column on wide screens, for visitors without Pro: a spotlight of the best Pro pieces that changes
 * by itself, what Pro costs, how many early slots are left, a strip of Pro screenshots drifting past, what one
 * visitor said, then the 21st.dev line and the MCP server. It stays in view while the page scrolls.
 */
export function ProRail({ copy, pricing: given }: { copy: PromoCopy; pricing?: DisplayPricing }) {
  const { isPro, pricing: shell } = useProAccess();
  // the page's own regional prices when it has them, otherwise the ones the site shell already worked out
  const pricing = given ?? shell ?? GLOBAL_PRICING;
  if (isPro) return null;
  const [before, accent, after] = copy.title;
  return (
    <aside aria-label="Nexus UI Pro" className="sticky top-[88px] flex max-h-[calc(100dvh-104px)] flex-col gap-3 overflow-y-auto [&>*]:shrink-0 overscroll-contain pb-2 [scrollbar-width:none]">
      <div className={cn("rounded-[26px] p-2", RING)}>
        <Spotlight />
        <div className="px-2.5 pb-2.5 pt-4">
          <h2 className="text-[21px] font-semibold leading-[1.15] tracking-[-0.025em] text-foreground">
            {before}
            <span className="bg-[linear-gradient(90deg,#0090f7,#6e5bff,#ba62fc,#f2416b,#f55600)] bg-clip-text text-transparent">{accent}</span>
            {after}
          </h2>
          <p className="mt-2 text-[14px] leading-[1.5] text-muted-foreground">{copy.body}</p>
          <p className="mt-4 flex items-baseline gap-1.5">
            <span className="text-[28px] font-semibold tabular-nums tracking-[-0.03em] text-foreground">{pricing.pro}</span>
            {pricing.proWas ? <WasPrice was={pricing.proWas} className="text-[15px] text-muted-foreground" /> : null}
            <span className="text-[14px] text-muted-foreground">a year</span>
          </p>
          <p className="text-[13.5px] text-muted-foreground">
            or {pricing.allAccess} {pricing.allAccessWas ? <WasPrice was={pricing.allAccessWas} /> : null} once, for good
          </p>
          {pricing.proSave ? <p className="mt-1.5 text-[12.5px] font-medium text-[#126b3a] dark:text-[#7ee2a8]">{pricing.proSave}% off early prices</p> : null}
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

      <Strip />

      {LINE_COMMENT ? <MiniQuote c={LINE_COMMENT} text="line" className="bg-card shadow-[0_0_0_0.5px_var(--border)]" /> : null}

      <Link href="/impact" className="group flex items-start gap-2.5 rounded-2xl px-2 py-1 text-[13.5px] leading-[1.45] text-foreground/80 focus-visible:outline-2 focus-visible:outline-ring">
        <span aria-hidden className="mt-px grid size-6 shrink-0 place-items-center rounded-md bg-[#3b5bff] text-[10px] font-bold text-white">21</span>
        <span>
          1M views on 21st.dev.{" "}
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
