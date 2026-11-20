# Context Meter

Add the "Context Meter" component from Nexus UI to my project.

A context-window token meter drawn as a 40 by 5 dot grid. Hover a category to light only its dots; the conversation keeps growing, and Compact chat drops its dots out of the grid while everything after them reflows to close the gap. Also includes Context Gauge, how full an AI model's context window is, drawn as a hundred fine ticks that rise as you add files and slide together when you compact.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { DEFAULT_CONTEXT_CATEGORIES, ContextMeter } from "@/components/context-meter/context-meter";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/context-meter/context-meter.tsx ---

```tsx
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface ContextCategory {
  id: string;
  label: string;
  /** Dot and swatch colour (any CSS colour, including var()). */
  color: string;
  /** Size in thousands of tokens. */
  tokens: number;
}

export interface ContextMeterProps {
  /** Starting categories, in grid order. */
  categories?: ContextCategory[];
  /** Window size in thousands of tokens. The grid always has 200 dots. */
  limit?: number;
  /** Id of the category that keeps growing and is cleared by "Compact chat". */
  growId?: string;
  /** Cycles the highlight and compacts when nearly full, until someone touches the card. */
  autoplay?: boolean;
}

export const DEFAULT_CONTEXT_CATEGORIES: ContextCategory[] = [
  // `--cm-ink` is near-black in light mode and near-white in dark mode.
  { id: "sys", label: "System prompt", color: "var(--cm-ink)", tokens: 4.2 },
  { id: "tools", label: "Tools", color: "#5e5ce6", tokens: 12.8 },
  { id: "files", label: "Files", color: "#ff9f0a", tokens: 46.1 },
  { id: "conv", label: "Conversation", color: "#0071e3", tokens: 38.4 },
  { id: "mem", label: "Memory", color: "#30d158", tokens: 3.9 },
];

const COLS = 40;
const ROWS = 5;
const COMPACT_TO = 6.2;

/**
 * A context-window meter drawn as a dot grid. Hover a category to light only its dots. The
 * conversation keeps growing; press Compact and its dots drop out of the grid and everything
 * after them closes the gap.
 */
export function ContextMeter({ categories = DEFAULT_CONTEXT_CATEGORIES, limit = 200, growId = "conv", autoplay = false }: ContextMeterProps) {
  const [cats, setCats] = useState(categories);
  const [hover, setHover] = useState<string | null>(null);
  const [dropping, setDropping] = useState(false);
  const touched = useRef(false);
  const droppingRef = useRef(false);
  const totalRef = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const per = limit / (COLS * ROWS); // K per dot
  const total = cats.reduce((a, c) => a + c.tokens, 0);

  useEffect(() => {
    totalRef.current = total;
  }, [total]);

  const dots = useMemo(() => {
    const out: { cat: ContextCategory; k: string }[] = [];
    cats.forEach((c) => {
      const n = Math.round(c.tokens / per);
      for (let i = 0; i < n; i++) out.push({ cat: c, k: `${c.id}-${i}` });
    });
    return out.slice(0, COLS * ROWS);
  }, [cats, per]);

  // The conversation keeps growing until the window is nearly full.
  useEffect(() => {
    const t = setInterval(() => {
      if (dropping) return;
      setCats((cs) => {
        const sum = cs.reduce((a, x) => a + x.tokens, 0);
        return sum < limit - 8 ? cs.map((c) => (c.id === growId ? { ...c, tokens: c.tokens + 2.2 } : c)) : cs;
      });
    }, 380);
    return () => clearInterval(t);
  }, [dropping, limit, growId]);

  const compact = useCallback(() => {
    if (droppingRef.current) return;
    droppingRef.current = true;
    setDropping(true);
    timer.current = setTimeout(() => {
      setCats((cs) => cs.map((c) => (c.id === growId ? { ...c, tokens: COMPACT_TO } : c)));
      droppingRef.current = false;
      setDropping(false);
    }, 650);
  }, [growId]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      if (!touched.current && totalRef.current > limit * 0.9) compact();
    }, 1000);
    const order: (string | null)[] = [null, "files", "tools", growId];
    const h = setInterval(() => {
      if (touched.current) return;
      setHover((p) => order[(order.indexOf(p) + 1) % order.length]);
    }, 1700);
    return () => { clearInterval(t); clearInterval(h); };
  }, [autoplay, compact, limit, growId]);

  const touch = () => {
    if (touched.current) return;
    touched.current = true;
    if (autoplay) setHover(null);
  };

  const pct = Math.round((total / limit) * 100);
  const pctClass = pct > 85 ? "text-[#d70015] dark:text-[#ff453a]" : pct > 70 ? "text-[#b25000] dark:text-[#ff9f0a]" : "text-[#86868b] dark:text-[#98989d]";

  return (
    <div
      className="w-[400px] max-w-full rounded-[22px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] [--cm-empty:#e8e8ed] [--cm-ink:#1d1d1f] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)] dark:[--cm-empty:#3a3a3c] dark:[--cm-ink:#f5f5f7]"
      onPointerDown={touch}
      onPointerEnter={touch}
    >
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Context window</span>
        <span className={`text-[12px] font-semibold tabular-nums ${pctClass}`}>{pct}%</span>
      </div>
      <div className="mb-3 flex items-baseline gap-1">
        <span className="text-[28px] font-semibold tabular-nums tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">{total.toFixed(1)}K</span>
        <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">of {limit}K tokens</span>
      </div>
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        role="meter"
        aria-label="Context window"
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={Math.round(total * 10) / 10}
        aria-valuetext={`${total.toFixed(1)}K of ${limit}K tokens`}
      >
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const d = dots[i];
          const dim = hover && d && d.cat.id !== hover;
          const falling = dropping && d?.cat.id === growId;
          return (
            <motion.span
              key={d ? d.k : `e${i}`}
              layout="position"
              className="aspect-square rounded-full transition-[background-color] duration-300"
              style={{ backgroundColor: d ? d.cat.color : "var(--cm-empty)" }}
              initial={d ? { scale: 0 } : false}
              animate={
                falling
                  ? { y: 26 + (i % 7) * 3, opacity: 0, scale: 0.4, transition: { duration: 0.5, delay: (i % COLS) * 0.008, ease: "easeIn" } }
                  : { scale: 1, y: 0, opacity: d && dim ? 0.18 : 1 }
              }
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          );
        })}
      </div>
      <ul className="mt-4 flex list-none flex-col gap-0.5 p-0">
        {cats.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onPointerEnter={() => setHover(c.id)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => {
                touch();
                setHover(c.id);
              }}
              onBlur={() => setHover(null)}
              className="flex h-8 w-full items-center gap-2.5 rounded-lg px-2 text-left text-[13px] text-[#1d1d1f] hover:bg-[#f5f5f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3] dark:text-[#f5f5f7] dark:hover:bg-[#2c2c2e] dark:focus-visible:outline-[#0a84ff]"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
              <span className="flex-1">{c.label}</span>
              <span className="relative h-4 overflow-hidden tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={c.tokens.toFixed(1)} className="block" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}>
                    {c.tokens.toFixed(1)}K
                  </motion.span>
                </AnimatePresence>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-[#f0f0f3] pt-3 dark:border-[#3a3a3c]">
        <span className="text-[12px] text-[#86868b] dark:text-[#98989d]">{(limit - total).toFixed(1)}K left</span>
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => {
            touched.current = true;
            compact();
          }}
          className="h-8 rounded-full bg-[#1d1d1f] px-3.5 text-[12px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:outline-[#0a84ff]"
        >
          Compact chat
        </motion.button>
      </div>
    </div>
  );
}
```

# Context Gauge

Add the "Context Gauge" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { ContextGauge } from "@/components/context-meter/context-gauge";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/context-meter/context-gauge.tsx ---

```tsx
"use client";

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type ContextKind = "system" | "tools" | "file" | "message" | "result" | "summary";
export type ContextItem = {
  id: string;
  kind: ContextKind;
  label: string;
  tokens: number;
};
export type ContextGaugeProps = {
  /** the model's context window, in tokens */
  limit?: number;
  items?: ContextItem[];
  /** how much of the compacted history the summary keeps, 0 to 1 */
  keep?: number;
  onChange?: (items: ContextItem[]) => void;
  onCompact?: (summary: ContextItem, removed: ContextItem[]) => void;
  /** Soft synthesised sounds as you use it. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

// ───────────── sound: small synthesised notes, no audio files. The browser keeps it silent until the visitor has
// clicked or pressed a key somewhere on the page, so autoplay only makes sound once someone is using the page. ─────────────

type Engine = { ctx: AudioContext; noise: AudioBuffer };
const ENGINE_KEY = "__uiSoundEngine";
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = {
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  glide?: number;
  bell?: number;
};
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (from: number, to: number, o?: { at?: number; dur?: number; gain?: number }) => void;
  /** a tiny dry click */
  tick: (o?: { at?: number; freq?: number; gain?: number }) => void;
};

function useSound(enabled: boolean, volume: number, allow: () => boolean = () => true): Sound {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [enabled]);
  const on = useRef(enabled);
  const vol = useRef(Math.max(0, Math.min(1, volume)));
  const allowRef = useRef(allow);
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
    allowRef.current = allow;
  });
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running" ? e : null;
    };
    const env = (ctx: AudioContext, t: number, peak: number, attack: number, dur: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      return g;
    };
    return {
      note(freq, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = o.dur ?? 0.3;
        const peak = (o.gain ?? 0.14) * vol.current;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 7000;
        lp.connect(ctx.destination);
        const g = env(ctx, t, peak, 0.006, dur);
        g.connect(lp);
        const a = ctx.createOscillator();
        a.type = o.type ?? "sine";
        a.frequency.setValueAtTime(freq, t);
        if (o.glide) a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide) b.frequency.exponentialRampToValueAtTime(o.glide * 2.76, t + dur * 0.6);
          b.connect(g2);
          b.start(t);
          b.stop(t + dur * 0.4 + 0.05);
        }
      },
      whoosh(from, to, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = Math.min(0.95, o.dur ?? 0.4);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = ctx.createGain();
        const peak = (o.gain ?? 0.08) * vol.current;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.3);
        src.stop(t + dur + 0.05);
      },
      tick(o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.005 + (o.at ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = o.freq ?? 3200;
        bp.Q.value = 4;
        const g = env(ctx, t, (o.gain ?? 0.09) * vol.current, 0.001, 0.03);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.5);
        src.stop(t + 0.05);
      },
    } satisfies Sound;
  }, []);
}

const I = {
  spark:
    "M208 144a15.78 15.78 0 0 1-10.42 14.94L146 178l-19 51.62a15.92 15.92 0 0 1-29.88 0L78 178l-51.62-19a15.92 15.92 0 0 1 0-29.88L78 110l19-51.62a15.92 15.92 0 0 1 29.88 0L146 110l51.62 19A15.78 15.78 0 0 1 208 144m-56-96h16v16a8 8 0 0 0 16 0V48h16a8 8 0 0 0 0-16h-16V16a8 8 0 0 0-16 0v16h-16a8 8 0 0 0 0 16m88 32h-8v-8a8 8 0 0 0-16 0v8h-8a8 8 0 0 0 0 16h8v8a8 8 0 0 0 16 0v-8h8a8 8 0 0 0 0-16",
  file: "m213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66M160 176H96a8 8 0 0 1 0-16h64a8 8 0 0 1 0 16m0-32H96a8 8 0 0 1 0-16h64a8 8 0 0 1 0 16m-8-56V44l44 44Z",
  chat: "M232 128a104 104 0 0 1-152.88 91.82l-34.05 11.35a16 16 0 0 1-20.24-20.24l11.35-34.05A104 104 0 1 1 232 128",
  tool: "M232 96a72 72 0 0 1-100.94 66L79 222.22c-.12.14-.26.29-.39.42a32 32 0 0 1-45.26-45.26c.14-.13.28-.27.43-.39L94 124.94a72.07 72.07 0 0 1 83.54-98.78a8 8 0 0 1 3.93 13.19L144 80l5.66 26.35L176 112l40.65-37.52a8 8 0 0 1 13.19 3.93A72.6 72.6 0 0 1 232 96",
  compact:
    "M216.49 56.48L177 96h19a12 12 0 0 1 0 24h-48a12 12 0 0 1-12-12V60a12 12 0 0 1 24 0v19l39.51-39.52a12 12 0 0 1 17 17ZM108 136H60a12 12 0 0 0 0 24h19l-39.49 39.51a12 12 0 0 0 17 17L96 177v19a12 12 0 0 0 24 0v-48a12 12 0 0 0-12-12",
  gear: "M237.94 107.21a8 8 0 0 0-3.89-5.4l-29.83-17l-.12-33.62a8 8 0 0 0-2.83-6.08a111.9 111.9 0 0 0-36.72-20.67a8 8 0 0 0-6.46.59L128 41.85L97.88 25a8 8 0 0 0-6.47-.6a111.9 111.9 0 0 0-36.68 20.75a8 8 0 0 0-2.83 6.07l-.15 33.65l-29.83 17a8 8 0 0 0-3.89 5.4a106.5 106.5 0 0 0 0 41.56a8 8 0 0 0 3.89 5.4l29.83 17l.12 33.63a8 8 0 0 0 2.83 6.08a111.9 111.9 0 0 0 36.72 20.67a8 8 0 0 0 6.46-.59L128 214.15L158.12 231a7.9 7.9 0 0 0 3.9 1a8.1 8.1 0 0 0 2.57-.42a112.1 112.1 0 0 0 36.68-20.73a8 8 0 0 0 2.83-6.07l.15-33.65l29.83-17a8 8 0 0 0 3.89-5.4a106.5 106.5 0 0 0-.03-41.52M128 168a40 40 0 1 1 40-40a40 40 0 0 1-40 40",
  terminal:
    "M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-91 94.25l-40 32a8 8 0 1 1-10-12.5L107.19 128L75 102.25a8 8 0 1 1 10-12.5l40 32a8 8 0 0 1 0 12.5M176 168h-40a8 8 0 0 1 0-16h40a8 8 0 0 1 0 16",
  cube: "m223.68 66.15l-88-48.15a15.88 15.88 0 0 0-15.36 0l-88 48.17a16 16 0 0 0-8.32 14v95.64a16 16 0 0 0 8.32 14l88 48.17a15.88 15.88 0 0 0 15.36 0l88-48.17a16 16 0 0 0 8.32-14V80.18a16 16 0 0 0-8.32-14.03M128 120L47.65 76L128 32l80.35 44Zm8 99.64v-85.81l80-43.78v85.76Z",
};
const Ico = ({ d, size, style }: { d: string; size: number; style?: CSSProperties }) => (
  <svg
    viewBox="0 0 256 256"
    width={size}
    height={size}
    style={{ display: "block", flex: "none", ...style }}
    aria-hidden="true"
  >
    <path fill="currentColor" d={d} />
  </svg>
);

const KINDS: Record<ContextKind, { label: string; color: string; icon: string; order: number }> = {
  system: { label: "System prompt", color: "#8e8e93", icon: I.gear, order: 0 },
  tools: {
    label: "Tool definitions",
    color: "#bf5af2",
    icon: I.cube,
    order: 1,
  },
  summary: { label: "Summary", color: "#32ade6", icon: I.compact, order: 4 },
  file: { label: "Files", color: "#0a84ff", icon: I.file, order: 3 },
  message: { label: "Messages", color: "#30d158", icon: I.chat, order: 5 },
  result: {
    label: "Tool results",
    color: "#ff9f0a",
    icon: I.terminal,
    order: 6,
  },
};
const DEFAULT_ITEMS: ContextItem[] = [
  { id: "s", kind: "system", label: "System prompt", tokens: 3200 },
  { id: "t", kind: "tools", label: "12 tools", tokens: 11800 },
  { id: "f1", kind: "file", label: "pricing-page.tsx", tokens: 17400 },
  { id: "f2", kind: "file", label: "design-tokens.json", tokens: 6100 },
  {
    id: "m1",
    kind: "message",
    label: "Tighten the pricing hero",
    tokens: 2600,
  },
  {
    id: "r1",
    kind: "result",
    label: "Search: pricing patterns",
    tokens: 14200,
  },
  { id: "m2", kind: "message", label: "Draft three headlines", tokens: 7900 },
  {
    id: "m3",
    kind: "message",
    label: "Make the second one shorter",
    tokens: 4300,
  },
  { id: "r2", kind: "result", label: "Ran the build", tokens: 9600 },
  {
    id: "m4",
    kind: "message",
    label: "Now the comparison table",
    tokens: 8800,
  },
];
const ADDS: { kind: ContextKind; label: string; tokens: number }[] = [
  { kind: "file", label: "checkout-flow.tsx", tokens: 15800 },
  { kind: "message", label: "Match the table to the hero", tokens: 6200 },
  { kind: "result", label: "Ran the tests", tokens: 18400 },
  { kind: "message", label: "Add a yearly toggle", tokens: 5400 },
  { kind: "file", label: "faq.md", tokens: 9300 },
  { kind: "result", label: "Read the analytics", tokens: 16600 },
];

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}K` : String(Math.round(n)));
let uid = 0;

function Roll({ text, reduce, style }: { text: string; reduce: boolean; style?: CSSProperties }) {
  const chars = [...text];
  return (
    <span
      aria-label={text}
      style={{
        display: "inline-flex",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        const key = chars.length - i;
        if (!/\d/.test(ch))
          return (
            <span key={`s${key}${ch}`} aria-hidden="true">
              {ch}
            </span>
          );
        return (
          <span
            key={`d${key}`}
            aria-hidden="true"
            style={{
              position: "relative",
              display: "inline-block",
              height: "1.1em",
              overflow: "hidden",
              lineHeight: 1.1,
            }}
          >
            <motion.span
              initial={false}
              animate={{ y: `${-Number(ch) * 10}%` }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 200,
                      damping: 21,
                      mass: 0.6 + (key % 3) * 0.15,
                    }
              }
              style={{ display: "flex", flexDirection: "column" }}
            >
              {"0123456789".split("").map((d) => (
                <span key={d} style={{ height: "1.1em" }}>
                  {d}
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

const TICKS = 100;
const MH = 58;
const hexRGB = (h: string) => {
  const v = parseInt(h.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};
type Sp = { x: number; v: number };
const spring = (s: Sp, to: number, k: number, d: number, dt: number) => {
  s.v += ((to - s.x) * k - s.v * d) * dt;
  s.x += s.v * dt;
};
/** one tick of the meter: belongs to an item, glides to its slot, rises and fades on springs */
type Tick = {
  item: string;
  k: number;
  x: Sp;
  h: Sp;
  a: Sp;
  tx: number;
  th: number;
  ta: number;
  rgb: number[];
  to: number[];
  start: number;
  dead?: number;
};

/**
 * How full an AI model's context window is, drawn as a hundred fine ticks, each one a hundredth of the window and
 * coloured by what fills it: system prompt, tools, files, messages, tool results. Add something and its ticks rise
 * one after another from left to right, everything after them gliding along to make room, while the percentage rolls
 * up. As it fills, the room that's left warms to amber and then red. Compact gathers the old turns: their ticks slide
 * together into a few, turn the colour of the summary and the extras sink away, the newer messages glide back after
 * them and the count rolls down. Point at the meter, or at a row, to see what each part is.
 */
export default function ContextGauge({
  limit = 200000,
  items: items0 = DEFAULT_ITEMS,
  keep = 0.16,
  onChange,
  onCompact,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: ContextGaugeProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [items, setItems] = useState(items0);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [hot, setHot] = useState<{ id?: string; kind?: ContextKind } | null>(null);
  const hotRef = useRef(hot);
  hotRef.current = hot;
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);
  const meter = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const addN = useRef(0);
  const ticks = useRef<Tick[]>([]);
  const shake = useRef<Sp>({ x: 0, v: 0 });
  // when a compaction happens, which items fold into which summary
  const folding = useRef<{ from: Set<string>; into: string } | null>(null);

  const sorted = useMemo(() => [...items].sort((a, b) => KINDS[a.kind].order - KINDS[b.kind].order), [items]);
  const used = items.reduce((a, b) => a + b.tokens, 0);
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const level = pct >= 95 ? 2 : pct >= 80 ? 1 : 0;
  const levelColor = ["#1d1d1f", "#ff9f0a", "#ff3b30"][level];
  const levelRef = useRef(level);
  levelRef.current = level;
  const groups = useMemo(() => {
    const m = new Map<ContextKind, { n: number; tokens: number }>();
    for (const it of sorted) {
      const g = m.get(it.kind) ?? { n: 0, tokens: 0 };
      g.n++;
      g.tokens += it.tokens;
      m.set(it.kind, g);
    }
    return [...m.entries()];
  }, [sorted]);
  // what Compact folds away: every message and tool result but the last two messages, and older summaries
  const compactable = useMemo(() => {
    const msgs = items.filter((i) => i.kind === "message");
    const keepIds = new Set(msgs.slice(-2).map((m) => m.id));
    return items.filter(
      (i) => (i.kind === "message" || i.kind === "result" || i.kind === "summary") && !keepIds.has(i.id),
    );
  }, [items]);

  // lay the ticks out whenever the contents change
  useEffect(() => {
    const now = performance.now();
    const per = limit / TICKS;
    const byKey = new Map<string, Tick>();
    for (const t of ticks.current) if (!t.dead) byKey.set(`${t.item}:${t.k}`, t);
    const next: Tick[] = [];
    const fold = folding.current;
    folding.current = null;
    // ticks of folded items, left to right, become the summary's ticks or sink away
    const folded = fold
      ? ticks.current.filter((t) => !t.dead && fold.from.has(t.item)).sort((a, b) => a.x.x - b.x.x)
      : [];
    for (const t of folded) byKey.delete(`${t.item}:${t.k}`);
    let slot = 0;
    let fresh = 0;
    for (const it of sorted) {
      const n = Math.max(1, Math.round(it.tokens / per));
      const rgb = hexRGB(KINDS[it.kind].color);
      for (let k = 0; k < n && slot < TICKS; k++, slot++) {
        let t = byKey.get(`${it.id}:${k}`);
        if (t) byKey.delete(`${it.id}:${k}`);
        else if (fold && it.id === fold.into && folded.length) {
          // reuse a folded tick, spread evenly through the old turns, so the summary is made of them
          t = folded.shift()!;
          t.item = it.id;
          t.k = k;
          t.start = now + 60 + k * 22;
        } else {
          t = {
            item: it.id,
            k,
            x: { x: slot, v: 0 },
            h: { x: 0, v: 0 },
            a: { x: 1, v: 0 },
            tx: slot,
            th: 1,
            ta: 1,
            rgb: [...rgb],
            to: rgb,
            start: now + 140 + fresh * 26,
          };
          fresh++;
        }
        t.tx = slot;
        t.th = 1;
        t.ta = 1;
        t.to = rgb;
        next.push(t);
      }
    }
    // folded ticks that weren't reused gather into the summary and sink
    const into = fold ? next.filter((t) => t.item === fold.into) : [];
    const lo = into.length ? Math.min(...into.map((t) => t.tx)) : 0;
    const hi = into.length ? Math.max(...into.map((t) => t.tx)) : 0;
    folded.forEach((t, j) => {
      t.tx = lo + ((hi - lo) * j) / Math.max(1, folded.length - 1);
      t.to = hexRGB(KINDS.summary.color);
      t.th = 0;
      t.ta = 0;
      t.dead = now + 900;
      t.start = now + j * 4;
      next.push(t);
    });
    // anything else that went away just sinks
    byKey.forEach((t) => {
      t.th = 0;
      t.ta = 0;
      t.dead = now + 700;
      next.push(t);
    });
    ticks.current = next;
  }, [sorted, limit]);

  // draw
  useEffect(() => {
    const c = cv.current;
    const host = meter.current;
    if (!c || !host) return;
    const g = c.getContext("2d");
    if (!g) return;
    let raf = 0;
    let last = performance.now();
    let vis = true;
    const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting));
    io.observe(host);
    const grey = [229, 229, 234];
    const warm = [
      [229, 229, 234],
      [255, 214, 153],
      [255, 176, 170],
    ];
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!vis) return;
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      const dpr = Math.min(2, devicePixelRatio || 1);
      const w = host.clientWidth;
      if (c.width !== Math.round(w * dpr)) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(MH * dpr);
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, MH);
      spring(shake.current, 0, 900, 14, dt);
      const pitch = w / TICKS;
      const bw = Math.max(1.2, pitch * 0.56);
      const cy = MH / 2;
      const T = ticks.current;
      const filled = T.filter((t) => !t.dead).length;
      const lvl = levelRef.current;
      // the empty slots, warming as the room runs out
      for (let i = 0; i < TICKS; i++) {
        if (i < filled) continue;
        const col = lvl ? warm[lvl] : grey;
        const hh = MH * 0.3;
        g.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
        g.beginPath();
        g.roundRect(i * pitch + (pitch - bw) / 2 + shake.current.x, cy - hh / 2, bw, hh, bw / 2);
        g.fill();
      }
      const H = hotRef.current;
      const kinds = new Map(itemsRef.current.map((it) => [it.id, it.kind]));
      ticks.current = T.filter((t) => !t.dead || now < t.dead);
      for (const t of ticks.current) {
        const go = reduce || now >= t.start;
        if (reduce) {
          t.x.x = t.tx;
          t.h.x = t.th;
          t.a.x = t.ta;
          t.rgb = [...t.to];
        } else {
          spring(t.x, t.tx, 170, 20, dt);
          if (go) {
            spring(t.h, t.th, 380, t.th > 0.5 ? 13 : 26, dt);
            spring(t.a, t.ta, 200, 26, dt);
          }
          const f = Math.min(1, dt * 7);
          for (let q = 0; q < 3; q++) t.rgb[q] += (t.to[q] - t.rgb[q]) * f;
        }
        const kind = kinds.get(t.item);
        const lit = !H || (H.id ? H.id === t.item : H.kind === kind);
        const hh = Math.max(0, MH * 0.86 * t.h.x * (H && lit && !t.dead ? 1.08 : 1));
        if (hh < 0.5) continue;
        g.globalAlpha = Math.max(0, Math.min(1, t.a.x)) * (lit ? 1 : 0.28);
        g.fillStyle = `rgb(${t.rgb[0] | 0},${t.rgb[1] | 0},${t.rgb[2] | 0})`;
        g.beginPath();
        g.roundRect(t.x.x * pitch + (pitch - bw) / 2 + shake.current.x, cy - hh / 2, bw, hh, bw / 2);
        g.fill();
      }
      g.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [reduce]);

  const commit = (n: ContextItem[]) => {
    setItems(n);
    onChange?.(n);
  };
  const add = (a?: (typeof ADDS)[number]) => {
    const pick = a ?? ADDS[addN.current++ % ADDS.length];
    const room = limit - itemsRef.current.reduce((x, y) => x + y.tokens, 0);
    if (room < limit / TICKS) {
      shake.current.v += 260;
      sfx.note(196, { dur: 0.25, gain: 0.05, type: "triangle" });
      return;
    }
    const it: ContextItem = {
      id: `n${Date.now().toString(36)}${uid++}`,
      kind: pick.kind,
      label: pick.label,
      tokens: Math.min(room, pick.tokens),
    };
    const before = (itemsRef.current.reduce((x, y) => x + y.tokens, 0) / limit) * 100;
    commit([...itemsRef.current, it]);
    // one soft tick per rising bar, a little higher each time
    const n = Math.max(1, Math.round(it.tokens / (limit / TICKS)));
    for (let k = 0; k < Math.min(n, 10); k++) sfx.tick({ at: 0.14 + k * 0.026, freq: 2200 + k * 160, gain: 0.02 });
    const pitch = {
      system: 392,
      tools: 440,
      summary: 494,
      file: 523,
      message: 659,
      result: 587,
    }[pick.kind];
    sfx.note(pitch, { at: 0.12, dur: 0.3, gain: 0.04, bell: 0.4 });
    const after = before + (it.tokens / limit) * 100;
    if ((before < 80 && after >= 80) || (before < 95 && after >= 95)) {
      sfx.note(880, { at: 0.45, dur: 0.18, gain: 0.035 });
      sfx.note(698, { at: 0.6, dur: 0.3, gain: 0.035 });
    }
  };
  const compact = () => {
    const take = compactable;
    if (take.length < 2) return;
    const ids = new Set(take.map((t) => t.id));
    const total = take.reduce((a, b) => a + b.tokens, 0);
    const summary: ContextItem = {
      id: `sum${Date.now().toString(36)}`,
      kind: "summary",
      label: `Summary of ${take.length} earlier turns`,
      tokens: Math.max(limit / TICKS, Math.round(total * keep)),
    };
    folding.current = { from: ids, into: summary.id };
    commit([...itemsRef.current.filter((i) => !ids.has(i.id)), summary]);
    onCompact?.(summary, take);
    sfx.whoosh(2600, 500, { dur: 0.6, gain: 0.045 });
    [784, 659, 523, 392].forEach((f, k) => sfx.note(f, { at: 0.12 + k * 0.07, dur: 0.28, gain: 0.032, bell: 0.5 }));
  };

  // autoplay: fill it up, look at what's taking the room, compact
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  const [ghostDown, setGhostDown] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const go = async (sel: string, ms = 600) => {
      const c = card.current;
      const e = c?.querySelector(sel);
      if (!c || !e) return;
      const r = e.getBoundingClientRect();
      const cb = c.getBoundingClientRect();
      setGhost(true);
      await Promise.all([
        animate(gx, r.left - cb.left + r.width / 2, {
          duration: ms / 1000,
          ease: [0.4, 0, 0.2, 1],
        }),
        animate(gy, r.top - cb.top + r.height / 2, {
          duration: ms / 1000,
          ease: [0.4, 0, 0.2, 1],
        }),
      ]);
    };
    const tap = async () => {
      setGhostDown(true);
      await wait(110);
      setGhostDown(false);
    };
    const run = async () => {
      await wait(1300);
      while (ok()) {
        for (let k = 0; k < 10 && ok(); k++) {
          const a = ADDS[addN.current % ADDS.length];
          await go(`[data-add="${a.kind}"]`, 450);
          await tap();
          add(ADDS[addN.current++ % ADDS.length]);
          await wait(1100);
          if (itemsRef.current.reduce((x, y) => x + y.tokens, 0) / limit > 0.9) break;
        }
        if (!ok()) return;
        await go("[data-hover-row]", 500);
        setHot({ kind: "result" });
        await wait(1100);
        setHot({ kind: "message" });
        await wait(900);
        setHot(null);
        await go("[data-compact]");
        await wait(250);
        await tap();
        compact();
        await wait(2600);
        if (!ok()) return;
        setGhost(false);
        await wait(1500);
        if (itemsRef.current.filter((i) => i.kind === "summary").length > 1) {
          commit(items0);
          await wait(900);
        }
      }
    };
    run().catch((err) => {
      // torn down mid-step (the tile scrolled away): its elements are gone, so there is nothing to report
      if (alive) throw err;
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  // which item the pointer is over on the meter
  const pointAt = (clientX: number) => {
    const m = meter.current;
    if (!m) return;
    const r = m.getBoundingClientRect();
    const i = Math.floor(((clientX - r.left) / r.width) * TICKS);
    const t = ticks.current.find((x) => !x.dead && Math.round(x.tx) === i);
    const next = t ? { id: t.item } : null;
    if (next?.id !== hotRef.current?.id) {
      setHot(next);
      if (next) sfx.tick({ freq: 3000, gain: 0.012 });
    }
  };
  const hotItem = hot?.id ? items.find((i) => i.id === hot.id) : null;
  const hotX = hotItem
    ? (() => {
        const xs = ticks.current.filter((t) => !t.dead && t.item === hotItem.id).map((t) => t.tx);
        return xs.length ? (Math.min(...xs) + Math.max(...xs) + 1) / 2 / TICKS : 0.5;
      })()
    : 0.5;

  return (
    <div
      className={`relative w-full max-w-[420px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#1d1d1f",
      }}
    >
      <div
        ref={card}
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        style={{
          position: "relative",
          borderRadius: 30,
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 30px 60px -34px rgba(0,0,0,0.35)",
          padding: "20px 22px 18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#86868b" }}>Context window</div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#6e6e73",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {fmt(limit)} tokens
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            margin: "6px 0 16px",
          }}
          aria-live="polite"
        >
          <Roll
            text={`${pct}%`}
            reduce={reduce}
            style={{
              fontSize: 46,
              fontWeight: 700,
              letterSpacing: "-0.045em",
              color: levelColor,
              transition: "color 0.5s",
            }}
          />
          <span
            style={{
              fontSize: 13.5,
              color: "#86868b",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {fmt(used)} used
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 13,
              fontWeight: 600,
              color: level ? levelColor : "#86868b",
              transition: "color 0.5s",
            }}
          >
            {level === 2 ? "Almost full" : level === 1 ? "Getting full" : `${fmt(Math.max(0, limit - used))} free`}
          </span>
        </div>

        {/* the meter */}
        <div style={{ position: "relative" }}>
          <div
            ref={meter}
            role="meter"
            aria-label="Context used"
            aria-valuemin={0}
            aria-valuemax={limit}
            aria-valuenow={used}
            aria-valuetext={`${pct}% used`}
            onPointerMove={(e) => pointAt(e.clientX)}
            onPointerLeave={() => setHot(null)}
            style={{ position: "relative", height: MH, cursor: "default" }}
          >
            <canvas
              ref={cv}
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: MH,
              }}
            />
          </div>
          {/* a hairline scale under it */}
          <div
            aria-hidden="true"
            style={{
              position: "relative",
              height: 16,
              marginTop: 4,
              fontSize: 10.5,
              color: "#a1a1a6",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {[0, 0.5, 0.8, 1].map((f) => (
              <span
                key={f}
                style={{
                  position: "absolute",
                  left: `${f * 100}%`,
                  transform: `translateX(${f === 0 ? 0 : f === 1 ? -100 : -50}%)`,
                  color: f === 0.8 && level ? levelColor : undefined,
                }}
              >
                {f === 0 ? "0" : fmt(limit * f)}
              </span>
            ))}
          </div>
          <AnimatePresence>
            {hotItem && (
              <motion.div
                key="tip"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 3, transition: { duration: 0.1 } }}
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
                style={{
                  position: "absolute",
                  bottom: MH + 26,
                  left: `${Math.max(18, Math.min(82, hotX * 100))}%`,
                  x: "-50%",
                  padding: "6px 10px",
                  borderRadius: 10,
                  background: "#1d1d1f",
                  color: "#fff",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  zIndex: 3,
                  boxShadow: "0 8px 18px -8px rgba(0,0,0,0.5)",
                }}
              >
                <span style={{ color: KINDS[hotItem.kind].color, fontWeight: 650 }}>{KINDS[hotItem.kind].label}</span>{" "}
                {hotItem.label} · {fmt(hotItem.tokens)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* what's in it */}
        <div role="list" aria-label="What's in the context" style={{ marginTop: 10 }}>
          {groups.map(([kind, g]) => {
            const k = KINDS[kind];
            return (
              <motion.div
                layout={!reduce}
                key={kind}
                role="listitem"
                data-hover-row={kind === "result" ? "" : undefined}
                onPointerEnter={() => setHot({ kind })}
                onPointerLeave={() => setHot(null)}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  backgroundColor: hot?.kind === kind ? "#f5f5f7" : "rgba(245,245,247,0)",
                }}
                transition={{
                  layout: { type: "spring", stiffness: 380, damping: 32 },
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "7px 8px",
                  borderRadius: 10,
                }}
              >
                <span
                  style={{
                    width: 3,
                    height: 16,
                    borderRadius: 2,
                    background: k.color,
                  }}
                />
                <span style={{ flex: 1, fontSize: 13.5, color: "#3a3a3c" }}>
                  {k.label}
                  {g.n > 1 && <span style={{ color: "#a1a1a6" }}> · {g.n}</span>}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {fmt(g.tokens)}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 12,
            paddingTop: 14,
            borderTop: "1px solid rgba(0,0,0,0.06)",
            flexWrap: "wrap",
          }}
        >
          {(
            [
              ["file", "File", I.file],
              ["message", "Message", I.chat],
              ["result", "Tool", I.tool],
            ] as const
          ).map(([kind, label, icon]) => (
            <motion.button
              key={kind}
              type="button"
              data-add={kind}
              aria-label={`Add a ${label.toLowerCase()}`}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                touched.current = true;
                const a =
                  ADDS.find((x, j) => x.kind === kind && j >= addN.current % ADDS.length) ??
                  ADDS.find((x) => x.kind === kind)!;
                addN.current++;
                add(a);
              }}
              className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                height: 34,
                padding: "0 12px",
                borderRadius: 17,
                border: 0,
                background: "#f5f5f7",
                color: "#1d1d1f",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <span style={{ color: KINDS[kind].color, display: "grid" }}>
                <Ico d={icon} size={13} />
              </span>
              {label}
            </motion.button>
          ))}
          <motion.button
            type="button"
            data-compact
            whileTap={{ scale: 0.94 }}
            disabled={compactable.length < 2}
            onClick={() => {
              touched.current = true;
              compact();
            }}
            animate={{
              backgroundColor: compactable.length < 2 ? "#f5f5f7" : "#1d1d1f",
              color: compactable.length < 2 ? "#c7c7cc" : "#ffffff",
            }}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
            style={{
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 34,
              padding: "0 14px",
              borderRadius: 17,
              border: 0,
              fontSize: 13,
              fontWeight: 650,
              cursor: compactable.length < 2 ? "default" : "pointer",
            }}
          >
            <Ico d={I.compact} size={13} />
            Compact
          </motion.button>
        </div>

        {ghost && (
          <motion.span
            aria-hidden="true"
            animate={{ scale: ghostDown ? 0.78 : 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 26 }}
            style={{
              position: "absolute",
              left: -13,
              top: -13,
              x: gx,
              y: gy,
              width: 26,
              height: 26,
              borderRadius: 13,
              background: "rgba(29,29,31,0.18)",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.85), 0 6px 14px -4px rgba(0,0,0,0.35)",
              pointerEvents: "none",
              zIndex: 9,
            }}
          />
        )}
      </div>
    </div>
  );
}
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    playbackSession();
    master = ctx.createGain();
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
}
```
