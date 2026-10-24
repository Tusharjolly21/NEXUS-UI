# Falloff Accordion

Add the "Falloff Accordion" component from Nexus UI to my project.

A row of photo strips where the one you point at opens and its neighbours give way on a smooth Gaussian falloff, so the whole row leans toward the pointer while a caption rises on the open strip.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { FalloffAccordion, DEFAULT_FALLOFF_STRIPS } from "@/components/falloff-accordion";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/falloff-accordion/falloff-accordion.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface FalloffStrip {
  title: string;
  /** Smaller line under the title, e.g. a place. */
  meta: string;
  /** Any CSS background for the strip: a gradient, or `url(...) center / cover` for a photo. */
  art: string;
}

export const DEFAULT_FALLOFF_STRIPS: FalloffStrip[] = [
  { title: "Glacier", meta: "Iceland", art: "linear-gradient(170deg,#e3f2ff 0%,#9cc9f5 40%,#3f6fa8 75%,#1d2f4f)" },
  { title: "Dune", meta: "Morocco", art: "linear-gradient(170deg,#ffe2b8 0%,#f5a65b 45%,#b4572b 80%,#5a2615)" },
  { title: "Fern", meta: "New Zealand", art: "linear-gradient(170deg,#e4f7c7 0%,#8fd16a 40%,#2f7d4a 75%,#123a26)" },
  { title: "Bloom", meta: "Japan", art: "linear-gradient(170deg,#fff0f5 0%,#ffb3cf 40%,#d1477a 78%,#5c1837)" },
  { title: "Basalt", meta: "Scotland", art: "linear-gradient(170deg,#e8e8ed 0%,#a1a1aa 40%,#4b4b55 78%,#1d1d22)" },
  { title: "Lagoon", meta: "Maldives", art: "linear-gradient(170deg,#e0fffb 0%,#6fe3d6 40%,#1695a3 78%,#0b3c55)" },
  { title: "Ember", meta: "Hawaii", art: "linear-gradient(170deg,#ffe9d6 0%,#ff9f6b 35%,#e0402b 70%,#3b0d0d)" },
];

export interface FalloffAccordionProps {
  /** The strips in the row. Titles must be unique (they are used as keys). */
  strips?: FalloffStrip[];
  /** Opens every other strip in turn until someone points at the row. */
  autoplay?: boolean;
}

/**
 * Photo strips in a fixed-width row. Hover one and it opens while its
 * neighbours give way on a smooth falloff, so the whole row leans toward the
 * pointer instead of one item snapping open. The caption rises on the open
 * strip.
 */
export function FalloffAccordion({ strips = DEFAULT_FALLOFF_STRIPS, autoplay = false }: FalloffAccordionProps) {
  const [focus, setFocus] = useState<number | null>(null);
  const touched = useRef(false);

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      setFocus(k % strips.length);
      k += 2;
    }, 1500);
    return () => clearInterval(t);
  }, [autoplay, strips.length]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="flex h-[290px] w-[440px] max-w-full gap-1.5"
        onPointerLeave={() => setFocus(null)}
        onPointerEnter={() => {
          touched.current = true;
        }}
      >
        {strips.map((s, i) => {
          const d = focus === null ? 0 : Math.abs(i - focus);
          // Gaussian falloff: the focused strip grows 7x, its neighbours a little less.
          const grow = focus === null ? 1 : 1 + 6 * Math.exp(-(d * d) / 1.1);
          const on = focus === i;
          return (
            <motion.button
              key={s.title}
              type="button"
              aria-label={`${s.title}, ${s.meta}`}
              aria-expanded={on}
              onPointerEnter={() => setFocus(i)}
              onFocus={() => {
                touched.current = true;
                setFocus(i);
              }}
              animate={{ flexGrow: grow }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
              className="relative min-w-0 basis-0 overflow-hidden rounded-[16px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
              style={{ flexGrow: 1 }}
            >
              <motion.span
                className="absolute inset-0"
                style={{ background: s.art }}
                animate={{ scale: on ? 1.06 : 1.2 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
              <span className="absolute inset-0" style={{ background: "radial-gradient(120% 60% at 50% 110%, rgba(0,0,0,.45), transparent 60%)" }} />
              <AnimatePresence>
                {on && (
                  <motion.span
                    key="cap"
                    className="absolute bottom-4 left-4 flex flex-col items-start text-left text-white"
                    initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.35, delay: 0.08 }}
                  >
                    <span className="whitespace-nowrap text-[18px] font-semibold tracking-[-0.02em]">{s.title}</span>
                    <span className="whitespace-nowrap text-[12px] opacity-85">{s.meta}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">Move along the row.</span>
    </div>
  );
}
```

--- components/falloff-accordion/index.ts ---

```ts
export { FalloffAccordion, DEFAULT_FALLOFF_STRIPS } from "./falloff-accordion";
export type { FalloffAccordionProps, FalloffStrip } from "./falloff-accordion";
```
