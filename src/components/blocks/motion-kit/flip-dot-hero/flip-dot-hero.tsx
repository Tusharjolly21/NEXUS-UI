"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FlipDotHeroProps {
  /** Words the sign cycles through. Each is upper-cased, stripped to the characters the dot font has (A to Z, 0 to 9, space, ! and ?) and cut to 7 characters. Pass a stable array. */
  words?: string[];
  /** Cycles the sign through `words` every 2.8s until the visitor first presses the board, types, or presses a key. */
  autoplay?: boolean;
  className?: string;
}

// 5x7 dot font, one string of 35 bits per glyph (row by row)
const F: Record<string, string> = {
  A: "01110100011000111111100011000110001", B: "11110100011000111110100011000111110", C: "01110100011000010000100001000101110",
  D: "11110100011000110001100011000111110", E: "11111100001000011110100001000011111", F: "11111100001000011110100001000010000",
  G: "01110100011000010111100011000101111", H: "10001100011000111111100011000110001", I: "01110001000010000100001000010001110",
  J: "00111000100001000010000101001001100", K: "10001100101010011000101001001010001", L: "10000100001000010000100001000011111",
  M: "10001110111010110101100011000110001", N: "10001100011100110101100111000110001", O: "01110100011000110001100011000101110",
  P: "11110100011000111110100001000010000", Q: "01110100011000110001101011001001101", R: "11110100011000111110101001001010001",
  S: "01111100001000001110000010000111110", T: "11111001000010000100001000010000100", U: "10001100011000110001100011000101110",
  V: "10001100011000110001100010101000100", W: "10001100011000110101101011010101010", X: "10001100010101000100010101000110001",
  Y: "10001100010101000100001000010000100", Z: "11111000010001000100010001000011111", "0": "01110100011001110101110011000101110",
  "1": "00100011000010000100001000010001110", "2": "01110100010000100010001000100011111", "3": "11111000100010000010000011000101110",
  "4": "00010001100101010010111110001000010", "5": "11111100001111000001000011000101110", "6": "00110010001000011110100011000101110",
  "7": "11111000010001000100010000100001000", "8": "01110100011000101110100011000101110", "9": "01110100011000101111000010001001100",
  "!": "00100001000010000100001000000000100", "?": "01110100010000100010001000000000100", " ": "0".repeat(35),
};
const MAX = 7;
const COLS = MAX * 6 - 1 + 4;
const ROWS = 11;
const DEFAULT_WORDS = ["HELLO", "BUILD", "SHIP IT", "NEXUS"];
const SEP = "\u0000";
const ALLOWED = new Set(Object.keys(F));
const ring =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

/** Upper-cases, drops accents, keeps only glyphs the dot font has, and caps the length. */
function sanitize(input: string): string {
  const plain = input.slice(0, 200).normalize("NFD").replace(/\p{M}/gu, "").toUpperCase();
  let out = "";
  for (const ch of plain) {
    if (!ALLOWED.has(ch)) continue;
    out += ch;
    if (out.length >= MAX) break;
  }
  return out;
}

function bitmap(word: string) {
  const w = sanitize(word);
  const out = new Uint8Array(COLS * ROWS);
  const width = w.length * 6 - 1;
  const x0 = Math.floor((COLS - width) / 2);
  const y0 = 2;
  [...w].forEach((ch, k) => {
    const g = F[ch] ?? F["?"];
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 5; c++) {
        const x = x0 + k * 6 + c;
        if (g[r * 5 + c] === "1" && x >= 0 && x < COLS) out[(y0 + r) * COLS + x] = 1;
      }
  });
  return out;
}

const subscribeVisibility = (cb: () => void) => {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
};
const usePageVisible = () =>
  useSyncExternalStore(subscribeVisibility, () => !document.hidden, () => true);

/**
 * A hero built around a flip-dot sign. The board clacks over to each new word in a ripple from left
 * to right, every dot spinning on its own axis with a small overshoot. Drag across the board to flip
 * dots by hand, or type your own word and watch it appear.
 */
export function FlipDotHero({ words = DEFAULT_WORDS, autoplay = false, className }: FlipDotHeroProps) {
  const root = useRef<HTMLElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const reduce = useReducedMotion();
  const inView = useInView(root, { amount: 0.2 });
  const visible = usePageVisible();

  const wordsKey = words.join(SEP);
  const list = useMemo(() => {
    const clean = wordsKey
      .split(SEP)
      .map(sanitize)
      .filter((w) => w.trim());
    return clean.length ? clean : DEFAULT_WORDS;
  }, [wordsKey]);

  const [idx, setIdx] = useState(0);
  const [custom, setCustom] = useState("");
  const [stopped, setStopped] = useState(false);
  const [brush, setBrush] = useState<Set<number>>(() => new Set());
  const [timers] = useState(() => new Map<number, number>());

  const run = autoplay && !reduce && !stopped && inView && visible && list.length > 1;
  useEffect(() => {
    if (!run) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % list.length), 2800);
    return () => window.clearInterval(id);
  }, [run, list.length]);
  useEffect(() => () => timers.forEach((t) => window.clearTimeout(t)), [timers]);

  const shown = custom.trim() ? custom : list[idx % list.length];

  // Only dots that change get a ripple delay, so the wave sweeps across the change.
  const [view, setView] = useState(() => ({ shown, bits: bitmap(shown), changed: new Uint8Array(COLS * ROWS) }));
  let cur = view;
  if (view.shown !== shown) {
    const bits = bitmap(shown);
    cur = { shown, bits, changed: bits.map((b, i) => (b !== view.bits[i] ? 1 : 0)) };
    setView(cur);
  }
  const { bits, changed } = cur;

  const flipAt = (e: ReactPointerEvent) => {
    if (e.type === "pointermove" && e.buttons === 0) return; // hand-flip only while pressed
    const el = board.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const c = Math.floor(((e.clientX - r.left) / r.width) * COLS);
    const rr = Math.floor(((e.clientY - r.top) / r.height) * ROWS);
    if (c < 0 || rr < 0 || c >= COLS || rr >= ROWS) return;
    const i = rr * COLS + c;
    if (brush.has(i)) return;
    setBrush((s) => new Set(s).add(i));
    const t = window.setTimeout(() => {
      setBrush((s) => {
        const n = new Set(s);
        n.delete(i);
        return n;
      });
      timers.delete(i);
    }, 1400);
    timers.set(i, t);
  };

  return (
    <section
      ref={root}
      aria-label="Flip-dot sign"
      className={cn(
        "flex w-full flex-col items-center bg-white px-5 py-14 text-center dark:bg-black sm:px-10",
        className,
      )}
      onPointerDownCapture={() => setStopped(true)}
      onKeyDownCapture={() => setStopped(true)}
    >
      <span className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#86868b] dark:text-[#a1a1a6]">
        Platform 4 · Departing now
      </span>
      <div className="mt-6 w-full max-w-[760px] rounded-[22px] bg-[#111113] p-3 shadow-[0_1px_0_rgba(255,255,255,.08)_inset,0_30px_60px_-30px_rgba(0,0,0,.6)] dark:bg-[#131315] dark:shadow-[0_0_0_1px_#2c2c2e,0_30px_60px_-30px_rgba(0,0,0,.9)] sm:p-5">
        <div
          ref={board}
          className="grid w-full cursor-crosshair touch-none select-none gap-[2px] sm:gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          onPointerDown={flipAt}
          onPointerMove={flipAt}
          role="img"
          aria-label={`Flip-dot sign showing ${shown}`}
        >
          {Array.from(bits, (b, i) => {
            const on = (b ^ (brush.has(i) ? 1 : 0)) === 1;
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            const delay = changed[i] ? col * 16 + row * 9 : 0;
            return (
              <span key={i} className="relative aspect-square [perspective:80px]">
                <span
                  className="absolute inset-0 [transform-style:preserve-3d]"
                  style={{
                    transform: `rotateY(${on ? 180 : 0}deg)`,
                    transition: reduce ? "none" : `transform 380ms cubic-bezier(.3,1.5,.5,1) ${delay}ms`,
                  }}
                >
                  <span className="absolute inset-[6%] rounded-full bg-[#232326] shadow-[inset_0_-1px_1px_rgba(255,255,255,.05)] [backface-visibility:hidden]" />
                  <span
                    className="absolute inset-[6%] rounded-full [backface-visibility:hidden] [transform:rotateY(180deg)]"
                    style={{
                      background: "radial-gradient(circle at 35% 30%, #fff6b0, #ffd60a 55%, #e0a800)",
                      boxShadow: "0 0 6px rgba(255,214,10,.35)",
                    }}
                  />
                </span>
              </span>
            );
          })}
        </div>
      </div>
      <motion.h1
        initial={reduce ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="m-0 mt-10 text-[clamp(34px,6vw,56px)] font-semibold leading-[1.05] tracking-[-0.035em] text-[#1d1d1f] dark:text-[#f5f5f7]"
      >
        Headlines with a little clack.
      </motion.h1>
      <p className="mx-auto mt-4 max-w-[480px] text-[17px] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6]">
        Drag across the board to flip dots by hand, or make it say something.
      </p>
      <label className="mt-7 flex w-full max-w-[360px] items-center gap-2 rounded-full bg-[#f5f5f7] p-1.5 pl-5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#0071e3] dark:bg-[#1c1c1e] dark:focus-within:outline-[#0a84ff]">
        <span className="sr-only">Your word</span>
        <input
          value={custom}
          onChange={(e) => setCustom(sanitize(e.target.value))}
          placeholder="Your word"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-describedby={hintId}
          className="min-w-0 flex-1 bg-transparent font-mono text-[15px] uppercase tracking-[0.12em] text-[#1d1d1f] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[#86868b] dark:text-[#f5f5f7] dark:placeholder:text-[#a1a1a6]"
        />
        <button
          type="button"
          onClick={() => setCustom("")}
          className={cn(
            "h-9 rounded-full bg-[#1d1d1f] px-4 text-[13px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]",
            ring,
          )}
        >
          Reset
        </button>
      </label>
      <span id={hintId} className="sr-only">
        Up to {MAX} characters: letters, numbers, spaces, exclamation and question marks.
      </span>
    </section>
  );
}
