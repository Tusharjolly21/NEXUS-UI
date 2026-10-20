"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type PointerEvent as RPointerEvent } from "react";
import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";

export interface SpectraImage {
  /** Photo URL. Leave empty to use one of the drawn scenes. */
  src?: string;
  /** Alt text, also shown as the caption when the photo is open. */
  alt: string;
}

export interface SpectraFrameProps {
  /** Photos, in reading order. Defaults to eight drawn scenes. */
  images?: SpectraImage[];
  /** How many images to show (slices `images`). */
  imageCount?: number;
  /** Photos per row. */
  columns?: number;
  /** Gap between photos, in px. */
  gap?: number;
  /** Corner radius of each photo, in px. */
  borderRadius?: number;
  /** Padding round the grid, in px. */
  padding?: number;
  /** Background behind the grid. Transparent by default. */
  backgroundColor?: string;
  /** How grey the resting photos are, 0-100. */
  grayscaleIntensity?: number;
  /** Zoom of the open photo. */
  scaleAmount?: number;
  /** Resting row height, in px. */
  cellMinHeight?: number;
  /** Height of the row holding the open photo, in px. */
  hoveredMinHeight?: number;
  /** How much wider the open photo grows than its neighbours. */
  expandedFlex?: number;
  /** Called with the index when a photo is clicked or activated with the keyboard. */
  onSelect?: (index: number) => void;
  /** Hint under the grid. Empty string hides it. */
  hint?: string;
  /** Opens each photo in turn until someone touches the grid. */
  autoplay?: boolean;
  /** @deprecated Cells fill their row now; kept so old code still compiles. */
  aspectRatio?: string;
  /** @deprecated Motion is spring-driven now. */
  transitionSpeed?: number;
  /** @deprecated Motion is spring-driven now. */
  colorRevealTiming?: string;
  /** @deprecated Use `expandedFlex`. */
  expandedBasis?: string;
  className?: string;
}

type Palette = [string, string, string, string, string];
const SCENES: { p: Palette; kind: 0 | 1 | 2 | 3; alt: string }[] = [
  { p: ["#ffb88c", "#ff6a88", "#fff1c9", "#c94b7c", "#6d2a5a"], kind: 0, alt: "Hills at sunset" },
  { p: ["#7fd3ff", "#d7f2ff", "#ffffff", "#2f8fd8", "#0b5aa8"], kind: 1, alt: "Bright sea" },
  { p: ["#2a2d6e", "#ff8f6b", "#ffe2b8", "#43307a", "#1b1745"], kind: 2, alt: "Peaks at dusk" },
  { p: ["#ffe29f", "#ffa99f", "#fffbe8", "#e88b4e", "#b5532a"], kind: 3, alt: "Desert dunes" },
  { p: ["#b1f2c9", "#e7fff2", "#ffffff", "#3fae75", "#1f7a50"], kind: 0, alt: "Green valley" },
  { p: ["#0b1d4d", "#5b4bc4", "#ffd9fa", "#24236b", "#0d0f33"], kind: 2, alt: "Night ridge" },
  { p: ["#ffd1e8", "#c3b6ff", "#fff6fd", "#8e6ad8", "#5c3eb0"], kind: 1, alt: "Lilac lake" },
  { p: ["#ffcf70", "#ff7b54", "#fff3d6", "#d4472f", "#8c2414"], kind: 3, alt: "Red canyon" },
];

const PATHS: Record<0 | 1 | 2 | 3, [string, string]> = {
  0: ["M0 62 C 22 48, 40 58, 60 50 S 88 42, 100 52 V100 H0Z", "M0 78 C 26 66, 48 80, 70 72 S 92 66, 100 70 V100 H0Z"],
  1: ["M0 64 Q 12 60 25 64 T 50 64 T 75 64 T 100 64 V100 H0Z", "M0 76 Q 12 72 25 76 T 50 76 T 75 76 T 100 76 V100 H0Z"],
  2: ["M0 70 L 18 42 L 30 58 L 48 30 L 66 60 L 80 46 L 100 68 V100 H0Z", "M0 84 L 22 64 L 40 78 L 62 58 L 84 80 L 100 72 V100 H0Z"],
  3: ["M0 66 C 30 50, 50 70, 100 56 V100 H0Z", "M0 80 C 34 70, 64 90, 100 74 V100 H0Z"],
};

function DrawnScene({ index, gid }: { index: number; gid: string }) {
  const s = SCENES[index % SCENES.length];
  const [top, bottom, sun, far, near] = s.p;
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gid})`} />
      <circle cx={30 + (index % 4) * 13} cy="38" r="11" fill={sun} opacity=".95" />
      <path d={PATHS[s.kind][0]} fill={far} opacity=".9" />
      <path d={PATHS[s.kind][1]} fill={near} />
    </svg>
  );
}

const PLACEHOLDERS: SpectraImage[] = SCENES.map((s) => ({ alt: s.alt }));

function Cell({
  img,
  index,
  open,
  dim,
  radius,
  grey,
  zoom,
  grow,
  still,
  onOpen,
  onClose,
  onSelect,
  demo,
  gid,
}: {
  gid: string;
  img: SpectraImage;
  index: number;
  open: boolean;
  dim: boolean;
  radius: number;
  grey: number;
  zoom: number;
  grow: number;
  still: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect?: (index: number) => void;
  demo: boolean;
}) {
  const ox = useMotionValue(50);
  const oy = useMotionValue(50);
  const r = useMotionValue(0);
  const run = useRef<AnimationPlaybackControls | undefined>(undefined);
  const clip = useMotionTemplate`circle(${r}% at ${ox}% ${oy}%)`;

  const aimAt = (e: RPointerEvent<HTMLButtonElement> | null) => {
    if (!e) {
      ox.set(50);
      oy.set(50);
      return;
    }
    const b = e.currentTarget.getBoundingClientRect();
    ox.set(((e.clientX - b.left) / b.width) * 100);
    oy.set(((e.clientY - b.top) / b.height) * 100);
  };

  // Colour blooms out from where the pointer came in, and drains back to where it left.
  useEffect(() => {
    run.current?.stop();
    run.current = animate(r, open ? 150 : 0, still ? { duration: 0 } : { type: "spring", stiffness: open ? 70 : 120, damping: open ? 16 : 22 });
    return () => run.current?.stop();
  }, [open, r, still]);

  useEffect(() => {
    if (demo && open) {
      ox.set(20 + (index % 3) * 30);
      oy.set(70);
    }
  }, [demo, open, index, ox, oy]);

  const layer = (colour: boolean): ReactNode => (
    <motion.span
      className="absolute inset-0 block"
      style={colour ? { clipPath: clip, WebkitClipPath: clip } : { filter: `grayscale(${grey / 100}) brightness(${dim ? 0.82 : 0.96})` }}
      animate={{ scale: open ? zoom : 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 20 }}
    >
      {img.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img.src} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      ) : (
        <DrawnScene index={index} gid={`${gid}-${colour ? "c" : "g"}`} />
      )}
    </motion.span>
  );

  return (
    <motion.button
      type="button"
      aria-label={img.alt}
      aria-pressed={open}
      className="relative min-w-0 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f5f7] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
      style={{ borderRadius: radius, flexBasis: 0 }}
      initial={false}
      animate={{ flexGrow: open ? grow : 1 }}
      transition={still ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 22 }}
      onPointerEnter={(e) => {
        aimAt(e);
        onOpen();
      }}
      onPointerLeave={(e) => {
        aimAt(e);
        onClose();
      }}
      onFocus={() => {
        aimAt(null);
        onOpen();
      }}
      onBlur={onClose}
      onClick={() => onSelect?.(index)}
    >
      {layer(false)}
      {layer(true)}
      <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,.18)]" style={{ borderRadius: radius }} aria-hidden="true" />
      <motion.span
        className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-[linear-gradient(0deg,rgba(0,0,0,.5),transparent)] px-3 pb-2 pt-6 text-left text-[12px] font-semibold text-white"
        initial={false}
        animate={{ opacity: open ? 1 : 0, y: open ? 0 : 8 }}
        transition={{ type: "spring", stiffness: 300, damping: 26, delay: open && !still ? 0.08 : 0 }}
        aria-hidden="true"
      >
        {img.alt}
      </motion.span>
    </motion.button>
  );
}

/**
 * A grid of photos at rest in black and white. Point at one and colour blooms
 * out from where you came in, the photo widens and its row grows while the
 * rest dim; move off and the colour drains back to where you left.
 */
export function SpectraFrame({
  images = PLACEHOLDERS,
  imageCount = 8,
  columns = 4,
  gap = 8,
  borderRadius = 16,
  padding = 0,
  backgroundColor = "transparent",
  grayscaleIntensity = 100,
  scaleAmount = 1.06,
  cellMinHeight = 128,
  hoveredMinHeight = 176,
  expandedFlex = 2.2,
  onSelect,
  hint = "Point at a photo.",
  autoplay = false,
  className = "",
}: SpectraFrameProps) {
  const still = useReducedMotion() === true;
  const [open, setOpen] = useState<number | null>(null);
  const [demoing, setDemoing] = useState(autoplay);
  const touched = useRef(false);
  const uid = useId().replace(/:/g, "");
  const touch = () => {
    touched.current = true;
    setDemoing(false);
  };
  const items = images.slice(0, Math.max(0, imageCount));
  const cols = Math.max(1, Math.round(columns));
  const rows: number[][] = [];
  for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols).map((_, k) => i + k));
  const openRow = open === null ? -1 : Math.floor(open / cols);
  const total = rows.length * cellMinHeight + Math.max(0, rows.length - 1) * gap;
  const rowGrow = cellMinHeight > 0 ? hoveredMinHeight / cellMinHeight : 1;

  useEffect(() => {
    if (!autoplay || items.length === 0) return;
    const order = [0, 5, 2, 7, 1, 6, 3, 4].filter((i) => i < items.length);
    let k = 0;
    let on = false;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      if (on) setOpen(null);
      else setOpen(order[k++ % order.length] ?? 0);
      on = !on;
    }, 1300);
    return () => clearInterval(t);
  }, [autoplay, items.length]);

  return (
    <div className={`flex w-full max-w-full flex-col items-center gap-3 ${className}`}>
      <div
        role="group"
        aria-label="Photos"
        className="flex w-full flex-col"
        style={{ gap, padding, background: backgroundColor, height: total + padding * 2, borderRadius: borderRadius + padding }}
        onPointerEnter={touch}
        onPointerDown={touch}
        onKeyDown={touch}
        onPointerLeave={() => setOpen(null)}
      >
        {rows.map((row, ri) => (
          <motion.div
            key={ri}
            className="flex min-h-0 w-full"
            style={{ gap, flexBasis: 0 }}
            initial={false}
            animate={{ flexGrow: ri === openRow ? rowGrow : 1 }}
            transition={still ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 24 }}
          >
            {row.map((i) => (
              <Cell
                key={i}
                img={items[i]}
                index={i}
                open={open === i}
                dim={open !== null && open !== i}
                radius={borderRadius}
                grey={Math.max(0, Math.min(100, grayscaleIntensity))}
                zoom={scaleAmount}
                grow={expandedFlex}
                still={still}
                demo={autoplay && demoing}
                gid={`sf-${uid}-${i}`}
                onOpen={() => setOpen(i)}
                onClose={() => setOpen((o) => (o === i ? null : o))}
                onSelect={onSelect}
              />
            ))}
          </motion.div>
        ))}
      </div>
      {hint ? <span className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{hint}</span> : null}
    </div>
  );
}

export default SpectraFrame;
