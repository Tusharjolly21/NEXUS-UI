Add the "Curved Reel" component from Nexus UI to my project.

An endless reel of posters bent around the inside of a curve: the centre cards sit back and pinch in while the edge cards swing round and come forward. It drifts on its own, and you can drag it or fling it to coast.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { CurvedReel } from "@/components/curved-reel";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/curved-reel/curved-reel.tsx ---

```tsx
"use client";
import { useEffect, useRef } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";

/** One poster in the reel: background, text colour, the big glyph and the caption. */
export interface ReelPoster {
  bg: string;
  fg: string;
  big: string;
  small: string;
  /** Sets the big glyph in an italic serif instead of semibold sans. */
  serif?: boolean;
}

export interface CurvedReelProps {
  posters?: ReelPoster[];
  /** Drifts the reel at 38px/s; pauses for 2.5s after a drag. */
  autoplay?: boolean;
}

const POSTERS: ReelPoster[] = [
  { bg: "#0040ff", fg: "#fff", big: "Aa", small: "04 · Grotesk" },
  { bg: "#ff4f00", fg: "#1d1d1f", big: "17", small: "Issue · Motion" },
  { bg: "#1d1d1f", fg: "#f5f5f7", big: "Ω", small: "Ohm Studio", serif: true },
  { bg: "#f2efe6", fg: "#1d1d1f", big: "Rare", small: "Type specimen", serif: true },
  { bg: "#c8f560", fg: "#1d1d1f", big: "↗", small: "Up & to the right" },
  { bg: "#ff6482", fg: "#fff", big: "03", small: "Spring · Summer" },
  { bg: "#5e5ce6", fg: "#fff", big: "Iso", small: "Grid systems" },
  { bg: "#ffd60a", fg: "#1d1d1f", big: "!?", small: "Loud & clear" },
  { bg: "#0b8f6a", fg: "#e9fff6", big: "Fern", small: "Field notes", serif: true },
  { bg: "#e5e5ea", fg: "#1d1d1f", big: "88", small: "Studio archive" },
];

const CW = 150;
const CH = 210;
const GAP = 16;
const VIEW = 760;

function Card({ p, i, offset, total }: { p: ReelPoster; i: number; offset: MotionValue<number>; total: number }) {
  // Position on a looping track, measured from the centre of the view.
  const x = useTransform(offset, (o) => {
    let v = i * (CW + GAP) - o;
    v = ((v % total) + total) % total;
    if (v > total / 2) v -= total;
    return v;
  });
  const d = useTransform(x, (v) => Math.max(-1.4, Math.min(1.4, v / (VIEW / 2))));
  const rotateY = useTransform(d, (v) => -v * 48);
  const scale = useTransform(d, (v) => 0.82 + Math.pow(Math.abs(v), 1.6) * 0.42);
  const z = useTransform(d, (v) => Math.abs(v) * 90);
  const opacity = useTransform(d, (v) => (Math.abs(v) > 1.25 ? 0 : 1));
  const bright = useTransform(d, (v) => `brightness(${1 - Math.min(0.25, Math.abs(v) * 0.18)})`);
  return (
    <motion.div className="absolute left-1/2 top-1/2" style={{ x, rotateY, scale, z, opacity, width: CW, height: CH, marginLeft: -CW / 2, marginTop: -CH / 2, filter: bright }}>
      <div className="flex h-full w-full flex-col justify-between overflow-hidden rounded-[14px] p-4 shadow-[0_20px_40px_-24px_rgba(0,0,0,.5)]" style={{ background: p.bg, color: p.fg }}>
        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] opacity-70">No. {String(i + 1).padStart(2, "0")}</span>
        <span className={`leading-none tracking-[-0.04em] ${p.serif ? "font-serif italic" : "font-semibold"}`} style={{ fontSize: p.big.length > 2 ? 46 : 72 }}>{p.big}</span>
        <span className="text-[11px] font-medium opacity-80">{p.small}</span>
      </div>
    </motion.div>
  );
}

/**
 * A reel of posters on the inside of a curve: cards at the centre sit back and
 * pinch in, cards toward the edges swing round, grow and come forward. It drifts
 * on its own; drag to scrub it and fling it to let it coast.
 */
export function CurvedReel({ posters = POSTERS, autoplay = true }: CurvedReelProps) {
  const offset = useMotionValue(0);
  const total = posters.length * (CW + GAP);
  const drag = useRef<{ x: number; o: number; v: number; lx: number; lt: number } | null>(null);
  const ctl = useRef<{ stop: () => void } | null>(null);
  const idleUntil = useRef(0);

  useEffect(() => {
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (autoplay && !drag.current && now > idleUntil.current) offset.set(offset.get() + dt * 38);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [autoplay, offset]);

  useEffect(() => () => ctl.current?.stop(), []);

  const release = () => {
    const d = drag.current;
    drag.current = null;
    idleUntil.current = performance.now() + 2500;
    if (d) ctl.current = animate(offset, [offset.get()], { type: "inertia", velocity: d.v, power: 0.5, timeConstant: 500 });
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div
        tabIndex={0}
        className="relative h-[300px] w-full max-w-[760px] cursor-grab touch-pan-y select-none overflow-hidden rounded-[18px] active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#2997ff]"
        style={{ perspective: 900, maskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)" }}
        onPointerDown={(e) => {
          ctl.current?.stop();
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, o: offset.get(), v: 0, lx: e.clientX, lt: performance.now() };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const now = performance.now();
          d.v = (d.lx - e.clientX) / Math.max(0.008, (now - d.lt) / 1000);
          d.lx = e.clientX; d.lt = now;
          offset.set(d.o + (d.x - e.clientX));
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onKeyDown={(e) => {
          if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
          e.preventDefault();
          ctl.current?.stop();
          idleUntil.current = performance.now() + 2500;
          const step = (e.key === "ArrowRight" ? 1 : -1) * (CW + GAP);
          ctl.current = animate(offset, offset.get() + step, { type: "spring", stiffness: 220, damping: 28 });
        }}
        role="region"
        aria-roledescription="carousel"
        aria-label="Poster reel. Drag to scroll, or use the left and right arrow keys."
      >
        <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {posters.map((p, i) => <Card key={i} p={p} i={i} offset={offset} total={total} />)}
        </div>
      </div>
      <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">Drag the reel, or fling it.</span>
    </div>
  );
}
```

--- components/curved-reel/index.ts ---

```ts
export { CurvedReel } from "./curved-reel";
export type { CurvedReelProps, ReelPoster } from "./curved-reel";
```
