# Reflow Mosaic

Add the "Reflow Mosaic" section from Nexus UI to my project.

Five images share one grid. Pick any frame, or its number, and it springs into the lead spot while the other four glide to their new places without stretching. Steps through the frames on its own until the visitor picks one.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { ReflowMosaic } from "@/components/blocks/motion-kit/reflow-mosaic";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/blocks/motion-kit/reflow-mosaic/index.ts ---

```ts
export { DEFAULT_REFLOW_MOSAIC_IMAGES, ReflowMosaic } from "./reflow-mosaic";
export type { ReflowMosaicImage, ReflowMosaicProps } from "./reflow-mosaic";
```

--- components/blocks/motion-kit/reflow-mosaic/reflow-mosaic.tsx ---

```tsx
"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { LayoutGroup, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ReflowMosaicImage {
  src: string;
  alt: string;
  title: string;
  meta?: string;
}

export interface ReflowMosaicProps {
  /** Five images. The first one starts in the lead spot. */
  images?: ReflowMosaicImage[];
  eyebrow?: string;
  title?: string;
  /** Moves the lead to the next frame every few seconds until the visitor picks one. Off under reduced motion. */
  autoplay?: boolean;
  /** Milliseconds between autoplay steps. */
  interval?: number;
  onSelect?: (image: ReflowMosaicImage, index: number) => void;
  className?: string;
}

const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=1100&q=72&auto=format&fit=crop`;

export const DEFAULT_REFLOW_MOSAIC_IMAGES: ReflowMosaicImage[] = [
  { src: u("1600607687939-ce8a6c25118c"), alt: "An open living room with a grey sofa and a kitchen beyond", title: "The long room", meta: "Living" },
  { src: u("1600585154340-be6161a56a0c"), alt: "A dark modern house with lit windows beside a large tree", title: "Evening house", meta: "Exterior" },
  { src: u("1600566753190-17f0baa2a6c3"), alt: "A house front clad in timber and black boards", title: "Timber house", meta: "Exterior" },
  { src: u("1616486338812-3dadae4b4ace"), alt: "A neutral living room with a sectional sofa and a wall of decor", title: "Soft neutrals", meta: "Living" },
  { src: u("1505691938895-1758d7feb511"), alt: "A sitting room with blue cushions under a large painting", title: "Blue and white", meta: "Living" },
];

const FOCUS = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const SPRING = { type: "spring" as const, stiffness: 170, damping: 26, mass: 1 };

function useOnScreen(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setOn(shown && inView);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      sync();
    });
    io.observe(el);
    const vis = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, [ref, enabled]);
  return on;
}

/**
 * Five frames share one grid. Pick any frame, or its number below, and it springs into the lead spot while
 * the other four glide to their new places; the frame that was leading takes the picked one's old slot.
 * Images keep their crop while they move, so nothing stretches. Autoplay steps through the frames until the
 * visitor picks one.
 */
export function ReflowMosaic({
  images = DEFAULT_REFLOW_MOSAIC_IMAGES,
  eyebrow = "Featured this week",
  title = "One frame leads, the rest make room",
  autoplay = true,
  interval = 3400,
  onSelect,
  className,
}: ReflowMosaicProps) {
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const items = images.slice(0, 5);
  // order[slot] is the image in that slot; slot 0 is the lead.
  const [order, setOrder] = useState(() => items.map((_, i) => i));
  const [touched, setTouched] = useState(false);
  const onScreen = useOnScreen(section, autoplay && !reduce && !touched);
  const lead = order[0];

  const promote = (index: number) => {
    setOrder((o) => {
      if (o[0] === index) return o;
      const next = [...o];
      const slot = next.indexOf(index);
      [next[0], next[slot]] = [next[slot], next[0]];
      return next;
    });
  };

  useEffect(() => {
    if (!onScreen || touched) return;
    const t = window.setInterval(() => {
      setOrder((o) => {
        const nextLead = (o[0] + 1) % o.length;
        const next = [...o];
        const slot = next.indexOf(nextLead);
        [next[0], next[slot]] = [next[slot], next[0]];
        return next;
      });
    }, interval);
    return () => window.clearInterval(t);
  }, [onScreen, touched, interval]);

  const pick = (index: number) => {
    setTouched(true);
    promote(index);
    onSelect?.(items[index], index);
  };

  return (
    <MotionConfig reducedMotion="user">
      <section ref={section} aria-label={title} className={cn("w-full bg-white px-4 py-14 sm:px-6 sm:py-20 dark:bg-black", className)}>
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-8 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.09em] text-[#6b6b77] dark:text-[#9696a2]">{eyebrow}</p>
            <h2 className="mx-auto mt-1.5 max-w-[16ch] text-balance text-[clamp(26px,3.6vw,38px)] font-semibold leading-[1.08] tracking-[-0.04em] text-[#15151a] dark:text-[#f1f1f4]">{title}</h2>
          </div>

          <LayoutGroup>
            <div className="grid h-[clamp(360px,48vw,520px)] grid-cols-4 grid-rows-[minmax(0,2fr)_minmax(0,1fr)] gap-2 sm:grid-rows-2 sm:gap-3">
              {order.map((index, slot) => {
                const img = items[index];
                const isLead = slot === 0;
                return (
                  <motion.button
                    key={img.src}
                    layout
                    transition={reduce ? { duration: 0 } : SPRING}
                    type="button"
                    tabIndex={isLead ? -1 : 0}
                    aria-label={isLead ? `${img.title}, shown large` : `Show ${img.title} large`}
                    aria-pressed={isLead}
                    onClick={() => pick(index)}
                    style={{ borderRadius: 18 }}
                    className={cn(
                      "group/tile relative overflow-hidden bg-[#ececf1] dark:bg-[#1c1c22]",
                      isLead ? "col-span-4 cursor-default sm:col-span-2 sm:row-span-2" : "cursor-pointer hover:ring-2 hover:ring-[#0071e3] dark:hover:ring-[#0a84ff]",
                      FOCUS,
                    )}
                  >
                    <motion.img
                      layout
                      transition={reduce ? { duration: 0 } : SPRING}
                      src={img.src}
                      alt={img.alt}
                      draggable={false}
                      className={cn(
                        "absolute inset-0 h-full w-full object-cover transition-[filter,scale] duration-500",
                        !isLead && "saturate-[.85] group-hover/tile:scale-105 group-hover/tile:saturate-100",
                      )}
                    />
                    <motion.span
                      initial={false}
                      animate={{ opacity: isLead ? 1 : 0, y: isLead ? 0 : 8 }}
                      transition={{ duration: 0.3, delay: isLead ? 0.35 : 0 }}
                      className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between gap-2.5 rounded-[14px] bg-white/75 px-3.5 py-2.5 text-[#15151a] backdrop-blur-xl dark:bg-[#141418]/80 dark:text-[#f1f1f4]"
                    >
                      <b className="truncate text-[14px] font-semibold">{img.title}</b>
                      {img.meta && <span className="shrink-0 font-mono text-[11px] text-[#6b6b77] dark:text-[#9696a2]">{img.meta}</span>}
                    </motion.span>
                  </motion.button>
                );
              })}
            </div>
          </LayoutGroup>

          <div className="mt-5 flex justify-center gap-1.5" role="group" aria-label="Choose the lead image">
            {items.map((img, i) => (
              <button
                key={img.src}
                type="button"
                aria-pressed={lead === i}
                aria-label={`Show ${img.title} large`}
                onClick={() => pick(i)}
                className={cn("relative h-[30px] w-[38px] rounded-full font-mono text-[11.5px] transition-colors", lead === i ? "text-white dark:text-black" : "text-[#6b6b77] hover:text-[#15151a] dark:text-[#9696a2] dark:hover:text-white", FOCUS)}
              >
                {lead === i && <motion.span layoutId="reflow-mosaic-chip" transition={SPRING} className="absolute inset-0 rounded-full bg-[#15151a] dark:bg-white" />}
                <span className="relative">{String(i + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
```
