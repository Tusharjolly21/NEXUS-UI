"use client";
import { useEffect, useEffectEvent, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface Mood {
  id: string;
  label: string;
  color: string;
}

const MOODS: Mood[] = [
  { id: "calm", label: "Calm", color: "#64d2ff" },
  { id: "focused", label: "Focused", color: "#0a84ff" },
  { id: "happy", label: "Happy", color: "#ffcc00" },
  { id: "energized", label: "Energized", color: "#ff9f0a" },
  { id: "tender", label: "Tender", color: "#ff6482" },
  { id: "dreamy", label: "Dreamy", color: "#bf5af2" },
];

const CELL = 12;
const MW = 216;

type Phase = "closed" | "opening" | "open" | "closing";

export interface PixelSelectProps {
  options?: Mood[];
  onChange?: (id: string) => void;
  /** Opens and picks moods by itself until the user interacts. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
}

/** Small seeded generator so every open gets fresh jitter without impure renders. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A dropdown that assembles itself out of pixels tinted with the current mood,
 * then dissolves back into a shower of them when it closes.
 */
export function PixelSelect({ options = MOODS, onChange, autoplay = false, enableSound = true }: PixelSelectProps) {
  const play = useSound(enableSound);
  const uid = useId();
  const [value, setValue] = useState((options[1] ?? options[0]).id);
  const [phase, setPhase] = useState<Phase>("closed");
  const [hover, setHover] = useState<string | null>(null);
  const touched = useRef(false);
  const autoK = useRef(0);
  const MH = options.length * 40 + 12;
  const cols = Math.ceil(MW / CELL), rows = Math.ceil(MH / CELL);
  const current = options.find((o) => o.id === value) ?? options[0];
  const [seed, setSeed] = useState(0);
  const cells = useMemo(() => {
    const rand = seeded(seed * 9973 + 17);
    return Array.from({ length: cols * rows }, (_, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      // Build from the top-left corner outwards, with jitter.
      const dist = Math.hypot(c / cols, r / rows);
      return { c, r, delay: dist * 0.22 + rand() * 0.08, fall: 40 + rand() * 140, drift: (rand() - 0.5) * 60, spin: (rand() - 0.5) * 180 };
    });
  }, [cols, rows, seed]);

  const openMenu = () => {
    if (phase !== "closed") return;
    play("pop", 0.7);
    setSeed((s) => s + 1);
    setPhase("opening");
    setTimeout(() => setPhase("open"), 420);
  };
  const closeMenu = (pick?: string) => {
    if (phase !== "open") return;
    if (pick) { play("tap", 0.8); setValue(pick); onChange?.(pick); }
    setSeed((s) => s + 1);
    setPhase("closing");
    setTimeout(() => setPhase("closed"), 900);
  };

  const autoRun = useEffectEvent((ts: number[]) => {
    if (touched.current || phase !== "closed") return;
    setSeed((s) => s + 1);
    setPhase("opening");
    ts.push(window.setTimeout(() => setPhase("open"), 420));
    autoK.current += 2;
    const pick = options[autoK.current % options.length];
    ts.push(window.setTimeout(() => { if (!touched.current) setHover(pick.id); }, 900));
    ts.push(window.setTimeout(() => {
      if (touched.current) return;
      setValue(pick.id);
      setSeed((s) => s + 1);
      setPhase("closing");
      ts.push(window.setTimeout(() => setPhase("closed"), 900));
    }, 1700));
  });

  useEffect(() => {
    if (!autoplay) return;
    const ts: number[] = [];
    ts.push(window.setTimeout(() => autoRun(ts), 700));
    const loop = setInterval(() => autoRun(ts), 3600);
    return () => { clearInterval(loop); ts.forEach(clearTimeout); };
  }, [autoplay]);

  return (
    <div className="relative h-[330px] w-[216px]" onPointerDown={() => { touched.current = true; }}>
      <motion.button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={phase === "open"}
        aria-controls={`${uid}-list`}
        onClick={() => (phase === "closed" ? openMenu() : closeMenu())}
        whileTap={{ scale: 0.97 }}
        className="flex h-11 w-full items-center gap-2.5 rounded-xl bg-white px-3.5 text-[15px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)] dark:focus-visible:outline-[#0a84ff]"
      >
        <motion.span className="h-3.5 w-3.5 rounded-[4px]" animate={{ backgroundColor: current.color }} />
        <span className="flex-1 text-left">{current.label}</span>
        <motion.svg animate={{ rotate: phase === "open" || phase === "opening" ? 180 : 0 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true" className="text-[#86868b] dark:text-[#8e8e93]"><path d="M6 9l6 6 6-6" /></motion.svg>
      </motion.button>

      <div className="absolute left-0 top-[52px]" style={{ width: MW, height: MH }}>
        {/* Pixels */}
        {phase !== "closed" && (
          <div key={seed} className="pointer-events-none absolute inset-0" aria-hidden="true">
            {cells.map((cell, i) => (
              <motion.span
                key={i}
                className="absolute rounded-[2px]"
                style={{ left: cell.c * CELL, top: cell.r * CELL, width: CELL - 1, height: CELL - 1, background: current.color }}
                initial={phase === "opening" ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1, x: 0, y: 0, rotate: 0 }}
                animate={
                  phase === "opening"
                    ? { scale: [0, 1.2, 1], opacity: [0, 1, 1] }
                    : phase === "open"
                      ? { scale: 1, opacity: 0 }
                      : { y: cell.fall, x: cell.drift, rotate: cell.spin, opacity: 0, scale: 0.4 }
                }
                transition={phase === "opening" ? { duration: 0.24, delay: cell.delay } : phase === "open" ? { duration: 0.3, delay: cell.delay * 0.4 } : { duration: 0.7, delay: cell.delay * 0.6, ease: [0.4, 0, 1, 1] }}
              />
            ))}
          </div>
        )}
        {/* Menu */}
        <AnimatePresence>
          {phase === "open" && (
            <motion.ul
              id={`${uid}-list`}
              role="listbox"
              aria-label="Mood"
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, transition: { duration: 0.08 } }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 m-0 list-none rounded-[14px] bg-white p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_24px_40px_-18px_rgba(0,0,0,.35)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_40px_-18px_rgba(0,0,0,.8)]"
              onPointerLeave={() => setHover(null)}
            >
              {options.map((o, i) => (
                <motion.li
                  key={o.id}
                  role="option"
                  aria-selected={o.id === value}
                  tabIndex={0}
                  onPointerEnter={() => setHover(o.id)}
                  onFocus={() => setHover(o.id)}
                  onClick={() => { touched.current = true; closeMenu(o.id); }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); touched.current = true; closeMenu(o.id); } if (e.key === "Escape") closeMenu(); }}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="relative flex h-10 cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 text-[14px] font-medium text-[#1d1d1f] outline-none dark:text-[#f5f5f7]"
                >
                  {hover === o.id && <motion.span layoutId={`${uid}-hl`} className="absolute inset-0 rounded-[10px]" style={{ background: `${o.color}26` }} transition={{ type: "spring", stiffness: 520, damping: 38 }} />}
                  <span className="relative h-3.5 w-3.5 rounded-[4px]" style={{ background: o.color }} />
                  <span className="relative flex-1">{o.label}</span>
                  {o.id === value && (
                    <svg className="relative" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
