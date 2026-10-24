Add the "Word Magnet" component from Nexus UI to my project.

A headline whose words behave like fridge magnets: the pointer pushes nearby words away, each one tilts in the direction it was shoved, holds for a beat, then springs home with a wobble. Whole words move, letters never split, and it works with touch as well as a mouse.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { WordMagnet } from "@/components/word-magnet";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/word-magnet/index.ts ---

```ts
export { WordMagnet } from "./word-magnet";
export type { WordMagnetProps } from "./word-magnet";
```

--- components/word-magnet/word-magnet.tsx ---

```tsx
"use client";

import * as React from "react";
import { motion, useMotionValue, useReducedMotion, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export type WordMagnetProps = {
  /** Text split into magnetic words (letters never split). */
  text?: string;
  /** Pointer influence radius in px. */
  radius?: number;
  /** Push strength, 0 to 1. */
  force?: number;
  /** Damping of the return spring. Lower wobbles longer, higher settles flat. */
  damping?: number;
  /** Milliseconds a pushed word holds its place before it springs back. */
  returnDelay?: number;
  /** Turns the effect off on touch screens and narrow viewports. */
  disableOnMobile?: boolean;
  /** Whether pushed words may spill out of the text box. */
  overflow?: React.CSSProperties["overflow"];
  className?: string;
  /** Classes for every word. */
  wordClassName?: string;
  style?: React.CSSProperties;
  /** A ghost pointer drifts through the words until a real pointer arrives. */
  autoplay?: boolean;
};

type Slot = { el: HTMLSpanElement | null; x: MotionValue<number>; y: MotionValue<number>; r: MotionValue<number> };
type Body = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; hold: number };

function useNarrowOrTouch(enabled: boolean) {
  return React.useSyncExternalStore(
    (cb) => {
      if (!enabled) return () => {};
      const mq = window.matchMedia("(max-width: 767px), (pointer: coarse)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => enabled && window.matchMedia("(max-width: 767px), (pointer: coarse)").matches,
    () => false,
  );
}

/** tailwind-merge drops a default `leading-*` whenever a later `text-*` size arrives, so the default goes last unless the caller set one. */
const withLeading = (cls: string | undefined, fallback: string) => (/(^|\s)([\w-]+:)*leading-/.test(cls ?? "") ? undefined : fallback);

function Word({ word, index, register, className }: { word: string; index: number; register: (i: number, s: Slot) => () => void; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const r = useMotionValue(0);
  const el = React.useRef<HTMLSpanElement>(null);
  React.useEffect(() => register(index, { el: el.current, x, y, r }), [register, index, x, y, r]);
  return (
    <motion.span ref={el} aria-hidden="true" className={cn("inline-block whitespace-nowrap will-change-transform", className)} style={{ x, y, rotate: r }}>
      {word}
    </motion.span>
  );
}

/**
 * A headline whose words behave like fridge magnets. The pointer pushes nearby words away; each
 * one tilts in the direction it is shoved, holds for a beat, then springs home on an under-damped
 * spring so it wobbles before it settles. One rAF loop integrates every word and writes straight
 * into motion values.
 */
export function WordMagnet({
  text = "Magnetic words react to your cursor and snap back into place",
  radius = 130,
  force = 0.45,
  damping = 28,
  returnDelay = 360,
  disableOnMobile = false,
  overflow = "visible",
  className,
  wordClassName,
  style,
  autoplay = false,
}: WordMagnetProps) {
  const still = useReducedMotion() === true;
  const blocked = useNarrowOrTouch(disableOnMobile);
  const off = still || blocked;
  const words = React.useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const root = React.useRef<HTMLDivElement>(null);
  const slots = React.useRef<Slot[]>([]);
  const pointer = React.useRef<{ x: number; y: number } | null>(null);
  const touched = React.useRef(false);
  const wake = React.useRef<() => void>(() => {});
  const gx = useMotionValue(-100);
  const gy = useMotionValue(-100);
  const go = useMotionValue(0);
  const cfg = React.useRef({ radius, force, damping, returnDelay });
  React.useEffect(() => {
    cfg.current = { radius: Math.max(10, radius), force: Math.max(0, force), damping: Math.max(1, damping), returnDelay: Math.max(0, returnDelay) };
  }, [radius, force, damping, returnDelay]);

  const register = React.useCallback((i: number, s: Slot) => {
    slots.current[i] = s;
    return () => {
      if (slots.current[i] === s) delete slots.current[i];
    };
  }, []);

  React.useEffect(() => {
    if (off) {
      slots.current.forEach((s) => {
        s?.x.set(0);
        s?.y.set(0);
        s?.r.set(0);
      });
      return;
    }
    const bodies: Body[] = [];
    let raf = 0;
    let last = 0;
    let t = 0;
    const tick = (now: number) => {
      const dt = last ? Math.min(0.033, (now - last) / 1000) : 0.016;
      last = now;
      const { radius: R, force: F, damping: D, returnDelay: hold } = cfg.current;
      const host = root.current;
      let ghost: { x: number; y: number } | null = null;
      if (autoplay && !touched.current && host) {
        t += dt;
        ghost = { x: host.clientWidth * (0.5 + Math.sin(t * 0.7) * 0.46), y: host.clientHeight * (0.5 + Math.sin(t * 1.3 + 0.6) * 0.42) };
        gx.set(ghost.x);
        gy.set(ghost.y);
        go.set(1);
      } else go.set(0);
      const p = pointer.current ?? ghost;
      let moving = !!p;
      slots.current.forEach((s, i) => {
        if (!s?.el) return;
        const b = (bodies[i] ??= { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, hold: 0 });
        if (p) {
          // Rest position comes from layout offsets, which transforms do not change.
          const cx = s.el.offsetLeft + s.el.offsetWidth / 2;
          const cy = s.el.offsetTop + s.el.offsetHeight / 2;
          const dx = cx - p.x;
          const dy = cy - p.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < R) {
            // Mostly vertical: words share a line, so a sideways shove would just pile them into their neighbours.
            const k = (1 - d / R) ** 1.6 * F * 80;
            b.tx = (dx / d) * k * 0.55;
            b.ty = (dy / d) * k;
            b.hold = now + hold;
          }
        }
        if (now > b.hold) {
          b.tx = 0;
          b.ty = 0;
        }
        const stiff = 190;
        const c = D * 0.5;
        b.vx += (stiff * (b.tx - b.x) - c * b.vx) * dt;
        b.vy += (stiff * (b.ty - b.y) - c * b.vy) * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        s.x.set(Math.round(b.x * 100) / 100);
        s.y.set(Math.round(b.y * 100) / 100);
        s.r.set(Math.max(-14, Math.min(14, b.x * 0.16 + b.vx * 0.012)));
        if (Math.abs(b.x) + Math.abs(b.y) + Math.abs(b.vx) + Math.abs(b.vy) > 0.05 || now < b.hold) moving = true;
      });
      raf = moving ? requestAnimationFrame(tick) : 0;
      if (!moving) last = 0;
    };
    wake.current = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    if (autoplay) wake.current();
    return () => {
      cancelAnimationFrame(raf);
      wake.current = () => {};
    };
  }, [off, autoplay, words, gx, gy, go]);

  const locate = (e: React.PointerEvent<HTMLDivElement>) => {
    if (off) return;
    const r = e.currentTarget.getBoundingClientRect();
    touched.current = true;
    pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    wake.current();
  };

  return (
    <div
      ref={root}
      onPointerEnter={locate}
      onPointerMove={locate}
      onPointerDown={locate}
      onPointerLeave={() => {
        pointer.current = null;
      }}
      onPointerCancel={() => {
        pointer.current = null;
      }}
      className={cn(
        "relative flex max-w-5xl touch-pan-y flex-wrap items-center justify-center gap-x-[0.24em] gap-y-[0.08em] text-center text-[40px] font-semibold tracking-[-0.035em] text-[#1d1d1f] sm:text-[52px] dark:text-[#f5f5f7]",
        className,
        withLeading(className, "leading-[1.12]"),
      )}
      style={{ overflow, ...style }}
    >
      <span className="sr-only">{text}</span>
      {words.map((w, i) =>
        off ? (
          <span key={`${w}-${i}`} aria-hidden="true" className={cn("inline-block whitespace-nowrap", wordClassName)}>
            {w}
          </span>
        ) : (
          <Word key={`${w}-${i}`} word={w} index={i} register={register} className={wordClassName} />
        ),
      )}
      {autoplay && !off ? (
        <motion.span aria-hidden="true" className="pointer-events-none absolute left-0 top-0" style={{ x: gx, y: gy, opacity: go }}>
          <span className="block size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0071e3]/15 shadow-[0_0_0_1.5px_rgba(0,113,227,.55)] dark:bg-[#0a84ff]/20 dark:shadow-[0_0_0_1.5px_rgba(10,132,255,.7)]" />
        </motion.span>
      ) : null}
    </div>
  );
}

export default WordMagnet;
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
