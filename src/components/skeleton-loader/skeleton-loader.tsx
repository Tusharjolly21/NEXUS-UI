"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";

export type SkeletonLoaderProps = {
  /** True while the real content is on its way. Leave it out and the component runs a demo on its own. */
  isLoading?: boolean;
  /** What to show while loading, built from `Skeleton`, `SkeletonText` and `SkeletonAvatar`. */
  skeleton?: ReactNode;
  /** The real content. It blurs in when `isLoading` turns false. */
  children?: ReactNode;
  /** Announced to screen readers while loading. */
  label?: string;
  /** Announced when the content has arrived. */
  loadedLabel?: string;
  /** Sweep a highlight across every placeholder as one wave. Off under reduced motion. */
  shimmer?: boolean;
  /** Colours for a light or a dark page. */
  tone?: "light" | "dark";
  /** In the demo, flips between loading and content by itself until the visitor touches it. Never runs under reduced motion. */
  autoplay?: boolean;
  className?: string;
};

type Tone = "light" | "dark";

const PALETTE = {
  light: { base: "#e8e8ed", glow: "rgba(255,255,255,.95)", text: "#1d1d1f", muted: "#6e6e73", card: "#ffffff" },
  dark: { base: "#262628", glow: "rgba(255,255,255,.12)", text: "#f5f5f7", muted: "#a1a1a6", card: "#121214" },
} as const;

const BAND = 280;

type Ctx = { sweep: MotionValue<number>; rootRef: RefObject<HTMLElement | null>; tone: Tone };
const SkeletonContext = createContext<Ctx | null>(null);

/**
 * A placeholder block. Inside a SkeletonLoader every block takes its slice of one shared sweep, so the highlight crosses the whole
 * layout as a single wave instead of each block shimmering on its own. Size it with `className` or `style`.
 */
export function Skeleton({ className = "h-3 w-full rounded-md", style }: { className?: string; style?: CSSProperties }) {
  const ctx = useContext(SkeletonContext);
  const own = useMotionValue(-9999);
  const sweep = ctx?.sweep ?? own;
  const palette = PALETTE[ctx?.tone ?? "light"];
  const ref = useRef<HTMLSpanElement>(null);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    const root = ctx?.rootRef.current;
    const el = ref.current;
    if (!root || !el) return;
    const measure = () => setLeft(el.getBoundingClientRect().left - root.getBoundingClientRect().left);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [ctx]);

  const backgroundPosition = useTransform(sweep, (x) => `${(x - left).toFixed(1)}px 0px`);

  return (
    <motion.span
      ref={ref}
      aria-hidden="true"
      className={`block ${className}`}
      style={{
        backgroundColor: palette.base,
        backgroundImage: `linear-gradient(100deg, transparent 0%, ${palette.glow} 50%, transparent 100%)`,
        backgroundSize: `${BAND}px 100%`,
        backgroundRepeat: "no-repeat",
        backgroundPosition,
        ...style,
      }}
    />
  );
}

/** Lines of placeholder text. The last line is shorter, like a real paragraph. */
export function SkeletonText({ lines = 3, lastLineWidth = "62%", className = "" }: { lines?: number; lastLineWidth?: string; className?: string }) {
  return (
    <span className={`flex flex-col gap-2.5 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className="h-3 rounded-full" style={{ width: i === lines - 1 && lines > 1 ? lastLineWidth : "100%" }} />
      ))}
    </span>
  );
}

/** A round placeholder, for an avatar. */
export function SkeletonAvatar({ size = 44, className = "" }: { size?: number; className?: string }) {
  return <Skeleton className={`shrink-0 rounded-full ${className}`} style={{ width: size, height: size }} />;
}

function DemoSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3.5">
        <SkeletonAvatar size={48} />
        <div className="flex flex-1 flex-col gap-2.5">
          <Skeleton className="h-3.5 w-36 rounded-full" />
          <Skeleton className="h-3 w-52 max-w-full rounded-full" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="flex gap-2">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
    </div>
  );
}

function DemoContent({ tone }: { tone: Tone }) {
  const p = PALETTE[tone];
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3.5">
        <span className="block h-12 w-12 shrink-0 overflow-hidden rounded-full" aria-hidden="true">
          <svg viewBox="0 0 40 40" className="h-full w-full" focusable="false">
            <rect width="40" height="40" fill="#d9f5dd" />
            <circle cx="27" cy="8.2" r="3.6" fill="#b5502f" />
            <path d="M4.5 40C5.6 30.4 12.6 27 20 27s14.4 3.4 15.5 13Z" fill="#1f9d62" />
            <rect x="17.2" y="21" width="5.6" height="8" rx="2.4" fill="#f6d3b3" />
            <rect x="17.2" y="25" width="5.6" height="3" fill="#000" opacity=".1" />
            <ellipse cx="20" cy="17" rx="7.4" ry="8.2" fill="#f6d3b3" />
            <path d="M12.6 15.4c.2-5.6 3.8-8 7.6-8 4 0 7.2 2.4 7.2 8-2.3-2.4-5-3.2-7.4-3.2-2.8 0-5.2.9-7.4 3.2Z" fill="#b5502f" />
            <circle cx="17.2" cy="17.8" r=".95" fill="#2b2b2e" />
            <circle cx="22.8" cy="17.8" r=".95" fill="#2b2b2e" />
            <ellipse cx="15.5" cy="20.4" rx="1.6" ry="1" fill="#ff6b81" opacity=".28" />
            <ellipse cx="24.5" cy="20.4" rx="1.6" ry="1" fill="#ff6b81" opacity=".28" />
            <path d="M18 21.6q2 1.7 4 0" fill="none" stroke="#2b2b2e" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="m-0 text-[15px] font-semibold leading-5 tracking-[-0.01em]" style={{ color: p.text }}>
            Ana Ribeiro
          </p>
          <p className="m-0 text-[13px] leading-5" style={{ color: p.muted }}>
            Product designer in Lisbon
          </p>
        </div>
      </div>
      <p className="m-0 text-[14px] leading-[1.55]" style={{ color: p.text }}>
        Ana designs checkout flows that feel calm. Last quarter she cut the steps from five to two and moved the first paint under a second.
      </p>
      <svg viewBox="0 0 320 144" preserveAspectRatio="xMidYMid slice" className="h-36 w-full rounded-2xl" role="img" aria-label="A checkout screen showing a confirmed payment">
        <rect width="320" height="144" fill="#dfeaff" />
        <circle cx="272" cy="24" r="48" fill="#cddfff" />
        <circle cx="38" cy="132" r="56" fill="#d2e2ff" />
        <rect x="92" y="27" width="136" height="100" rx="14" fill="#1d3a7a" opacity=".1" />
        <rect x="92" y="22" width="136" height="100" rx="14" fill="#ffffff" />
        <circle cx="116" cy="46" r="9" fill="#30d158" />
        <path d="m111.8 46.2 3 3 5.6-6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="134" y="40" width="62" height="6" rx="3" fill="#1d1d1f" />
        <rect x="134" y="52" width="40" height="5" rx="2.5" fill="#c7c7cc" />
        <rect x="106" y="68" width="108" height="1.5" fill="#e5e5ea" />
        <rect x="106" y="78" width="44" height="5" rx="2.5" fill="#c7c7cc" />
        <rect x="186" y="78" width="28" height="5" rx="2.5" fill="#1d1d1f" />
        <rect x="106" y="90" width="52" height="5" rx="2.5" fill="#c7c7cc" />
        <rect x="190" y="90" width="24" height="5" rx="2.5" fill="#1d1d1f" />
        <rect x="106" y="102" width="108" height="14" rx="7" fill="#0071e3" />
        <rect x="146" y="107" width="28" height="4" rx="2" fill="#ffffff" />
      </svg>
      <div className="flex flex-wrap gap-2 text-[12px] font-medium">
        {["Checkout", "Research", "Motion"].map((t) => (
          <span key={t} className="rounded-full px-3 py-1.5" style={{ background: tone === "light" ? "#f2f2f7" : "#232326", color: p.text }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton loading that behaves. One highlight sweeps across the whole layout as a single wave, the content blurs in when it
 * arrives, and screen readers hear "Loading" and then "Loaded" through a polite live region, with aria-busy set on the wrapper.
 * Compose your own placeholder from Skeleton, SkeletonText and SkeletonAvatar, or render with no props for a demo card.
 */
export default function SkeletonLoader({
  isLoading,
  skeleton,
  children,
  label = "Loading",
  loadedLabel = "Loaded",
  shimmer = true,
  tone = "light",
  autoplay = false,
  className = "",
}: SkeletonLoaderProps) {
  const reduced = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "80px" });
  const sweep = useMotionValue(-9999);
  const touched = useRef(false);
  const demo = children === undefined && skeleton === undefined;
  const controlled = isLoading !== undefined;
  const [auto, setAuto] = useState(true);
  const loading = controlled ? isLoading : auto;
  const palette = PALETTE[tone];

  useEffect(() => {
    if (!loading || !shimmer || reduced || !inView) {
      sweep.set(-9999);
      return;
    }
    const width = rootRef.current?.offsetWidth ?? 600;
    const controls = animate(sweep, [-BAND, width + 24], {
      duration: Math.max(1.5, width / 380),
      ease: [0.45, 0, 0.2, 1],
      repeat: Infinity,
      repeatDelay: 0.35,
    });
    return () => controls.stop();
  }, [loading, shimmer, reduced, inView, sweep]);

  useEffect(() => {
    if (!autoplay || reduced || controlled || !inView) return;
    const id = window.setTimeout(() => {
      if (!touched.current) setAuto((a) => !a);
    }, auto ? 2700 : 3800);
    return () => window.clearTimeout(id);
  }, [autoplay, reduced, controlled, inView, auto]);

  const showDemoControl = demo && !controlled;
  const ctx: Ctx = { sweep, rootRef, tone };
  const fade = reduced ? { duration: 0 } : { duration: 0.34 };

  return (
    <div className={`w-full ${className}`}>
      <SkeletonContext.Provider value={ctx}>
        <div ref={rootRef} aria-busy={loading} className="grid [&>*]:[grid-area:1/1]">
          <span className="sr-only" role="status" aria-live="polite">
            {loading ? label : loadedLabel}
          </span>
          <AnimatePresence initial={false}>
            {loading ? (
              <motion.div
                key="skeleton"
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
                transition={fade}
                className="min-w-0"
              >
                {demo ? <DemoSkeleton /> : skeleton}
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={reduced ? false : { opacity: 0, y: 8, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={reduced ? { duration: 0 } : { duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
                className="min-w-0"
              >
                {demo ? <DemoContent tone={tone} /> : children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SkeletonContext.Provider>
      {showDemoControl && (
        <button
          type="button"
          onClick={() => {
            touched.current = true;
            setAuto((a) => !a);
          }}
          className="mt-4 rounded-full px-3 py-1.5 text-[12px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff] focus-visible:ring-offset-2"
          style={{ background: tone === "light" ? "#f2f2f7" : "#232326", color: palette.text }}
        >
          {loading ? "Show content" : "Load again"}
        </button>
      )}
    </div>
  );
}
