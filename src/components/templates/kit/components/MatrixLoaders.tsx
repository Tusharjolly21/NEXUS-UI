"use client";
import { motion } from "framer-motion";

const N = 5; // 5x5 grid
const cells = Array.from({ length: N * N }, (_, i) => ({ r: Math.floor(i / N), c: i % N, i }));
const center = (N - 1) / 2;

type Pattern = (c: { r: number; c: number; i: number }) => { delay: number; duration?: number };

// Each pattern turns a cell's position into a phase offset for the same pulse.
const PATTERNS: { name: string; label: string; color: string; fn: Pattern; dur: number }[] = [
  { name: "wave", label: "Indexing", color: "#0071e3", dur: 1.2, fn: ({ c, r }) => ({ delay: (c + r) * 0.08 }) },
  { name: "ripple", label: "Thinking", color: "#bf5af2", dur: 1.4, fn: ({ c, r }) => ({ delay: Math.hypot(c - center, r - center) * 0.16 }) },
  { name: "spiral", label: "Searching", color: "#ff9f0a", dur: 1.6, fn: ({ c, r }) => ({ delay: ((Math.atan2(r - center, c - center) + Math.PI) / (Math.PI * 2)) * 1.2 + Math.hypot(c - center, r - center) * 0.05 }) },
  { name: "rain", label: "Syncing", color: "#30d158", dur: 1.0, fn: ({ c, r }) => ({ delay: r * 0.12 + ((c * 37) % 5) * 0.11 }) },
  { name: "halogen", label: "Recording", color: "#ff3b30", dur: 1.0, fn: ({ c }) => ({ delay: c * 0.14 }) },
  { name: "checker", label: "Building", color: "#1d1d1f", dur: 0.9, fn: ({ c, r }) => ({ delay: (c + r) % 2 ? 0.45 : 0 }) },
];

/**
 * Six 5×5 dot-matrix loaders. They all share one pulse (scale, opacity,
 * colour); only the phase offset per dot changes, which is what turns the same
 * grid into a wave, ripple, spiral, rain, halogen sweep or checkerboard.
 */
export function MatrixLoader({ pattern = 0, size = 64, color }: { pattern?: number; size?: number; color?: string }) {
  const p = PATTERNS[pattern % PATTERNS.length];
  const col = color ?? p.color;
  const dot = size / N;
  return (
    <span role="status" aria-label={p.label} className="grid" style={{ width: size, height: size, gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}>
      {cells.map((c) => {
        const { delay } = p.fn(c);
        return (
          <span key={c.i} className="flex items-center justify-center" style={{ width: dot, height: dot }}>
            <motion.span
              className="rounded-full"
              style={{ width: dot * 0.62, height: dot * 0.62, background: col }}
              animate={{ scale: [0.45, 1, 0.45], opacity: [0.18, 1, 0.18] }}
              transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: delay % p.dur }}
            />
          </span>
        );
      })}
    </span>
  );
}

export default function MatrixLoaders() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {PATTERNS.map((p, i) => (
        <div key={p.name} className="flex h-[132px] w-[132px] flex-col items-center justify-center gap-3 rounded-[22px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_10px_24px_-18px_rgba(0,0,0,.35)]">
          <MatrixLoader pattern={i} />
          <motion.span className="text-[12px] font-medium text-[#6e6e73]" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}>
            {p.label}…
          </motion.span>
        </div>
      ))}
    </div>
  );
}
