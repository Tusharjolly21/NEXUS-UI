# Column Drift Gallery

Add the "Column Drift Gallery" section from Nexus UI to my project.

An editorial image wall in columns that drift continuously, alternating up and down at slightly different speeds. Hover a column to hold it, hover a frame for its caption, and click a frame to open it large in a lightbox. Still under reduced motion.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { ColumnDriftGallery } from "@/components/blocks/motion-kit/column-drift-gallery";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/blocks/motion-kit/column-drift-gallery/index.ts ---

```ts
export { ColumnDriftGallery, DEFAULT_COLUMN_DRIFT_IMAGES } from "./column-drift-gallery";
export type { ColumnDriftGalleryProps, ColumnDriftImage } from "./column-drift-gallery";
```

--- components/blocks/motion-kit/column-drift-gallery/column-drift-gallery.tsx ---

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
