Add the "Infinite Moving Cards" component from Nexus UI to my project.

A belt of cards that cruises sideways forever and fades out at the edges. Hover and it eases to a stop; grab it and fling, and it coasts on your throw, leaning into the speed, before it settles back to cruising.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { InfiniteMovingCards } from "@/components/infinite-moving-cards";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/infinite-moving-cards/InfiniteMovingCards.tsx ---

```tsx
"use client";
import { useEffect, useLayoutEffect, useRef, type KeyboardEvent, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

export type InfiniteMovingCardItem = {
  id?: string | number;
  title?: string;
  description?: string;
  /** Image URL drawn across the top of the card. */
  image?: string;
  /** Avatar URL. Initials on a gradient are drawn when it's missing. */
  avatar?: string;
  name?: string;
  role?: string;
  /** 0–5 stars. */
  rating?: number;
  tags?: string[];
};

export type InfiniteMovingCardsProps<T extends InfiniteMovingCardItem = InfiniteMovingCardItem> = {
  items: T[];
  /** Which way the belt cruises. */
  direction?: "left" | "right";
  /** Cruise speed preset. */
  speed?: "slow" | "normal" | "fast";
  /** Ease the belt to a stop while hovered or focused. */
  pauseOnHover?: boolean;
  className?: string;
  /** Classes for each card's wrapper, e.g. a width. */
  cardClassName?: string;
  /** Space between cards in px. */
  gap?: number;
  /** Repeat the items so the belt never runs out. */
  loop?: boolean;
  /** Fade the cards out at the left and right edges. */
  showGradientMask?: boolean;
  /** Let people grab the belt and fling it. */
  draggable?: boolean;
  /** Draw your own card. */
  renderItem?: (item: T, index: number) => ReactNode;
  /** Flings the belt back and forth every few seconds until someone touches it. */
  autoplay?: boolean;
};

const SPEED: Record<NonNullable<InfiniteMovingCardsProps["speed"]>, number> = { slow: 26, normal: 44, fast: 74 };

const TONES = [
  ["#5ac8fa", "#0071e3"],
  ["#ffb340", "#ff6b3d"],
  ["#7ee0a1", "#1fa463"],
  ["#d6a4ff", "#8e44ec"],
  ["#ff8fa3", "#ff375f"],
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

function Stars({ n }: { n: number }) {
  const k = Math.max(0, Math.min(5, Math.round(n)));
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${k} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className={i < k ? "fill-[#ff9f0a]" : "fill-[#d2d2d7] dark:fill-[#48484a]"}>
          <path d="M6 .8 7.6 4l3.5.5-2.6 2.4.7 3.5L6 8.7 2.8 10.4l.7-3.5L.9 4.5 4.4 4Z" />
        </svg>
      ))}
    </span>
  );
}

function DefaultCard({ item, index }: { item: InfiniteMovingCardItem; index: number }) {
  const tone = TONES[index % TONES.length];
  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-[22px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]">
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- consumer-supplied image of any origin
        <img src={item.image} alt={item.title ?? ""} className="h-32 w-full object-cover" draggable={false} />
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        {typeof item.rating === "number" ? <Stars n={item.rating} /> : null}
        {item.title ? <h3 className="m-0 mt-2.5 text-[16px] font-semibold leading-snug tracking-[-0.02em]">{item.title}</h3> : null}
        {item.description ? <p className="m-0 mt-1.5 text-[14px] leading-[1.5] text-[#424245] [text-wrap:pretty] dark:text-[#d1d1d6]">{item.description}</p> : null}
        {item.tags?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-[#f0f0f3] px-2.5 py-0.5 text-[11px] font-medium text-[#6e6e73] dark:bg-[#2c2c2e] dark:text-[#a1a1a6]">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        {item.name || item.role ? (
          <div className="mt-auto flex items-center gap-2.5 pt-4">
            {item.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element -- consumer-supplied avatar of any origin
              <img src={item.avatar} alt="" className="size-8 shrink-0 rounded-full object-cover" draggable={false} />
            ) : item.name ? (
              <span
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white"
                style={{ background: `linear-gradient(135deg, ${tone[0]}, ${tone[1]})` }}
              >
                {initials(item.name)}
              </span>
            ) : null}
            <span className="min-w-0">
              {item.name ? <span className="block truncate text-[13px] font-semibold tracking-[-0.01em]">{item.name}</span> : null}
              {item.role ? <span className="block truncate text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{item.role}</span> : null}
            </span>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/**
 * A belt of cards that cruises sideways forever. Hover and it eases to a
 * stop; grab it and fling, and it coasts on your throw, leaning into the
 * speed, before it settles back to cruising.
 */
export function InfiniteMovingCards<T extends InfiniteMovingCardItem = InfiniteMovingCardItem>({
  items,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className = "",
  cardClassName = "",
  gap = 16,
  loop = true,
  showGradientMask = true,
  draggable = true,
  renderItem,
  autoplay = false,
}: InfiniteMovingCardsProps<T>) {
  const reduce = useReducedMotion() === true;
  const x = useMotionValue(0);
  const vel = useMotionValue(0);
  const lean = useSpring(
    useTransform(vel, [-2400, 0, 2400], [5, 0, -5], { clamp: true }),
    { stiffness: 200, damping: 22 },
  );
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const size = useRef({ set: 0, view: 0 });
  const hold = useRef(false);
  const fling = useRef(0);
  const touched = useRef(false);
  const flung = useRef(false);
  const drag = useRef<{ startX: number; lastX: number; t: number; v: number; live: boolean; id: number } | null>(null);
  const list = items ?? [];
  const rendered = loop ? [...list, ...list] : list;

  const conf = useRef({ direction, speed, pauseOnHover, loop, reduce, count: list.length });
  useEffect(() => {
    conf.current = { direction, speed, pauseOnHover, loop, reduce, count: list.length };
  });

  useLayoutEffect(() => {
    const v = viewport.current;
    const t = track.current;
    if (!v || !t) return;
    const measure = () => {
      size.current = { set: loop ? t.scrollWidth / 2 : t.scrollWidth, view: v.clientWidth };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(v);
    ro.observe(t);
    return () => ro.disconnect();
  }, [loop, gap, list.length]);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    let factor = 1;
    let pos = 0;
    let started = false;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      const c = conf.current;
      const { set, view } = size.current;
      if (!set) return;
      if (!started) {
        started = true;
        pos = c.loop && c.direction === "right" ? -set : 0;
      }
      const g = drag.current;
      let v: number;
      if (g?.live) {
        v = g.v;
        pos += g.lastX - g.startX;
        g.startX = g.lastX;
      } else {
        const want = c.reduce || c.count < 2 || (c.pauseOnHover && hold.current) ? 0 : 1;
        factor += (want - factor) * (1 - Math.exp(-dt * 4));
        fling.current = Math.abs(fling.current) < 4 ? 0 : fling.current * Math.exp(-dt * 2.2);
        v = (c.direction === "left" ? -1 : 1) * SPEED[c.speed] * factor + fling.current;
        pos += v * dt;
      }
      if (c.loop) {
        pos = ((pos % set) + set) % set - set;
      } else {
        pos = Math.max(-Math.max(0, set - view), Math.min(0, pos));
      }
      x.set(Math.round(pos * 100) / 100);
      vel.set(c.reduce ? 0 : v);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [x, vel]);

  useEffect(() => {
    if (!autoplay || reduce) return;
    let k = 0;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      fling.current = k++ % 2 === 0 ? -1700 : 1300;
    }, 3400);
    return () => window.clearInterval(t);
  }, [autoplay, reduce]);

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    if (!draggable || (e.pointerType === "mouse" && e.button !== 0)) return;
    drag.current = { startX: e.clientX, lastX: e.clientX, t: e.timeStamp, v: 0, live: false, id: e.pointerId };
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const g = drag.current;
    if (!g) return;
    if (!g.live) {
      if (Math.abs(e.clientX - g.startX) < 5) return;
      g.live = true;
      g.startX = e.clientX;
      e.currentTarget.setPointerCapture(g.id);
    }
    const dt = Math.max(8, e.timeStamp - g.t) / 1000;
    g.v = g.v * 0.5 + ((e.clientX - g.lastX) / dt) * 0.5;
    g.lastX = e.clientX;
    g.t = e.timeStamp;
  };
  const onUp = () => {
    const g = drag.current;
    drag.current = null;
    if (!g?.live) return;
    flung.current = true;
    window.setTimeout(() => {
      flung.current = false;
    }, 0);
    if (reduce) return;
    const cruise = (direction === "left" ? -1 : 1) * SPEED[speed];
    fling.current = Math.max(-5000, Math.min(5000, g.v - cruise));
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    touched.current = true;
    fling.current += e.key === "ArrowLeft" ? 900 : -900;
  };

  const mask = showGradientMask ? "linear-gradient(to right, transparent, #000 9%, #000 91%, transparent)" : undefined;

  return (
    <div
      className={`relative w-full ${className}`}
      onPointerEnter={() => {
        hold.current = true;
      }}
      onPointerLeave={() => {
        hold.current = false;
      }}
      onFocus={() => {
        hold.current = true;
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hold.current = false;
      }}
    >
      <div
        ref={viewport}
        role="region"
        aria-roledescription="carousel"
        aria-label="Moving cards. Arrow keys push the belt."
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClickCapture={(e) => {
          // A fling is not a click on whatever card was under the pointer.
          if (flung.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className={`overflow-hidden rounded-[24px] py-3 outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff] ${draggable ? "cursor-grab touch-pan-y select-none active:cursor-grabbing" : ""}`}
        style={{ WebkitMaskImage: mask, maskImage: mask }}
      >
        <motion.div ref={track} className="flex w-max" style={{ x, skewX: lean }}>
          {rendered.map((item, idx) => (
            <div
              key={`${item.id ?? "item"}-${idx}`}
              className={`shrink-0 ${cardClassName || (renderItem ? "" : "w-[min(19rem,calc(100vw-4rem))]")}`}
              style={{ marginRight: gap }}
              aria-hidden={loop && idx >= list.length ? true : undefined}
            >
              {renderItem ? renderItem(item, idx % Math.max(1, list.length)) : <DefaultCard item={item} index={idx % Math.max(1, list.length)} />}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
```

--- components/infinite-moving-cards/index.ts ---

```ts
export type { InfiniteMovingCardItem, InfiniteMovingCardsProps } from "./InfiniteMovingCards";
export { InfiniteMovingCards } from "./InfiniteMovingCards";
```
