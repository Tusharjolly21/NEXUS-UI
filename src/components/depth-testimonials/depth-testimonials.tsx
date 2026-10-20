"use client";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";

export type DepthTestimonial = {
  quote: string;
  name: string;
  role?: string;
  /** Two colours for the avatar gradient. */
  tone?: [string, string];
};

export type DepthTestimonialsProps = {
  /** Testimonials, front first. Takes priority over `quotes`. */
  items?: DepthTestimonial[];
  /** Plain quotes (older API); shown without a byline. */
  quotes?: string[];
  /** Auto-advance every this many ms, paused while hovered or focused. 0 turns it off. */
  interval?: number;
  /** Heading above the deck. An empty string hides the header. */
  heading?: string;
  /** Small caption above the heading. */
  eyebrow?: string;
  /** Hint under the controls. An empty string hides it. */
  hint?: string;
  /** Called with the index of the testimonial that comes to the front. */
  onChange?: (index: number) => void;
  /** Pulls the deck and flies cards past every 2.8s until someone touches it. */
  autoplay?: boolean;
  className?: string;
};

export const DEFAULT_DEPTH_TESTIMONIALS: DepthTestimonial[] = [
  {
    quote: "We rebuilt the pricing page in an afternoon. The motion feels expensive and the code reads like we wrote it.",
    name: "Priya Raman",
    role: "Design lead, Fieldnote",
    tone: ["#5ac8fa", "#0071e3"],
  },
  {
    quote: "Reduced motion is handled for us. Our accessibility review took ten minutes instead of a week.",
    name: "Tomás Reyes",
    role: "Frontend engineer, Harborline",
    tone: ["#ffb340", "#ff6b3d"],
  },
  {
    quote: "Launch week sign-ups were up a third. People kept replying to the email just to ask how the page moves.",
    name: "Mei Tanaka",
    role: "Founder, Quietly",
    tone: ["#7ee0a1", "#1fa463"],
  },
  {
    quote: "The springs are tuned by someone who cares. Every card lands exactly where your eye expects it.",
    name: "Jonah Okoye",
    role: "Product designer, Lumen Labs",
    tone: ["#d6a4ff", "#8e44ec"],
  },
];

/** Distance between cards along the z axis, in px. */
const GAP = 120;
const SPRING = { type: "spring" as const, stiffness: 170, damping: 19, mass: 0.9 };

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

/** Where card `i` sits relative to the camera: 0 is the front, 1 the next one back, (-1, 0) is flying past. */
const depthOf = (i: number, p: number, n: number) => {
  let d = (((i - p) % n) + n) % n;
  if (d > n - 1) d -= n;
  return d;
};

function DepthCard({ item, i, n, p, reduce }: { item: DepthTestimonial; i: number; n: number; p: MotionValue<number>; reduce: boolean }) {
  const d = useTransform(p, (v) => depthOf(i, v, n));
  const z = useTransform(d, (v) => (v < 0 ? -v * 260 : -v * GAP));
  const y = useTransform(d, (v) => (v < 0 ? v * 30 : -v * 18));
  const opacity = useTransform(d, (v) => (v < 0 ? 1 + v * 1.4 : Math.max(0, 1 - Math.max(0, v - 1.6) * 1.1)));
  const filter = useTransform(d, (v) => (reduce ? "none" : `blur(${(v < 0 ? -v * 8 : Math.max(0, v - 0.6) * 1.6).toFixed(2)}px)`));
  const zIndex = useTransform(d, (v) => Math.round(100 - (v < 0 ? -v : v) * 10 + (v < 0 ? 5 : 0)));
  const ink = useTransform(d, (v) => (v < 0 ? 1 : Math.max(0, 1 - v * 0.85)));
  const tone = item.tone ?? ["#5ac8fa", "#0071e3"];
  return (
    <motion.figure
      className="absolute inset-0 m-0 flex flex-col rounded-[24px] bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]"
      style={{ z, y, opacity, filter, zIndex, transformOrigin: "50% 100%" }}
    >
      <motion.div className="flex h-full flex-col" style={{ opacity: ink }}>
        <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true" className="shrink-0 fill-[#0071e3] dark:fill-[#0a84ff]">
          <path d="M0 16V9.6C0 4.2 2.6 1 7.8 0l1 2.2C5.9 3 4.5 4.8 4.4 7.4H9V16H0Zm12.6 0V9.6c0-5.4 2.6-8.6 7.8-9.6l1 2.2c-2.9.8-4.3 2.6-4.4 5.2h4.6V16h-9Z" />
        </svg>
        <blockquote className="m-0 mt-3 text-[16px] leading-[1.45] tracking-[-0.01em] text-[#1d1d1f] [text-wrap:pretty] dark:text-[#f5f5f7]">
          {item.quote}
        </blockquote>
        {item.name ? (
          <figcaption className="mt-auto flex items-center gap-3 pt-4">
            <span
              className="grid size-9 shrink-0 place-items-center rounded-full text-[12px] font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${tone[0]}, ${tone[1]})` }}
              aria-hidden="true"
            >
              {initials(item.name)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">{item.name}</span>
              {item.role ? <span className="block truncate text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{item.role}</span> : null}
            </span>
          </figcaption>
        ) : null}
      </motion.div>
    </motion.figure>
  );
}

/**
 * Testimonials stacked down a corridor. The front card reads clearly and the
 * rest wait behind it, softer and further away. Next flies the front card
 * past you while the deck surges forward and overshoots; drag the deck to pull
 * it through by hand.
 */
export function DepthTestimonials({
  items,
  quotes,
  interval = 0,
  heading = "Loved by people who ship",
  eyebrow = "Testimonials",
  hint = "Drag the deck, or use the arrows.",
  onChange,
  autoplay = false,
  className = "",
}: DepthTestimonialsProps) {
  const reduce = useReducedMotion() === true;
  const list: DepthTestimonial[] = items ?? (quotes ? quotes.map((q) => ({ quote: q, name: "" })) : DEFAULT_DEPTH_TESTIMONIALS);
  const n = Math.max(1, list.length);
  const p = useMotionValue(0);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const run = useRef<AnimationPlaybackControls | undefined>(undefined);
  const target = useRef(0);
  const touched = useRef(false);
  const drag = useRef<{ x: number; y: number; p: number; t: number; v: number } | null>(null);
  const changeRef = useRef(onChange);
  useEffect(() => {
    changeRef.current = onChange;
  }, [onChange]);

  useMotionValueEvent(p, "change", (v) => {
    const k = ((Math.round(v) % n) + n) % n;
    setIndex((prev) => {
      if (prev !== k) changeRef.current?.(k);
      return k;
    });
  });

  const goTo = (to: number) => {
    target.current = to;
    run.current?.stop();
    run.current = reduce ? (p.set(to), undefined) : animate(p, to, SPRING);
  };
  const step = (dir: number) => goTo(Math.round(target.current) + dir);
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  });

  useEffect(() => () => run.current?.stop(), []);

  useEffect(() => {
    if (!autoplay || n < 2) return;
    let k = 0;
    const local: AnimationPlaybackControls[] = [];
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      k++;
      if (k % 3 === 0 && !reduce) {
        // A hand-pull that doesn't quite make it, then springs back.
        const base = Math.round(target.current);
        run.current?.stop();
        local.push(
          animate(p, base + 0.32, {
            duration: 0.5,
            ease: [0.3, 0, 0.3, 1],
            onComplete: () => {
              if (!touched.current) run.current = animate(p, base, SPRING);
            },
          }),
        );
        return;
      }
      stepRef.current(1);
    }, 2800);
    return () => {
      window.clearInterval(t);
      local.forEach((a) => a.stop());
    };
  }, [autoplay, n, p, reduce]);

  useEffect(() => {
    if (!interval || paused || n < 2) return;
    const t = window.setInterval(() => stepRef.current(1), interval);
    return () => window.clearInterval(t);
  }, [interval, paused, n]);

  const touch = () => {
    touched.current = true;
  };

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    touch();
    if (n < 2) return;
    run.current?.stop();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, p: p.get(), t: e.timeStamp, v: 0 };
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    if (!g) return;
    // Left or up pulls the deck toward you.
    const delta = (g.x - e.clientX + (g.y - e.clientY)) / 220;
    const next = g.p + delta;
    const now = e.timeStamp;
    const dt = Math.max(1, now - g.t);
    g.v = (next - p.get()) / dt;
    g.t = now;
    p.set(next);
  };
  const onUp = () => {
    const g = drag.current;
    if (!g) return;
    drag.current = null;
    const moved = p.get() - g.p;
    const fling = g.v * 180;
    let to = Math.round(g.p);
    if (moved + fling > 0.28) to = Math.round(g.p) + 1;
    else if (moved + fling < -0.28) to = Math.round(g.p) - 1;
    goTo(to);
  };

  const onKey = (e: KeyboardEvent) => {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    touch();
    step(dir);
  };

  const jump = (k: number) => {
    touch();
    const cur = Math.round(target.current);
    const at = ((cur % n) + n) % n;
    let diff = k - at;
    if (diff > n / 2) diff -= n;
    if (diff < -n / 2) diff += n;
    goTo(cur + diff);
  };

  const current = list[index] ?? list[0];
  const btn =
    "grid size-9 place-items-center rounded-full bg-[#f0f0f3] text-[#1d1d1f] outline-none transition-colors hover:bg-[#e6e6ea] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c] dark:focus-visible:ring-[#0a84ff]";

  return (
    <section
      aria-roledescription="carousel"
      aria-label={heading || "Testimonials"}
      className={`flex w-full max-w-[480px] flex-col items-center ${className}`}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {heading ? (
        <header className="mb-7 text-center">
          {eyebrow ? <p className="m-0 text-[12px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{eyebrow}</p> : null}
          <h2 className="m-0 mt-1 text-[24px] font-semibold leading-tight tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">{heading}</h2>
        </header>
      ) : null}

      <div
        role="group"
        aria-roledescription="slide"
        aria-label={`${index + 1} of ${n}`}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="relative h-[200px] w-full cursor-grab touch-none select-none rounded-[24px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f5f7] active:cursor-grabbing dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
        style={{ perspective: 900, perspectiveOrigin: "50% -40%" }}
      >
        <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {list.map((item, i) => (
            <DepthCard key={i} item={item} i={i} n={n} p={p} reduce={reduce} />
          ))}
        </div>
        <span className="sr-only" aria-live="polite">
          {current ? `${current.quote}${current.name ? `, ${current.name}` : ""}` : ""}
        </span>
      </div>

      <div className="mt-6 flex items-center gap-4" onPointerDown={touch}>
        <button type="button" aria-label="Previous testimonial" className={btn} onClick={() => step(-1)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8.5 2.5 4 7l4.5 4.5" />
          </svg>
        </button>
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Choose testimonial">
          {list.map((t, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={t.name || `Testimonial ${i + 1}`}
              onClick={() => jump(i)}
              className="relative grid h-5 w-5 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]"
            >
              <motion.span
                className={`block h-1.5 rounded-full transition-colors ${
                  i === index ? "bg-[#1d1d1f] dark:bg-[#f5f5f7]" : "bg-[#d2d2d7] dark:bg-[#48484a]"
                }`}
                initial={false}
                animate={{ width: i === index ? 18 : 6 }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
              />
            </button>
          ))}
        </div>
        <button type="button" aria-label="Next testimonial" className={btn} onClick={() => step(1)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5.5 2.5 10 7l-4.5 4.5" />
          </svg>
        </button>
      </div>
      {hint ? <p className="m-0 mt-3 text-[12px] text-[#86868b] dark:text-[#a1a1a6]">{hint}</p> : null}
    </section>
  );
}
