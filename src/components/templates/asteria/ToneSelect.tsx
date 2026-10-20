"use client";
// Asteria copy of the Motion Kit Pixel Select: adds a label, a default value and
// reports autoplay picks through onChange so the page can react to them.
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface Mood { id: string; label: string; color: string }

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
}

/**
 * A dropdown that assembles itself out of pixels tinted with the current mood,
 * then dissolves back into a shower of them when it closes.
 */
export default function ToneSelect({ options = MOODS, onChange, autoplay = false, defaultValue, label = "Mood", accent = "#7c3aed" }: PixelSelectProps & { defaultValue?: string; label?: string; accent?: string }) {
  const uid = useId();
  const [value, setValue] = useState(defaultValue ?? options[1].id);
  const [phase, setPhase] = useState<Phase>("closed");
  const [hover, setHover] = useState<string | null>(null);
  const touched = useRef(false);
  const MH = options.length * 40 + 12;
  const cols = Math.ceil(MW / CELL), rows = Math.ceil(MH / CELL);
  const current = options.find((o) => o.id === value)!;
  const [seed, setSeed] = useState(0);
  const cells = useMemo(
    () =>
      Array.from({ length: cols * rows }, (_, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        // Build from the top-left corner outwards, with jitter.
        const dist = Math.hypot(c / cols, r / rows);
        const rnd = (k: number) => { const x = Math.sin((i + 1) * 12.9898 + (seed + 1) * 78.233 + k * 37.719) * 43758.5453; return x - Math.floor(x); };
        return { c, r, delay: dist * 0.22 + rnd(1) * 0.08, fall: 40 + rnd(2) * 140, drift: (rnd(3) - 0.5) * 60, spin: (rnd(4) - 0.5) * 180 };
      }),
    [cols, rows, seed],
  );

  const openMenu = () => {
    if (phase !== "closed") return;
    setSeed((s) => s + 1);
    setPhase("opening");
    setTimeout(() => setPhase("open"), 420);
  };
  const closeMenu = (pick?: string) => {
    if (phase !== "open") return;
    if (pick) { setValue(pick); onChange?.(pick); }
    setSeed((s) => s + 1);
    setPhase("closing");
    setTimeout(() => setPhase("closed"), 900);
  };

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const ts: number[] = [];
    const run = () => {
      if (touched.current) return;
      setPhase((p) => {
        if (p !== "closed") return p;
        setSeed((s) => s + 1);
        ts.push(window.setTimeout(() => setPhase("open"), 420));
        const pick = options[(k += 2) % options.length];
        ts.push(window.setTimeout(() => !touched.current && setHover(pick.id), 900));
        ts.push(window.setTimeout(() => {
          if (touched.current) return;
          setValue(pick.id);
          onChange?.(pick.id);
          setSeed((s) => s + 1);
          setPhase("closing");
          ts.push(window.setTimeout(() => setPhase("closed"), 900));
        }, 1700));
        return "opening";
      });
    };
    ts.push(window.setTimeout(run, 700));
    const loop = setInterval(run, 3600);
    return () => { clearInterval(loop); ts.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  return (
    <div className="relative h-[330px] w-[216px]" onPointerDown={() => (touched.current = true)}>
      <motion.button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={phase === "open"}
        aria-controls={`${uid}-list`}
        onClick={() => (phase === "closed" ? openMenu() : closeMenu())}
        whileTap={{ scale: 0.97 }}
        className="flex h-11 w-full items-center gap-2.5 rounded-xl bg-white px-3.5 text-[15px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ outlineColor: accent }}
        aria-label={`${label}: ${current.label}`}
      >
        <motion.span className="h-3.5 w-3.5 rounded-[4px]" animate={{ backgroundColor: current.color }} />
        <span className="flex-1 text-left">{current.label}</span>
        <motion.svg animate={{ rotate: phase === "open" || phase === "opening" ? 180 : 0 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#86868b" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></motion.svg>
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
              aria-label={label}
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, transition: { duration: 0.08 } }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 m-0 list-none rounded-[14px] bg-white p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_24px_40px_-18px_rgba(0,0,0,.35)]"
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
                  className="relative flex h-10 cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 text-[14px] font-medium text-[#1d1d1f] outline-none"
                >
                  {hover === o.id && <motion.span layoutId={`${uid}-hl`} className="absolute inset-0 rounded-[10px]" style={{ background: `${o.color}26` }} transition={{ type: "spring", stiffness: 520, damping: 38 }} />}
                  <span className="relative h-3.5 w-3.5 rounded-[4px]" style={{ background: o.color }} />
                  <span className="relative flex-1">{o.label}</span>
                  {o.id === value && (
                    <svg className="relative" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
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
