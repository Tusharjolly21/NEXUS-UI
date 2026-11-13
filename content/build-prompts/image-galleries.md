# Column Drift Gallery

Add the "Column Drift Gallery" component from Nexus UI to my project.

Three image-first galleries in one install. Column Drift is an editorial wall whose columns drift up and down at their own pace, holds on hover and opens any frame in a lightbox. Reflow Mosaic puts five frames in one grid: pick any frame, or its number, and it springs into the lead spot while the others glide to new places without stretching. Focus Rail opens the focused panel wide while the rest fold in, moving on by itself with a progress line, holding on hover and taking the arrow keys.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { DEFAULT_COLUMN_DRIFT_IMAGES, ColumnDriftGallery } from "@/components/image-galleries/column-drift-gallery";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/image-galleries/column-drift-gallery.tsx ---

```tsx
"use client";

/* eslint-disable @next/next/no-img-element -- plain img keeps the block free of next.config image settings */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ColumnDriftImage {
  src: string;
  alt: string;
  title: string;
  /** Short label on the right of the caption, for example a place or a year. */
  meta?: string;
}

export interface ColumnDriftGalleryProps {
  images?: ColumnDriftImage[];
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Columns on wide screens. Phones always show two. */
  columns?: 3 | 4 | 5;
  /** Columns drift on their own, alternating up and down. Off under reduced motion. */
  autoplay?: boolean;
  /** Seconds one column takes to travel a full loop. Each column runs a little faster or slower. */
  speed?: number;
  className?: string;
}

const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=900&q=70&auto=format&fit=crop`;

export const DEFAULT_COLUMN_DRIFT_IMAGES: ColumnDriftImage[] = [
  { src: u("1600585154340-be6161a56a0c"), alt: "A dark modern house with lit windows beside a large tree", title: "Evening house", meta: "Exterior" },
  { src: u("1600210492486-724fe5c67fb0"), alt: "A bright living room with a grid of framed prints and a leather sofa", title: "Gallery wall", meta: "Living" },
  { src: u("1600566753190-17f0baa2a6c3"), alt: "A house front clad in timber and black boards", title: "Timber house", meta: "Exterior" },
  { src: u("1600607687939-ce8a6c25118c"), alt: "An open living room with a grey sofa and a kitchen beyond", title: "The long room", meta: "Living" },
  { src: u("1512917774080-9991f1c4c750"), alt: "A white villa beside a narrow pool", title: "White villa", meta: "Exterior" },
  { src: u("1505691938895-1758d7feb511"), alt: "A sitting room with blue cushions under a large painting", title: "Blue and white", meta: "Living" },
  { src: u("1600047509807-ba8f99d2cdde"), alt: "A modern house with a timber-clad upper floor and a lawn", title: "Cedar block", meta: "Exterior" },
  { src: u("1616486338812-3dadae4b4ace"), alt: "A neutral living room with a sectional sofa and a wall of decor", title: "Soft neutrals", meta: "Living" },
  { src: u("1484154218962-a197022b5858"), alt: "A white kitchen with black pendant lights and bar stools", title: "Open kitchen", meta: "Kitchen" },
  { src: u("1618221195710-dd6b41faaea6"), alt: "A living room under a row of high windows with warm wood floors", title: "Clerestory", meta: "Living" },
  { src: u("1564013799919-ab600027ffc6"), alt: "A white two-storey house behind a pool and palm trees", title: "Pool house", meta: "Exterior" },
  { src: u("1586023492125-27b2c045efd7"), alt: "A yellow armchair under a floor lamp", title: "Reading chair", meta: "Detail" },
];

const FOCUS = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
/* Each column gets its own pace so the wall never moves as one sheet. */
const PACE = [1, 0.82, 1.14, 0.9, 1.05];

/**
 * An editorial wall of images in columns that drift continuously, alternating up and down. Hover a column
 * to hold it, hover a frame for its caption, and click (or press Enter on) a frame to open it large;
 * Escape or the close button puts it back. Under reduced motion the columns stand still.
 */
export function ColumnDriftGallery({
  images = DEFAULT_COLUMN_DRIFT_IMAGES,
  eyebrow = "Selected work",
  title = "Built to be looked at, made to be lived in",
  description = "A slow, steady wall of rooms that never asks for a click but rewards one.",
  columns = 4,
  autoplay = true,
  speed = 44,
  className,
}: ColumnDriftGalleryProps) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const moving = autoplay && !reduce;

  const cols = Array.from({ length: columns }, (_, c) => images.filter((_, i) => i % columns === c));

  useEffect(() => {
    if (open === null) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    setOpen(null);
    opener.current?.focus();
  };

  const tile = (img: ColumnDriftImage, index: number, k: number, c: number, hidden: boolean) => (
    <button
      key={`${hidden ? "h" : "v"}-${index}`}
      type="button"
      tabIndex={hidden ? -1 : 0}
      aria-hidden={hidden || undefined}
      aria-label={hidden ? undefined : `Open ${img.title}`}
      onClick={(e) => {
        opener.current = e.currentTarget;
        setOpen(index);
      }}
      className={cn(
        "group/tile relative block w-full cursor-zoom-in overflow-hidden rounded-2xl bg-[#ececf1] transition-[transform,box-shadow] duration-300 hover:-translate-y-[3px] hover:shadow-[0_18px_36px_-18px_rgba(0,0,0,0.45)] dark:bg-[#1c1c22]",
        (k + c) % 2 ? "aspect-[4/5]" : "aspect-[4/3]",
        FOCUS,
      )}
    >
      <img
        src={img.src}
        alt={hidden ? "" : img.alt}
        loading="lazy"
        draggable={false}
        className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover/tile:scale-[1.04]"
      />
      <span className="absolute inset-x-2 bottom-2 flex translate-y-1.5 justify-between gap-2 rounded-[10px] bg-white/75 px-2.5 py-1.5 text-left text-[12px] font-medium text-[#15151a] opacity-0 backdrop-blur-md transition-all duration-200 group-hover/tile:translate-y-0 group-hover/tile:opacity-100 group-focus-visible/tile:translate-y-0 group-focus-visible/tile:opacity-100 dark:bg-[#141418]/80 dark:text-[#f1f1f4]">
        <span className="truncate">{img.title}</span>
        {img.meta && <span className="shrink-0 font-mono text-[10.5px] text-[#6b6b77] dark:text-[#9696a2]">{img.meta}</span>}
      </span>
    </button>
  );

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label={title} className={cn("w-full bg-white px-4 py-14 sm:px-6 sm:py-20 dark:bg-black", className)}>
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.09em] text-[#6b6b77] dark:text-[#9696a2]">{eyebrow}</p>
              <h2 className="mt-1.5 max-w-[18ch] text-balance text-[clamp(26px,3.6vw,38px)] font-semibold leading-[1.08] tracking-[-0.04em] text-[#15151a] dark:text-[#f1f1f4]">{title}</h2>
            </div>
            <p className="max-w-[34ch] text-[14px] text-[#6b6b77] dark:text-[#9696a2]">{description}</p>
          </div>

          <div
            className="grid h-[440px] grid-cols-2 gap-3 overflow-hidden sm:h-[540px] sm:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))] [mask-image:linear-gradient(transparent,#000_12%,#000_88%,transparent)]"
            style={{ ["--cols" as string]: columns }}
          >
            {cols.map((list, c) => {
              const indexed = list.map((img) => ({ img, index: images.indexOf(img) }));
              return (
                <div key={c} className={cn("group/col min-w-0", c >= 2 && "hidden sm:block")}>
                  <div
                    className={cn("flex flex-col gap-3", moving && "animate-[column-drift_var(--t)_linear_infinite] group-hover/col:[animation-play-state:paused] group-focus-within/col:[animation-play-state:paused]")}
                    style={{ ["--t" as string]: `${speed * PACE[c % PACE.length]}s`, animationDirection: c % 2 ? "reverse" : "normal" }}
                  >
                    {indexed.map(({ img, index }, k) => tile(img, index, k, c, false))}
                    {moving && indexed.map(({ img, index }, k) => tile(img, index, k, c, true))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <style>{"@keyframes column-drift{to{transform:translateY(calc(-50% - 6px))}}"}</style>

        <AnimatePresence>
          {open !== null && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={images[open].title}
              className="fixed inset-0 z-50 grid place-items-center bg-[rgba(8,8,12,0.62)] p-5 backdrop-blur-[10px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.target === e.currentTarget && close()}
            >
              <motion.figure
                className="m-0 w-[min(760px,100%)] overflow-hidden rounded-[22px] bg-white shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] dark:bg-[#131317]"
                initial={{ scale: 0.94, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
              >
                <img src={images[open].src} alt={images[open].alt} className="aspect-[4/3] w-full object-cover" />
                <figcaption className="flex items-center justify-between gap-3 px-4 py-3.5 text-[#15151a] dark:text-[#f1f1f4]">
                  <div>
                    <b className="font-semibold">{images[open].title}</b>
                    {images[open].meta && <span className="ml-2 text-[13px] text-[#6b6b77] dark:text-[#9696a2]">{images[open].meta}</span>}
                  </div>
                  <button
                    ref={closeBtn}
                    type="button"
                    onClick={close}
                    className={cn("h-[34px] rounded-full border border-[#e5e5eb] px-3.5 text-[13px] font-medium transition-colors hover:bg-[#f4f4f7] dark:border-[#24242b] dark:hover:bg-[#1c1c22]", FOCUS)}
                  >
                    Close
                  </button>
                </figcaption>
              </motion.figure>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </MotionConfig>
  );
}
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

# Reflow Mosaic

Add the "Reflow Mosaic" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { DEFAULT_REFLOW_MOSAIC_IMAGES, ReflowMosaic } from "@/components/image-galleries/reflow-mosaic";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/image-galleries/reflow-mosaic.tsx ---

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

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

# Focus Rail Gallery

Add the "Focus Rail Gallery" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { DEFAULT_FOCUS_RAIL_IMAGES, FocusRailGallery } from "@/components/image-galleries/focus-rail-gallery";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/image-galleries/focus-rail-gallery.tsx ---

```tsx
"use client";

/* eslint-disable @next/next/no-img-element -- plain img keeps the block free of next.config image settings */

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react";
import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FocusRailImage {
  src: string;
  alt: string;
  title: string;
  meta?: string;
}

export interface FocusRailGalleryProps {
  /** Four to eight images work best. */
  images?: FocusRailImage[];
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Moves the focus to the next panel on its own. Holds while the pointer is over the rail. Off under reduced motion. */
  autoplay?: boolean;
  /** Milliseconds each panel stays open during autoplay. */
  interval?: number;
  onChange?: (index: number) => void;
  className?: string;
}

const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=1100&q=72&auto=format&fit=crop`;

export const DEFAULT_FOCUS_RAIL_IMAGES: FocusRailImage[] = [
  { src: u("1600585154340-be6161a56a0c"), alt: "A dark modern house with lit windows beside a large tree", title: "Evening house", meta: "Exterior" },
  { src: u("1600210492486-724fe5c67fb0"), alt: "A bright living room with a grid of framed prints and a leather sofa", title: "Gallery wall", meta: "Living" },
  { src: u("1484154218962-a197022b5858"), alt: "A white kitchen with black pendant lights and bar stools", title: "Open kitchen", meta: "Kitchen" },
  { src: u("1512917774080-9991f1c4c750"), alt: "A white villa beside a narrow pool", title: "White villa", meta: "Exterior" },
  { src: u("1618221195710-dd6b41faaea6"), alt: "A living room under a row of high windows with warm wood floors", title: "Clerestory", meta: "Living" },
  { src: u("1586023492125-27b2c045efd7"), alt: "A yellow armchair under a floor lamp", title: "Reading chair", meta: "Detail" },
];

const FOCUS = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const EASE = [0.3, 0.9, 0.25, 1] as const;

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
 * A row of image panels where the focused one opens wide and the rest fold in. It moves on by itself with
 * a progress line under the caption; hover the rail to hold it, click a panel or use the arrow keys to
 * choose. Panels are tabs, so screen readers announce which image is open.
 */
export function FocusRailGallery({
  images = DEFAULT_FOCUS_RAIL_IMAGES,
  eyebrow = "Frame by frame",
  title = "Step through the work at your own pace",
  description = "Pick a panel, or let the rail move the focus for you.",
  autoplay = true,
  interval = 3600,
  onChange,
  className,
}: FocusRailGalleryProps) {
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const running = useOnScreen(section, autoplay && !reduce) && !held && autoplay && !reduce;

  const go = (i: number, focus = false) => {
    const next = (i + images.length) % images.length;
    setActive(next);
    onChange?.(next);
    if (focus) tabs.current[next]?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % images.length), interval);
    return () => window.clearTimeout(t);
  }, [running, active, interval, images.length]);

  const onKey = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(active + 1, true);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(active - 1, true);
    }
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <MotionConfig reducedMotion="user">
      <section ref={section} aria-label={title} className={cn("w-full bg-white px-4 py-14 sm:px-6 sm:py-20 dark:bg-black", className)}>
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.09em] text-[#6b6b77] dark:text-[#9696a2]">{eyebrow}</p>
              <h2 className="mt-1.5 max-w-[18ch] text-balance text-[clamp(26px,3.6vw,38px)] font-semibold leading-[1.08] tracking-[-0.04em] text-[#15151a] dark:text-[#f1f1f4]">{title}</h2>
            </div>
            <div>
              <p className="max-w-[32ch] text-[14px] text-[#6b6b77] dark:text-[#9696a2]">{description}</p>
              <p className="mt-2 font-mono text-[12px] tabular-nums text-[#6b6b77] dark:text-[#9696a2]" aria-live="polite">
                <b className="font-medium text-[#15151a] dark:text-[#f1f1f4]">{pad(active + 1)}</b> / {pad(images.length)}
              </p>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Gallery panels"
            onKeyDown={onKey}
            onPointerEnter={() => setHeld(true)}
            onPointerLeave={() => setHeld(false)}
            className="flex h-[clamp(300px,40vw,460px)] gap-1.5 sm:gap-2.5"
          >
            {images.map((img, i) => {
              const on = i === active;
              return (
                <motion.button
                  key={img.src}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-label={img.title}
                  tabIndex={on ? 0 : -1}
                  onClick={() => go(i)}
                  initial={false}
                  animate={{ flexGrow: on ? 5.2 : 1 }}
                  transition={{ duration: reduce ? 0 : 0.8, ease: EASE }}
                  className={cn("group/panel relative min-w-0 basis-0 overflow-hidden rounded-[18px] bg-[#ececf1] dark:bg-[#1c1c22]", on ? "cursor-default" : "cursor-pointer", FOCUS)}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    draggable={false}
                    className={cn(
                      "absolute inset-0 h-full w-full object-cover transition-[scale,filter] duration-[1200ms] ease-[cubic-bezier(.3,.9,.25,1)]",
                      !on && "brightness-[.96] saturate-[.7] group-hover/panel:scale-[1.06] group-hover/panel:saturate-100",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-1/2 top-2.5 hidden -translate-x-1/2 rounded-full bg-white/75 px-1.5 py-0.5 font-mono text-[11px] text-[#15151a] backdrop-blur-md transition-opacity sm:block dark:bg-[#141418]/80 dark:text-[#f1f1f4]",
                      on && "opacity-0",
                    )}
                  >
                    {pad(i + 1)}
                  </span>
                  <motion.span
                    initial={false}
                    animate={{ opacity: on ? 1 : 0, y: on ? 0 : 10 }}
                    transition={{ duration: 0.35, delay: on ? 0.35 : 0 }}
                    className="pointer-events-none absolute inset-x-3.5 bottom-3.5 grid gap-2 rounded-[14px] bg-white/75 px-3.5 py-3 text-left text-[#15151a] backdrop-blur-xl dark:bg-[#141418]/80 dark:text-[#f1f1f4]"
                  >
                    <span className="flex items-baseline justify-between gap-2.5">
                      <b className="truncate text-[14px] font-semibold">{img.title}</b>
                      {img.meta && <span className="shrink-0 font-mono text-[11px] text-[#6b6b77] dark:text-[#9696a2]">{img.meta}</span>}
                    </span>
                    {autoplay && !reduce && (
                      <span className="h-[3px] overflow-hidden rounded-full bg-[#15151a]/15 dark:bg-white/15">
                        {on && (
                          <motion.span
                            key={`${active}-${held}`}
                            className="block h-full rounded-full bg-[#15151a] dark:bg-white"
                            initial={{ width: "0%" }}
                            animate={{ width: running ? "100%" : "0%" }}
                            transition={{ duration: running ? interval / 1000 : 0.2, ease: "linear" }}
                          />
                        )}
                      </span>
                    )}
                  </motion.span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
