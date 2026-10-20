"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export interface WallOfLoveQuote {
  text: string;
  name: string;
  role: string;
  /** Avatar colour, any CSS colour. The avatar shows the person's initials. */
  color: string;
}

export interface WallOfLoveProps {
  quotes?: WallOfLoveQuote[];
  eyebrow?: string;
  title?: string;
  /** Any CSS colour. Leave empty to use Apple blue, which brightens in dark mode. */
  accent?: string;
  /** Scrolls the columns. With `false` the wall starts paused and the viewer can press play. */
  autoplay?: boolean;
  className?: string;
}

/* Invented people and quotes for the demo. Replace with real, attributed quotes before publishing. */
export const DEFAULT_WALL_OF_LOVE_QUOTES: WallOfLoveQuote[] = [
  { text: "We replaced three tools and a weekly spreadsheet ritual. Monday mornings are quiet now.", name: "Avery Lin", role: "COO, logistics startup", color: "#ff9f0a" },
  { text: "The live charts are the first dashboard our sales team actually opens.", name: "Jordan Reyes", role: "Head of Sales, B2B software", color: "#0a84ff" },
  { text: "Setup took one afternoon. I kept waiting for the catch.", name: "Sam Okafor", role: "Founder, design studio", color: "#30d158" },
  { text: "Our board deck builds itself now. I just add the commentary.", name: "Priya Shah", role: "CFO, retail group", color: "#bf5af2" },
  { text: "Permissions that follow the org chart saved our IT team weeks.", name: "Noah Berg", role: "IT Lead, 400-person company", color: "#ff375f" },
  { text: "Support replied in four minutes on a Sunday. Four.", name: "Lena Fischer", role: "Ops Manager, marketplace", color: "#5e5ce6" },
  { text: "It's the only tool everyone on the team agreed on in the first week.", name: "Marco Silva", role: "Engineering Manager, fintech", color: "#30b0c7" },
  { text: "The weekly summary email is genuinely the best email I get.", name: "Hana Mori", role: "CEO, travel app", color: "#ff6b4a" },
  { text: "We spotted a churn spike two weeks earlier than we would have.", name: "Theo Grant", role: "Head of CS, subscription box", color: "#0b8f6a" },
];

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

function QuoteCard({ quote }: { quote: WallOfLoveQuote }) {
  return (
    <figure className="m-0 mb-4 flex flex-col gap-5 rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_18px_36px_-28px_rgba(0,0,0,.35)] sm:p-6 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_18px_36px_-28px_rgba(0,0,0,.9)]">
      <div className="flex gap-0.5" role="img" aria-label="Rated 5 out of 5">
        {Array.from({ length: 5 }, (_, i) => (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#ff9f0a" d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.4L12 18.3 5.5 22l1.7-7.4L1.5 9.6 9 8.9z" />
          </svg>
        ))}
      </div>
      <blockquote className="m-0 text-[16px] leading-[1.5] tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">{quote.text}</blockquote>
      <figcaption className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-[12px] font-semibold text-white"
          style={{ background: `linear-gradient(140deg, ${quote.color}, color-mix(in srgb, ${quote.color} 66%, transparent))` }}
        >
          {initials(quote.name)}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{quote.name}</span>
          <span className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{quote.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

function Column({
  quotes,
  speed,
  paused,
  still,
  className,
}: {
  quotes: WallOfLoveQuote[];
  speed: number;
  paused: boolean;
  still: boolean;
  className?: string;
}) {
  const y = useMotionValue(0);
  const rate = useSpring(paused ? 0 : 1, { stiffness: 60, damping: 18 });
  const track = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  const [held, setHeld] = useState(false);
  const stopped = paused || held;

  useEffect(() => {
    rate.set(stopped || hovering.current ? 0 : 1);
  }, [stopped, rate]);

  useAnimationFrame((_, delta) => {
    if (still) return;
    const el = track.current;
    const half = el ? el.scrollHeight / 2 : 0;
    const r = rate.get();
    if (!half || r < 0.001) return;
    let next = y.get() - (speed * r * Math.min(delta, 64)) / 1000;
    if (next <= -half) next += half;
    if (next > 0) next -= half;
    y.set(next);
  });

  if (still) {
    return (
      <div className={cn("relative h-full overflow-y-auto overscroll-contain py-[12%] [scrollbar-width:none]", className)}>
        {quotes.map((q, i) => (
          <QuoteCard key={`${i}-${q.name}`} quote={q} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn("relative h-full overflow-hidden", className)}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        hovering.current = true;
        rate.set(0);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        hovering.current = false;
        rate.set(stopped ? 0 : 1);
      }}
      onPointerUp={(e) => {
        if (e.pointerType !== "mouse") setHeld((h) => !h);
      }}
    >
      <motion.div ref={track} style={{ y }}>
        {quotes.map((q, i) => (
          <QuoteCard key={`${i}-${q.name}`} quote={q} />
        ))}
        <div aria-hidden="true">
          {quotes.map((q, i) => (
            <QuoteCard key={`copy-${i}-${q.name}`} quote={q} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Wall of testimonials in columns that scroll endlessly in opposite directions. Hover a column
 * (or tap it on touch screens) and it eases to a stop so it can be read; the pause button stops
 * the whole wall. With reduced motion the columns stand still and scroll by hand.
 */
export function WallOfLove({
  quotes = DEFAULT_WALL_OF_LOVE_QUOTES,
  eyebrow = "Wall of love",
  title = "Teams switch, then tell their friends.",
  accent,
  autoplay = true,
  className,
}: WallOfLoveProps) {
  const reduce = useReducedMotion() ?? false;
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? !autoplay;
  const halves = [quotes.filter((_, i) => i % 2 === 0), quotes.filter((_, i) => i % 2 === 1)];
  const thirds = [0, 1, 2].map((k) => quotes.filter((_, i) => i % 3 === k));
  const mask = "linear-gradient(transparent, #000 12%, #000 88%, transparent)";
  const accentStyle = accent ? ({ "--mk-accent-text": accent } as CSSProperties) : undefined;

  return (
    <section
      style={accentStyle}
      className={cn(
        "@container w-full bg-[#f5f5f7] px-4 py-16 [--mk-accent-text:#0071e3] sm:px-5 sm:py-20 dark:bg-black dark:[--mk-accent-text:#2997ff]",
        className,
      )}
    >
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-10 flex flex-col items-center gap-3 text-center sm:mb-12">
          <span className="text-[14px] font-semibold text-[var(--mk-accent-text)]">{eyebrow}</span>
          <h2 className="m-0 max-w-[700px] text-balance text-[clamp(32px,5vw,54px)] font-semibold leading-[1.04] tracking-[-0.04em] text-[#1d1d1f] dark:text-[#f5f5f7]">
            {title}
          </h2>
        </div>
        <div
          className="grid h-[560px] grid-cols-1 gap-4 @2xl:h-[640px] @2xl:grid-cols-2 @5xl:grid-cols-3"
          style={{ maskImage: mask, WebkitMaskImage: mask }}
        >
          <Column quotes={quotes} speed={34} paused={paused} still={reduce} className="@2xl:hidden" />
          <Column quotes={halves[0]} speed={34} paused={paused} still={reduce} className="hidden @2xl:block @5xl:hidden" />
          <Column quotes={halves[1]} speed={-26} paused={paused} still={reduce} className="hidden @2xl:block @5xl:hidden" />
          <Column quotes={thirds[0]} speed={34} paused={paused} still={reduce} className="hidden @5xl:block" />
          <Column quotes={thirds[1]} speed={-26} paused={paused} still={reduce} className="hidden @5xl:block" />
          <Column quotes={thirds[2]} speed={40} paused={paused} still={reduce} className="hidden @5xl:block" />
        </div>
        {!reduce && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              aria-pressed={paused}
              onClick={() => setUserPaused(!paused)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06)] outline-none transition-colors hover:bg-[#fafafa] focus-visible:ring-2 focus-visible:ring-[var(--mk-accent-text)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)] dark:hover:bg-[#2c2c2e]"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="currentColor">
                {paused ? <path d="M3 1.5v9l7.5-4.5z" /> : <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />}
              </svg>
              {paused ? "Play wall" : "Pause wall"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
