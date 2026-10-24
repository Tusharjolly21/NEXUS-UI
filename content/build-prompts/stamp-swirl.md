# Stamp Swirl

Add the "Stamp Swirl" component from Nexus UI to my project.

A row of perforated postage stamps whose artwork slowly swirls like wet ink. Hover or focus one and it lifts out of the row, swirls harder, and its name and year slide in underneath.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { StampSwirl, DEFAULT_STAMPS } from "@/components/stamp-swirl";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/stamp-swirl/index.ts ---

```ts
export { StampSwirl, DEFAULT_STAMPS } from "./stamp-swirl";
export type { StampSwirlProps, SwirlStamp } from "./stamp-swirl";
```

--- components/stamp-swirl/stamp-swirl.tsx ---

```tsx
"use client";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export interface SwirlStamp {
  name: string;
  /** Year of issue, shown under the row. */
  date: string;
  /** Face value printed in the corner, e.g. "12c". */
  value: string;
  /** Any CSS background used as the artwork (layered gradients work best). */
  art: string;
}

export interface StampSwirlProps {
  stamps?: SwirlStamp[];
  /** Lifts the stamps one after another until the pointer enters. */
  autoplay?: boolean;
}

export const DEFAULT_STAMPS: SwirlStamp[] = [
  { name: "Tidepool", date: "1974", value: "12c", art: "radial-gradient(60% 50% at 30% 30%, #ffe6b8, rgba(255,230,184,0) 60%), radial-gradient(50% 60% at 75% 70%, #2ec4b6, rgba(46,196,182,0) 65%), linear-gradient(160deg,#9be7d8,#126e82)" },
  { name: "Ember Fields", date: "1981", value: "20c", art: "radial-gradient(50% 50% at 70% 25%, #fff1c1, rgba(255,241,193,0) 60%), radial-gradient(60% 50% at 30% 75%, #e63946, rgba(230,57,70,0) 65%), linear-gradient(170deg,#ffb36b,#9d2b2b)" },
  { name: "Night Bloom", date: "1968", value: "8c", art: "radial-gradient(45% 45% at 50% 40%, #f0c3ff, rgba(240,195,255,0) 60%), radial-gradient(60% 60% at 20% 80%, #5e5ce6, rgba(94,92,230,0) 65%), linear-gradient(170deg,#3a2f6b,#0f0c29)" },
  { name: "Moss & Stone", date: "1990", value: "32c", art: "radial-gradient(55% 45% at 35% 35%, #e9f5c8, rgba(233,245,200,0) 60%), radial-gradient(60% 60% at 80% 80%, #3f6f3a, rgba(63,111,58,0) 65%), linear-gradient(160deg,#a7c47e,#2c3e2d)" },
];

const TILT = [-3, 2, -1.5, 3];

/**
 * Perforated stamp paper. The holes are cut out with a mask (base XOR hole rows), so the
 * edges show whatever surface the stamp sits on, in light and dark mode alike.
 * Hole centres sit on the paper edge: every 10px from x = 6 on the top/bottom, from y = 7 on the sides.
 */
const HOLE = "radial-gradient(circle, #000 3.2px, transparent 3.6px)";
const PAPER_MASK: CSSProperties = {
  maskImage: `${HOLE}, ${HOLE}, ${HOLE}, ${HOLE}, linear-gradient(#000, #000)`,
  maskSize: "10px 8px, 10px 8px, 8px 10px, 8px 10px, 100% 100%",
  maskPosition: "1px -4px, 1px calc(100% + 4px), -4px 2px, calc(100% + 4px) 2px, 0 0",
  maskRepeat: "repeat-x, repeat-x, repeat-y, repeat-y, no-repeat",
  maskComposite: "exclude",
  WebkitMaskImage: `${HOLE}, ${HOLE}, ${HOLE}, ${HOLE}, linear-gradient(#000, #000)`,
  WebkitMaskSize: "10px 8px, 10px 8px, 8px 10px, 8px 10px, 100% 100%",
  WebkitMaskPosition: "1px -4px, 1px calc(100% + 4px), -4px 2px, calc(100% + 4px) 2px, 0 0",
  WebkitMaskRepeat: "repeat-x, repeat-x, repeat-y, repeat-y, no-repeat",
  WebkitMaskComposite: "xor",
};

/** The artwork, pushed around by an animated SVG turbulence field through a displacement map. */
function StampArt({ stamp, active, index }: { stamp: SwirlStamp; active: boolean; index: number }) {
  const fid = "s" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const turb = useRef<SVGFETurbulenceElement>(null);
  const disp = useRef<SVGFEDisplacementMapElement>(null);
  const strength = useRef(10);
  const reduce = useReducedMotion();

  useEffect(() => {
    turb.current?.setAttribute("seed", String(1 + index));
    if (reduce) {
      // Still artwork: a fixed field, a little stronger while lifted.
      strength.current = active ? 34 : 12;
      disp.current?.setAttribute("scale", String(strength.current));
      return;
    }
    let raf = 0;
    const loop = (now: number) => {
      const t = now / 1000 + index * 2.3;
      strength.current += ((active ? 34 : 12) - strength.current) * 0.06;
      turb.current?.setAttribute("baseFrequency", `${(0.012 + Math.sin(t * 0.7) * 0.004).toFixed(4)} ${(0.018 + Math.cos(t * 0.5) * 0.005).toFixed(4)}`);
      disp.current?.setAttribute("scale", strength.current.toFixed(1));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, index, reduce]);

  return (
    <>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id={fid} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence ref={turb} type="turbulence" baseFrequency="0.012 0.018" numOctaves="2" result="n" />
          <feDisplacementMap ref={disp} in="SourceGraphic" in2="n" scale="12" xChannelSelector="R" yChannelSelector="B" />
        </filter>
      </svg>
      <div className="absolute inset-[-8%]" style={{ background: stamp.art, filter: `url(#${fid})` }} />
    </>
  );
}

/**
 * Postage stamps whose artwork slowly swirls like wet ink. Hover or focus one and it lifts
 * out of the row, the swirl gets stronger, and its name and year appear underneath.
 */
export function StampSwirl({ stamps = DEFAULT_STAMPS, autoplay = false }: StampSwirlProps) {
  const [hover, setHover] = useState<number | null>(null);
  const touched = useRef(false);

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      const step = k++ % (stamps.length + 1);
      setHover(step === stamps.length ? null : step);
    }, 1500);
    return () => clearInterval(t);
  }, [autoplay, stamps.length]);

  const current = hover !== null ? stamps[hover] : undefined;

  return (
    <div
      className="flex flex-col items-center gap-6"
      onPointerEnter={() => {
        touched.current = true;
      }}
    >
      <div className="flex h-[210px] items-center gap-4">
        {stamps.map((s, i) => {
          const on = hover === i;
          return (
            <motion.button
              key={s.name}
              type="button"
              aria-label={`${s.name}, ${s.date}`}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => {
                touched.current = true;
                setHover(i);
              }}
              onBlur={() => setHover(null)}
              className="relative outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]"
              initial={false}
              animate={{ scale: on ? 1.45 : hover !== null ? 0.92 : 1, rotate: on ? 0 : TILT[i % 4], y: on ? -6 : 0, zIndex: on ? 10 : 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              style={{ width: 84, height: 104, filter: on ? "drop-shadow(0 18px 22px rgba(0,0,0,.28))" : "drop-shadow(0 6px 10px rgba(0,0,0,.14))" }}
            >
              {/* paper with perforated edges */}
              <span className="absolute inset-0 bg-white" style={PAPER_MASK} />
              <span className="absolute inset-[7px] overflow-hidden">
                <StampArt stamp={s} active={on} index={i} />
                <span className="absolute bottom-1 right-1.5 text-[11px] font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,.4)]">{s.value}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
      <div className="relative h-11 w-[260px] overflow-hidden text-center" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={hover ?? "none"} initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} className="flex flex-col">
            {current ? (
              <>
                <span className="font-serif text-[18px] italic text-[#1d1d1f] dark:text-[#f5f5f7]">{current.name}</span>
                <span className="text-[12px] tabular-nums text-[#86868b] dark:text-[#98989d]">Issued {current.date}</span>
              </>
            ) : (
              <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">Hover a stamp.</span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
```
