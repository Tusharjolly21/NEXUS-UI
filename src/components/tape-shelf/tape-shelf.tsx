"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export interface ShelfTape {
  title: string;
  artist: string;
  /** Spine and label colour. */
  color: string;
  /** Text colour on the spine and label. */
  ink: string;
}

export const DEFAULT_TAPES: ShelfTape[] = [
  { title: "Night Drive", artist: "Coastal Lines", color: "#ff6b4a", ink: "#fff" },
  { title: "Paper Moons", artist: "Hollow Bay", color: "#ffd60a", ink: "#1d1d1f" },
  { title: "Glass Garden", artist: "Mira Vale", color: "#30d158", ink: "#0b2814" },
  { title: "Static Bloom", artist: "Tarn", color: "#0a84ff", ink: "#fff" },
  { title: "Low Orbit", artist: "Kesh", color: "#bf5af2", ink: "#fff" },
  { title: "Salt & Iron", artist: "Wren Atlas", color: "#e5e5ea", ink: "#1d1d1f" },
  { title: "Afterglow", artist: "Juno Park", color: "#ff375f", ink: "#fff" },
];

export interface TapeShelfProps {
  /** Cases on the shelf, left to right. */
  tapes?: ShelfTape[];
  /** Called with the picked index, or null when the tape goes back. */
  onPick?: (index: number | null) => void;
  /** Pulls a few tapes out and puts them back until someone touches the shelf. */
  autoplay?: boolean;
}

const SPINE = 22;
const GAP = 6;
const TH = 140; // tape case height
const CW = 92; // cover width (depth when shelved)

function Reel({ spin }: { spin: boolean }) {
  const reduce = useReducedMotion();
  const turning = spin && !reduce;
  return (
    <motion.svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      animate={turning ? { rotate: 360 } : { rotate: 0 }}
      transition={turning ? { duration: 1.6, repeat: Infinity, ease: "linear" } : { duration: 0.4 }}
      aria-hidden="true"
    >
      <circle cx="13" cy="13" r="12" fill="#f5f5f7" />
      <circle cx="13" cy="13" r="4" fill="#1d1d1f" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <rect key={a} x="12" y="3" width="2" height="5" rx="1" fill="#1d1d1f" transform={`rotate(${a} 13 13)`} />
      ))}
    </motion.svg>
  );
}

/**
 * A shelf of cassette cases seen spine-on. Hover slides one up; pick one and it
 * swings out to show its cover with the reels turning, while the shelf behind
 * steps back.
 */
export function TapeShelf({ tapes = DEFAULT_TAPES, onPick, autoplay = false }: TapeShelfProps) {
  const [hover, setHover] = useState<number | null>(null);
  const [pick, setPickState] = useState<number | null>(null);
  const touched = useRef(false);
  const n = tapes.length;

  const setPick = (i: number | null) => {
    setPickState(i);
    onPick?.(i);
  };

  useEffect(() => {
    if (!autoplay || n === 0) return;
    let k = 0;
    const seq = [2, null, 5, null, 0, null];
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      const s = seq[k++ % seq.length];
      setPickState(s === null ? null : s % n);
    }, 1800);
    return () => clearInterval(t);
  }, [autoplay, n]);

  const rowW = n * (SPINE + GAP);
  const picked = pick !== null && pick < n ? pick : null;

  return (
    <div
      className="flex flex-col items-center gap-4"
      onPointerDown={() => {
        touched.current = true;
      }}
      onKeyDown={(e) => {
        touched.current = true;
        if (e.key === "Escape" && picked !== null) setPick(null);
      }}
    >
      <div className="relative h-[250px] w-[420px] max-w-full" style={{ perspective: 1000 }}>
        <div
          className="absolute left-1/2 top-[54px]"
          style={{ width: rowW, marginLeft: -rowW / 2, height: TH, transformStyle: "preserve-3d", transform: "rotateY(-18deg) rotateX(6deg)" }}
        >
          {tapes.map((t, i) => {
            const isPick = picked === i;
            const lifted = hover === i && picked === null;
            const spread = picked !== null && !isPick ? (i < picked ? -14 : 14) : 0;
            return (
              <motion.button
                key={`${t.title}-${i}`}
                type="button"
                aria-pressed={isPick}
                aria-label={`${t.title} by ${t.artist}`}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onClick={() => {
                  touched.current = true;
                  setPick(isPick ? null : i);
                }}
                className="absolute top-0 outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]"
                style={{ left: i * (SPINE + GAP), width: SPINE, height: TH, transformStyle: "preserve-3d", originX: 0.5 }}
                initial={false}
                animate={
                  isPick
                    ? { x: rowW / 2 - i * (SPINE + GAP) - (CW * 1.6) / 2, y: -16, z: 150, rotateY: -84, scale: 1.05, opacity: 1 }
                    : { x: spread, y: lifted ? -18 : 0, z: lifted ? 8 : 0, rotateY: 0, scale: 1, opacity: picked !== null ? 0.55 : 1 }
                }
                transition={{ type: "spring", stiffness: 160, damping: 20 }}
              >
                {/* spine */}
                <span
                  className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[3px]"
                  style={{ background: t.color, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08), inset 2px 0 0 rgba(255,255,255,.35)", backfaceVisibility: "hidden" }}
                >
                  <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: t.ink, transform: "rotate(-90deg)" }}>
                    {t.title}
                  </span>
                </span>
                {/* cover, hinged on the spine's left edge */}
                <span
                  className="absolute top-0 flex flex-col justify-between overflow-hidden rounded-[6px] bg-[#1d1d1f] p-2.5"
                  style={{
                    width: CW * 1.6,
                    height: TH,
                    left: 0,
                    transformOrigin: "0% 50%",
                    transform: "rotateY(90deg)",
                    backfaceVisibility: "hidden",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,.12)",
                  }}
                >
                  <span className="flex h-[42px] flex-col justify-center rounded-[3px] px-2" style={{ background: t.color, color: t.ink }}>
                    <span className="text-[11px] font-bold leading-tight">{t.title}</span>
                    <span className="text-[9px] opacity-80">{t.artist}</span>
                  </span>
                  <span className="mx-auto flex h-[46px] w-[110px] items-center justify-between rounded-[23px] bg-[#2c2c2e] px-2.5 shadow-[inset_0_2px_6px_rgba(0,0,0,.6)]">
                    <Reel spin={isPick} />
                    <span className="h-[14px] w-[30px] rounded-[3px] bg-[#3a2a1c]" />
                    <Reel spin={isPick} />
                  </span>
                  <span className="text-center text-[8px] font-semibold uppercase tracking-[0.2em] text-white/40">Side A · 45 min</span>
                </span>
              </motion.button>
            );
          })}
        </div>
        <div
          className="absolute inset-x-10 top-[200px] h-3 rounded-full bg-[radial-gradient(closest-side,rgba(0,0,0,.18),rgba(0,0,0,0))] dark:bg-[radial-gradient(closest-side,rgba(0,0,0,.7),rgba(0,0,0,0))]"
          aria-hidden="true"
        />
      </div>
      <div className="relative h-10 w-[300px] max-w-full overflow-hidden text-center" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={picked ?? "none"}
            initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
            className="flex flex-col"
          >
            {picked === null ? (
              <span className="text-[13px] text-[#86868b] dark:text-[#8e8e93]">Pick a tape from the shelf.</span>
            ) : (
              <>
                <span className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{tapes[picked].title}</span>
                <span className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">Now playing · {tapes[picked].artist}</span>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
