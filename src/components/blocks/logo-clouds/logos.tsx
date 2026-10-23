"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useAnimationFrame, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Placeholder customer marks for the logo clouds. Every brand here is invented, so a page built
 * from these blocks never implies a real company is a customer. Swap in your own marks by passing
 * `logos` to the variants, or by editing this list.
 */

type MarkProps = { className?: string; style?: React.CSSProperties };

export type Logo = {
  name: string;
  /** The glyph. Draws in `currentColor`. */
  Icon: React.ComponentType<MarkProps>;
  /** Accent for the glyph when a variant shows colour. */
  color: string;
  /** Type treatment for the wordmark, so each brand reads as its own lockup. */
  wordmark?: string;
};

const svg = (children: React.ReactNode) =>
  function Mark({ className, style }: MarkProps) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} style={style}>
        {children}
      </svg>
    );
  };
const S = { stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** Twenty invented brands, so a rotating band never repeats a mark within a page. */
export const LOGOS: Logo[] = [
  { name: "Arcwell", color: "#3b5bdb", wordmark: "font-semibold tracking-[-0.03em]", Icon: svg(<><path d="M4 18a8 8 0 0 1 16 0" {...S} strokeWidth="2.4" /><path d="M8.5 18a3.5 3.5 0 0 1 7 0" {...S} strokeWidth="2.4" /></>) },
  { name: "BASALT", color: "#868e96", wordmark: "text-[0.78em] font-semibold tracking-[0.22em]", Icon: svg(<><path d="M12 2.5 20.2 7v10L12 21.5 3.8 17V7Z" {...S} strokeWidth="2" /><path d="M12 12v9.5M12 12l8.2-5M12 12 3.8 7" {...S} strokeWidth="1.6" /></>) },
  { name: "Corvid", color: "#7048e8", wordmark: "font-serif text-[1.08em] italic", Icon: svg(<path d="M3 17 12 5l9 12h-5.2L12 11.6 8.2 17Z" fill="currentColor" />) },
  { name: "driftline", color: "#0c8599", wordmark: "font-medium tracking-[-0.02em]", Icon: svg(<>{[7, 12, 17].map((y) => <path key={y} d={`M3 ${y}c2.2-2 4.3-2 6.5 0s4.3 2 6.5 0 3.7-1.6 5 0`} {...S} strokeWidth="2" />)}</>) },
  { name: "Emberly", color: "#e8590c", wordmark: "font-bold tracking-[-0.04em]", Icon: svg(<path d="M12 2.5c4 4.2 6.5 7.6 6.5 11.2A6.5 6.5 0 0 1 5.5 13.7c0-2.3 1.1-4.3 3-6.2.3 2 1.3 3.2 2.6 3.6C11 8 11 5.4 12 2.5Z" fill="currentColor" />) },
  { name: "fieldnote", color: "#2b8a3e", wordmark: "font-mono text-[0.9em] font-medium tracking-[-0.04em]", Icon: svg(<><path d="M4.5 3.5h10l5 5v12h-15Z" {...S} strokeWidth="2" /><path d="M8 13h8M8 16.5h5" {...S} strokeWidth="1.8" /></>) },
  { name: "Glasshouse", color: "#1971c2", wordmark: "font-light tracking-[0.02em]", Icon: svg(<><path d="M3.5 11 12 3.5l8.5 7.5v9.5h-17Z" {...S} strokeWidth="2" /><path d="M12 9v11.5M3.5 15h17" {...S} strokeWidth="1.6" /></>) },
  { name: "KESTREL", color: "#e03131", wordmark: "text-[0.86em] font-black tracking-[0.08em]", Icon: svg(<path d="M2.5 15.5 14 4.5l-3 7h10.5L10 19.5l3-4Z" fill="currentColor" />) },
  { name: "Lumora", color: "#f08c00", wordmark: "font-serif text-[1.08em]", Icon: svg(<><circle cx="12" cy="12" r="9" {...S} strokeWidth="2" /><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" /></>) },
  { name: "Oakhaven", color: "#5c940d", wordmark: "font-semibold tracking-[-0.02em]", Icon: svg(<path d="M12 21.5V11M12 11c-5.5 0-8-3.5-8-8.5 5.3 0 8 2.6 8 8.5Zm0 0c5.5 0 8-3.5 8-8.5-5.3 0-8 2.6-8 8.5Z" fill="currentColor" {...S} strokeWidth="1.4" />) },
  { name: "Quill & Co", color: "#ae3ec9", wordmark: "font-serif text-[1.06em] italic", Icon: svg(<><path d="M20.5 3.5C11 4.5 6 10 5 20.5 9 13.8 13 10.5 20.5 3.5Z" fill="currentColor" /><path d="M3.5 20.5h8" {...S} strokeWidth="2" /></>) },
  { name: "Tidewater", color: "#1c7ed6", wordmark: "font-medium tracking-[-0.01em]", Icon: svg(<><circle cx="12" cy="12" r="9" {...S} strokeWidth="2" /><path d="M3.5 13.5c2.8-2.4 5.7-2.4 8.5 0s5.7 2.4 8.5 0V15a9 9 0 0 1-17 0Z" fill="currentColor" /></>) },
  { name: "MONOLITH", color: "#868e96", wordmark: "text-[0.82em] font-bold tracking-[0.18em]", Icon: svg(<><rect x="8" y="2.5" width="8" height="19" rx="1.5" fill="currentColor" /><path d="M4 21.5h16" {...S} strokeWidth="2" /></>) },
  { name: "brightloop", color: "#f59f00", wordmark: "font-semibold tracking-[-0.04em]", Icon: svg(<><path d="M12 12c-2.2-3.2-6.5-3.2-6.5 0s4.3 3.2 6.5 0Zm0 0c2.2 3.2 6.5 3.2 6.5 0s-4.3-3.2-6.5 0Z" {...S} strokeWidth="2.2" /><circle cx="12" cy="4" r="1.6" fill="currentColor" /></>) },
  { name: "Sablewood", color: "#2f9e44", wordmark: "font-serif text-[1.06em]", Icon: svg(<><path d="M12 2.5 19 14H5Z" fill="currentColor" /><path d="M12 8.5 20.5 21h-17Z" fill="currentColor" opacity=".55" /></>) },
  { name: "VANTAGE", color: "#4263eb", wordmark: "text-[0.84em] font-extrabold tracking-[0.12em]", Icon: svg(<path d="M3 4.5h5.5L12 13l3.5-8.5H21L13.5 20h-3Z" fill="currentColor" />) },
  { name: "Pinecrest", color: "#099268", wordmark: "font-medium tracking-[-0.02em]", Icon: svg(<><path d="M12 2.5 6 11h3.2L5 17.5h14L14.8 11H18Z" fill="currentColor" /><path d="M12 17.5v4" {...S} strokeWidth="2.2" /></>) },
  { name: "cobalt", color: "#1864ab", wordmark: "font-bold tracking-[-0.05em]", Icon: svg(<><circle cx="8" cy="8" r="4.5" fill="currentColor" /><circle cx="16" cy="16" r="4.5" fill="currentColor" opacity=".55" /><circle cx="16" cy="8" r="2.4" fill="currentColor" /></>) },
  { name: "Ridgeway", color: "#d9480f", wordmark: "font-light tracking-[0.01em]", Icon: svg(<><path d="M2.5 19 9 8l3.5 5.5L15 10l6.5 9Z" fill="currentColor" /><circle cx="17.5" cy="5.5" r="2" fill="currentColor" /></>) },
  { name: "Halyard", color: "#0b7285", wordmark: "font-serif text-[1.06em] italic", Icon: svg(<><path d="M12 3v15.5M5 13.5c0 4 3.1 7 7 7s7-3 7-7M7.5 7.5h9" {...S} strokeWidth="2.2" /><circle cx="12" cy="3.5" r="1.8" fill="currentColor" /></>) },
];

/**
 * A brand lockup: glyph and wordmark side by side, in the current text colour. `tinted` paints the
 * glyph in the brand accent; the wordmark stays ink so a row of them reads as one quiet band.
 */
export function LogoLockup({
  logo,
  tinted = false,
  className,
}: {
  logo: Logo;
  tinted?: boolean;
  className?: string;
}) {
  const { Icon } = logo;
  return (
    <span className={cn("inline-flex items-center gap-2 whitespace-nowrap text-[17px] leading-none", className)}>
      <Icon className="size-[1.35em] shrink-0 transition-colors duration-300" style={tinted ? { color: logo.color } : undefined} />
      <span className={logo.wordmark}>{logo.name}</span>
    </span>
  );
}

// ─── Shared by the variants ──────────────────────────────────────────────────

export const SPRING = { type: "spring" as const, stiffness: 340, damping: 30 };
export const SOFT = { type: "spring" as const, stiffness: 240, damping: 30 };
/** Ink for the marks, light and dark. */
export const INK = "text-[#1d1d1f] dark:text-[#f5f5f7]";
/** Fades a band out at both edges. */
export const EDGE = "linear-gradient(to right, transparent, black 12%, black 88%, transparent)";

/** Headline block that every variant opens with. Rises into view once. */
export function LogoHeading({
  eyebrow,
  eyebrowClassName,
  title,
  subtitle,
}: {
  eyebrow?: string;
  eyebrowClassName?: string;
  title: string;
  subtitle?: string;
}) {
  const reduced = !!useReducedMotion();
  return (
    <motion.div
      className="mx-auto max-w-2xl text-center"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={SOFT}
    >
      {eyebrow ? (
        <p className={cn("m-0 mb-1 text-[15px] font-semibold text-[#6e6e73] dark:text-[#a1a1a6]", eyebrowClassName)}>{eyebrow}</p>
      ) : null}
      <h2 className="m-0 text-balance text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7] sm:text-[40px]">
        {title}
      </h2>
      {subtitle ? (
        <p className="m-0 mt-3 text-[17px] leading-[1.47] text-[#6e6e73] dark:text-[#a1a1a6]">{subtitle}</p>
      ) : null}
    </motion.div>
  );
}

/** Pages through `logos` `slots` at a time, every `ms` while `run` is true. */
export function usePager(logos: Logo[], slots: number, ms: number, run: boolean) {
  const [page, setPage] = React.useState(0);
  const pages = Math.max(1, Math.ceil(logos.length / slots));
  React.useEffect(() => {
    if (!run || pages < 2) return;
    const id = window.setInterval(() => setPage((p) => p + 1), ms);
    return () => window.clearInterval(id);
  }, [run, ms, pages]);
  const p = page % pages;
  return { page: p, items: Array.from({ length: slots }, (_, i) => logos[(p * slots + i) % logos.length]) };
}

/** A row that drifts sideways forever, easing to a stop while the pointer is over it. */
export function Track({
  items,
  speed,
  reverse,
  render,
  gap,
  active = true,
  pauseOnHover = true,
}: {
  items: (Logo | null)[];
  speed: number;
  reverse?: boolean;
  render: (b: Logo | null, i: number) => React.ReactNode;
  gap: number;
  /** Stops the drift, for example while the band is off screen. */
  active?: boolean;
  pauseOnHover?: boolean;
}) {
  const track = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const target = useMotionValue(1);
  const throttle = useSpring(target, { stiffness: 120, damping: 24 });
  const reduced = !!useReducedMotion();
  React.useEffect(() => {
    if (reverse && track.current) x.set(-track.current.scrollWidth / 4);
  }, [reverse, x]);
  useAnimationFrame((_, delta) => {
    const el = track.current;
    if (!el || reduced || !active) return;
    const half = el.scrollWidth / 2;
    if (!half) return;
    let n = x.get() + (reverse ? 1 : -1) * speed * throttle.get() * (Math.min(delta, 64) / 1000);
    if (n <= -half) n += half;
    if (n > 0) n -= half;
    x.set(n);
  });
  return (
    <div
      onMouseEnter={() => pauseOnHover && target.set(0)}
      onMouseLeave={() => target.set(1)}
      className="py-1"
    >
      <motion.div ref={track} style={{ x, gap }} className="flex w-max">
        {[...items, ...items].map((b, i) => render(b, i))}
      </motion.div>
    </div>
  );
}
