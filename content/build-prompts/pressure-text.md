# Pressure Text

Add the "Pressure Text" component from Nexus UI to my project.

A headline that bulges where you hover: letters near the pointer swell taller and heavier on a variable font's weight axis and take the accent colour. Each letter has its own spring, so the swell falls away smoothly on either side.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { PressureText } from "@/components/pressure-text";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/pressure-text/index.ts ---

```ts
export { PressureText } from "./pressure-text";
export type { PressureTextProps } from "./pressure-text";
```

--- components/pressure-text/pressure-text.tsx ---

```tsx
"use client";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";

export interface PressureTextProps {
  /** The headline. Each character becomes its own spring. */
  text?: string;
  /** Colour the letters take when they are near the pointer. */
  accent?: string;
  /** Small caption under the headline. Pass an empty string to hide it. */
  hint?: string;
  /** How far the bulge spreads: the share of the word a letter can be from the pointer and still swell (0.18 by default). */
  spread?: number;
  /** Sweeps a bulge back and forth along the word until someone hovers it. */
  autoplay?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

function Letter({ ch, i, n, px, falloff }: { ch: string; i: number; n: number; px: MotionValue<number>; falloff: number }) {
  const at = (i + 0.5) / n;
  const near = useTransform(px, (x) => Math.max(0, 1 - Math.abs(x - at) * falloff));
  const s = useSpring(near, { stiffness: 260, damping: 20 });
  const fontWeight = useTransform(s, (v) => Math.round(250 + v * 650));
  const scaleY = useTransform(s, (v) => 1 + v * 0.28);
  const y = useTransform(s, (v) => -v * 4);
  // Both colours are CSS variables on the root so dark mode and the accent switch without re-rendering.
  const color = useTransform(s, (v) => (v > 0.55 ? "var(--pt-accent)" : "var(--pt-ink)"));
  const fontVariationSettings = useTransform(fontWeight, (w) => `"wght" ${w}`);
  if (ch === " ") return <span className="inline-block w-[0.28em]" />;
  return (
    <motion.span className="inline-block origin-bottom" style={{ fontWeight, scaleY, y, color, fontVariationSettings }}>
      {ch}
    </motion.span>
  );
}

/**
 * A headline that responds to pressure. Letters near the pointer swell
 * taller and heavier and take the accent colour, falling away smoothly on
 * either side, so the word bulges wherever you hover. With autoplay it
 * breathes by itself until someone hovers it.
 */
export function PressureText({
  text = "Feel every word",
  accent = "#0071e3",
  hint = "Move along the word.",
  spread = 1 / 5.5,
  autoplay = false,
  className = "",
}: PressureTextProps) {
  // Pointer position as a fraction of the headline's width; -1 means "nowhere", so every letter rests.
  const px = useMotionValue(-1);
  const touched = useRef(false);
  const reduce = useReducedMotion();
  const falloff = 1 / Math.max(0.02, spread);

  useEffect(() => {
    if (!autoplay || reduce) return;
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      if (touched.current) return;
      raf = requestAnimationFrame(loop);
      const t = (now - t0) / 1000;
      px.set(0.5 + Math.sin(t * 0.9) * 0.55);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [autoplay, reduce, px]);

  const leave = () => px.set(-1);
  const chars = Array.from(text);

  return (
    <div
      className={`flex max-w-full flex-col items-center gap-4 [--pt-ink:#1d1d1f] dark:[--pt-ink:#f5f5f7] ${className}`}
      style={{ ["--pt-accent" as string]: accent }}
    >
      <div
        className="max-w-full cursor-default select-none whitespace-nowrap px-4 py-6 text-[clamp(30px,7vw,56px)] leading-none tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]"
        onPointerMove={(e) => {
          touched.current = true;
          const r = e.currentTarget.getBoundingClientRect();
          if (r.width) px.set((e.clientX - r.left) / r.width);
        }}
        onPointerLeave={leave}
        onPointerCancel={leave}
      >
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">
          {chars.map((c, i) => (
            <Letter key={i} ch={c} i={i} n={chars.length} px={px} falloff={falloff} />
          ))}
        </span>
      </div>
      {hint ? <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">{hint}</span> : null}
    </div>
  );
}
```
