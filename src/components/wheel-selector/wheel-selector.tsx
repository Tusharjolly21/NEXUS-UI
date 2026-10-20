"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";

/** Kept for compatibility. The dial now follows the site's light or dark mode, so this is ignored. */
export type WheelTheme = "obsidian" | "midnight" | "arctic" | "ember" | "custom";
/** "responsive" puts the panel beside the dial when there is room, "desktop" always does, "mobile" always stacks. */
export type WheelVariant = "responsive" | "desktop" | "mobile";
export type WheelContentMode = "minimal" | "detailed" | "hidden";
export type WheelAnimationSpeed = "slow" | "medium" | "fast";
export type WheelIconName =
  | "analytics"
  | "boxes"
  | "brush"
  | "code"
  | "compass"
  | "cpu"
  | "globe"
  | "layers"
  | "idea"
  | "marketing"
  | "pen"
  | "rocket"
  | "search"
  | "security"
  | "sparkles"
  | "target";

export type WheelItem = {
  id: string;
  /** Short name on the dial's hub and in the accessible label. */
  label: string;
  /** Headline in the panel. */
  title: string;
  /** Eyebrow above the title. */
  subtitle?: string;
  description?: string;
  /** Accent for this item's node, eyebrow and CTA. */
  accentColor?: string;
  icon?: WheelIconName;
  /** Your own icon image instead of a built-in icon. */
  iconImageUrl?: string;
  /** Optional picture shown in the detailed panel. */
  image?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export type WheelSelectorProps = {
  items?: WheelItem[];
  /** @deprecated Ignored; the dial follows light and dark mode. */
  theme?: WheelTheme;
  variant?: WheelVariant;
  contentMode?: WheelContentMode;
  /** Controlled selection. */
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  /** Radius of the ring of nodes, in px (80 to 220). */
  ringRadius?: number;
  /** Ticks round the rim (12 to 120). */
  tickCount?: number;
  showTicks?: boolean;
  /** The 02 / 06 counter in the hub. */
  showCounter?: boolean;
  /** Show each item's CTA link in the panel. */
  showCTA?: boolean;
  /** Turns the wheel one stop at a time until someone touches it. */
  autoplay?: boolean;
  /** Older name for `autoplay`. */
  autoRotate?: boolean;
  /** Milliseconds between autoplay turns. */
  autoRotateInterval?: number;
  /** How snappy the snap spring is. */
  animationSpeed?: WheelAnimationSpeed;
  /** Accent for items without their own accentColor. */
  accentColor?: string;
  className?: string;
};

const P: Record<WheelIconName, string> = {
  analytics: "M2.5 13.5h11M4.5 11V8M8 11V4.5M11.5 11V6.5",
  boxes: "M8 1.8l5.5 3v6.4L8 14.2l-5.5-3V4.8zM2.5 4.8L8 8l5.5-3.2M8 8v6.2",
  brush: "M13.5 2.5L7 9M7 9c-1.6-.4-3 .6-3 2.2 0 1.2-.6 2-1.5 2.3 1 .5 4.5.6 5.6-1.3.6-1 .3-2.4-1.1-3.2z",
  code: "M5.5 4.5L2 8l3.5 3.5M10.5 4.5L14 8l-3.5 3.5M9 3l-2 10",
  compass: "M8 1.8a6.2 6.2 0 100 12.4A6.2 6.2 0 008 1.8zM10.6 5.4L9.2 9.2 5.4 10.6l1.4-3.8z",
  cpu: "M4.5 4.5h7v7h-7zM6.5 6.5h3v3h-3zM6 2v2.5M10 2v2.5M6 11.5V14M10 11.5V14M2 6h2.5M2 10h2.5M11.5 6H14M11.5 10H14",
  globe: "M8 1.8a6.2 6.2 0 100 12.4A6.2 6.2 0 008 1.8zM1.8 8h12.4M8 1.8c1.9 1.9 2.5 3.8 2.5 6.2S9.9 12.3 8 14.2C6.1 12.3 5.5 10.4 5.5 8S6.1 3.7 8 1.8z",
  layers: "M8 2l6 3.2-6 3.2-6-3.2zM2 8.2l6 3.2 6-3.2M2 11l6 3.2 6-3.2",
  idea: "M6 12h4M6.5 14h3M8 1.8a4.4 4.4 0 00-2.6 8c.4.3.6.8.6 1.2v1h4v-1c0-.4.2-.9.6-1.2A4.4 4.4 0 008 1.8z",
  marketing: "M2.5 6.5v3h2l5 3v-9l-5 3zM12 5.5a3.5 3.5 0 010 5M4.5 9.5l1 4",
  pen: "M10.5 2.5l3 3-8 8H2.5v-3zM9 4l3 3",
  rocket: "M9.5 2.5c2.5 0 4 1.5 4 4L9 11 5 7zM5 7L2.5 7.5 4 5.5h3M9 11l-.5 2.5 2-1.5V9M4.5 11.5L2.5 13.5",
  search: "M7 12.2a5.2 5.2 0 100-10.4 5.2 5.2 0 000 10.4zM14.2 14.2l-3.4-3.4",
  security: "M8 1.5l5.5 2v4c0 3.5-2.4 6-5.5 7-3.1-1-5.5-3.5-5.5-7v-4zM5.5 8l2 2 3-3.5",
  sparkles: "M8 1.5l1.3 3.7L13 6.5 9.3 7.8 8 11.5 6.7 7.8 3 6.5l3.7-1.3zM12.5 10.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z",
  target: "M8 1.8a6.2 6.2 0 100 12.4A6.2 6.2 0 008 1.8zM8 4.6a3.4 3.4 0 100 6.8 3.4 3.4 0 000-6.8zM8 7.2a.8.8 0 100 1.6.8.8 0 000-1.6z",
};

export const DEFAULT_WHEEL_ITEMS: WheelItem[] = [
  { id: "strategy", label: "Strategy", title: "Product strategy", subtitle: "Direction", description: "Positioning, narratives and roadmaps that line teams up around outcomes you can measure.", accentColor: "#0071e3", icon: "compass", ctaHref: "#" },
  { id: "design", label: "Design", title: "Experience design", subtitle: "Craft", description: "Clear interfaces and expressive visual systems that make hard products feel easy.", accentColor: "#ff9f0a", icon: "pen", ctaHref: "#" },
  { id: "engineering", label: "Engineering", title: "Digital platforms", subtitle: "Build", description: "Fast, reliable front ends on scalable systems, with motion that earns its place.", accentColor: "#30d158", icon: "code", ctaHref: "#" },
  { id: "growth", label: "Growth", title: "Launch campaigns", subtitle: "Reach", description: "Launch moments that turn your product story into attention, and attention into sign-ups.", accentColor: "#ff375f", icon: "rocket", ctaHref: "#" },
  { id: "insights", label: "Insights", title: "User research", subtitle: "Learn", description: "Interviews and analytics that turn what users do into decisions you can defend.", accentColor: "#bf5af2", icon: "analytics", ctaHref: "#" },
  { id: "systems", label: "Systems", title: "Design systems", subtitle: "Scale", description: "Components, tokens and docs in one system your teams can extend without asking.", accentColor: "#5ac8fa", icon: "layers", ctaHref: "#" },
];

const SPEED: Record<WheelAnimationSpeed, { stiffness: number; damping: number }> = {
  slow: { stiffness: 110, damping: 14 },
  medium: { stiffness: 170, damping: 16 },
  fast: { stiffness: 260, damping: 20 },
};

const r3 = (n: number) => Math.round(n * 1000) / 1000;
const wrap = (i: number, n: number) => ((i % n) + n) % n;

function Glyph({ item, className }: { item: WheelItem; className: string }) {
  if (item.iconImageUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- accepts any customer-hosted icon URL
    return <img src={item.iconImageUrl} alt="" className={`${className} object-contain`} draggable={false} />;
  }
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[item.icon ?? "sparkles"]} />
    </svg>
  );
}

/** One node on the ring. Rides the ring's rotation, stays upright, and swells as it nears the top. */
function Node({
  item,
  index,
  step,
  radius,
  rot,
  counter,
  accent,
  active,
}: {
  item: WheelItem;
  index: number;
  step: number;
  radius: number;
  rot: MotionValue<number>;
  counter: MotionValue<number>;
  accent: string;
  active: boolean;
}) {
  const theta = index * step;
  const near = useTransform(rot, (r) => {
    const a = wrap(theta + r + 180, 360) - 180;
    return Math.max(0, 1 - Math.abs(a) / step);
  });
  const scale = useTransform(near, (k) => 0.86 + k * 0.34);
  return (
    <div className="absolute left-1/2 top-1/2 size-0" style={{ transform: `rotate(${theta}deg) translateY(${-radius}px) rotate(${-theta}deg)` }}>
      <motion.div className="absolute" style={{ rotate: counter, left: -26, top: -26 }}>
        <motion.span
          data-node={index}
          style={{ scale, background: active ? accent : undefined }}
          className={`grid size-[52px] cursor-pointer place-items-center rounded-full transition-[background-color,color,box-shadow] duration-200 ${
            active
              ? "text-white shadow-[0_10px_22px_-10px_rgba(0,0,0,.55)]"
              : "bg-white text-[#6e6e73] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_8px_18px_-12px_rgba(0,0,0,.4)] hover:text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#a1a1a6] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_8px_18px_-12px_rgba(0,0,0,.9)] dark:hover:text-[#f5f5f7]"
          }`}
        >
          <Glyph item={item} className="size-[22px]" />
        </motion.span>
      </motion.div>
    </div>
  );
}

/**
 * A radial selector. Drag the dial round and let go (or fling it): it coasts,
 * snaps to the nearest stop and overshoots a touch before it settles. The
 * node at the top swells and fills with its colour, the hub counter rolls,
 * and the panel swaps to that item. Arrow keys, the scroll wheel and clicks
 * on a node turn it too.
 */
export function WheelSelector({
  items = DEFAULT_WHEEL_ITEMS,
  variant = "responsive",
  contentMode = "detailed",
  activeIndex: controlled,
  onActiveChange,
  ringRadius = 112,
  tickCount = 60,
  showTicks = true,
  showCounter = true,
  showCTA = false,
  autoplay = false,
  autoRotate = false,
  autoRotateInterval = 3000,
  animationSpeed = "medium",
  accentColor = "#0071e3",
  className = "",
}: WheelSelectorProps) {
  const list = items.length ? items : DEFAULT_WHEEL_ITEMS;
  const n = list.length;
  const step = 360 / n;
  const R = Math.max(80, Math.min(ringRadius, 220));
  const S = 2 * (R + 42);
  const ticks = Math.max(12, Math.min(tickCount, 120));
  const reduce = useReducedMotion() === true;
  const uid = useId().replace(/:/g, "");
  const spring = SPEED[animationSpeed] ?? SPEED.medium;

  const start = wrap(controlled ?? 0, n);
  const rot = useMotionValue(-start * step);
  const counter = useTransform(rot, (r) => -r);
  const [active, setActive] = useState(start);
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const dial = useRef<HTMLDivElement>(null);
  const drag = useRef<{ last: number; t: number; v: number; moved: number; node: number | null } | null>(null);
  const touched = useRef(false);
  const lastWheel = useRef(0);
  const report = useRef(onActiveChange);
  useEffect(() => {
    report.current = onActiveChange;
  }, [onActiveChange]);

  useMotionValueEvent(rot, "change", (r) => {
    const i = wrap(Math.round(-r / step), n);
    setActive((a) => (a === i ? a : i));
  });

  // Tell the parent once the wheel has settled on a new stop.
  const settled = useRef(start);
  const settle = (i: number) => {
    if (settled.current !== i) {
      settled.current = i;
      report.current?.(i);
    }
  };

  const snapTo = (target: number, velocity = 0) => {
    anim.current?.stop();
    const i = wrap(Math.round(-target / step), n);
    if (reduce) {
      rot.set(target);
      settle(i);
      return;
    }
    anim.current = animate(rot, target, { type: "spring", ...spring, velocity, onComplete: () => settle(i) });
  };

  const goIndex = (i: number) => {
    const cur = rot.get();
    const want = -i * step;
    // Take the short way round.
    const diff = wrap(want - cur + 180, 360) - 180;
    snapTo(Math.round((cur + diff) / step) * step);
  };

  const nudge = (dir: number) => {
    const target = Math.round(rot.get() / step) * step - dir * step;
    snapTo(target);
  };

  // Controlled selection.
  useEffect(() => {
    if (controlled === undefined) return;
    const i = wrap(controlled, n);
    const cur = wrap(Math.round(-rot.get() / step), n);
    if (i === cur) return;
    const diff = wrap(-i * step - rot.get() + 180, 360) - 180;
    anim.current?.stop();
    anim.current = animate(rot, Math.round((rot.get() + diff) / step) * step, reduce ? { duration: 0 } : { type: "spring", ...spring });
    settled.current = i;
  }, [controlled, n, step, rot, reduce, spring]);

  const playing = autoplay || autoRotate;
  useEffect(() => {
    if (!playing || n < 2) return;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      anim.current?.stop();
      const target = Math.round(rot.get() / step) * step - step;
      anim.current = animate(rot, target, reduce ? { duration: 0 } : { type: "spring", ...spring });
    }, Math.max(1200, Math.min(autoRotateInterval, 15000)));
    return () => window.clearInterval(t);
  }, [playing, n, step, rot, reduce, spring, autoRotateInterval]);

  const angleOf = (e: RPointerEvent) => {
    const el = dial.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };

  const down = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    touched.current = true;
    anim.current?.stop();
    e.currentTarget.setPointerCapture(e.pointerId);
    const hit = (e.target as HTMLElement).closest("[data-node]");
    drag.current = { last: angleOf(e), t: performance.now(), v: 0, moved: 0, node: hit ? Number(hit.getAttribute("data-node")) : null };
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const a = angleOf(e);
    const delta = wrap(a - d.last + 180, 360) - 180;
    const now = performance.now();
    const dt = Math.max(1, now - d.t);
    d.v = d.v * 0.6 + (delta / dt) * 1000 * 0.4;
    d.last = a;
    d.t = now;
    d.moved += Math.abs(delta);
    rot.set(rot.get() + delta);
  };
  const up = () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    if (d.moved < 3 && d.node !== null) {
      goIndex(d.node);
      return;
    }
    const v = Math.max(-1400, Math.min(1400, d.v));
    // Coast a little in the direction of the fling, then snap with the release velocity.
    const projected = rot.get() + v * 0.22;
    snapTo(Math.round(projected / step) * step, v);
  };

  useEffect(() => {
    const el = dial.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) + Math.abs(e.deltaX) < 4) return;
      e.preventDefault();
      touched.current = true;
      const now = Date.now();
      if (now - lastWheel.current < 260) return;
      lastWheel.current = now;
      const dir = e.deltaY > 0 || e.deltaX > 0 ? 1 : -1;
      anim.current?.stop();
      const target = Math.round(rot.get() / step) * step - dir * step;
      const i = wrap(Math.round(-target / step), n);
      anim.current = animate(rot, target, reduce ? { duration: 0 } : { type: "spring", ...spring, onComplete: () => report.current?.(i) });
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, [rot, step, n, reduce, spring]);

  const key = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") nudge(1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") nudge(-1);
    else if (e.key === "Home") goIndex(0);
    else if (e.key === "End") goIndex(n - 1);
    else return;
    e.preventDefault();
    touched.current = true;
  };

  const item = list[active];
  const accent = item.accentColor ?? accentColor;
  const side = variant === "desktop" ? "flex-row" : variant === "mobile" ? "flex-col" : "flex-col @min-[560px]:flex-row";

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Wheel selector"
      className={`@container w-full rounded-[28px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] ${className}`}
    >
      <div className={`flex items-center gap-6 ${side}`}>
        <div className="flex shrink-0 flex-col items-center gap-2">
          <div
            ref={dial}
            role="slider"
            tabIndex={0}
            aria-label="Choose an item"
            aria-valuemin={1}
            aria-valuemax={n}
            aria-valuenow={active + 1}
            aria-valuetext={`${item.label}, ${active + 1} of ${n}`}
            onKeyDown={key}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            className="relative max-w-full cursor-grab touch-none select-none rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071e3] active:cursor-grabbing dark:focus-visible:outline-[#0a84ff]"
            style={{ width: S, height: S }}
          >
            <div className="absolute inset-[14px] rounded-full bg-[#f5f5f7] shadow-[inset_0_1px_2px_rgba(0,0,0,.06)] dark:bg-[#2c2c2e] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,.5)]" />
            <svg className="absolute inset-0 overflow-visible" width={S} height={S} aria-hidden="true">
              <circle cx={S / 2} cy={S / 2} r={R} fill="none" className="stroke-[#e5e5ea] dark:stroke-[#3a3a3c]" strokeWidth="1" />
              {showTicks ? (
                <motion.g style={{ rotate: rot, originX: "50%", originY: "50%" }}>
                  {Array.from({ length: ticks }, (_, i) => {
                    const a = ((i / ticks) * 360 - 90) * (Math.PI / 180);
                    const major = i % Math.max(1, Math.round(ticks / n)) === 0;
                    const r1 = S / 2 - (major ? 12 : 9);
                    const r2 = S / 2 - 4;
                    return (
                      <line
                        key={i}
                        x1={r3(S / 2 + Math.cos(a) * r1)}
                        y1={r3(S / 2 + Math.sin(a) * r1)}
                        x2={r3(S / 2 + Math.cos(a) * r2)}
                        y2={r3(S / 2 + Math.sin(a) * r2)}
                        strokeWidth={major ? 1.6 : 1}
                        strokeLinecap="round"
                        className={major ? "stroke-[#aeaeb2] dark:stroke-[#636366]" : "stroke-[#d2d2d7] dark:stroke-[#48484a]"}
                      />
                    );
                  })}
                </motion.g>
              ) : null}
              <path d={`M${S / 2 - 6} 1 L${S / 2 + 6} 1 L${S / 2} 10 Z`} style={{ fill: accent, transition: "fill .3s" }} />
            </svg>
            <motion.div className="absolute inset-0" style={{ rotate: rot }}>
              {list.map((it, i) => (
                <Node
                  key={it.id}
                  item={it}
                  index={i}
                  step={step}
                  radius={R}
                  rot={rot}
                  counter={counter}
                  accent={it.accentColor ?? accentColor}
                  active={i === active}
                />
              ))}
            </motion.div>
            <div className="pointer-events-none absolute left-1/2 top-1/2 flex size-[96px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_14px_28px_-16px_rgba(0,0,0,.45)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_14px_28px_-16px_rgba(0,0,0,.9)]">
              {showCounter ? (
                <span className="flex items-baseline text-[26px] font-semibold leading-none tracking-[-0.04em] tabular-nums">
                  <span className="relative inline-flex h-[26px] overflow-hidden">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={active}
                        initial={reduce ? false : { y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={reduce ? undefined : { y: "-100%", opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 32 }}
                      >
                        {String(active + 1).padStart(2, "0")}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <span className="ml-0.5 text-[12px] font-medium tracking-normal text-[#86868b] dark:text-[#8e8e93]">/{String(n).padStart(2, "0")}</span>
                </span>
              ) : null}
              <span className="mt-1 max-w-[80px] truncate text-[11px] font-semibold" style={{ color: accent }}>
                {item.label}
              </span>
            </div>
          </div>
          <span className="text-[12px] text-[#86868b] dark:text-[#a1a1a6]">Drag the dial, or fling it.</span>
        </div>

        {contentMode !== "hidden" ? (
          <div className="relative min-h-[150px] w-full min-w-0 flex-1" aria-live="polite" id={`${uid}-panel`}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={item.id}
                initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduce ? undefined : { opacity: 0, y: -10, filter: "blur(6px)" }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              >
                {item.subtitle ? (
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: accent }}>
                    {item.subtitle}
                  </p>
                ) : null}
                <h3 className="mt-1.5 text-[28px] font-semibold leading-[1.08] tracking-[-0.035em] [text-wrap:balance]">{item.title}</h3>
                {contentMode === "detailed" && item.description ? (
                  <p className="mt-2.5 max-w-[34ch] text-[14px] leading-relaxed text-[#6e6e73] dark:text-[#a1a1a6]">{item.description}</p>
                ) : null}
                {contentMode === "detailed" && item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- accepts any local or remote URL
                  <img src={item.image} alt="" className="mt-4 aspect-[16/9] w-full max-w-[280px] rounded-[16px] object-cover" draggable={false} />
                ) : null}
                {showCTA && item.ctaHref ? (
                  <a
                    href={item.ctaHref}
                    className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold text-white outline-none transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] active:scale-[.97] dark:focus-visible:outline-[#0a84ff]"
                    style={{ background: accent }}
                  >
                    {item.ctaLabel ?? "Learn more"}
                    <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2.5 6h7M6.5 3l3 3-3 3" />
                    </svg>
                  </a>
                ) : null}
              </motion.div>
            </AnimatePresence>
            <div className="mt-5 flex gap-1.5" aria-hidden="true">
              {list.map((it, i) => (
                <motion.span
                  key={it.id}
                  className="h-1.5 rounded-full"
                  animate={{ width: i === active ? 22 : 6, backgroundColor: i === active ? accent : "rgba(142,142,147,.35)" }}
                  transition={{ type: "spring", stiffness: 420, damping: 30 }}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
