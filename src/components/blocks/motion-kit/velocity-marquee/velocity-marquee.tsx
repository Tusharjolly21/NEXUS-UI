"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface VelocityMarqueeReview {
  /** The short quote, shown in curly quotes. */
  quote: string;
  /** Who said it, for example "Arjun, Tally". The first letter fills the avatar. */
  name: string;
}

export interface VelocityMarqueeProps {
  /** Small line above the belts. */
  heading?: string;
  /** Replaces the heading when the visitor prefers reduced motion and the rows hold still. */
  staticHeading?: string;
  /** Reviews on the top belt (runs left). Five or more fill a wide screen. Use a stable array. */
  topRow?: VelocityMarqueeReview[];
  /** Reviews on the bottom belt (runs right). Use a stable array. */
  bottomRow?: VelocityMarqueeReview[];
  className?: string;
}

/* Invented people and quotes for the demo. Replace with real, attributed quotes before publishing. */
export const DEFAULT_VELOCITY_TOP_ROW: VelocityMarqueeReview[] = [
  { quote: "Shipped our pricing page in an afternoon", name: "Arjun, Tally" },
  { quote: "The motion is the good kind", name: "Lena, Wayfare" },
  { quote: "Visitors play with the hero", name: "Sara, Orbitly" },
  { quote: "Feels expensive. Wasn't.", name: "Dev, indie" },
  { quote: "Respects reduced motion out of the box", name: "Noor, Quadrel" },
];
export const DEFAULT_VELOCITY_BOTTOM_ROW: VelocityMarqueeReview[] = [
  { quote: "Copy, paste, ship", name: "Tom, Relay" },
  { quote: "Our onboarding finally feels like us", name: "Maya, Loop" },
  { quote: "Clients ask who built it", name: "Kai, studio" },
  { quote: "Designers and devs stopped arguing", name: "Eli, Paraleon" },
  { quote: "The small details win", name: "Ana, Velara" },
];

const MASK = "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)";
const TOP_TINT = "linear-gradient(135deg,#0a84ff,#5e5ce6)";
const BOTTOM_TINT = "linear-gradient(135deg,#ff9f0a,#ff375f)";
const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

/** Wraps v into [min, max) so the belt loops forever. */
const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

function ReviewPill({ review, tint, hidden }: { review: VelocityMarqueeReview; tint: string; hidden?: boolean }) {
  return (
    <figure
      className="m-0 flex flex-none items-center gap-3 rounded-full bg-white py-2.5 pl-2.5 pr-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_8px_20px_-14px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_8px_20px_-14px_rgba(0,0,0,.9)]"
      aria-hidden={hidden ? true : undefined}
    >
      <span
        className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-[13px] font-bold text-white"
        style={{ background: tint }}
        aria-hidden="true"
      >
        {review.name.charAt(0).toUpperCase()}
      </span>
      <blockquote className="m-0 whitespace-nowrap text-[15px] font-medium tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">
        &ldquo;{review.quote}&rdquo;
      </blockquote>
      <figcaption className="whitespace-nowrap text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">{review.name}</figcaption>
    </figure>
  );
}

function Row({
  items,
  dir,
  boost,
  tint,
  paused,
}: {
  items: VelocityMarqueeReview[];
  dir: 1 | -1;
  boost: MotionValue<number>;
  tint: string;
  paused: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root);
  const base = useMotionValue(0);
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);
  const skew = useTransform(boost, (b) => Math.max(-14, Math.min(14, b * -dir * 0.9)));
  const hover = useRef(false);
  const slow = useSpring(1, { stiffness: 120, damping: 20 });
  const drag = useRef<{ x: number } | null>(null);
  const width = useRef(1);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useAnimationFrame((_, delta) => {
    // Off screen the belt holds still; framer already stops this loop in a hidden tab.
    if (!inView || drag.current) return;
    slow.set(pausedRef.current ? 0 : hover.current ? 0.12 : 1);
    // Base speed plus whatever the page scroll is adding, in the direction you scroll.
    const b = boost.get();
    const speed = (2.2 + Math.abs(b) * 0.6) * slow.get();
    const sign = b < -0.5 ? -dir : dir;
    base.set(base.get() + sign * -speed * (Math.min(delta, 64) / 1000));
  });

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX };
    width.current = Math.max(1, e.currentTarget.scrollWidth / 2);
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    base.set(base.get() + ((e.clientX - d.x) / width.current) * 50);
    d.x = e.clientX;
  };
  const up = () => {
    drag.current = null;
  };

  const doubled = [...items, ...items];
  return (
    <div
      ref={root}
      className="relative overflow-hidden py-2"
      onPointerEnter={() => {
        hover.current = true;
      }}
      onPointerLeave={() => {
        hover.current = false;
        up();
      }}
    >
      <motion.div
        // The right padding equals one gap, so half of the width is exactly one set and the loop is seamless.
        className="flex w-max cursor-grab touch-pan-y gap-3 pr-3 active:cursor-grabbing"
        style={{ x, skewX: skew }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        {doubled.map((review, i) => (
          <ReviewPill key={i} review={review} tint={tint} hidden={i >= items.length} />
        ))}
      </motion.div>
    </div>
  );
}

function StaticRow({ items, tint }: { items: VelocityMarqueeReview[]; tint: string }) {
  return (
    <div className="flex flex-wrap justify-center gap-3 px-4 py-2">
      {items.map((review, i) => (
        <ReviewPill key={i} review={review} tint={tint} />
      ))}
    </div>
  );
}

/**
 * Two belts of reviews running opposite ways, wired to the page scroll. Scroll and both belts speed up
 * and lean into it; scroll back up and they reverse. Hovering a row brakes it so you can read, and you
 * can grab a row and drag it. Under reduced motion the belts stop and the reviews sit in static rows.
 */
export function VelocityMarquee({
  heading = "Scroll the page and watch them go.",
  staticHeading = "What teams are saying.",
  topRow = DEFAULT_VELOCITY_TOP_ROW,
  bottomRow = DEFAULT_VELOCITY_BOTTOM_ROW,
  className,
}: VelocityMarqueeProps) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const boost = useSpring(
    useTransform(velocity, (v) => v / 120),
    { stiffness: 80, damping: 30 },
  );
  const [paused, setPaused] = useState(false);

  return (
    <section
      aria-label="Customer reviews"
      className={cn("relative w-full overflow-hidden bg-white py-14 dark:bg-black", className)}
    >
      <div className="mb-5 flex flex-col items-center gap-1 px-4 text-center">
        <p className="m-0 text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{reduce ? staticHeading : heading}</p>
        {!reduce && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className={cn(
              "h-7 rounded-full px-3 text-[12px] font-medium text-[#0071e3] hover:underline dark:text-[#0a84ff]",
              FOCUS,
            )}
          >
            {paused ? "Resume motion" : "Pause motion"}
          </button>
        )}
      </div>
      {reduce ? (
        <div className="flex flex-col gap-1">
          <StaticRow items={topRow} tint={TOP_TINT} />
          <StaticRow items={bottomRow} tint={BOTTOM_TINT} />
        </div>
      ) : (
        <div style={{ maskImage: MASK, WebkitMaskImage: MASK }}>
          <Row items={topRow} dir={1} boost={boost} tint={TOP_TINT} paused={paused} />
          <Row items={bottomRow} dir={-1} boost={boost} tint={BOTTOM_TINT} paused={paused} />
        </div>
      )}
    </section>
  );
}
