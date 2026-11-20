# Spend Strip

Add the "Spend Strip" component from Nexus UI to my project.

A quiet month of spending: one soft grey bar per day under the total and a thin budget line. Choose a category and each day's share of it rises in its colour from the bottom of the bar while the total rolls to it on digit reels; point at a day to read what it cost.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { SpendStrip } from "@/components/spend-strip";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/spend-strip/index.ts ---

```ts
export { default as SpendStrip } from "./spend-strip";
export type { SpendStripProps } from "./spend-strip";
```

--- components/spend-strip/spend-strip.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type SpendCategory = { id: string; name: string; color: string };
export type SpendItem = { day: number; cat: string; amount: number };
export type SpendStripProps = {
  month?: string;
  /** days in the month */
  days?: number;
  budget?: number;
  categories?: SpendCategory[];
  items?: SpendItem[];
  currency?: string;
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

const DEFAULT_CATS: SpendCategory[] = [
  { id: "transport", name: "Transport", color: "#8e8cff" },
  { id: "shopping", name: "Shopping", color: "#ff7ab6" },
  { id: "food", name: "Food", color: "#5fd4a8" },
  { id: "bills", name: "Bills", color: "#ffb15e" },
];
// a month of spending, made up but steady: a few things most days
const makeItems = () => {
  const out: SpendItem[] = [];
  let seed = 7;
  const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let d = 1; d <= 30; d++) {
    const n = 1 + Math.floor(r() * 2.2);
    for (let k = 0; k < n; k++) {
      const p = r();
      const cat = p < 0.36 ? "transport" : p < 0.6 ? "shopping" : p < 0.9 ? "food" : "bills";
      const base = cat === "bills" ? 260 : cat === "shopping" ? 150 : cat === "transport" ? 95 : 40;
      out.push({
        day: d,
        cat,
        amount: Math.round(base * (0.35 + r() * 1.2) * 100) / 100,
      });
    }
  }
  return out;
};
const DEFAULT_ITEMS = makeItems();

function Roll({ text, reduce, style }: { text: string; reduce: boolean; style?: CSSProperties }) {
  const chars = [...text];
  const box = {
    display: "inline-block",
    height: "1.1em",
    lineHeight: 1.1,
    overflow: "hidden",
  } as const;
  return (
    <span
      aria-label={text}
      style={{
        display: "inline-flex",
        alignItems: "flex-end",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        const key = chars.length - i;
        if (!/\d/.test(ch))
          return (
            <span key={`s${key}${ch}`} aria-hidden="true" style={box}>
              {ch}
            </span>
          );
        return (
          <span key={`d${key}`} aria-hidden="true" style={{ ...box, position: "relative" }}>
            <motion.span
              initial={false}
              animate={{ y: `${-Number(ch) * 10}%` }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 200,
                      damping: 27,
                      mass: 0.6 + (key % 3) * 0.1,
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

/**
 * A quiet month of spending. One soft bar per day, grey until you choose a category: then each day's share of it
 * rises in that category's colour from the bottom of the bar while the total rolls to what went on it and the budget
 * line eases to match. Point at a day to read what it cost.
 */
export default function SpendStrip({
  month = "November",
  days = 30,
  budget = 10000,
  categories = DEFAULT_CATS,
  items = DEFAULT_ITEMS,
  currency = "$",
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: SpendStripProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [cat, setCat] = useState<string | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);

  const totals = useMemo(() => {
    const t: Record<string, number> = {};
    categories.forEach((c) => (t[c.id] = 0));
    items.forEach((i) => (t[i.cat] = (t[i.cat] ?? 0) + i.amount));
    return t;
  }, [items, categories]);
  const perDay = useMemo(() => {
    const d = Array.from({ length: days }, () => ({ all: 0 }) as Record<string, number>);
    items.forEach((i) => {
      const row = d[i.day - 1];
      if (!row) return;
      row.all += i.amount;
      row[i.cat] = (row[i.cat] ?? 0) + i.amount;
    });
    return d;
  }, [items, days]);
  const all = Object.values(totals).reduce((a, b) => a + b, 0);
  const top = Math.max(...perDay.map((d) => d.all), 1);
  const shown = cat ? totals[cat] : all;
  const color = cat ? (categories.find((c) => c.id === cat)?.color ?? "#fff") : "#f5f5f7";
  const [whole, cents] = shown.toFixed(2).split(".");

  const choose = (id: string | null) => {
    setCat((c) => {
      if (c !== id && id)
        sfx.tick({
          freq: 1500 + categories.findIndex((x) => x.id === id) * 220,
          gain: 0.025,
        });
      return id;
    });
  };

  // autoplay: walk the categories, then a few days
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const go = async (sel: string, ms = 520) => {
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
    const run = async () => {
      await wait(1200);
      while (ok()) {
        for (const c of categories) {
          if (!ok()) return;
          await go(`[data-cat="${c.id}"]`);
          choose(c.id);
          await wait(1400);
        }
        choose(null);
        for (const d of [6, 15, 24]) {
          if (!ok()) return;
          await go(`[data-day="${d}"]`, 450);
          setDay(d);
          await wait(1000);
        }
        setDay(null);
        setGhost(false);
        await wait(1500);
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

  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 150, damping: 22 };
  const used = Math.min(1, shown / budget);

  return (
    <div
      className={`relative w-full max-w-[460px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#f5f5f7",
      }}
    >
      <div
        ref={card}
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        style={{
          position: "relative",
          borderRadius: 26,
          background: "#111113",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), 0 30px 60px -30px rgba(0,0,0,0.6)",
          padding: "22px 22px 18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            fontSize: 13,
            color: "rgba(235,235,245,0.5)",
          }}
        >
          <div
            style={{
              position: "relative",
              height: 18,
              overflow: "hidden",
              flex: 1,
            }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={cat ?? "all"}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              >
                {cat ? categories.find((c) => c.id === cat)?.name : "Spent"} in {month}
              </motion.div>
            </AnimatePresence>
          </div>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            of {currency}
            {budget.toLocaleString("en-US")}
          </span>
        </div>
        <div aria-live="polite" style={{ display: "flex", alignItems: "flex-end", marginTop: 8 }}>
          <span
            style={{
              fontSize: 18,
              color: "rgba(235,235,245,0.45)",
              marginRight: 3,
              marginBottom: 5,
            }}
          >
            {currency}
          </span>
          <Roll
            text={Number(whole).toLocaleString("en-US")}
            reduce={reduce}
            style={{ fontSize: 38, fontWeight: 500, letterSpacing: "-0.035em" }}
          />
          <Roll
            text={`.${cents}`}
            reduce={reduce}
            style={{
              fontSize: 38,
              fontWeight: 500,
              letterSpacing: "-0.035em",
              color: "rgba(235,235,245,0.3)",
            }}
          />
        </div>
        {/* how much of the budget it is */}
        <div
          style={{
            height: 3,
            borderRadius: 2,
            background: "rgba(255,255,255,0.07)",
            marginTop: 14,
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={false}
            animate={{ width: `${used * 100}%`, backgroundColor: color }}
            transition={{ width: spring, backgroundColor: { duration: 0.4 } }}
            style={{ height: "100%", borderRadius: 2 }}
          />
        </div>

        {/* one bar per day */}
        <div
          role="group"
          aria-label={`Spending each day in ${month}`}
          onPointerLeave={() => setDay(null)}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            gap: 4,
            height: 86,
            marginTop: 26,
          }}
        >
          {perDay.map((d, i) => {
            const h = (d.all / top) * 100;
            const part = cat ? ((d[cat] ?? 0) / (d.all || 1)) * 100 : 0;
            const hot = day === i;
            return (
              <div
                key={i}
                data-day={i}
                onPointerEnter={() => setDay(i)}
                style={{
                  flex: 1,
                  height: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                  cursor: "default",
                }}
              >
                <motion.div
                  initial={reduce ? false : { height: "4%" }}
                  animate={{ height: `${Math.max(4, h)}%` }}
                  transition={{ ...spring, delay: reduce ? 0 : i * 0.012 }}
                  style={{
                    position: "relative",
                    width: "100%",
                    borderRadius: 3,
                    overflow: "hidden",
                    background: hot
                      ? "rgba(255,255,255,0.42)"
                      : cat
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(255,255,255,0.2)",
                    transition: "background 0.3s",
                  }}
                >
                  <motion.div
                    initial={false}
                    animate={{ height: `${part}%` }}
                    transition={{
                      ...spring,
                      delay: reduce ? 0 : (i % 30) * 0.008,
                    }}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: color,
                      borderRadius: 3,
                    }}
                  />
                </motion.div>
              </div>
            );
          })}
          <AnimatePresence>
            {day !== null && (
              <motion.div
                key="tip"
                initial={{ opacity: 0, y: 4 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  left: `${((day + 0.5) / days) * 100}%`,
                }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                style={{
                  position: "absolute",
                  bottom: "100%",
                  marginBottom: 6,
                  x: day > days * 0.78 ? "-88%" : day < days * 0.18 ? "-12%" : "-50%",
                  padding: "4px 8px",
                  borderRadius: 8,
                  background: "#f5f5f7",
                  color: "#111",
                  fontSize: 11,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {month.slice(0, 3)} {day + 1}, {currency}
                {(cat ? (perDay[day][cat] ?? 0) : perDay[day].all).toFixed(2)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10.5,
            color: "rgba(235,235,245,0.3)",
            marginTop: 8,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span>{month.slice(0, 3)} 1</span>
          <span>
            {month.slice(0, 3)} {days}
          </span>
        </div>

        {/* the categories */}
        <div
          role="group"
          aria-label="Categories"
          onPointerLeave={() => choose(null)}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
            gap: 4,
            marginTop: 18,
          }}
        >
          {categories.map((c) => {
            const on = cat === c.id;
            return (
              <button
                key={c.id}
                type="button"
                data-cat={c.id}
                aria-pressed={on}
                onPointerEnter={() => choose(c.id)}
                onFocus={() => choose(c.id)}
                onClick={() => {
                  touched.current = true;
                  choose(on ? null : c.id);
                }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: 12,
                  border: 0,
                  background: on ? "rgba(255,255,255,0.06)" : "transparent",
                  color: "inherit",
                  cursor: "pointer",
                  transition: "background 0.25s",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: on || !cat ? "rgba(235,235,245,0.75)" : "rgba(235,235,245,0.35)",
                    transition: "color 0.25s",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      background: c.color,
                    }}
                  />
                  {c.name}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 13.5,
                    fontWeight: 500,
                    marginTop: 3,
                    color: on || !cat ? "#f5f5f7" : "rgba(235,235,245,0.35)",
                    fontVariantNumeric: "tabular-nums",
                    transition: "color 0.25s",
                  }}
                >
                  {Math.round((totals[c.id] / all) * 100)}%
                </span>
              </button>
            );
          })}
        </div>

        {ghost && (
          <motion.span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: -12,
              top: -12,
              x: gx,
              y: gy,
              width: 24,
              height: 24,
              borderRadius: 12,
              background: "rgba(255,255,255,0.2)",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.75), 0 6px 14px -4px rgba(0,0,0,0.5)",
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
