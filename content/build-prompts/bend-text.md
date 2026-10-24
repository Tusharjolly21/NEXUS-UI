# Bend Text

Add the "Bend Text" component from Nexus UI to my project.

A line of type running along a string that you can grab and pull, with the words flowing round the bend. Let go and an underdamped spring twangs it back, overshooting a few times before it lies flat.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { BendText } from "@/components/bend-text";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/bend-text/bend-text.tsx ---

```tsx
"use client";
import { useEffect, useId, useRef, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";

export interface BendTextProps {
  /** One repeat of the text that runs along the string. It is repeated four times so the line is always full. */
  text?: string;
  /** Colour of the grab point on the string and the focus ring. */
  accent?: string;
  /** Small caption under the stage. Pass an empty string to hide it. */
  hint?: string;
  /** Called when the string is let go, with how far it was pulled from rest (in stage units, 0 to about 120). */
  onPluck?: (pull: number) => void;
  /** Plucks the string every 2.6s until someone touches it. */
  autoplay?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

/** Stage size in SVG units and the resting height of the string. */
const W = 340;
const H = 260;
const Y = 130;
/** How far the text drifts along the string, in SVG units per second (0.06% of the path per frame at 60fps). */
const DRIFT = 11.5;
const SPRING = { stiffness: 180, damping: 4, mass: 0.6 };

/**
 * A line of type you can pluck. Text runs along a string; grab anywhere and
 * pull, and the string bends under your hand with the words flowing round
 * the curve. Let go and it twangs back, overshooting a few times before it
 * lies flat again.
 */
export function BendText({
  text = "PLUCK THE LINE · MAKE IT SING · ",
  accent = "#0071e3",
  hint = "Grab the line, pull, and let go.",
  onPluck,
  autoplay = false,
  className = "",
}: BendTextProps) {
  const id = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const tx = useMotionValue(W / 2);
  const ty = useMotionValue(Y);
  const cx = useSpring(tx, SPRING);
  const cy = useSpring(ty, SPRING);
  // The quadratic's control point is placed so the curve passes through (cx, cy).
  const d = useTransform([cx, cy] as MotionValue<number>[], ([x, y]: number[]) => `M 10 ${Y} Q ${2 * x - W / 2} ${2 * y - Y} ${W - 10} ${Y}`);
  const offset = useMotionValue(0);
  const drag = useRef(false);
  const stage = useRef<HTMLDivElement>(null);
  const measure = useRef<SVGTextElement>(null);
  const touched = useRef(false);
  const anims = useRef<AnimationPlaybackControls[]>([]);

  const stopAnims = () => {
    anims.current.forEach((a) => a.stop());
    anims.current = [];
  };

  // Drift the text along the string, wrapping by exactly one repeat so the loop is seamless.
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    let last = 0;
    let period = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (!period) period = measure.current?.getComputedTextLength() ?? 0;
      const p = period || 450;
      let o = offset.get() - DRIFT * dt;
      if (o < -p) o += p;
      offset.set(o);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [offset, reduce, text]);

  /** Pull the string to (px, py) over half a second, then let it go. */
  const pluck = (px: number, py: number) => {
    stopAnims();
    tx.jump(cx.get());
    ty.jump(cy.get());
    anims.current = [
      animate(tx, px, { duration: 0.5, ease: "easeOut" }),
      animate(ty, py, {
        duration: 0.5,
        ease: "easeOut",
        onComplete: () => {
          tx.set(W / 2);
          ty.set(Y);
        },
      }),
    ];
  };
  const pluckRef = useRef(pluck);
  useEffect(() => {
    pluckRef.current = pluck;
  });

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      pluckRef.current(90 + Math.random() * 160, Math.random() > 0.5 ? 40 : 220);
    }, 2600);
    return () => clearInterval(t);
  }, [autoplay]);

  useEffect(() => () => stopAnims(), []);

  const local = (e: RPointerEvent) => {
    const r = stage.current?.getBoundingClientRect();
    if (!r || !r.width || !r.height) return { x: W / 2, y: Y };
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const release = () => {
    if (!drag.current) return;
    drag.current = false;
    onPluck?.(Math.hypot(tx.get() - W / 2, ty.get() - Y));
    tx.set(W / 2);
    ty.set(Y);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const target =
      e.key === "ArrowUp" || e.key === "Enter" || e.key === " "
        ? { x: W / 2, y: 40 }
        : e.key === "ArrowDown"
          ? { x: W / 2, y: 220 }
          : e.key === "ArrowLeft"
            ? { x: 90, y: 40 }
            : e.key === "ArrowRight"
              ? { x: 250, y: 220 }
              : null;
    if (!target) return;
    e.preventDefault();
    touched.current = true;
    pluck(target.x, target.y);
    onPluck?.(Math.hypot(target.x - W / 2, target.y - Y));
  };

  return (
    <div className={`flex max-w-full flex-col items-center gap-3 ${className}`}>
      <div
        ref={stage}
        role="button"
        tabIndex={0}
        aria-label={`${text.trim()}. Press Enter or the arrow keys to pluck the line.`}
        className="relative aspect-[340/260] w-[340px] max-w-full cursor-grab touch-none select-none overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--bend-accent)] active:cursor-grabbing dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
        style={{ ["--bend-accent" as string]: accent }}
        onPointerDown={(e) => {
          touched.current = true;
          stopAnims();
          drag.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          const p = local(e);
          tx.set(p.x);
          ty.set(p.y);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const p = local(e);
          tx.set(Math.max(40, Math.min(W - 40, p.x)));
          ty.set(Math.max(20, Math.min(H - 20, p.y)));
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
        onKeyDown={onKeyDown}
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} className="block" aria-hidden="true">
          <motion.path id={`bend-${id}`} d={d} fill="none" strokeWidth="1" className="stroke-[#e5e5ea] dark:stroke-[#3a3a3c]" />
          {/* Invisible copy of one repeat, measured to wrap the drift seamlessly. */}
          <text ref={measure} fontSize="22" fontWeight="700" letterSpacing="1" visibility="hidden" style={{ whiteSpace: "pre" }}>
            {text}
          </text>
          <text fontSize="22" fontWeight="700" letterSpacing="1" dy="-8" className="fill-[#1d1d1f] dark:fill-[#f5f5f7]" style={{ whiteSpace: "pre" }}>
            <motion.textPath href={`#bend-${id}`} startOffset={offset}>
              {text.repeat(4)}
            </motion.textPath>
          </text>
          <motion.circle cx={cx} cy={cy} r="5" fill={accent} opacity=".85" />
          <circle cx="10" cy={Y} r="3" className="fill-[#c7c7cc] dark:fill-[#48484a]" />
          <circle cx={W - 10} cy={Y} r="3" className="fill-[#c7c7cc] dark:fill-[#48484a]" />
        </svg>
      </div>
      {hint ? <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">{hint}</span> : null}
    </div>
  );
}
```

--- components/bend-text/index.ts ---

```ts
export { BendText } from "./bend-text";
export type { BendTextProps } from "./bend-text";
```
