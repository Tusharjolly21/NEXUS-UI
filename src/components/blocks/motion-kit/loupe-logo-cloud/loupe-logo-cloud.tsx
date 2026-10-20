"use client";

import { useRef, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useAnimationFrame, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export interface LoupeLogoCloudBrand {
  name: string;
  /** Tailwind classes that give the wordmark its type treatment. */
  cls: string;
  /** Full colour shown inside the lens. */
  color: string;
  /** Lens colour in dark mode, for marks that would vanish on black. Defaults to `color`. */
  colorDark?: string;
  /** Optional SVG path (24x24 box) drawn before the name. */
  mark?: string;
}

export interface LoupeLogoCloudProps {
  brands?: LoupeLogoCloudBrand[];
  title?: string;
  subtitle?: string;
  /** Drifts the row sideways. */
  autoplay?: boolean;
  className?: string;
}

const BRANDS: LoupeLogoCloudBrand[] = [
  { name: "Northwind", cls: "font-serif italic", color: "#0b8f6a", colorDark: "#30d158", mark: "M4 20L12 4l8 16z" },
  { name: "LUMEN", cls: "tracking-[0.3em] font-semibold", color: "#0071e3", colorDark: "#2997ff" },
  { name: "parcel", cls: "font-bold lowercase tracking-[-0.04em]", color: "#ff6b4a", mark: "M4 8l8-4 8 4v8l-8 4-8-4z" },
  { name: "Orbit", cls: "font-medium", color: "#5e5ce6", colorDark: "#7d7aff", mark: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" },
  { name: "HALCYON", cls: "font-black tracking-tight", color: "#1d1d1f", colorDark: "#f5f5f7" },
  { name: "fieldnote", cls: "font-serif", color: "#c2410c", colorDark: "#ff9f0a" },
  { name: "Quanta", cls: "font-semibold italic", color: "#bf5af2", mark: "M5 5h14v14H5z" },
  { name: "Kettle", cls: "font-bold tracking-[-0.03em]", color: "#ff375f", mark: "M6 10h12v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM9 6h6" },
];

const LENS = 70;
const fade = "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)";

function Row({ brands, color }: { brands: LoupeLogoCloudBrand[]; color: boolean }) {
  return (
    <div className="flex flex-none items-center">
      {[...brands, ...brands].map((b, i) => (
        <span
          key={i}
          className={cn(
            "mx-7 flex items-center gap-2 whitespace-nowrap text-[22px] @2xl:mx-9 @2xl:text-[26px]",
            b.cls,
            color ? "text-[var(--mk-c)] dark:text-[var(--mk-cd)]" : "text-[#a1a1a6] dark:text-[#636366]",
          )}
          style={color ? ({ "--mk-c": b.color, "--mk-cd": b.colorDark ?? b.color } as CSSProperties) : undefined}
        >
          {b.mark && (
            <svg className="h-[0.92em] w-[0.92em]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d={b.mark} />
            </svg>
          )}
          {b.name}
        </span>
      ))}
    </div>
  );
}

/**
 * Logo cloud with a loupe. The row drifts in soft grey; a glass lens follows
 * the pointer and shows the logos inside it magnified and in full colour.
 * Tap or drag on touch, or focus the strip and use the arrow keys. When the
 * mouse leaves, the lens springs back to the middle.
 */
export function LoupeLogoCloud({
  brands = BRANDS,
  title = "Used by teams that ship every week",
  subtitle = "From two-person studios to platform teams of four hundred.",
  autoplay = true,
  className,
}: LoupeLogoCloudProps) {
  const reduce = useReducedMotion();
  const drift = autoplay && !reduce;
  const x = useMotionValue(0);
  const row = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage);
  const lx = useSpring(0, { stiffness: 260, damping: 26 });
  const centred = useRef(true);
  const placed = useRef(false);

  useAnimationFrame((_, dt) => {
    const s = stage.current;
    if (s && centred.current) {
      const mid = s.offsetWidth / 2;
      if (!placed.current) {
        lx.jump(mid);
        placed.current = true;
      } else if (Math.abs(lx.get() - mid) > 0.5) lx.set(mid);
    }
    if (!drift || !inView) return;
    const w = row.current ? row.current.scrollWidth / 2 : 0;
    if (!w) return;
    let v = x.get() - (28 * Math.min(dt, 64)) / 1000;
    if (v <= -w) v += w;
    x.set(v);
  });

  const clip = useMotionTemplate`circle(${LENS}px at ${lx}px 50%)`;
  const origin = useMotionTemplate`${lx}px 50%`;

  const follow = (e: ReactPointerEvent<HTMLDivElement>) => {
    centred.current = false;
    const r = e.currentTarget.getBoundingClientRect();
    lx.set(Math.max(0, Math.min(r.width, e.clientX - r.left)));
  };
  const onKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const width = e.currentTarget.offsetWidth;
    const step = e.shiftKey ? 120 : 48;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      centred.current = false;
      const next = lx.get() + (e.key === "ArrowLeft" ? -step : step);
      lx.set(Math.max(LENS / 2, Math.min(width - LENS / 2, next)));
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      centred.current = false;
      lx.set(e.key === "Home" ? LENS : width - LENS);
    } else if (e.key === "Escape") {
      centred.current = true;
    }
  };

  return (
    <section className={cn("@container w-full bg-white px-5 py-16 dark:bg-black @2xl:py-20", className)}>
      <div className="mx-auto w-full max-w-[1080px] text-center">
        <h2 className="m-0 text-[clamp(22px,3.4cqi,32px)] font-semibold tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</h2>
        {subtitle && <p className="m-0 mt-2 text-[clamp(15px,1.8cqi,16px)] text-[#6e6e73] dark:text-[#a1a1a6]">{subtitle}</p>}
        <div
          ref={stage}
          tabIndex={0}
          role="group"
          aria-label="Customer logos. Use the left and right arrow keys to move the magnifier."
          className="relative mt-8 h-[150px] cursor-none touch-pan-y rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff] @2xl:mt-10"
          onPointerMove={follow}
          onPointerDown={follow}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") centred.current = true;
          }}
          onKeyDown={onKey}
        >
          <div className="absolute inset-0 overflow-hidden" style={{ maskImage: fade, WebkitMaskImage: fade }}>
          <div className="absolute inset-0 flex items-center" style={{ filter: "blur(.6px)" }} aria-hidden="true">
            <motion.div ref={row} className="flex w-max" style={{ x }}>
              <Row brands={brands} color={false} />
            </motion.div>
          </div>
          <motion.div className="absolute inset-0 flex items-center" style={{ clipPath: clip, WebkitClipPath: clip }} aria-hidden="true">
            <motion.div className="flex h-full w-full items-center" style={{ scale: 1.35, transformOrigin: origin }}>
              <motion.div className="flex w-max" style={{ x }}>
                <Row brands={brands} color />
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.div
            className="pointer-events-none absolute top-1/2 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,.35),transparent_45%)] shadow-[inset_0_0_0_1.5px_rgba(255,255,255,.9),inset_0_0_0_3px_rgba(0,0,0,.06),inset_0_10px_20px_rgba(255,255,255,.6),0_18px_40px_-16px_rgba(0,0,0,.35)] dark:bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,.12),transparent_45%)] dark:shadow-[inset_0_0_0_1.5px_rgba(255,255,255,.28),inset_0_0_0_3px_rgba(0,0,0,.5),inset_0_10px_20px_rgba(255,255,255,.08),0_18px_40px_-16px_rgba(0,0,0,.95)]"
            style={{ left: lx, width: LENS * 2, height: LENS * 2, x: "-50%", y: "-50%" }}
            aria-hidden="true"
          />
          </div>
        </div>
        <span className="sr-only">{brands.map((b) => b.name).join(", ")}</span>
      </div>
    </section>
  );
}
