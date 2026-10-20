"use client";
import { motion, useReducedMotion } from "framer-motion";

const N = 5; // 5x5 grid
const cells = Array.from({ length: N * N }, (_, i) => ({ r: Math.floor(i / N), c: i % N, i }));
const center = (N - 1) / 2;

type Cell = { r: number; c: number; i: number };
type Pattern = (c: Cell) => { delay: number };

export type MatrixPatternName = "wave" | "ripple" | "spiral" | "rain" | "halogen" | "checker";

// Each pattern turns a cell's position into a phase offset for the same pulse.
// Colours that need a dark-mode twin are CSS variables set on the loader.
const PATTERNS: { name: MatrixPatternName; label: string; color: string; fn: Pattern; dur: number }[] = [
  { name: "wave", label: "Indexing", color: "var(--mk-blue)", dur: 1.2, fn: ({ c, r }) => ({ delay: (c + r) * 0.08 }) },
  { name: "ripple", label: "Thinking", color: "#bf5af2", dur: 1.4, fn: ({ c, r }) => ({ delay: Math.hypot(c - center, r - center) * 0.16 }) },
  {
    name: "spiral",
    label: "Searching",
    color: "#ff9f0a",
    dur: 1.6,
    fn: ({ c, r }) => ({ delay: ((Math.atan2(r - center, c - center) + Math.PI) / (Math.PI * 2)) * 1.2 + Math.hypot(c - center, r - center) * 0.05 }),
  },
  { name: "rain", label: "Syncing", color: "#30d158", dur: 1.0, fn: ({ c, r }) => ({ delay: r * 0.12 + ((c * 37) % 5) * 0.11 }) },
  { name: "halogen", label: "Recording", color: "#ff3b30", dur: 1.0, fn: ({ c }) => ({ delay: c * 0.14 }) },
  { name: "checker", label: "Building", color: "var(--mk-ink)", dur: 0.9, fn: ({ c, r }) => ({ delay: (c + r) % 2 ? 0.45 : 0 }) },
];

export const MATRIX_PATTERNS: readonly MatrixPatternName[] = PATTERNS.map((p) => p.name);

export interface MatrixLoaderProps {
  /** Pattern name, or its index (0-5) in wave, ripple, spiral, rain, halogen, checker. */
  pattern?: number | MatrixPatternName;
  /** Width and height of the 5×5 grid in px. */
  size?: number;
  /** Dot colour. Defaults to the pattern's own colour. */
  color?: string;
  /** Accessible label. Defaults to the pattern's label ("Indexing", "Thinking"…). */
  label?: string;
}

/**
 * One 5×5 dot-matrix loader. Every dot runs the same pulse (scale, opacity);
 * only its phase offset changes, which is what turns the grid into a wave,
 * ripple, spiral, rain, halogen sweep or checkerboard.
 */
export function MatrixLoader({ pattern = 0, size = 64, color, label }: MatrixLoaderProps) {
  const reduce = useReducedMotion();
  const index = typeof pattern === "number" ? pattern : Math.max(0, PATTERNS.findIndex((p) => p.name === pattern));
  const p = PATTERNS[((index % PATTERNS.length) + PATTERNS.length) % PATTERNS.length];
  const col = color ?? p.color;
  const dot = size / N;
  return (
    <span
      role="status"
      aria-label={label ?? p.label}
      className="grid [--mk-blue:#0071e3] [--mk-ink:#1d1d1f] dark:[--mk-blue:#0a84ff] dark:[--mk-ink:#f5f5f7]"
      style={{ width: size, height: size, gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}
    >
      {cells.map((c) => {
        const { delay } = p.fn(c);
        return (
          <span key={c.i} className="flex items-center justify-center" style={{ width: dot, height: dot }}>
            <motion.span
              className="rounded-full"
              style={{ width: dot * 0.62, height: dot * 0.62, background: col }}
              animate={reduce ? { scale: 0.8, opacity: [0.35, 1, 0.35] } : { scale: [0.45, 1, 0.45], opacity: [0.18, 1, 0.18] }}
              transition={{ duration: reduce ? p.dur * 2 : p.dur, repeat: Infinity, ease: "easeInOut", delay: delay % p.dur }}
            />
          </span>
        );
      })}
    </span>
  );
}

export interface MatrixLoadersProps {
  /** Grid size of each loader in px. */
  size?: number;
  /** One colour for every loader. Defaults to each pattern's own colour. */
  color?: string;
  /** Show the pulsing label ("Indexing…") under each loader. */
  showLabels?: boolean;
}

/**
 * Six 5×5 dot-matrix loaders on a 3×2 grid of tiles, all sharing one pulse.
 */
export function MatrixLoaders({ size = 64, color, showLabels = true }: MatrixLoadersProps) {
  const reduce = useReducedMotion();
  const tile = size + 68; // 132px tiles at the default size
  return (
    <div className="grid grid-cols-3 gap-4">
      {PATTERNS.map((p, i) => (
        <div
          key={p.name}
          className="flex flex-col items-center justify-center gap-3 rounded-[22px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_10px_24px_-18px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
          style={{ width: tile, height: tile }}
        >
          <MatrixLoader pattern={i} size={size} color={color} />
          {showLabels && (
            <motion.span
              className="text-[12px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]"
              aria-hidden="true"
              animate={reduce ? { opacity: 1 } : { opacity: [0.5, 1, 0.5] }}
              transition={reduce ? { duration: 0 } : { duration: 2, repeat: Infinity, delay: i * 0.2 }}
            >
              {p.label}…
            </motion.span>
          )}
        </div>
      ))}
    </div>
  );
}
