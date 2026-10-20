"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from "framer-motion";
import { cn } from "@/lib/utils";

type HoverHighlightTextElement = "h1" | "h2" | "p" | "span";

export type HoverHighlightTextProps = {
  /** The sentence to highlight. */
  text: string;
  /** Element used for the text. */
  as?: HoverHighlightTextElement;
  /** Classes for the text element (size, weight, width). */
  baseClassName?: string;
  /** Classes for every marker stroke, e.g. a custom background colour. */
  highlightClassName?: string;
  /** Classes for the outer wrapper that listens to the pointer. */
  containerClassName?: string;
  /** How far from the pointer, in px, a word still gets highlighted. */
  reach?: number;
  /** @deprecated Use `reach`. When given without `reach`, reach is 35% of it. */
  spotlightRadius?: number;
  /** Colour of words that are not highlighted. Defaults to a mid grey. */
  baseColor?: string;
  /** Colour of highlighted words. Defaults to the ink colour. */
  highlightColor?: string;
  /** Marker colour (any CSS colour). Defaults to a highlighter yellow. */
  markerColor?: string;
  /** Seconds a word stays highlighted after the pointer moves on. */
  linger?: number;
  /** Spring for the marker stroke. The default overshoots a little. */
  springConfig?: SpringOptions;
  /** Turns the effect off and shows plain text. */
  disabled?: boolean;
  /** Sweeps a highlighter across the words, line by line, until a real pointer arrives. */
  autoplay?: boolean;
  /** @deprecated No longer used; the marker replaced the spotlight mask. */
  spotlightSoftness?: number;
  /** @deprecated No longer used. */
  strokeColor?: string;
  /** @deprecated No longer used. */
  strokeWidth?: number;
  /** @deprecated No longer used. */
  enableGlow?: boolean;
};

function subscribeTheme(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
/** Follows the site's class-based dark mode; false on the server and during hydration. */
function useIsDark() {
  return React.useSyncExternalStore(subscribeTheme, () => document.documentElement.classList.contains("dark"), () => false);
}

/** tailwind-merge drops a default `leading-*` whenever a later `text-*` size arrives, so the default goes last unless the caller set one. */
const withLeading = (cls: string | undefined, fallback: string) => (/(^|\s)([\w-]+:)*leading-/.test(cls ?? "") ? undefined : fallback);

const SPRING: SpringOptions = { stiffness: 320, damping: 17, mass: 0.7 };

type Slot = { el: HTMLSpanElement | null; heat: MotionValue<number> };

function Word({
  word,
  index,
  register,
  spring,
  base,
  ink,
  marker,
  markerClassName,
}: {
  word: string;
  index: number;
  register: (i: number, slot: Slot) => () => void;
  spring: SpringOptions;
  base: string;
  ink: string;
  marker: string;
  markerClassName?: string;
}) {
  const heat = useMotionValue(0);
  const s = useSpring(heat, spring);
  const color = useTransform(s, [0, 1], [base, ink], { clamp: true });
  const scaleX = useTransform(s, (v) => Math.max(0, v));
  const opacity = useTransform(s, (v) => Math.min(1, Math.max(0, v * 3)));
  const el = React.useRef<HTMLSpanElement>(null);
  React.useEffect(() => register(index, { el: el.current, heat }), [register, index, heat]);
  return (
    <span ref={el} className="relative inline-block">
      <motion.span
        aria-hidden="true"
        className={cn("pointer-events-none absolute inset-x-[-0.08em] bottom-[0.04em] top-[0.32em] rounded-[0.16em]", markerClassName)}
        style={{ scaleX, opacity, originX: 0, skewX: -8, backgroundColor: markerClassName && /\bbg-/.test(markerClassName) ? undefined : marker }}
      />
      <motion.span className="relative" style={{ color }}>
        {word}
      </motion.span>
    </span>
  );
}

/**
 * A headline you read with a highlighter. Words near the pointer get inked and a marker stroke
 * swipes in under each one with a small overshoot; as the pointer moves on, the strokes linger
 * and retract one after another like a comet tail. One rAF loop writes every word's heat into
 * motion values, so React never re-renders while you move.
 */
export function HoverHighlightText({
  text,
  as = "h2",
  baseClassName,
  highlightClassName,
  containerClassName,
  reach,
  spotlightRadius,
  baseColor,
  highlightColor,
  markerColor,
  linger = 0.9,
  springConfig,
  disabled = false,
  autoplay = false,
}: HoverHighlightTextProps) {
  const still = useReducedMotion() === true;
  const dark = useIsDark();
  const Tag = as;
  const words = React.useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const root = React.useRef<HTMLDivElement>(null);
  const slots = React.useRef<Slot[]>([]);
  const pointer = React.useRef<{ x: number; y: number } | null>(null);
  const touched = React.useRef(false);
  const wake = React.useRef<() => void>(() => {});
  const span = Math.max(4, reach ?? (spotlightRadius !== undefined ? spotlightRadius * 0.35 : 40));
  const cfg = React.useRef({ reach: span, linger });
  React.useEffect(() => {
    cfg.current = { reach: span, linger: Math.max(0.05, linger) };
  }, [span, linger]);

  const off = disabled || still;
  const register = React.useCallback((i: number, slot: Slot) => {
    slots.current[i] = slot;
    return () => {
      if (slots.current[i] === slot) delete slots.current[i];
    };
  }, []);

  // The heat loop. It sleeps when nothing is lit and no pointer (real or demo) is around.
  React.useEffect(() => {
    if (off) return;
    let raf = 0;
    let last = 0;
    let ghost: { x: number; y: number } | null = null;
    let demoWord = 0;
    let demoAt = 0;
    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      const { reach: near, linger: hold } = cfg.current;
      const list = slots.current;
      // Autoplay: a highlighter glides from word to word, line by line, then starts over.
      if (autoplay && !touched.current) {
        const target = list[demoWord]?.el;
        if (target) {
          const tx = target.offsetLeft + target.offsetWidth * 0.9;
          const ty = target.offsetTop + target.offsetHeight * 0.55;
          ghost = ghost ? { x: ghost.x + (tx - ghost.x) * Math.min(1, dt * 12), y: ghost.y + (ty - ghost.y) * Math.min(1, dt * 12) } : { x: target.offsetLeft, y: ty };
        }
        if (now - demoAt > (demoWord >= list.length - 1 ? 1600 : 170)) {
          demoAt = now;
          demoWord = demoWord >= list.length - 1 ? 0 : demoWord + 1;
          if (demoWord === 0) ghost = null;
        }
      } else ghost = null;
      const p = pointer.current ?? ghost;
      let busy = !!p;
      list.forEach((slot) => {
        if (!slot?.el) return;
        const el = slot.el;
        let target = 0;
        if (p) {
          const dx = Math.max(el.offsetLeft - p.x, 0, p.x - (el.offsetLeft + el.offsetWidth));
          const dy = Math.max(el.offsetTop - p.y, 0, p.y - (el.offsetTop + el.offsetHeight));
          const d = Math.hypot(dx, dy * 1.6);
          target = d < near ? 1 : 0;
        }
        const cur = slot.heat.get();
        const next = target >= cur ? target : Math.max(0, cur - dt / hold);
        if (next !== cur) slot.heat.set(next);
        if (next > 0) busy = true;
      });
      raf = busy ? requestAnimationFrame(tick) : 0;
      if (!busy) last = 0;
    };
    wake.current = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    if (autoplay) wake.current();
    return () => {
      cancelAnimationFrame(raf);
      wake.current = () => {};
    };
  }, [off, autoplay, words]);

  const base = baseColor ?? (dark ? "#6e6e73" : "#86868b");
  const ink = highlightColor ?? (dark ? "#f5f5f7" : "#1d1d1f");
  const marker = markerColor ?? (dark ? "rgba(255,214,10,0.34)" : "rgba(255,214,10,0.62)");

  const locate = (e: React.PointerEvent) => {
    const r = root.current?.getBoundingClientRect();
    const tag = root.current?.firstElementChild as HTMLElement | null;
    if (!r || !tag) return;
    // Word offsets are measured from the text element, so measure the pointer from it too.
    const t = tag.getBoundingClientRect();
    pointer.current = { x: e.clientX - t.left, y: e.clientY - t.top };
    wake.current();
  };

  return (
    <div
      ref={root}
      className={cn("relative inline-block max-w-full", containerClassName)}
      onPointerEnter={(e) => {
        touched.current = true;
        locate(e);
      }}
      onPointerMove={locate}
      onPointerLeave={() => {
        pointer.current = null;
      }}
    >
      <Tag className={cn("relative m-0 text-balance text-center text-[40px] font-semibold tracking-[-0.035em] sm:text-[52px]", baseClassName, withLeading(baseClassName, "leading-[1.12]"))}>
        {off ? (
          <span style={{ color: ink }}>{text}</span>
        ) : (
          <>
            <span className="sr-only">{text}</span>
            <span aria-hidden="true" key={dark ? "d" : "l"}>
              {words.map((w, i) => (
                <React.Fragment key={`${w}-${i}`}>
                  <Word word={w} index={i} register={register} spring={springConfig ?? SPRING} base={base} ink={ink} marker={marker} markerClassName={highlightClassName} />
                  {i < words.length - 1 ? " " : null}
                </React.Fragment>
              ))}
            </span>
          </>
        )}
      </Tag>
    </div>
  );
}
